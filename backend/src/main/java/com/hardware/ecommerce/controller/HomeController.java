package com.hardware.ecommerce.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class HomeController {

    @GetMapping
    public ResponseEntity<String> root() {
        return ResponseEntity.ok("Hardware E-Commerce AI Backend is running. Use /api/products, /api/categories, /api/brands, /api/auth to interact with the API.");
    }
}
