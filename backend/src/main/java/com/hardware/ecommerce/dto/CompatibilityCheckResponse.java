package com.hardware.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompatibilityCheckResponse {
    private boolean compatible;
    @Builder.Default
    private List<String> messages = new ArrayList<>();
    @Builder.Default
    private List<String> warnings = new ArrayList<>();
    private Integer totalWattage;
}
