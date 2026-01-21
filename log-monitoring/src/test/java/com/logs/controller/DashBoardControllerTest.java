package com.logs.controller;

import com.logs.dto.DashboardSummary;
import com.logs.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.ZoneId;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DashBoardController.class)
class DashBoardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    /**
     * GET /api/dashboard/summary?zone=UTC
     */
    @Test
    void summary_withExplicitZone() throws Exception {
        DashboardSummary summary = DashboardSummary.builder()
                .totalLogsToday(1200)
                .errorsLast5m(45)
                .activeAlerts(3)
                .build();

        when(dashboardService.getSummary(ZoneId.of("UTC")))
                .thenReturn(summary);

        mockMvc.perform(get("/api/dashboard/summary")
                        .param("zone", "UTC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLogsToday").value(1200))
                .andExpect(jsonPath("$.errorsLast5m").value(45))
                .andExpect(jsonPath("$.activeAlerts").value(3));
    }

    /**
     * GET /api/dashboard/summary (default zone = UTC)
     */
    @Test
    void summary_withDefaultZone() throws Exception {
        DashboardSummary summary = DashboardSummary.builder()
                .totalLogsToday(800)
                .errorsLast5m(10)
                .activeAlerts(1)
                .build();

        when(dashboardService.getSummary(ZoneId.of("UTC")))
                .thenReturn(summary);

        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLogsToday").value(800))
                .andExpect(jsonPath("$.errorsLast5m").value(10))
                .andExpect(jsonPath("$.activeAlerts").value(1));
    }
}
