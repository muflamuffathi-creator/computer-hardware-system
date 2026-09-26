<#
Simple end-to-end auth verification script for the backend.

Usage (PowerShell):
  ./scripts/e2e-auth.ps1 -BaseUrl http://localhost:8080/api -Email dev@example.com -Password password

What it does:
  - POST /auth/login (captures JSON response and cookies)
  - GET a public resource using the access token
  - POST /auth/refresh using the cookie to obtain a rotated token & cookie
  - GET the protected resource again with the refreshed token
  - POST /auth/logout to revoke the refresh token and clear cookie
#>

param(
    [string]$BaseUrl = "http://localhost:8080/api",
    [string]$Email = "e2e-user@example.com",
    [string]$Password = "Password123!",
    [string]$FirstName = "E2E",
    [string]$LastName = "User"
)

function Info($m) { Write-Host "[INFO] $m" }
function ErrorExit($m, $code = 1) { Write-Error $m; exit $code }

function AttemptLogin {
    param([string]$email, [string]$password)
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $body -ContentType 'application/json' -SessionVariable sess -ErrorAction Stop
    } catch {
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode.Value__ -eq 401) {
            return $null
        }
        throw
    }
}

function AttemptRegister {
    param([string]$email, [string]$password, [string]$firstName, [string]$lastName)
    $body = @{ firstName = $firstName; lastName = $lastName; email = $email; password = $password } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
}

Info "Starting E2E auth flow against $BaseUrl"

try {
    $login = AttemptLogin -email $Email -password $Password
    if (-not $login) {
        Info "Login failed, registering E2E user $Email"
        try {
            AttemptRegister -email $Email -password $Password -firstName $FirstName -lastName $LastName
            Info "Registration succeeded, retrying login"
            $login = AttemptLogin -email $Email -password $Password
        } catch {
            if ($_.Exception.Response -and $_.Exception.Response.StatusCode.Value__ -eq 400) {
                Info "Registration returned 400, retrying login anyway"
                $login = AttemptLogin -email $Email -password $Password
            } else {
                throw
            }
        }
    }

    if (-not $login) { ErrorExit "Unable to obtain access token after login/register." 2 }

    $access = $login.token
    if (-not $access) { ErrorExit "No access token returned from login." 2 }
    Info "Received access token (length: $($access.Length))"

    Info "Calling GET $BaseUrl/products with access token"
    $public = Invoke-RestMethod -Uri "$BaseUrl/products" -Method Get -Headers @{ Authorization = "Bearer $access" } -WebSession $sess -ErrorAction Stop
    Info "Public products retrieved: $($public.Count) items (if any)"

    Info "Requesting refresh via cookie"
    $refresh = Invoke-RestMethod -Uri "$BaseUrl/auth/refresh" -Method Post -WebSession $sess -ErrorAction Stop
    $newAccess = $refresh.token
    if (-not $newAccess) { ErrorExit "No access token returned from refresh." 3 }
    Info "Received refreshed access token (length: $($newAccess.Length))"

    Info "Calling GET $BaseUrl/products with refreshed token"
    $protected = Invoke-RestMethod -Uri "$BaseUrl/products" -Method Get -Headers @{ Authorization = "Bearer $newAccess" } -WebSession $sess -ErrorAction Stop
    Info "Protected products retrieved: $($protected.Count) items (if any)"

    Info "Logging out (revoke refresh token)"
    Invoke-RestMethod -Uri "$BaseUrl/auth/logout" -Method Post -WebSession $sess -ErrorAction SilentlyContinue
    Info "Logout request sent"

    Info "E2E auth flow completed successfully."
    exit 0
} catch {
    ErrorExit "E2E flow failed: $($_.Exception.Message)"
}
