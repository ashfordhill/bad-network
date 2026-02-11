package com.badnetwork.trafficscrambler.controller;

import com.badnetwork.trafficscrambler.model.ChaosConfig;
import com.badnetwork.trafficscrambler.model.ChaosMetrics;
import com.badnetwork.trafficscrambler.service.ChaosService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chaos")
public class ChaosController {

    private static final Logger log = LoggerFactory.getLogger(ChaosController.class);

    private final ChaosService chaosService;

    public ChaosController(ChaosService chaosService) {
        this.chaosService = chaosService;
    }

    @PostMapping
    public ResponseEntity<ChaosConfig> updateChaosConfig(@RequestBody ChaosConfig config) {
        log.info("Received chaos config update: {}", config);
        chaosService.updateChaosConfig(config);
        return ResponseEntity.ok(config);
    }

    @GetMapping
    public ResponseEntity<ChaosConfig> getChaosConfig() {
        return ResponseEntity.ok(chaosService.getChaosConfig());
    }

    @GetMapping("/metrics")
    public ResponseEntity<ChaosMetrics> getMetrics() {
        return ResponseEntity.ok(chaosService.getMetrics());
    }

    @DeleteMapping
    public ResponseEntity<Void> resetChaosConfig() {
        log.info("Resetting chaos config to defaults");
        chaosService.updateChaosConfig(new ChaosConfig());
        return ResponseEntity.noContent().build();
    }
}
