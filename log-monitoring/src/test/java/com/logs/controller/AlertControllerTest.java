package com.logs.controller;

import com.logs.enums.AlertSeverity;
import com.logs.enums.AlertStatus;
import com.logs.enums.Environment;
import com.logs.model.Alert;
import com.logs.service.AlertService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AlertController.class)
class AlertControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AlertService alertService;

    /**
     * GET /api/alerts/active
     */
    @Test
    void getActiveAlerts_success() throws Exception {
        Alert alert1 = Alert.builder()
                .id("1")
                .ruleId("error.rate.high")
                .serviceName("order-service")
                .env(Environment.PROD)
                .tenant("tenant-a")
                .severity(AlertSeverity.HIGH)
                .status(AlertStatus.OPEN)
                .observed(12.5)
                .threshold(5.0)
                .openedAt(Instant.now())
                .note("High error rate detected")
                .build();

        Alert alert2 = Alert.builder()
                .id("2")
                .ruleId("latency.spike")
                .serviceName("payment-service")
                .env(Environment.PROD)
                .tenant("tenant-b")
                .severity(AlertSeverity.CRITICAL)
                .status(AlertStatus.OPEN)
                .observed(1800.0)
                .threshold(500.0)
                .openedAt(Instant.now())
                .note("Latency spike")
                .build();

        when(alertService.getActiveAlerts()).thenReturn(List.of(alert1, alert2));

        mockMvc.perform(get("/api/alerts/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].serviceName").value("order-service"))
                .andExpect(jsonPath("$[0].severity").value("HIGH"))
                .andExpect(jsonPath("$[1].serviceName").value("payment-service"))
                .andExpect(jsonPath("$[1].severity").value("CRITICAL"));
    }

    /**
     * POST /api/alerts/evaluate/{serviceName} - triggered
     */
    @Test
    void evaluateNow_triggered() throws Exception {
        Alert alert = Alert.builder()
                .id("3")
                .ruleId("cpu.spike")
                .serviceName("inventory-service")
                .env(Environment.PROD)
                .severity(AlertSeverity.MEDIUM)
                .status(AlertStatus.OPEN)
                .openedAt(Instant.now())
                .build();

        when(alertService.evaluateForService("inventory-service"))
                .thenReturn(Optional.of(alert));

        mockMvc.perform(post("/api/alerts/evaluate/inventory-service"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serviceName").value("inventory-service"))
                .andExpect(jsonPath("$.triggered").value(true));
    }

    /**
     * POST /api/alerts/evaluate/{serviceName} - not triggered
     */
    @Test
    void evaluateNow_notTriggered() throws Exception {
        when(alertService.evaluateForService("billing-service"))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/api/alerts/evaluate/billing-service"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serviceName").value("billing-service"))
                .andExpect(jsonPath("$.triggered").value(false));
    }

    /**
     * GET /api/alerts/trend?days=7
     */
    @Test
    void getTrend_success() throws Exception {
        List<Map<String, Object>> trend = List.of(
                Map.of("date", "2026-01-15", "count", 4),
                Map.of("date", "2026-01-16", "count", 6)
        );

        when(alertService.getTrendLastNDays(7, ZoneId.systemDefault()))
                .thenReturn(trend);

        mockMvc.perform(get("/api/alerts/trend")
                        .param("days", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].count").value(4))
                .andExpect(jsonPath("$[1].count").value(6));
    }

    /**
     * GET /api/alerts/trend - default days (14)
     */
    @Test
    void getTrend_defaultDays() throws Exception {
        when(alertService.getTrendLastNDays(14, ZoneId.systemDefault()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/alerts/trend"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
