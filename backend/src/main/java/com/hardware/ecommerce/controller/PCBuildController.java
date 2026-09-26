package com.hardware.ecommerce.controller;

import com.hardware.ecommerce.dto.PCBuildDto;
import com.hardware.ecommerce.model.PCBuild;
import com.hardware.ecommerce.model.Product;
import com.hardware.ecommerce.model.User;
import com.hardware.ecommerce.repository.PCBuildRepository;
import com.hardware.ecommerce.repository.ProductRepository;
import com.hardware.ecommerce.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/builds")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://10.140.28.203:5173", "http://10.140.28.203:5174", "http://192.168.23.203:5173", "http://192.168.23.203:5174"}, allowCredentials = "true")
public class PCBuildController {

    private final PCBuildRepository pcBuildRepository;
    private final ProductRepository productRepository;
    private final UserService userService;

    public PCBuildController(PCBuildRepository pcBuildRepository,
                             ProductRepository productRepository,
                             UserService userService) {
        this.pcBuildRepository = pcBuildRepository;
        this.productRepository = productRepository;
        this.userService = userService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByEmail(email);
    }

    @PostMapping
    public ResponseEntity<?> saveBuild(@RequestBody PCBuildDto dto) {
        try {
            User user = getAuthenticatedUser();

            Long cpuId = dto.getCpuId();
            Long motherboardId = dto.getMotherboardId();
            Long ramId = dto.getRamId();
            Long gpuId = dto.getGpuId();
            Long coolerId = dto.getCoolerId();
            Long psuId = dto.getPsuId();
            Long caseId = dto.getCaseId();
            Long storageId = dto.getStorageId();

            Product cpu = cpuId != null ? productRepository.findById(cpuId).orElse(null) : null;
            Product mobo = motherboardId != null ? productRepository.findById(motherboardId).orElse(null) : null;
            Product ram = ramId != null ? productRepository.findById(ramId).orElse(null) : null;
            Product gpu = gpuId != null ? productRepository.findById(gpuId).orElse(null) : null;
            Product cooler = coolerId != null ? productRepository.findById(coolerId).orElse(null) : null;
            Product psu = psuId != null ? productRepository.findById(psuId).orElse(null) : null;
            Product pcCase = caseId != null ? productRepository.findById(caseId).orElse(null) : null;
            Product storage = storageId != null ? productRepository.findById(storageId).orElse(null) : null;

            StringBuilder invalidComponents = new StringBuilder();
            if (cpuId != null && cpu == null) invalidComponents.append("CPU, ");
            if (motherboardId != null && mobo == null) invalidComponents.append("Motherboard, ");
            if (ramId != null && ram == null) invalidComponents.append("RAM, ");
            if (gpuId != null && gpu == null) invalidComponents.append("GPU, ");
            if (coolerId != null && cooler == null) invalidComponents.append("Cooler, ");
            if (psuId != null && psu == null) invalidComponents.append("PSU, ");
            if (caseId != null && pcCase == null) invalidComponents.append("Case, ");
            if (storageId != null && storage == null) invalidComponents.append("Storage, ");
            if (invalidComponents.length() > 0) {
                String invalidList = invalidComponents.toString();
                invalidList = invalidList.substring(0, invalidList.length() - 2);
                return ResponseEntity.badRequest().body("Invalid build component selection: " + invalidList + ".");
            }

            if (cpu == null && mobo == null && ram == null && gpu == null && cooler == null && psu == null && pcCase == null && storage == null) {
                return ResponseEntity.badRequest().body("At least one component must be selected to save a build.");
            }

            BigDecimal totalPrice = BigDecimal.ZERO;
            if (cpu != null) totalPrice = totalPrice.add(cpu.getPrice());
            if (mobo != null) totalPrice = totalPrice.add(mobo.getPrice());
            if (ram != null) totalPrice = totalPrice.add(ram.getPrice());
            if (gpu != null) totalPrice = totalPrice.add(gpu.getPrice());
            if (cooler != null) totalPrice = totalPrice.add(cooler.getPrice());
            if (psu != null) totalPrice = totalPrice.add(psu.getPrice());
            if (pcCase != null) totalPrice = totalPrice.add(pcCase.getPrice());
            if (storage != null) totalPrice = totalPrice.add(storage.getPrice());

            PCBuild build = PCBuild.builder()
                    .user(user)
                    .buildName(dto.getBuildName() != null ? dto.getBuildName() : "My Custom PC Build")
                    .cpu(cpu)
                    .motherboard(mobo)
                    .ram(ram)
                    .gpu(gpu)
                    .cooler(cooler)
                    .psu(psu)
                    .pcCase(pcCase)
                    .storage(storage)
                    .totalPrice(totalPrice)
                    .build();

            PCBuild saved = pcBuildRepository.save(build);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to save build: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<PCBuild>> getMyBuilds() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(pcBuildRepository.findByUserOrderByCreatedAtDesc(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBuild(@PathVariable long id) {
        try {
            User user = getAuthenticatedUser();
            PCBuild build = pcBuildRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Build not found."));

            if (!build.getUser().getUserId().equals(user.getUserId()) && !user.getRole().equals("ADMIN")) {
                return ResponseEntity.status(403).body("Access denied.");
            }

            pcBuildRepository.delete(build);
            return ResponseEntity.ok("Build deleted successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
