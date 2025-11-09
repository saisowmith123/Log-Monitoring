package com.logs.controller;

import com.logs.model.Alert;
import com.logs.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping("/active")
    public List<Alert> getActive() {
        return alertService.getActiveAlerts();
    }

    @PostMapping("/evaluate/{serviceName}")
    public Map<String, Object> evaluateNow(@PathVariable String serviceName) {
        boolean triggered = alertService.evaluateForService(serviceName).isPresent();
        return Map.of("serviceName", serviceName, "triggered", triggered);
    }

    @GetMapping("/trend")
    public List<Map<String, Object>> getTrend(@RequestParam(defaultValue = "14") int days) {
        ZoneId zone = ZoneId.systemDefault();
        return alertService.getTrendLastNDays(days, zone);
    }

}
