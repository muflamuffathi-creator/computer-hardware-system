package com.hardware.ecommerce.repository;

import com.hardware.ecommerce.model.Cart;
import com.hardware.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
}
