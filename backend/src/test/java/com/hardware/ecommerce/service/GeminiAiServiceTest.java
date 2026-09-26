package com.hardware.ecommerce.service;

import com.hardware.ecommerce.model.Brand;
import com.hardware.ecommerce.model.Category;
import com.hardware.ecommerce.model.Product;
import com.hardware.ecommerce.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import org.mockito.Mockito;

@ExtendWith(MockitoExtension.class)
public class GeminiAiServiceTest {

    @Mock
    private ProductRepository productRepository;

    private GeminiAiService geminiAiService;

    @BeforeEach
    public void setUp() {
        geminiAiService = new GeminiAiService(productRepository);
        // Manually set apiKey to mock mode using reflection since it's private
        try {
            var field = GeminiAiService.class.getDeclaredField("apiKey");
            field.setAccessible(true);
            field.set(geminiAiService, "mock_mode_key");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    public void offlineResponse_returnsGamingChairRecommendation() {
        // Setup mock products
        Brand brand = Brand.builder().brandId(1L).brandName("ComfortTech").build();
        Category category = Category.builder().categoryId(1L).name("Chairs").build();
        Product chair = Product.builder()
                .productId(1L)
                .name("Gaming Chair")
                .brand(brand)
                .category(category)
                .price(BigDecimal.valueOf(299.99))
                .stockQuantity(5)
                .build();

        Mockito.lenient().when(productRepository.findAll()).thenReturn(List.of(chair));

        String response = geminiAiService.generateResponse("gaming chairs");

        assertNotNull(response);
        assertTrue(response.contains("Gaming Chair") || response.contains("gaming chair"),
                "Response should contain gaming chair information");
        assertTrue(response.contains("$") || response.contains("comfort"),
                "Response should contain pricing or comfort features");
    }

    @Test
    public void offlineResponse_handlesSingleWordChairQuery() {
        Mockito.lenient().when(productRepository.findAll()).thenReturn(List.of());

        String response = geminiAiService.generateResponse("chair");

        assertNotNull(response);
        assertTrue(response.toLowerCase().contains("chair"),
                "Response should mention chairs");
    }

    @Test
    public void offlineResponse_handlesSeatingQuery() {
        Mockito.lenient().when(productRepository.findAll()).thenReturn(List.of());

        String response = geminiAiService.generateResponse("seating");

        assertNotNull(response);
        assertTrue(response.toLowerCase().contains("chair") || response.toLowerCase().contains("seating"),
                "Response should address seating/chair query");
    }

    @Test
    public void offlineResponse_returnsCategoryBasedRecommendationForMonitorQueries() {
        Brand brand = Brand.builder().brandId(2L).brandName("Acer").build();
        Category category = Category.builder().categoryId(2L).name("Monitors").build();
        Product monitor = Product.builder()
                .productId(2L)
                .name("Acer Predator X27")
                .brand(brand)
                .category(category)
                .price(BigDecimal.valueOf(899.99))
                .stockQuantity(4)
                .build();

        Mockito.lenient().when(productRepository.findAll()).thenReturn(List.of(monitor));

        String response = geminiAiService.generateResponse("monitors");

        assertNotNull(response);
        assertTrue(response.toLowerCase().contains("monitor") || response.toLowerCase().contains("monitors"),
                "Response should mention monitors");
        assertTrue(response.contains("$") || response.contains("monitor"),
                "Response should include product details for the matching category");
    }

    @Test
    public void offlineResponse_returnsGPURecommendation() {
        Mockito.lenient().when(productRepository.findAll()).thenReturn(List.of());

        String response = geminiAiService.generateResponse("gaming gpu");

        assertNotNull(response);
        assertTrue(response.contains("RTX") || response.contains("GPU"),
                "Response should contain GPU recommendations");
    }

    @Test
    public void offlineResponse_returnsBuildRecommendation() {
        Mockito.lenient().when(productRepository.findAll()).thenReturn(List.of());

        String response = geminiAiService.generateResponse("suggest a build");

        assertNotNull(response);
        assertTrue(response.contains("CPU") || response.contains("build"),
                "Response should contain build recommendation");
    }

    @Test
    public void offlineResponse_returnsCoolerRecommendation() {
        Mockito.lenient().when(productRepository.findAll()).thenReturn(List.of());

        String response = geminiAiService.generateResponse("cpu cooler");

        assertNotNull(response);
        assertTrue(response.toLowerCase().contains("cooler") || response.contains("NZXT Kraken X63") || response.contains("Noctua NH-D15"),
                "Response should mention CPU coolers or the specific cooler products.");
    }
}
