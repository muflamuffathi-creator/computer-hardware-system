package com.hardware.ecommerce.controller;

import com.hardware.ecommerce.dto.CheckoutRequest;
import com.hardware.ecommerce.model.Order;
import com.hardware.ecommerce.model.User;
import com.hardware.ecommerce.service.OrderService;
import com.hardware.ecommerce.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://10.140.28.203:5173", "http://10.140.28.203:5174", "http://192.168.23.203:5173", "http://192.168.23.203:5174"}, allowCredentials = "true")
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    public OrderController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByEmail(email);
    }

    @PostMapping("/orders")
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest request) {
        try {
            User user = getAuthenticatedUser();
            Order order = orderService.checkout(user, request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getMyOrders() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(orderService.getOrdersForUser(user));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();
            Order order = orderService.getOrderById(id);
            
            // Authorization check: User can only see their own orders unless they are Admin
            if (!order.getUser().getUserId().equals(user.getUserId()) && !user.getRole().equals("ADMIN")) {
                return ResponseEntity.status(403).body("Access denied.");
            }
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Admin APIs
    @GetMapping("/admin/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/admin/orders/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Status is required.");
            }
            Order order = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();
            Order order = orderService.cancelOrder(id, user);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
