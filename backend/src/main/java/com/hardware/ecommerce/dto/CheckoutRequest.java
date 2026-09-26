package com.hardware.ecommerce.dto;

import lombok.Data;

@Data
public class CheckoutRequest {
    private String shippingAddress;
    private String billingAddress;
}
