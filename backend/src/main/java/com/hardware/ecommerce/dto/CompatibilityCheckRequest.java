package com.hardware.ecommerce.dto;

import lombok.Data;

@Data
public class CompatibilityCheckRequest {
    private Long cpuId;
    private Long motherboardId;
    private Long ramId;
    private Long gpuId;
    private Long coolerId;
    private Long psuId;
    private Long caseId;
    private Long storageId;
}
