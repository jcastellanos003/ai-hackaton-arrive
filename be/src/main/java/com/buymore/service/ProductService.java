package com.buymore.service;

import com.buymore.dto.CategoryResponse;
import com.buymore.dto.ProductListResponse;
import com.buymore.dto.ProductResponse;
import com.buymore.entity.Product;
import com.buymore.exception.ResourceNotFoundException;
import com.buymore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public ProductListResponse getProducts(int page, int limit, String category,
                                           String search, Boolean isFeatured, String sort) {
        int cappedLimit = Math.min(limit, 100);
        Pageable pageable = PageRequest.of(page - 1, cappedLimit, resolveSort(sort));

        String categoryFilter = (category != null && !category.isBlank()) ? category : null;
        String searchFilter = (search != null && !search.isBlank()) ? search : null;

        Page<Product> productPage = productRepository.findWithFilters(
                categoryFilter, searchFilter, isFeatured, pageable
        );

        List<ProductResponse> data = productPage.getContent().stream()
                .map(ProductResponse::from)
                .toList();

        ProductListResponse.Meta meta = new ProductListResponse.Meta(
                page,
                cappedLimit,
                productPage.getTotalElements(),
                productPage.getTotalPages()
        );

        return new ProductListResponse(data, meta);
    }

    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found", "PRODUCT_NOT_FOUND"));
        return ProductResponse.from(product);
    }

    public List<ProductResponse> getRelatedProducts(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found", "PRODUCT_NOT_FOUND"));
        return productRepository.findTop4ByCategoryAndIdNot(product.getCategory(), id).stream()
                .map(ProductResponse::from)
                .toList();
    }

    public CategoryResponse getCategories() {
        List<CategoryResponse.CategoryItem> items = productRepository.findCategoryCounts().stream()
                .map(c -> new CategoryResponse.CategoryItem(c.getName(), c.getCount()))
                .toList();
        return new CategoryResponse(items);
    }

    private Sort resolveSort(String sort) {
        if (sort == null) return Sort.by("createdAt").descending();
        return switch (sort) {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "name_asc" -> Sort.by("name").ascending();
            case "rating_desc" -> Sort.by("rating").descending();
            default -> Sort.by("createdAt").descending();
        };
    }
}
