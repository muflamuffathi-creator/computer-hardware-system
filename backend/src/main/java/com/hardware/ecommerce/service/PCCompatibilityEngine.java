package com.hardware.ecommerce.service;

import com.hardware.ecommerce.dto.CompatibilityCheckRequest;
import com.hardware.ecommerce.dto.CompatibilityCheckResponse;
import com.hardware.ecommerce.model.Product;
import com.hardware.ecommerce.model.ProductSpecification;
import com.hardware.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class PCCompatibilityEngine {

    private final ProductRepository productRepository;

    public PCCompatibilityEngine(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public CompatibilityCheckResponse checkCompatibility(CompatibilityCheckRequest request) {
        boolean compatible = true;
        List<String> messages = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        int estimatedWattage = 0;

        Long cpuId = request.getCpuId();
        Long motherboardId = request.getMotherboardId();
        Long ramId = request.getRamId();
        Long gpuId = request.getGpuId();
        Long coolerId = request.getCoolerId();
        Long psuId = request.getPsuId();
        Long caseId = request.getCaseId();

        Product cpu = cpuId != null ? productRepository.findById(cpuId).orElse(null) : null;
        Product mobo = motherboardId != null ? productRepository.findById(motherboardId).orElse(null) : null;
        Product ram = ramId != null ? productRepository.findById(ramId).orElse(null) : null;
        Product gpu = gpuId != null ? productRepository.findById(gpuId).orElse(null) : null;
        Product cooler = coolerId != null ? productRepository.findById(coolerId).orElse(null) : null;
        Product psu = psuId != null ? productRepository.findById(psuId).orElse(null) : null;
        Product pcCase = caseId != null ? productRepository.findById(caseId).orElse(null) : null;

        // 1. CPU & Motherboard Socket Check
        if (cpu != null && mobo != null) {
            String cpuSocket = getSpec(cpu, "socket");
            String moboSocket = getSpec(mobo, "socket");
            if (cpuSocket != null && moboSocket != null) {
                if (!cpuSocket.equalsIgnoreCase(moboSocket)) {
                    compatible = false;
                    messages.add("Incompatible CPU & Motherboard: CPU uses socket " + cpuSocket + 
                                 " but Motherboard uses socket " + moboSocket + ".");
                } else {
                    messages.add("CPU and Motherboard socket match (" + cpuSocket + ").");
                }
            } else {
                compatible = false;
                messages.add("CPU/Motherboard socket validation incomplete because socket metadata is missing.");
            }
        }

        // 2. Motherboard & RAM Standard Check (DDR4 vs DDR5)
        if (mobo != null && ram != null) {
            String moboRamType = getSpec(mobo, "ram_type");
            String ramType = getSpec(ram, "ram_type");
            if (moboRamType != null && ramType != null) {
                if (!moboRamType.equalsIgnoreCase(ramType)) {
                    compatible = false;
                    messages.add("Incompatible RAM & Motherboard: Motherboard supports " + moboRamType + 
                                 " but RAM is " + ramType + ".");
                } else {
                    messages.add("RAM and Motherboard memory generation match (" + ramType + ").");
                }
            } else {
                compatible = false;
                messages.add("Motherboard/RAM compatibility could not be fully validated due to missing memory type data.");
            }
        }

        // 3. CPU Cooler Socket Fit Check
        if (cpu != null && cooler != null) {
            String cpuSocket = getSpec(cpu, "socket");
            String coolerSockets = getSpec(cooler, "supported_sockets");
            if (coolerSockets == null) {
                coolerSockets = getSpec(cooler, "socket");
            }
            if (cpuSocket != null && coolerSockets != null) {
                String[] supportedSockets = coolerSockets.split("[,|;]");
                List<String> supportedList = Arrays.stream(supportedSockets)
                        .filter(Objects::nonNull)
                        .map(value -> value.trim())
                        .map(value -> value.toLowerCase(Locale.ROOT))
                        .toList();
                if (!supportedList.contains(cpuSocket.toLowerCase(Locale.ROOT))) {
                    compatible = false;
                    messages.add("Incompatible CPU Cooler: CPU uses " + cpuSocket + 
                                 " but cooler only supports " + coolerSockets + ".");
                } else {
                    messages.add("CPU Cooler supports socket " + cpuSocket + ".");
                }
            } else {
                compatible = false;
                messages.add("CPU Cooler compatibility could not be fully validated because socket metadata is missing.");
            }
        }

        // 4. Case & Motherboard Form Factor Check
        if (pcCase != null && mobo != null) {
            String moboSize = getSpec(mobo, "form_factor");
            String caseSizes = getSpec(pcCase, "supported_form_factors");
            if (moboSize != null && caseSizes != null) {
                String[] supportedFormFactors = caseSizes.split(",");
                List<String> supportedList = Arrays.stream(supportedFormFactors)
                        .filter(Objects::nonNull)
                        .map(value -> value.trim())
                        .map(value -> value.toLowerCase(Locale.ROOT))
                        .toList();
                if (!supportedList.contains(moboSize.toLowerCase())) {
                    compatible = false;
                    messages.add("Incompatible Case & Motherboard: Motherboard is " + moboSize + 
                                 " but Case only fits " + caseSizes + ".");
                } else {
                    messages.add("Case fits " + moboSize + " motherboard.");
                }
            } else {
                compatible = false;
                messages.add("Case and Motherboard fit could not be validated because form factor data is missing.");
            }
        }

        // 5. Power Consumption & PSU Sufficiency Check
        int cpuTdp = parseWattage(getSpec(cpu, "tdp"), 100); // default 100w
        int gpuTdp = parseWattage(getSpec(gpu, "tdp"), 250); // default 250w if gpu is selected, else 0
        if (gpu == null) gpuTdp = 0;
        int systemTdp = cpuTdp + gpuTdp + 150; // 150w for motherboard, fans, drives, safety margin
        estimatedWattage = systemTdp;

        if (psu != null) {
            int psuWattage = parseWattage(getSpec(psu, "wattage"), 0);
            if (psuWattage > 0 && psuWattage < systemTdp) {
                compatible = false;
                messages.add("Insufficient Power Supply: System estimated draw is " + systemTdp + 
                             "W (including 150W safety margin) but PSU is only rated for " + psuWattage + "W.");
            } else {
                messages.add("Power Supply (" + psuWattage + "W) is sufficient for system requirements (" + systemTdp + "W).");
            }
        } else if (gpu != null) {
            String recPsu = getSpec(gpu, "recommended_psu");
            if (recPsu != null) {
                warnings.add("GPU suggests a minimum " + recPsu + " Power Supply.");
            }
        }

        // Clean default messages if nothing selected
        if (cpu == null && mobo == null && ram == null && gpu == null && cooler == null && psu == null && pcCase == null) {
            messages.add("No components selected yet.");
        }

        return CompatibilityCheckResponse.builder()
                .compatible(compatible)
                .messages(messages)
                .warnings(warnings)
                .totalWattage(estimatedWattage)
                .build();
    }

    private String getSpec(Product p, String key) {
        if (p == null || p.getSpecifications() == null) return null;
        for (ProductSpecification spec : p.getSpecifications()) {
            if (spec.getSpecificationName().equalsIgnoreCase(key)) {
                return spec.getSpecificationValue();
            }
        }
        return null;
    }

    private int parseWattage(String val, int defaultVal) {
        if (val == null) return defaultVal;
        try {
            return Integer.parseInt(val.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            return defaultVal;
        }
    }
}
