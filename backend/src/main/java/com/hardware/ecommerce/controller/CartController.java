package com.hardware.ecommerce.controller;

import com.hardware.ecommerce.dto.CartItemDto;
import com.hardware.ecommerce.model.Cart;
import com.hardware.ecommerce.model.User;
import com.hardware.ecommerce.service.CartService;
import com.hardware.ecommerce.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://10.140.28.203:5173", "http://10.140.28.203:5174", "http://192.168.23.203:5173", "http://192.168.23.203:5174"}, allowCredentials = "true")
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    public CartController(CartService cartService, UserService userService) {
        this.cartService = cartService;
        this.userService = userService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByEmail(email);
    }

    @GetMapping
    public ResponseEntity<Cart> getCart() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(cartService.getCartForUser(user));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody CartItemDto itemDto) {
        try {
            User user = getAuthenticatedUser();
            Cart cart = cartService.addItemToCart(user, itemDto.getProductId(), itemDto.getQuantity());
            return ResponseEntity.ok(cart);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateCartItem(@RequestBody CartItemDto itemDto) {
        try {
            User user = getAuthenticatedUser();
            Cart cart = cartService.updateItemQuantity(user, itemDto.getProductId(), itemDto.getQuantity());
            return ResponseEntity.ok(cart);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeCartItem(@PathVariable Long productId) {
        try {
            User user = getAuthenticatedUser();
            Cart cart = cartService.removeItemFromCart(user, productId);
            return ResponseEntity.ok(cart);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/clear")
    public ResponseEntity<?> clearCart() {
        User user = getAuthenticatedUser();
        cartService.clearCart(user);
        return ResponseEntity.ok("Cart cleared successfully.");
    }
}
