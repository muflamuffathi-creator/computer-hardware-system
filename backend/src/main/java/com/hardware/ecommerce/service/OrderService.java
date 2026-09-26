package com.hardware.ecommerce.service;

import com.hardware.ecommerce.dto.CheckoutRequest;
import com.hardware.ecommerce.model.*;
import com.hardware.ecommerce.repository.OrderRepository;
import com.hardware.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.math.BigDecimal;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        CartService cartService,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order checkout(User user, CheckoutRequest request) {
        Cart cart = cartService.getCartForUser(user);
        if (cart.getCartItems().isEmpty()) {
            throw new IllegalStateException("Cannot checkout with an empty cart.");
        }

        // 1. Verify stock levels for all items first
        for (CartItem item : cart.getCartItems()) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName() + 
                                                   " (Available: " + product.getStockQuantity() + ")");
            }
        }

        // 2. Build Order
        Order order = Order.builder()
                .user(user)
                .shippingAddress(request.getShippingAddress())
                .billingAddress(request.getBillingAddress())
                .orderStatus("PENDING")
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem item : cart.getCartItems()) {
            Product product = item.getProduct();
            
            // Deduct stock quantity
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(item.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();

            orderItems.add(orderItem);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(total);

        // 3. Save order and clear cart
        Order savedOrder = orderRepository.save(order);
        cartService.clearCart(user);

        return savedOrder;
    }

    public Order getOrderById(Long orderId) {
        Objects.requireNonNull(orderId, "Order id is required");
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));
    }

    public List<Order> getOrdersForUser(User user) {
        return orderRepository.findByUserOrderByOrderDateDesc(user);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Objects.requireNonNull(status, "Order status is required");
        Order order = getOrderById(orderId);
        order.setOrderStatus(status.toUpperCase());
        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(Long orderId, User user) {
        Order order = getOrderById(orderId);
        if (!order.getUser().getUserId().equals(user.getUserId()) && !user.getRole().equals("ADMIN")) {
            throw new IllegalArgumentException("You are not authorized to cancel this order.");
        }
        if ("COMPLETED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new IllegalStateException("Completed orders cannot be cancelled.");
        }
        if ("CANCELLED".equalsIgnoreCase(order.getOrderStatus())) {
            return order;
        }

        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setOrderStatus("CANCELLED");
        return orderRepository.save(order);
    }
}
