package com.buymore.service;

import com.buymore.dto.CartResponse;
import com.buymore.dto.ProductResponse;
import com.buymore.entity.Cart;
import com.buymore.entity.CartItem;
import com.buymore.entity.Product;
import com.buymore.exception.InsufficientInventoryException;
import com.buymore.exception.ResourceNotFoundException;
import com.buymore.repository.CartItemRepository;
import com.buymore.repository.CartRepository;
import com.buymore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Transactional
    public CartResponse getCart(String sessionId) {
        Cart cart = getOrCreateCart(sessionId);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(String sessionId, UUID productId, int quantity) {
        Cart cart = getOrCreateCart(sessionId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found", "PRODUCT_NOT_FOUND"));

        CartItem existing = cartItemRepository.findByCartAndProduct(cart, product).orElse(null);
        int currentQty = existing != null ? existing.getQuantity() : 0;
        int newQty = currentQty + quantity;

        if (newQty > product.getInventory()) {
            throw new InsufficientInventoryException(
                    "Only " + product.getInventory() + " items left in stock"
            );
        }

        if (existing != null) {
            existing.setQuantity(newQty);
            cartItemRepository.save(existing);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();
            cart.getItems().add(item);
            cartItemRepository.save(item);
        }

        return toResponse(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Transactional
    public CartResponse updateItem(String sessionId, UUID productId, int quantity) {
        Cart cart = getOrCreateCart(sessionId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found", "PRODUCT_NOT_FOUND"));

        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new ResourceNotFoundException("Item not in cart", "CART_ITEM_NOT_FOUND"));

        if (quantity > product.getInventory()) {
            throw new InsufficientInventoryException(
                    "Only " + product.getInventory() + " items left in stock"
            );
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return toResponse(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Transactional
    public CartResponse removeItem(String sessionId, UUID productId) {
        Cart cart = getOrCreateCart(sessionId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found", "PRODUCT_NOT_FOUND"));

        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new ResourceNotFoundException("Item not in cart", "CART_ITEM_NOT_FOUND"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return toResponse(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Transactional
    public void clearCart(String sessionId) {
        Cart cart = getOrCreateCart(sessionId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    Cart getOrCreateCart(String sessionId) {
        return cartRepository.findBySessionId(sessionId)
                .orElseGet(() -> cartRepository.save(
                        Cart.builder().sessionId(sessionId).build()
                ));
    }

    CartResponse toResponse(Cart cart) {
        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> CartResponse.CartItemResponse.builder()
                        .productId(item.getProduct().getId())
                        .product(ProductResponse.from(item.getProduct()))
                        .quantity(item.getQuantity())
                        .build())
                .toList();

        BigDecimal subtotal = itemResponses.stream()
                .map(i -> i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal taxes = subtotal.multiply(new BigDecimal("0.08"))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal shipping = subtotal.compareTo(new BigDecimal("100")) >= 0
                ? BigDecimal.ZERO.setScale(2)
                : new BigDecimal("9.99");
        BigDecimal total = subtotal.add(taxes).add(shipping).setScale(2, RoundingMode.HALF_UP);

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .subtotal(subtotal)
                .taxes(taxes)
                .shipping(shipping)
                .total(total)
                .build();
    }
}
