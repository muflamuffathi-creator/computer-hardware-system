package com.hardware.ecommerce.service;

import com.hardware.ecommerce.model.Brand;
import com.hardware.ecommerce.model.Category;
import com.hardware.ecommerce.model.Product;
import com.hardware.ecommerce.repository.BrandRepository;
import com.hardware.ecommerce.repository.CategoryRepository;
import com.hardware.ecommerce.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Objects;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          BrandRepository brandRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        Objects.requireNonNull(id, "Product id is required");
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
    }

    public List<Product> searchProducts(String keyword, Long categoryId, Long brandId, Double minPrice, Double maxPrice) {
        return productRepository.searchProducts(keyword, categoryId, brandId, minPrice, maxPrice);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        Objects.requireNonNull(id, "Category id is required");
        return categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
    }

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand getBrandById(Long id) {
        Objects.requireNonNull(id, "Brand id is required");
        return brandRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found with id: " + id));
    }

    @Transactional
    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        // Prevent deleting a category that still has products referencing it
        List<Product> linked = productRepository.findByCategory_CategoryId(id);
        if (linked != null && !linked.isEmpty()) {
            throw new IllegalStateException("Cannot delete category: it is referenced by existing products.");
        }
        categoryRepository.deleteById(id);
    }

    @Transactional
    public Brand saveBrand(Brand brand) {
        return brandRepository.save(brand);
    }

    @Transactional
    public void deleteBrand(Long id) {
        // Prevent deleting a brand that still has products referencing it
        List<Product> linked = productRepository.findByBrand_BrandId(id);
        if (linked != null && !linked.isEmpty()) {
            throw new IllegalStateException("Cannot delete brand: it is referenced by existing products.");
        }
        brandRepository.deleteById(id);
    }

    @Transactional
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
