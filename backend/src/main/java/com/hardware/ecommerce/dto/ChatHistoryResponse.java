package com.hardware.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistoryResponse {
    private Long chatId;
    private String question;
    private String response;
    private String createdAt;
}
