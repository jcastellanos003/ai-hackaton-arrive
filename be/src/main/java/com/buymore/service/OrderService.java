package com.buymore.service;

import com.buymore.dto.OrderRequest;
import com.buymore.dto.OrderResponse;
import com.buymore.entity.*;
import com.buymore.exception.InsufficientInventoryException;
import com.buymore.exception.ResourceNotFoundException;
import com.buymore.repository.OrderRepository;
import com.buymore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    @Transactional
    public OrderResponse placeOrder(String sessionId, OrderRequest request) {
        var cart = cartService.getOrCreateCart(sessionId);

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        // Re-validate inventory and decrement
        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found", "PRODUCT_NOT_FOUND"));

            if (cartItem.getQuantity() > product.getInventory()) {
                throw new InsufficientInventoryException(
                        "Only " + product.getInventory() + " item" +
                        (product.getInventory() == 1 ? "" : "s") +
                        " left in stock for " + product.getName()
                );
            }

            product.setInventory(product.getInventory() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // Calculate totals
        BigDecimal subtotal = cart.getItems().stream()
                .map(i -> i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal taxes = subtotal.multiply(new BigDecimal("0.08")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal shipping = subtotal.compareTo(new BigDecimal("100")) >= 0
                ? BigDecimal.ZERO.setScale(2)
                : new BigDecimal("9.99");
        BigDecimal total = subtotal.add(taxes).add(shipping).setScale(2, RoundingMode.HALF_UP);

        // Build order
        OrderRequest.ShippingInfo s = request.getShipping();
        CustomerOrder order = CustomerOrder.builder()
                .orderNumber(generateOrderNumber())
                .status("processing")
                .subtotal(subtotal)
                .taxes(taxes)
                .shipping(shipping)
                .total(total)
                .customerName(s.getFirstName() + " " + s.getLastName())
                .email(s.getEmail())
                .phone(s.getPhone())
                .estimatedDelivery(calculateEstimatedDelivery(LocalDate.now()))
                .items(new ArrayList<>())
                .build();

        ShippingAddress address = ShippingAddress.builder()
                .order(order)
                .firstName(s.getFirstName())
                .lastName(s.getLastName())
                .address(s.getAddress())
                .city(s.getCity())
                .state(s.getState())
                .zip(s.getZip())
                .country(s.getCountry())
                .build();
        order.setShippingAddress(address);

        for (CartItem cartItem : cart.getItems()) {
            Product p = cartItem.getProduct();
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(p)
                    .productName(p.getName())
                    .productImage(p.getImages().isEmpty() ? "" : p.getImages().get(0))
                    .price(p.getPrice())
                    .quantity(cartItem.getQuantity())
                    .build();
            order.getItems().add(orderItem);
        }

        CustomerOrder saved = orderRepository.save(order);

        // Clear cart
        cartService.clearCart(sessionId);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID id) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found", "ORDER_NOT_FOUND"));
        return toResponse(order);
    }

    private String generateOrderNumber() {
        int year = LocalDate.now().getYear();
        OffsetDateTime start = LocalDate.of(year, 1, 1).atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end = LocalDate.of(year + 1, 1, 1).atStartOfDay().atOffset(ZoneOffset.UTC);
        long count = orderRepository.countByCreatedAtBetween(start, end);
        return String.format("BM-%d-%05d", year, count + 1);
    }

    private LocalDate calculateEstimatedDelivery(LocalDate orderDate) {
        int businessDays = 3 + new Random().nextInt(3); // 3, 4, or 5
        LocalDate date = orderDate;
        int added = 0;
        while (added < businessDays) {
            date = date.plusDays(1);
            DayOfWeek dow = date.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                added++;
            }
        }
        return date;
    }

    private OrderResponse toResponse(CustomerOrder order) {
        List<OrderResponse.OrderItemResponse> items = order.getItems().stream()
                .map(i -> OrderResponse.OrderItemResponse.builder()
                        .productId(i.getProduct().getId())
                        .productName(i.getProductName())
                        .productImage(i.getProductImage())
                        .price(i.getPrice())
                        .quantity(i.getQuantity())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .items(items)
                .subtotal(order.getSubtotal())
                .taxes(order.getTaxes())
                .shipping(order.getShipping())
                .total(order.getTotal())
                .customerName(order.getCustomerName())
                .email(order.getEmail())
                .phone(order.getPhone())
                .estimatedDelivery(order.getEstimatedDelivery())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
