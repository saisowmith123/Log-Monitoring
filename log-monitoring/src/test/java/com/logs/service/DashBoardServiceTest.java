package com.logs.service;

import com.logs.dto.DashboardSummary;
import com.logs.enums.AlertStatus;
import com.logs.enums.LogLevel;
import com.logs.model.LogEvent;
import com.logs.repository.AlertRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;

import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private ElasticsearchOperations esOps;

    @Mock
    private AlertRepository alertRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @BeforeEach
    void setup() {
        // nothing required
    }

    /**
     * getSummary should aggregate:
     * - total logs today
     * - error logs in last 5 minutes
     * - active alerts
     */
    @Test
    void getSummary_success() {
        ZoneId zone = ZoneId.of("UTC");

        // First countLogs call → totalLogsToday
        // Second countLogs call → errorsLast5m
        when(esOps.count(any(NativeQuery.class), eq(LogEvent.class)))
                .thenReturn(1200L)  // totalLogsToday
                .thenReturn(45L);   // errorsLast5m

        when(alertRepository.countByStatus(AlertStatus.OPEN))
                .thenReturn(3L);

        DashboardSummary summary = dashboardService.getSummary(zone);

        assertThat(summary).isNotNull();
        assertThat(summary.getTotalLogsToday()).isEqualTo(1200L);
        assertThat(summary.getErrorsLast5m()).isEqualTo(45L);
        assertThat(summary.getActiveAlerts()).isEqualTo(3L);

        // Verify ES count called twice
        verify(esOps, times(2))
                .count(any(NativeQuery.class), eq(LogEvent.class));

        // Verify alert count called once
        verify(alertRepository, times(1))
                .countByStatus(AlertStatus.OPEN);
    }
}
