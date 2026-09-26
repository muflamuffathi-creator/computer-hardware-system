package com.hardware.ecommerce.service;

import com.hardware.ecommerce.model.Product;
import com.hardware.ecommerce.repository.BrandRepository;
import com.hardware.ecommerce.repository.CategoryRepository;
import com.hardware.ecommerce.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    ProductRepository productRepository;

    @Mock
    CategoryRepository categoryRepository;

    @Mock
    BrandRepository brandRepository;

    @InjectMocks
    ProductService productService;

    @BeforeEach
    void setup() {
        // Mockito will inject mocks
    }

    @Test
    void deleteCategory_throws_when_products_linked() {
        when(productRepository.findByCategory_CategoryId(1L)).thenReturn(Collections.singletonList(new Product()));
        assertThrows(IllegalStateException.class, () -> productService.deleteCategory(1L));
        verify(productRepository).findByCategory_CategoryId(1L);
        verify(categoryRepository, never()).deleteById(anyLong());
    }

    @Test
    void deleteCategory_deletes_when_no_products() {
        when(productRepository.findByCategory_CategoryId(2L)).thenReturn(Collections.emptyList());
        assertDoesNotThrow(() -> productService.deleteCategory(2L));
        verify(categoryRepository).deleteById(2L);
    }

    @Test
    void deleteBrand_throws_when_products_linked() {
        when(productRepository.findByBrand_BrandId(3L)).thenReturn(Collections.singletonList(new Product()));
        assertThrows(IllegalStateException.class, () -> productService.deleteBrand(3L));
        verify(productRepository).findByBrand_BrandId(3L);
        verify(brandRepository, never()).deleteById(anyLong());
    }

    @Test
    void deleteBrand_deletes_when_no_products() {
        when(productRepository.findByBrand_BrandId(4L)).thenReturn(Collections.emptyList());
        assertDoesNotThrow(() -> productService.deleteBrand(4L));
        verify(brandRepository).deleteById(4L);
    }
}
