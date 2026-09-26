package com.hardware.ecommerce.service;

import com.hardware.ecommerce.model.RefreshToken;
import com.hardware.ecommerce.model.User;
import com.hardware.ecommerce.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final long refreshTokenDurationMs;

    public RefreshTokenService(RefreshTokenRepository repository,
                               @Value("${app.auth.refreshTokenExpiration:2592000000}") long refreshTokenDurationMs) {
        this.repository = repository;
        this.refreshTokenDurationMs = refreshTokenDurationMs;
    }

    public String createRefreshToken(User user) {
        final RefreshToken rt;
        // delete existing tokens for user
        repository.deleteByUser(user);
        String token = UUID.randomUUID().toString();
        rt = RefreshToken.builder()
            .token(token)
            .user(user)
            .expiryDate(Instant.now().plus(refreshTokenDurationMs, ChronoUnit.MILLIS))
            .build();
        repository.save(rt);
        return token;
    }

    public Optional<User> verifyRefreshToken(String token) {
        return repository.findByToken(token)
                .filter(rt -> rt.getExpiryDate().isAfter(Instant.now()))
                .map(rt -> rt.getUser());
    }

    public void revokeRefreshToken(User user) {
        repository.deleteByUser(user);
    }
}
