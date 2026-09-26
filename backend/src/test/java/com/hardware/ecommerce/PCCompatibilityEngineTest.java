package com.hardware.ecommerce;

import com.hardware.ecommerce.dto.CompatibilityCheckRequest;
import com.hardware.ecommerce.dto.CompatibilityCheckResponse;
import com.hardware.ecommerce.model.Product;
import com.hardware.ecommerce.model.ProductSpecification;
import com.hardware.ecommerce.repository.ProductRepository;
import com.hardware.ecommerce.service.PCCompatibilityEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PCCompatibilityEngineTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private PCCompatibilityEngine compatibilityEngine;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testSocketCompatibility_Success() {
        // Arrange
        Product cpu = createMockProduct(1L, "CPU", List.of(
            createSpec("socket", "AM5"),
            createSpec("tdp", "120W")
        ));
        Product mobo = createMockProduct(2L, "Motherboard", List.of(
            createSpec("socket", "AM5"),
            createSpec("ram_type", "DDR5")
        ));

        when(productRepository.findById(1L)).thenReturn(Optional.of(cpu));
        when(productRepository.findById(2L)).thenReturn(Optional.of(mobo));

        CompatibilityCheckRequest request = new CompatibilityCheckRequest();
        request.setCpuId(1L);
        request.setMotherboardId(2L);

        // Act
        CompatibilityCheckResponse response = compatibilityEngine.checkCompatibility(request);

        // Assert
        assertTrue(response.isCompatible());
        assertTrue(response.getMessages().contains("CPU and Motherboard socket match (AM5)."));
    }

    @Test
    public void testSocketCompatibility_Mismatch() {
        // Arrange
        Product cpu = createMockProduct(1L, "CPU", List.of(
            createSpec("socket", "AM5")
        ));
        Product mobo = createMockProduct(2L, "Motherboard", List.of(
            createSpec("socket", "LGA1700")
        ));

        when(productRepository.findById(1L)).thenReturn(Optional.of(cpu));
        when(productRepository.findById(2L)).thenReturn(Optional.of(mobo));

        CompatibilityCheckRequest request = new CompatibilityCheckRequest();
        request.setCpuId(1L);
        request.setMotherboardId(2L);

        // Act
        CompatibilityCheckResponse response = compatibilityEngine.checkCompatibility(request);

        // Assert
        assertFalse(response.isCompatible());
        assertTrue(response.getMessages().stream().anyMatch(m -> m.contains("Incompatible CPU & Motherboard")));
    }

    @Test
    public void testCompatibility_NoComponentsSelected() {
        CompatibilityCheckRequest request = new CompatibilityCheckRequest();
        CompatibilityCheckResponse response = compatibilityEngine.checkCompatibility(request);

        assertTrue(response.isCompatible());
        assertEquals(1, response.getMessages().size());
        assertEquals("No components selected yet.", response.getMessages().get(0));
    }

    @Test
    public void testSocketCompatibilityWithMissingSpecData() {
        // Arrange
        Product cpu = createMockProduct(1L, "CPU", List.of(
            createSpec("tdp", "120W")
        ));
        Product mobo = createMockProduct(2L, "Motherboard", List.of(
            createSpec("ram_type", "DDR5")
        ));

        when(productRepository.findById(1L)).thenReturn(Optional.of(cpu));
        when(productRepository.findById(2L)).thenReturn(Optional.of(mobo));

        CompatibilityCheckRequest request = new CompatibilityCheckRequest();
        request.setCpuId(1L);
        request.setMotherboardId(2L);

        // Act
        CompatibilityCheckResponse response = compatibilityEngine.checkCompatibility(request);

        // Assert
        assertFalse(response.isCompatible());
        assertTrue(response.getMessages().stream().anyMatch(m -> m.contains("socket validation incomplete")));
    }

    @Test
    public void testCoolerCompatibilityWithMissingSpecData() {
        // Arrange
        Product cpu = createMockProduct(1L, "CPU", List.of(
            createSpec("socket", "AM5")
        ));
        Product cooler = createMockProduct(2L, "Cooler", List.of(
            createSpec("tdp", "125W")
        ));

        when(productRepository.findById(1L)).thenReturn(Optional.of(cpu));
        when(productRepository.findById(2L)).thenReturn(Optional.of(cooler));

        CompatibilityCheckRequest request = new CompatibilityCheckRequest();
        request.setCpuId(1L);
        request.setCoolerId(2L);

        // Act
        CompatibilityCheckResponse response = compatibilityEngine.checkCompatibility(request);

        // Assert
        assertFalse(response.isCompatible());
        assertTrue(response.getMessages().stream().anyMatch(m -> m.contains("CPU Cooler compatibility could not be fully validated")));
    }

    @Test
    public void testCoolerCompatibilityMatch() {
        Product cpu = createMockProduct(1L, "CPU", List.of(
            createSpec("socket", "AM5")
        ));
        Product cooler = createMockProduct(2L, "Cooler", List.of(
            createSpec("supported_sockets", "AM5,LGA1700")
        ));

        when(productRepository.findById(1L)).thenReturn(Optional.of(cpu));
        when(productRepository.findById(2L)).thenReturn(Optional.of(cooler));

        CompatibilityCheckRequest request = new CompatibilityCheckRequest();
        request.setCpuId(1L);
        request.setCoolerId(2L);

        CompatibilityCheckResponse response = compatibilityEngine.checkCompatibility(request);

        assertTrue(response.isCompatible());
        assertTrue(response.getMessages().stream().anyMatch(m -> m.contains("CPU Cooler supports socket AM5")));
    }

    private Product createMockProduct(Long id, String categoryName, List<ProductSpecification> specs) {
        Product product = Product.builder()
                .productId(id)
                .name("Mock Component " + id)
                .price(BigDecimal.valueOf(100.0))
                .stockQuantity(10)
                .specifications(new ArrayList<>(specs))
                .build();
        for (ProductSpecification s : product.getSpecifications()) {
            s.setProduct(product);
        }
        return product;
    }

    private ProductSpecification createSpec(String name, String value) {
        return ProductSpecification.builder()
                .specificationName(name)
                .specificationValue(value)
                .build();
    }
}
