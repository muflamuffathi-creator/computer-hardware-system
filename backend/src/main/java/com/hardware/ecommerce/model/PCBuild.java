package com.hardware.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pc_builds")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PCBuild {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long buildId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "build_name", nullable = false, length = 100)
    private String buildName;

    @ManyToOne
    @JoinColumn(name = "cpu_id")
    private Product cpu;

    @ManyToOne
    @JoinColumn(name = "motherboard_id")
    private Product motherboard;

    @ManyToOne
    @JoinColumn(name = "ram_id")
    private Product ram;

    @ManyToOne
    @JoinColumn(name = "gpu_id")
    private Product gpu;

    @ManyToOne
    @JoinColumn(name = "cooler_id")
    private Product cooler;

    @ManyToOne
    @JoinColumn(name = "psu_id")
    private Product psu;

    @ManyToOne
    @JoinColumn(name = "case_id")
    private Product pcCase;

    @ManyToOne
    @JoinColumn(name = "storage_id")
    private Product storage;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
