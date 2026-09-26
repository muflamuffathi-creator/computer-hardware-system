package com.hardware.ecommerce.controller;

import com.hardware.ecommerce.model.Brand;
import com.hardware.ecommerce.model.Category;
import com.hardware.ecommerce.model.Product;
import com.hardware.ecommerce.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://10.140.28.203:5173"}, allowCredentials = "true")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        
        List<Product> products = productService.searchProducts(keyword, categoryId, brandId, minPrice, maxPrice);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            Product product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    @GetMapping("/brands")
    public ResponseEntity<List<Brand>> getBrands() {
        return ResponseEntity.ok(productService.getAllBrands());
    }

    // Admin APIs
    @PostMapping("/admin/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            if (product.getCategory() != null && product.getCategory().getCategoryId() != null) {
                product.setCategory(productService.getCategoryById(product.getCategory().getCategoryId()));
            }
            if (product.getBrand() != null && product.getBrand().getBrandId() != null) {
                product.setBrand(productService.getBrandById(product.getBrand().getBrandId()));
            }
            Product saved = productService.saveProduct(product);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            String msg = "Error creating product: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(msg);
        }
    }

    @PutMapping("/admin/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        try {
            Product product = productService.getProductById(id);
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            product.setStockQuantity(productDetails.getStockQuantity());
            product.setImageUrl(productDetails.getImageUrl());
            if (productDetails.getCategory() != null && productDetails.getCategory().getCategoryId() != null) {
                product.setCategory(productService.getCategoryById(productDetails.getCategory().getCategoryId()));
            }
            if (productDetails.getBrand() != null && productDetails.getBrand().getBrandId() != null) {
                product.setBrand(productService.getBrandById(productDetails.getBrand().getBrandId()));
            }
            return ResponseEntity.ok(productService.saveProduct(product));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(productService.saveCategory(category));
    }

    @PutMapping("/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        try {
            Category category = productService.getCategoryById(id);
            category.setName(categoryDetails.getName());
            category.setDescription(categoryDetails.getDescription());
            return ResponseEntity.ok(productService.saveCategory(category));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            productService.deleteCategory(id);
            return ResponseEntity.ok("Category deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Cannot delete category: " + e.getMessage());
        }
    }

    @PostMapping("/admin/brands")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Brand> createBrand(@RequestBody Brand brand) {
        return ResponseEntity.ok(productService.saveBrand(brand));
    }

    @PutMapping("/admin/brands/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBrand(@PathVariable Long id, @RequestBody Brand brandDetails) {
        try {
            Brand brand = productService.getBrandById(id);
            brand.setBrandName(brandDetails.getBrandName());
            return ResponseEntity.ok(productService.saveBrand(brand));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/admin/brands/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBrand(@PathVariable Long id) {
        try {
            productService.deleteBrand(id);
            return ResponseEntity.ok("Brand deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Cannot delete brand: " + e.getMessage());
        }
    }

    @DeleteMapping("/admin/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok("Product deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Cannot delete product: " + e.getMessage());
        }
    }
}
