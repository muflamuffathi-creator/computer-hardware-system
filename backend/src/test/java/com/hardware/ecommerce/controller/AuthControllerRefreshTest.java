package com.hardware.ecommerce.controller;

import com.hardware.ecommerce.dto.AuthResponse;
import com.hardware.ecommerce.model.User;
import com.hardware.ecommerce.service.RefreshTokenService;
import com.hardware.ecommerce.service.UserService;
import com.hardware.ecommerce.config.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerRefreshTest {

    @Mock
    private UserService userService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private JwtTokenProvider tokenProvider; 

    @InjectMocks
    private AuthController authController;

    @Test
    public void refreshReturnsNewTokenForValidBearer() {
        User user = User.builder()
                .userId(99L)
                .email("refresh@example.com")
                .firstName("Ref")
                .lastName("Resh")
                .password("password")
                .role("CUSTOMER")
                .build();

        when(userService.getUserByEmail("refresh@example.com")).thenReturn(user);
        when(tokenProvider.validateToken("old-valid-token")).thenReturn(true);
        when(tokenProvider.getEmailFromJWT("old-valid-token")).thenReturn("refresh@example.com");
        when(tokenProvider.generateToken(any())).thenReturn("new-refreshed-token");
        when(request.getHeader("Authorization")).thenReturn("Bearer old-valid-token");

        // Fixed: Invoked with only 'request' to match your controller signature
        ResponseEntity<?> resp = authController.refreshToken(request);

        assertEquals(200, resp.getStatusCode().value());
        Object body = resp.getBody();
        assertNotNull(body);
        assertTrue(body instanceof AuthResponse);
        AuthResponse ar = (AuthResponse) body;
        assertNotNull(ar.getToken());
        assertEquals("new-refreshed-token", ar.getToken());
    }

    @Test
    public void refreshReturnsNewTokenForValidRefreshCookie() {
        User user = User.builder()
                .userId(100L)
                .email("cookie-refresh@example.com")
                .firstName("Cookie")
                .lastName("Refresh")
                .password("password")
                .role("CUSTOMER")
                .build();

        when(refreshTokenService.verifyRefreshToken("cookie-token")).thenReturn(Optional.of(user));
        when(refreshTokenService.createRefreshToken(user)).thenReturn("next-cookie-token");
        when(tokenProvider.generateToken(any())).thenReturn("new-cookie-token");
        when(request.getHeader("Authorization")).thenReturn(null);
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("refreshToken", "cookie-token")});
        when(request.isSecure()).thenReturn(false);

        // Fixed: Invoked with only 'request' to match your controller signature
        ResponseEntity<?> resp = authController.refreshToken(request);

        assertEquals(200, resp.getStatusCode().value());
        
        // Asserting directly on the ResponseEntity headers, as the controller handles this natively
        String setCookieHeader = resp.getHeaders().getFirst("Set-Cookie");
        assertNotNull(setCookieHeader, "Set-Cookie header should not be null");
        assertTrue(setCookieHeader.contains("refreshToken=next-cookie-token"));
        
        Object body = resp.getBody();
        assertNotNull(body);
        assertTrue(body instanceof AuthResponse);
        AuthResponse ar = (AuthResponse) body;
        assertEquals("new-cookie-token", ar.getToken());
        verify(tokenProvider, times(1)).generateToken(any());
    }

    @Test
    public void refreshUsesCookieWhenBearerTokenIsExpired() {
        User user = User.builder()
                .userId(101L)
                .email("expired-cookie-refresh@example.com")
                .firstName("Expired")
                .lastName("Cookie")
                .password("password")
                .role("CUSTOMER")
                .build();

        when(tokenProvider.validateToken("expired-token")).thenReturn(false);
        when(refreshTokenService.verifyRefreshToken("cookie-token")).thenReturn(Optional.of(user));
        when(refreshTokenService.createRefreshToken(user)).thenReturn("next-cookie-token");
        when(tokenProvider.generateToken(any())).thenReturn("new-cookie-token");
        when(request.getHeader("Authorization")).thenReturn("Bearer expired-token");
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("refreshToken", "cookie-token")});
        when(request.isSecure()).thenReturn(false);

        // Fixed: Invoked with only 'request' to match your controller signature
        ResponseEntity<?> resp = authController.refreshToken(request);

        assertEquals(200, resp.getStatusCode().value());
        Object body = resp.getBody();
        assertNotNull(body);
        assertTrue(body instanceof AuthResponse);
        AuthResponse ar = (AuthResponse) body;
        assertEquals("new-cookie-token", ar.getToken());
        verify(refreshTokenService, times(1)).verifyRefreshToken("cookie-token");
    }
}