package com.logs.controller;

import com.logs.model.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    /**
     * Simple health endpoint
     */
    @GetMapping("/health")
    public ApiResponse<String> healthCheck() {
        return ApiResponse.ok("Log Monitoring Service is up and running 🚀");
    }

    /**
     * Lightweight ping endpoint (used for uptime checks)
     */
    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }
}
