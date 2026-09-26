package com.hardware.ecommerce.controller;

import com.hardware.ecommerce.dto.ChatHistoryResponse;
import com.hardware.ecommerce.dto.ChatRequest;
import com.hardware.ecommerce.dto.ChatResponse;
import com.hardware.ecommerce.dto.CompatibilityCheckRequest;
import com.hardware.ecommerce.dto.CompatibilityCheckResponse;
import com.hardware.ecommerce.model.ChatHistory;
import com.hardware.ecommerce.model.User;
import com.hardware.ecommerce.repository.ChatHistoryRepository;
import com.hardware.ecommerce.service.GeminiAiService;
import com.hardware.ecommerce.service.PCCompatibilityEngine;
import com.hardware.ecommerce.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://10.140.28.203:5173", "http://10.140.28.203:5174", "http://192.168.23.203:5173", "http://192.168.23.203:5174"}, allowCredentials = "true")
@Slf4j
public class AIController {

    private final GeminiAiService geminiAiService;
    private final PCCompatibilityEngine compatibilityEngine;
    private final ChatHistoryRepository chatHistoryRepository;
    private final UserService userService;

    public AIController(GeminiAiService geminiAiService,
                        PCCompatibilityEngine compatibilityEngine,
                        ChatHistoryRepository chatHistoryRepository,
                        UserService userService) {
        this.geminiAiService = geminiAiService;
        this.compatibilityEngine = compatibilityEngine;
        this.chatHistoryRepository = chatHistoryRepository;
        this.userService = userService;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new IllegalStateException("Authentication required");
        }

        User user = userService.getUserByEmail(authentication.getName());
        if (user == null) {
            throw new IllegalStateException("Authenticated user not found");
        }
        return user;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Chat message must not be empty.");
        }

        try {
            User user = getAuthenticatedUser();
            String reply = geminiAiService.generateResponse(request.getMessage());

            ChatHistory history = ChatHistory.builder()
                    .user(user)
                    .question(request.getMessage())
                    .response(reply)
                    .build();
            chatHistoryRepository.save(history);

            return ResponseEntity.ok(new ChatResponse(reply));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("AI Chat error: " + e.getMessage());
        } catch (Exception e) {
            // Log the exception (server side) and return a friendly assistant reply to the client
            log.error("AI processing failed for message='{}'", request.getMessage(), e);
            String fallbackReply = "Sorry, I couldn't reach my processor. Please try again in a moment.";
            try {
                // Attempt to save a history entry with the fallback reply if we can determine the user
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
                    User user = userService.getUserByEmail(authentication.getName());
                    if (user != null) {
                        ChatHistory history = ChatHistory.builder()
                                .user(user)
                                .question(request.getMessage())
                                .response(fallbackReply)
                                .build();
                        chatHistoryRepository.save(history);
                    }
                }
            } catch (Exception ex) {
                log.warn("Failed to persist fallback chat history", ex);
            }

            // Return 200 with a ChatResponse so the frontend receives a stable shape
            return ResponseEntity.ok(new ChatResponse(fallbackReply));
        }
    }

    @GetMapping("/chat/history")
    public ResponseEntity<List<ChatHistoryResponse>> getChatHistory() {
        try {
            User user = getAuthenticatedUser();
            List<ChatHistory> history = chatHistoryRepository.findByUserOrderByCreatedAtAsc(user);
            String fallbackReply = "Sorry, I couldn't reach my processor. Please try again in a moment.";
            List<ChatHistoryResponse> response = history.stream()
                    .map(entry -> {
                        String resp = entry.getResponse();
                        String safeResp = resp;
                        if (resp != null) {
                            String trimmed = resp.trim();
                            // Detect JSON error payloads either as the entire response or embedded inside the string
                            boolean looksLikeSpringJson = false;
                            if (trimmed.startsWith("{")) {
                                looksLikeSpringJson = (trimmed.contains("\"status\"") || trimmed.contains("\"error\"") || trimmed.contains("\"timestamp\""));
                            } else {
                                // Embedded JSON fragment detection
                                if (trimmed.contains("{\"timestamp\":") || trimmed.contains("\"status\":") || trimmed.contains("\"error\":") || trimmed.contains("/api/chat")) {
                                    looksLikeSpringJson = true;
                                }
                            }

                            if (looksLikeSpringJson) {
                                safeResp = fallbackReply;
                                // attempt to persist the sanitized response so future reads are clean
                                try {
                                    entry.setResponse(safeResp);
                                    chatHistoryRepository.save(entry);
                                } catch (Exception e) {
                                    log.warn("Failed to persist sanitized chat history for id={}", entry.getChatId(), e);
                                }
                            }
                        }
                        return new ChatHistoryResponse(
                                entry.getChatId(),
                                entry.getQuestion(),
                                safeResp,
                                entry.getCreatedAt() != null ? entry.getCreatedAt().toString() : null
                        );
                    })
                    .toList();
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @DeleteMapping("/chat/history")
    public ResponseEntity<?> clearChatHistory() {
        try {
            User user = getAuthenticatedUser();
            chatHistoryRepository.deleteByUser(user);
            return ResponseEntity.ok("Chat history cleared successfully.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Chat history clear failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to clear chat history for user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Chat history clear failed: " + e.getMessage());
        }
    }

    @PostMapping("/compatibility-check")
    public ResponseEntity<?> checkCompatibility(@RequestBody CompatibilityCheckRequest request) {
        try {
            CompatibilityCheckResponse response = compatibilityEngine.checkCompatibility(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Compatibility verification failed: " + e.getMessage());
        }
    }

    // NOTE: admin sanitization endpoint removed after one-time use.
}
