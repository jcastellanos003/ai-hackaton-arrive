package com.buymore.dto;

import com.buymore.entity.Product;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private List<String> images;
    private Integer inventory;
    private BigDecimal rating;
    private List<String> tags;
    private Boolean isFeatured;

    public static ProductResponse from(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .category(p.getCategory())
                .images(p.getImages())
                .inventory(p.getInventory())
                .rating(p.getRating())
                .tags(p.getTags())
                .isFeatured(p.getIsFeatured())
                .build();
    }
}
