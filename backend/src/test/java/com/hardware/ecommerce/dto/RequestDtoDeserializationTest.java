package com.hardware.ecommerce.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RequestDtoDeserializationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void loginRequestDeserializesFromJson() throws Exception {
        String json = "{\"email\":\"customer@example.com\",\"password\":\"password123\"}";

        LoginRequest request = objectMapper.readValue(json, LoginRequest.class);

        assertEquals("customer@example.com", request.getEmail());
        assertEquals("password123", request.getPassword());
    }

    @Test
    void registerRequestDeserializesFromJson() throws Exception {
        String json = "{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\",\"password\":\"password123\"}";

        RegisterRequest request = objectMapper.readValue(json, RegisterRequest.class);

        assertEquals("Test", request.getFirstName());
        assertEquals("User", request.getLastName());
        assertEquals("test@example.com", request.getEmail());
        assertEquals("password123", request.getPassword());
    }
}
