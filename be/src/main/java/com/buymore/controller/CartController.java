package com.buymore.controller;

import com.buymore.dto.CartItemRequest;
import com.buymore.dto.CartResponse;
import com.buymore.dto.UpdateCartItemRequest;
import com.buymore.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            @RequestHeader("X-Session-ID") String sessionId
    ) {
        return ResponseEntity.ok(cartService.getCart(sessionId));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @RequestHeader("X-Session-ID") String sessionId,
            @Valid @RequestBody CartItemRequest request
    ) {
        return ResponseEntity.ok(cartService.addItem(sessionId, request.getProductId(), request.getQuantity()));
    }

    @PatchMapping("/items/{productId}")
    public ResponseEntity<CartResponse> updateItem(
            @RequestHeader("X-Session-ID") String sessionId,
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return ResponseEntity.ok(cartService.updateItem(sessionId, productId, request.getQuantity()));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponse> removeItem(
            @RequestHeader("X-Session-ID") String sessionId,
            @PathVariable UUID productId
    ) {
        return ResponseEntity.ok(cartService.removeItem(sessionId, productId));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearCart(
            @RequestHeader("X-Session-ID") String sessionId
    ) {
        cartService.clearCart(sessionId);
        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }
}
