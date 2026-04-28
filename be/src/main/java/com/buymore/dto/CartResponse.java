package com.buymore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {

    private UUID id;
    private List<CartItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal taxes;
    private BigDecimal shipping;
    private BigDecimal total;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemResponse {
        private UUID productId;
        private ProductResponse product;
        private Integer quantity;
    }
}
