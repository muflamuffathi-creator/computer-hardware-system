package com.hardware.ecommerce.controller;

import com.hardware.ecommerce.dto.ChatHistoryResponse;
import com.hardware.ecommerce.dto.ChatRequest;
import com.hardware.ecommerce.dto.ChatResponse;
import com.hardware.ecommerce.model.ChatHistory;
import com.hardware.ecommerce.model.User;
import com.hardware.ecommerce.repository.ChatHistoryRepository;
import com.hardware.ecommerce.service.GeminiAiService;
import com.hardware.ecommerce.service.PCCompatibilityEngine;
import com.hardware.ecommerce.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AIControllerTest {

    @Mock
    private GeminiAiService geminiAiService;

    @Mock
    private PCCompatibilityEngine compatibilityEngine;

    @Mock
    private ChatHistoryRepository chatHistoryRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private AIController aiController;

    private SecurityContext originalContext;

    @BeforeEach
    public void setUp() {
        originalContext = SecurityContextHolder.getContext();
    }

    @AfterEach
    public void tearDown() {
        SecurityContextHolder.setContext(originalContext);
    }

    private void setAuthenticatedUser(String email) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                email,
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(auth);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    public void chatReturnsBadRequestForEmptyMessage() {
        ChatRequest emptyRequest = new ChatRequest();
        emptyRequest.setMessage("   ");

        ResponseEntity<?> response = aiController.chat(emptyRequest);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Chat message must not be empty.", response.getBody());
        verifyNoInteractions(geminiAiService, chatHistoryRepository, userService);
    }

    @Test
    public void chatSavesHistoryWhenAuthenticated() {
        setAuthenticatedUser("user@example.com");
        User user = User.builder().userId(42L).email("user@example.com").firstName("Test").lastName("User").role("CUSTOMER").password("pass").build();
        when(userService.getUserByEmail("user@example.com")).thenReturn(user);
        when(geminiAiService.generateResponse("Hello")).thenReturn("Hi there!");

        ChatRequest request = new ChatRequest();
        request.setMessage("Hello");

        ResponseEntity<?> response = aiController.chat(request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof ChatResponse);
        assertEquals("Hi there!", ((ChatResponse) response.getBody()).getReply());
        verify(chatHistoryRepository, times(1)).save(org.mockito.ArgumentMatchers.<ChatHistory>any());
    }

    @Test
    public void getChatHistoryReturnsUserEntries() {
        setAuthenticatedUser("history@example.com");
        User user = User.builder().userId(24L).email("history@example.com").firstName("History").lastName("User").role("CUSTOMER").password("pass").build();
        when(userService.getUserByEmail("history@example.com")).thenReturn(user);

        ChatHistory first = ChatHistory.builder()
                .chatId(1L)
                .user(user)
                .question("What GPU should I buy?")
                .response("Consider the RTX 4070 Ti.")
                .createdAt(LocalDateTime.of(2025, 12, 1, 14, 30))
                .build();
        ChatHistory second = ChatHistory.builder()
                .chatId(2L)
                .user(user)
                .question("Is AM5 compatible with DDR5?")
                .response("Yes, AM5 supports DDR5.")
                .createdAt(LocalDateTime.of(2025, 12, 1, 14, 31))
                .build();

        when(chatHistoryRepository.findByUserOrderByCreatedAtAsc(user)).thenReturn(List.of(first, second));

        ResponseEntity<List<ChatHistoryResponse>> response = aiController.getChatHistory();

        assertEquals(200, response.getStatusCode().value());
        List<ChatHistoryResponse> history = response.getBody();
        assertNotNull(history);
        assertEquals(2, history.size());
        assertEquals(1L, history.get(0).getChatId());
        assertEquals("What GPU should I buy?", history.get(0).getQuestion());
        assertEquals("Consider the RTX 4070 Ti.", history.get(0).getResponse());
        assertEquals("2025-12-01T14:30", history.get(0).getCreatedAt().substring(0, 16));
    }

    @Test
    public void clearChatHistoryDeletesEntriesForAuthenticatedUser() {
        setAuthenticatedUser("clear@example.com");
        User user = User.builder().userId(30L).email("clear@example.com").firstName("Clear").lastName("User").role("CUSTOMER").password("pass").build();
        when(userService.getUserByEmail("clear@example.com")).thenReturn(user);

        ResponseEntity<?> response = aiController.clearChatHistory();

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Chat history cleared successfully.", response.getBody());
        verify(chatHistoryRepository, times(1)).deleteByUser(user);
    }

    @Test
    public void chatReturnsGamingChairRecommendation() {
        setAuthenticatedUser("user@example.com");
        User user = User.builder().userId(42L).email("user@example.com").firstName("Test").lastName("User").role("CUSTOMER").password("pass").build();
        when(userService.getUserByEmail("user@example.com")).thenReturn(user);
        when(geminiAiService.generateResponse("gaming chairs")).thenReturn("Great choice! Gaming chairs provide comfort for extended sessions. Here are some excellent options from our catalog:\n" +
                "- **Premium Gaming Chair Pro**: $299.99 (Ergonomic design, adjustable height, lumbar support)\n" +
                "- **Racing Style Gaming Chair**: $249.99 (High-back design, reclining feature, armrests)\n" +
                "- **Mesh Gaming Chair**: $179.99 (Breathable mesh, swivel base, budget-friendly)\n\n" +
                "All gaming chairs are in stock! Which features are most important to you - ergonomics, reclining, or budget?");

        ChatRequest request = new ChatRequest();
        request.setMessage("gaming chairs");

        ResponseEntity<?> response = aiController.chat(request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof ChatResponse);
        String reply = ((ChatResponse) response.getBody()).getReply();
        assertTrue(reply.contains("Gaming Chair"));
        verify(chatHistoryRepository, times(1)).save(org.mockito.ArgumentMatchers.<ChatHistory>any());
    }
}
