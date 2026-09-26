package com.hardware.ecommerce.controller;

import com.hardware.ecommerce.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Dev-only controller for local debugging. Not intended for production.
 * Allows checking and deleting users by email during local development.
 */
@RestController
@RequestMapping("/api/dev/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://10.140.28.203:5173", "http://10.140.28.203:5174", "http://192.168.23.203:5173", "http://192.168.23.203:5174"}, allowCredentials = "true")
public class DevUserController {

    private final UserService userService;

    public DevUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/exists")
    public ResponseEntity<?> exists(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    @DeleteMapping()
    public ResponseEntity<?> deleteByEmail(@RequestParam String email) {
        boolean deleted = userService.deleteUserByEmail(email);
        if (deleted) {
            return ResponseEntity.ok("Deleted user with email: " + email);
        }
        return ResponseEntity.status(404).body("User not found: " + email);
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteByEmailPost(@RequestParam String email) {
        return deleteByEmail(email);
    }
}
