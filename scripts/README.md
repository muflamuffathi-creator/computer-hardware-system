E2E auth scripts
-----------------

Files:

- `e2e-auth.ps1` — PowerShell script to exercise login → refresh → logout against a running backend at `http://localhost:8080` by default.

Usage (PowerShell):

```powershell
./scripts/e2e-auth.ps1 -BaseUrl http://localhost:8080/api -Email dev@example.com -Password password
```

Notes:
- The script requires the backend to be running locally. It uses `Invoke-RestMethod` which handles cookies via the session variable.
- Adjust `-BaseUrl`, `-Email`, and `-Password` as needed for your environment.
