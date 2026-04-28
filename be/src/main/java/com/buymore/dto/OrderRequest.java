package com.buymore.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderRequest {

    @NotNull(message = "shipping is required")
    @Valid
    private ShippingInfo shipping;

    @NotNull(message = "payment is required")
    @Valid
    private PaymentInfo payment;

    @Data
    public static class ShippingInfo {
        @NotBlank(message = "firstName is required")
        private String firstName;

        @NotBlank(message = "lastName is required")
        private String lastName;

        @NotBlank(message = "email is required")
        @Email(message = "email must be valid")
        private String email;

        private String phone;

        @NotBlank(message = "address is required")
        private String address;

        @NotBlank(message = "city is required")
        private String city;

        @NotBlank(message = "state is required")
        private String state;

        @NotBlank(message = "zip is required")
        private String zip;

        @NotBlank(message = "country is required")
        private String country;
    }

    @Data
    public static class PaymentInfo {
        @NotBlank(message = "cardNumber is required")
        private String cardNumber;

        @NotBlank(message = "cardExpiry is required")
        private String cardExpiry;

        @NotBlank(message = "cardCvc is required")
        private String cardCvc;
    }
}
