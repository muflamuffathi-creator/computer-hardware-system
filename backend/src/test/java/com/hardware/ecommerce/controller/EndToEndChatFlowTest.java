package com.hardware.ecommerce.controller;

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
import org.mockito.ArgumentCaptor;
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
public class EndToEndChatFlowTest {

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
    public void chatFlow_savesAndReturnsHistory() {
        setAuthenticatedUser("e2e@example.com");
        User user = User.builder().userId(777L).email("e2e@example.com").firstName("E2E").lastName("Test").role("CUSTOMER").password("pass").build();
        when(userService.getUserByEmail("e2e@example.com")).thenReturn(user);
        when(geminiAiService.generateResponse("How compatible is CPU X with Mobo Y?"))
                .thenReturn("They are compatible.");

        ChatRequest req = new ChatRequest();
        req.setMessage("How compatible is CPU X with Mobo Y?");

        ResponseEntity<?> chatResp = aiController.chat(req);
        assertEquals(200, chatResp.getStatusCode().value());
        assertTrue(chatResp.getBody() instanceof ChatResponse);
        assertEquals("They are compatible.", ((ChatResponse) chatResp.getBody()).getReply());

        ArgumentCaptor<ChatHistory> captor = ArgumentCaptor.forClass(ChatHistory.class);
        verify(chatHistoryRepository, times(1)).save(captor.capture());
        ChatHistory saved = captor.getValue();
        assertEquals(user.getEmail(), saved.getUser().getEmail());
        assertEquals("How compatible is CPU X with Mobo Y?", saved.getQuestion());
        assertEquals("They are compatible.", saved.getResponse());

        // Now simulate retrieval
        ChatHistory stored = ChatHistory.builder()
                .chatId(10L)
                .user(user)
                .question(saved.getQuestion())
                .response(saved.getResponse())
                .createdAt(LocalDateTime.now())
                .build();
        when(chatHistoryRepository.findByUserOrderByCreatedAtAsc(user)).thenReturn(List.of(stored));

        ResponseEntity<List<com.hardware.ecommerce.dto.ChatHistoryResponse>> historyResp = aiController.getChatHistory();
        assertEquals(200, historyResp.getStatusCode().value());
        List<com.hardware.ecommerce.dto.ChatHistoryResponse> list = historyResp.getBody();
        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals(stored.getQuestion(), list.get(0).getQuestion());
        assertEquals(stored.getResponse(), list.get(0).getResponse());
    }
}
