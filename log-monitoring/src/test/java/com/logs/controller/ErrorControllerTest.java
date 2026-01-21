package com.logs.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.logs.dto.*;
import com.logs.enums.Environment;
import com.logs.enums.LogLevel;
import com.logs.model.ApiResponse;
import com.logs.model.LogEvent;
import com.logs.service.ErrorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ErrorController.class)
class ErrorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ErrorService errorService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * POST /api/errors/trend
     */
    @Test
    void trend_success() throws Exception {
        TrendResponse response = TrendResponse.builder()
                .interval("hour")
                .trendPoints(List.of(
                        TrendPoint.builder()
                                .bucketStart(Instant.parse("2026-01-20T10:00:00Z"))
                                .count(5)
                                .build()
                ))
                .build();

        when(errorService.trend(null, "hour"))
                .thenReturn(response);

        mockMvc.perform(post("/api/errors/trend")
                        .param("interval", "hour")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.interval").value("hour"))
                .andExpect(jsonPath("$.data.trendPoints[0].count").value(5));
    }

    /**
     * POST /api/errors/severity
     */
    @Test
    void severity_success() throws Exception {
        SeverityCounts counts = SeverityCounts.builder()
                .error(12)
                .warn(5)
                .info(30)
                .build();

        when(errorService.severity(null))
                .thenReturn(counts);

        mockMvc.perform(post("/api/errors/severity")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.error").value(12))
                .andExpect(jsonPath("$.data.warn").value(5))
                .andExpect(jsonPath("$.data.info").value(30));
    }

    /**
     * POST /api/errors/byService?top=5
     */
    @Test
    void errorsByService_success() throws Exception {
        List<CountByService> data = List.of(
                CountByService.builder()
                        .serviceName("order-service")
                        .count(7)
                        .build()
        );

        when(errorService.errorsByService(null, 5))
                .thenReturn(data);

        mockMvc.perform(post("/api/errors/byService")
                        .param("top", "5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].serviceName").value("order-service"))
                .andExpect(jsonPath("$.data[0].count").value(7));
    }

    /**
     * POST /api/errors/recent?page=0&size=10
     */
    @Test
    void recent_success() throws Exception {
        LogEvent log = LogEvent.builder()
                .id("1")
                .serviceName("payment-service")
                .env(Environment.PROD)
                .level(LogLevel.ERROR)
                .message("Null pointer exception")
                .timestamp(Instant.now())
                .build();

        PagedRecentErrors paged = PagedRecentErrors.builder()
                .items(List.of(log))
                .total(1)
                .page(0)
                .size(10)
                .build();

        when(errorService.recent(null, 0, 10))
                .thenReturn(paged);

        mockMvc.perform(post("/api/errors/recent")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.items[0].serviceName").value("payment-service"))
                .andExpect(jsonPath("$.data.items[0].level").value("ERROR"));
    }
}
