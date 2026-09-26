package com.hardware.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "brands")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long brandId;

    @Column(name = "brand_name", nullable = false, unique = true, length = 50)
    private String brandName;
}
