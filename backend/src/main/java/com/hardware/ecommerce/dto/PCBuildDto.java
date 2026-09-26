package com.hardware.ecommerce.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PCBuildDto {
    private Long buildId;
    private String buildName;
    private Long cpuId;
    private Long motherboardId;
    private Long ramId;
    private Long gpuId;
    private Long coolerId;
    private Long psuId;
    private Long caseId;
    private Long storageId;
    private BigDecimal totalPrice;
}
