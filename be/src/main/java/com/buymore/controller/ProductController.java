package com.buymore.controller;

import com.buymore.dto.CategoryResponse;
import com.buymore.dto.ProductListResponse;
import com.buymore.dto.ProductResponse;
import com.buymore.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ProductListResponse> getProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(name = "is_featured", required = false) Boolean isFeatured,
            @RequestParam(defaultValue = "created_at_desc") String sort
    ) {
        return ResponseEntity.ok(productService.getProducts(page, limit, category, search, isFeatured, sort));
    }

    // Must be declared before /{id} so Spring matches the literal "categories" path first
    @GetMapping("/categories")
    public ResponseEntity<CategoryResponse> getCategories() {
        return ResponseEntity.ok(productService.getCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<Map<String, List<ProductResponse>>> getRelatedProducts(@PathVariable UUID id) {
        return ResponseEntity.ok(Map.of("data", productService.getRelatedProducts(id)));
    }
}
