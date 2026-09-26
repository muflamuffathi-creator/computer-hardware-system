package com.hardware.ecommerce.repository;

import com.hardware.ecommerce.model.PCBuild;
import com.hardware.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PCBuildRepository extends JpaRepository<PCBuild, Long> {
    List<PCBuild> findByUserOrderByCreatedAtDesc(User user);
}
