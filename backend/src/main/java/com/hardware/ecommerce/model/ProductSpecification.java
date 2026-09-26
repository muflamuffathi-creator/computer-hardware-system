package com.hardware.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "product_specifications", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_id", "specification_name"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "product")
@EqualsAndHashCode(exclude = "product")
public class ProductSpecification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long specificationId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonBackReference
    private Product product;

    @Column(name = "specification_name", nullable = false, length = 100)
    private String specificationName;

    @Column(name = "specification_value", nullable = false)
    private String specificationValue;
}
