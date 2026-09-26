package com.hardware.ecommerce.controller;

import com.hardware.ecommerce.model.User;
import com.hardware.ecommerce.service.RefreshTokenService;
import com.hardware.ecommerce.service.UserService;
import com.hardware.ecommerce.config.JwtTokenProvider;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerLogoutTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthController controller;

    @AfterEach
    public void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    public void logout_revokesRefreshAndClearsCookie() {
        User user = User.builder()
                .userId(101L)
                .email("logout@example.com")
                .firstName("Logout")
                .lastName("User")
                .password("password")
                .role("CUSTOMER")
                .build();

        when(userService.getUserByEmail("logout@example.com")).thenReturn(user);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "logout@example.com", null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        jakarta.servlet.http.HttpServletRequest request = mock(jakarta.servlet.http.HttpServletRequest.class);
        when(request.isSecure()).thenReturn(false);

        ResponseEntity<?> resp = controller.logout(request);

        assertEquals(200, resp.getStatusCode().value());
        String setCookie = resp.getHeaders().getFirst("Set-Cookie");
        assertNotNull(setCookie);
        assertTrue(setCookie.contains("refreshToken="));
        assertTrue(setCookie.contains("Max-Age=0"));
        assertTrue(setCookie.contains("SameSite=None"));
        verify(refreshTokenService, times(1)).revokeRefreshToken(user);
    }
}
