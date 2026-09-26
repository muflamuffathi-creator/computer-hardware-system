package com.hardware.ecommerce.service;

import com.hardware.ecommerce.model.Cart;
import com.hardware.ecommerce.model.CartItem;
import com.hardware.ecommerce.model.Product;
import com.hardware.ecommerce.model.User;
import com.hardware.ecommerce.repository.CartItemRepository;
import com.hardware.ecommerce.repository.CartRepository;
import com.hardware.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Objects;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    public Cart getCartForUser(User user) {
        Objects.requireNonNull(user, "User is required");
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart cart = Cart.builder().user(user).build();
                    return cartRepository.save(cart);
                });
    }

    @Transactional
    public Cart addItemToCart(User user, Long productId, Integer quantity) {
        Objects.requireNonNull(productId, "productId is required");
        Objects.requireNonNull(quantity, "quantity is required");
        Cart cart = getCartForUser(user);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));

        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock.");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByCartAndProduct(cart, product);

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;
            if (product.getStockQuantity() < newQuantity) {
                throw new IllegalArgumentException("Total requested quantity exceeds available stock.");
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
            // ensure the cart's collection is in sync in this transaction
            if (!cart.getCartItems().contains(item)) {
                cart.getCartItems().add(item);
            }
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();
            CartItem saved = cartItemRepository.save(item);
            // add the newly saved item to the cart collection so it is returned to clients
            cart.getCartItems().add(saved);
        }

        return getCartForUser(user);
    }

    @Transactional
    public Cart updateItemQuantity(User user, Long productId, Integer quantity) {
        Objects.requireNonNull(productId, "productId is required");
        Objects.requireNonNull(quantity, "quantity is required");
        Cart cart = getCartForUser(user);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));

        if (quantity <= 0) {
            return removeItemFromCart(user, productId);
        }

        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock.");
        }

        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new IllegalArgumentException("Product not found in cart."));

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        // ensure cart collection reflects updated item
        if (!cart.getCartItems().contains(item)) {
            cart.getCartItems().add(item);
        }

        return getCartForUser(user);
    }

    @Transactional
    public Cart removeItemFromCart(User user, Long productId) {
        Objects.requireNonNull(productId, "productId is required");
        Cart cart = getCartForUser(user);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new IllegalArgumentException("Product not found in cart."));

        cartItemRepository.delete(item);
        // remove from the cart collection so callers see the change immediately
        cart.getCartItems().removeIf(ci -> ci.getCartItemId().equals(item.getCartItemId()));
        return getCartForUser(user);
    }

    @Transactional
    public void clearCart(User user) {
        Cart cart = getCartForUser(user);
        cartItemRepository.deleteByCart(cart);
    }
}
