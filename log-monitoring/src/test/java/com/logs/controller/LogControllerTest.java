package com.logs.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.logs.dto.LogRequest;
import com.logs.dto.LogSearchRequest;
import com.logs.enums.Environment;
import com.logs.enums.LogLevel;
import com.logs.model.LogEvent;
import com.logs.service.LogService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LogController.class)
class LogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LogService logService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * POST /api/logs - success
     */
    @Test
    void receiveLog_success() throws Exception {
        LogRequest request = LogRequest.builder()
                .serviceName("order-service")
                .level(LogLevel.INFO)
                .message("Order created")
                .build();

        mockMvc.perform(post("/api/logs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data")
                        .value("Log processed successfully"));
    }

    /**
     * POST /api/logs - exception
     */
    @Test
    void receiveLog_exception() throws Exception {
        LogRequest request = LogRequest.builder()
                .serviceName("order-service")
                .level(LogLevel.INFO)
                .message("Bad log")
                .build();

        doThrow(new RuntimeException("Failure"))
                .when(logService).processLog(request);

        mockMvc.perform(post("/api/logs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    /**
     * GET /api/logs/recent
     */
    @Test
    void getRecentLogs_success() throws Exception {
        LogEvent log = LogEvent.builder()
                .id("1")
                .serviceName("payment-service")
                .env(Environment.PROD)
                .level(LogLevel.ERROR)
                .message("Timeout")
                .timestamp(Instant.now())
                .build();

        when(logService.getRecentLogs())
                .thenReturn(List.of(log));

        mockMvc.perform(get("/api/logs/recent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].serviceName")
                        .value("payment-service"))
                .andExpect(jsonPath("$.data[0].level")
                        .value("ERROR"));
    }

    /**
     * POST /api/logs/search
     */
    @Test
    void search_success() throws Exception {
        LogEvent log = LogEvent.builder()
                .id("2")
                .serviceName("inventory-service")
                .env(Environment.PROD)
                .level(LogLevel.WARN)
                .message("Slow response")
                .timestamp(Instant.now())
                .build();

        Page<LogEvent> page = new PageImpl<>(List.of(log));

        LogSearchRequest request = new LogSearchRequest();
        request.setServiceName("inventory-service");
        request.setLevel(LogLevel.WARN);

        when(logService.searchLogs(request))
                .thenReturn(page);

        mockMvc.perform(post("/api/logs/search")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].serviceName")
                        .value("inventory-service"))
                .andExpect(jsonPath("$.data.content[0].level")
                        .value("WARN"));
    }

}
