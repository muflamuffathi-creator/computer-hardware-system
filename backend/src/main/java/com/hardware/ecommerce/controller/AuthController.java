package com.hardware.ecommerce.controller;

import com.hardware.ecommerce.config.JwtTokenProvider;
import com.hardware.ecommerce.dto.AuthResponse;
import com.hardware.ecommerce.dto.LoginRequest;
import com.hardware.ecommerce.dto.RegisterRequest;
import com.hardware.ecommerce.model.User;
import com.hardware.ecommerce.service.RefreshTokenService;
import com.hardware.ecommerce.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://10.140.28.203:5173", "http://10.140.28.203:5174", "http://192.168.23.203:5173", "http://192.168.23.203:5174"}, allowCredentials = "true")
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;

    public AuthController(UserService userService, JwtTokenProvider tokenProvider, RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.tokenProvider = tokenProvider;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request);
            return ResponseEntity.ok("User registered successfully with ID: " + user.getUserId());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            AuthResponse authResponse = userService.loginUser(loginRequest);
            if (refreshTokenService != null) {
                try {
                    User user = userService.getUserByEmail(authResponse.getEmail());
                    String rt = refreshTokenService.createRefreshToken(user);
                    ResponseCookie cookie = buildRefreshCookie(rt, request.isSecure());
                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, cookie.toString())
                            .body(authResponse);
                } catch (Exception ignored) {
                    // continue without refresh cookie if token creation fails
                }
            }
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            Logger logger = LoggerFactory.getLogger(AuthController.class);
            logger.debug("Login failed for {}: {}", loginRequest != null ? loginRequest.getEmail() : "<no-email>", e.getMessage());
            return ResponseEntity.status(401).body("Invalid email or password.");
        }
    }

    @GetMapping("/dev/users/exists")
    public ResponseEntity<Boolean> devUserExists(@RequestParam String email) {
        return ResponseEntity.ok(userService.existsByEmail(email));
    }

    @PostMapping("/dev/users/delete")
    public ResponseEntity<?> deleteDevUser(@RequestParam String email) {
        boolean deleted = userService.deleteUserByEmail(email);
        if (deleted) {
            return ResponseEntity.ok("Deleted user with email: " + email);
        }
        return ResponseEntity.status(404).body("User not found: " + email);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        // Revoke server-side refresh token when available and clear cookie
        try {
            if (refreshTokenService != null && SecurityContextHolder.getContext().getAuthentication() != null) {
                Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                String email = null;
                if (principal instanceof org.springframework.security.core.userdetails.User) {
                    email = ((org.springframework.security.core.userdetails.User) principal).getUsername();
                } else if (principal instanceof String) {
                    email = (String) principal;
                }
                if (email != null) {
                    try {
                        User user = userService.getUserByEmail(email);
                        refreshTokenService.revokeRefreshToken(user);
                    } catch (Exception ignore) {
                    }
                }
            }
        } catch (Exception ignore) {
        }

        ResponseCookie cookie = clearRefreshCookie(request.isSecure());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Logged out successfully.");
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (tokenProvider.validateToken(token)) {
                try {
                    String email = tokenProvider.getEmailFromJWT(token);
                    User user = userService.getUserByEmail(email);
                    UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                            user.getEmail(), user.getPassword(), List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
                    );
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    String newToken = tokenProvider.generateToken(auth);
                    AuthResponse resp = new AuthResponse(newToken, user.getEmail(), user.getRole(), user.getFirstName(), user.getLastName());
                    return ResponseEntity.ok(resp);
                } catch (Exception ignored) {
                    // fall through to cookie refresh when access token refresh cannot complete
                }
            }
        }

        // Try cookie-based refresh token if available
        if (refreshTokenService != null && request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("refreshToken".equals(c.getName())) {
                    String rt = c.getValue();
                    return refreshUsingRefreshToken(rt, request.isSecure());
                }
            }
        }

        return ResponseEntity.status(401).body("Missing bearer token or refresh cookie");
    }

    private ResponseEntity<?> refreshUsingRefreshToken(String rt, boolean secure) {
        try {
            Optional<User> maybeUser = refreshTokenService.verifyRefreshToken(rt);
            if (maybeUser.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid or expired refresh token");
            }
            User user = maybeUser.get();
            UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                    user.getEmail(), user.getPassword(), List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
            );
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            String newToken = tokenProvider.generateToken(auth);
            String newRefreshToken = refreshTokenService.createRefreshToken(user);
            ResponseCookie cookie = buildRefreshCookie(newRefreshToken, secure);
            AuthResponse resp = new AuthResponse(newToken, user.getEmail(), user.getRole(), user.getFirstName(), user.getLastName());
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(resp);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Unable to refresh from cookie: " + e.getMessage());
        }
    }

    private ResponseCookie buildRefreshCookie(String refreshToken, boolean secure) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .path("/")
                .maxAge(60 * 60 * 24 * 30)
                .sameSite("None");

        if (secure) {
            builder.secure(true);
        }

        return builder.build();
    }

    private ResponseCookie clearRefreshCookie(boolean secure) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("None");

        if (secure) {
            builder.secure(true);
        }

        return builder.build();
    }
}