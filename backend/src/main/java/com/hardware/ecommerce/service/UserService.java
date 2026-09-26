package com.hardware.ecommerce.service;

import com.hardware.ecommerce.dto.AuthResponse;
import com.hardware.ecommerce.dto.LoginRequest;
import com.hardware.ecommerce.dto.RegisterRequest;
import com.hardware.ecommerce.model.Cart;
import com.hardware.ecommerce.model.User;
import com.hardware.ecommerce.repository.CartRepository;
import com.hardware.ecommerce.repository.UserRepository;
import com.hardware.ecommerce.config.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.AuthenticationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Objects;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public UserService(UserRepository userRepository, CartRepository cartRepository,
                       PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

@Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email address already in use.");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("CUSTOMER")
                .build();

        User savedUser = userRepository.save(user);

        // Auto-create shopping cart
        Cart cart = Cart.builder().user(savedUser).build();
        cartRepository.save(cart);

        return savedUser;
    }

    public AuthResponse loginUser(LoginRequest request) {
        Objects.requireNonNull(request, "Login request is required");
        Objects.requireNonNull(request.getEmail(), "Login email is required");
        Objects.requireNonNull(request.getPassword(), "Login password is required");

        Authentication authentication = null;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (AuthenticationException ex) {
            Logger logger = LoggerFactory.getLogger(UserService.class);
            logger.debug("Authentication failed for email={}: {}", request.getEmail(), ex.getMessage());
            throw ex;
        }
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User details not found."));

        return new AuthResponse(
                jwt,
                user.getEmail(),
                user.getRole(),
                user.getFirstName(),
                user.getLastName()
        );
    }

    public User getUserByEmail(String email) {
        Objects.requireNonNull(email, "Email is required");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    public boolean existsByEmail(String email) {
        Objects.requireNonNull(email, "Email is required");
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public boolean deleteUserByEmail(String email) {
        Objects.requireNonNull(email, "Email is required");
        return userRepository.findByEmail(email)
                .map(user -> {
                    cartRepository.findByUser(user).ifPresent(cartRepository::delete);
                    userRepository.delete(user);
                    return true;
                })
                .orElse(false);
    }
}
