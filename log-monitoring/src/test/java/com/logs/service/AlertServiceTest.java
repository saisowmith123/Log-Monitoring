package com.logs.service;

import com.logs.enums.AlertSeverity;
import com.logs.enums.AlertStatus;
import com.logs.enums.LogLevel;
import com.logs.model.Alert;
import com.logs.model.LogEvent;
import com.logs.repository.AlertRepository;
import com.logs.repository.LogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock
    private LogRepository logRepository;

    @Mock
    private AlertRepository alertRepository;

    @InjectMocks
    private AlertService alertService;

    private String serviceName;

    @BeforeEach
    void setup() {
        serviceName = "order-service";
    }

    /**
     * ERROR count > threshold → alert created
     */
    @Test
    void evaluateForService_triggersAlert() {
        when(logRepository.findByServiceNameAndLevelAndTimestampAfter(
                eq(serviceName), eq(LogLevel.ERROR), any()))
                .thenReturn(List.of(
                        new LogEvent(), new LogEvent(), new LogEvent(),
                        new LogEvent(), new LogEvent(), new LogEvent()
                ));

        when(alertRepository.findFirstByServiceNameAndRuleIdAndStatusOrderByOpenedAtDesc(
                serviceName, "error.rate.high", AlertStatus.OPEN))
                .thenReturn(Optional.empty());

        when(alertRepository.save(any(Alert.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Optional<Alert> result = alertService.evaluateForService(serviceName);

        assertThat(result).isPresent();
        assertThat(result.get().getStatus()).isEqualTo(AlertStatus.OPEN);
        assertThat(result.get().getSeverity()).isEqualTo(AlertSeverity.HIGH);
        assertThat(result.get().getObserved()).isGreaterThan(5);
    }

    /**
     * Existing OPEN alert → updated (not recreated)
     */
    @Test
    void evaluateForService_updatesExistingAlert() {
        Alert existing = Alert.builder()
                .serviceName(serviceName)
                .ruleId("error.rate.high")
                .status(AlertStatus.OPEN)
                .openedAt(Instant.now())
                .build();

        when(logRepository.findByServiceNameAndLevelAndTimestampAfter(
                eq(serviceName), eq(LogLevel.ERROR), any()))
                .thenReturn(List.of(new LogEvent(), new LogEvent(), new LogEvent(),
                        new LogEvent(), new LogEvent(), new LogEvent()));

        when(alertRepository.findFirstByServiceNameAndRuleIdAndStatusOrderByOpenedAtDesc(
                serviceName, "error.rate.high", AlertStatus.OPEN))
                .thenReturn(Optional.of(existing));

        when(alertRepository.save(existing)).thenReturn(existing);

        Optional<Alert> result = alertService.evaluateForService(serviceName);

        assertThat(result).isPresent();
        verify(alertRepository, times(1)).save(existing);
    }

    /**
     * ERROR count <= threshold → no alert
     */
    @Test
    void evaluateForService_noAlertWhenBelowThreshold() {
        when(logRepository.findByServiceNameAndLevelAndTimestampAfter(
                eq(serviceName), eq(LogLevel.ERROR), any()))
                .thenReturn(List.of(new LogEvent(), new LogEvent()));

        Optional<Alert> result = alertService.evaluateForService(serviceName);

        assertThat(result).isEmpty();
    }

    /**
     * Recovery resolves OPEN alert
     */
    @Test
    void resolveIfRecovered_closesOpenAlert() {
        Alert open = Alert.builder()
                .serviceName(serviceName)
                .ruleId("error.rate.high")
                .status(AlertStatus.OPEN)
                .openedAt(Instant.now())
                .build();

        when(logRepository.findByServiceNameAndLevelAndTimestampAfter(
                eq(serviceName), eq(LogLevel.ERROR), any()))
                .thenReturn(List.of(new LogEvent())); // below threshold

        when(alertRepository.findFirstByServiceNameAndRuleIdAndStatusOrderByOpenedAtDesc(
                serviceName, "error.rate.high", AlertStatus.OPEN))
                .thenReturn(Optional.of(open));

        when(alertRepository.save(any(Alert.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        alertService.evaluateForService(serviceName);

        assertThat(open.getStatus()).isEqualTo(AlertStatus.RESOLVED);
        assertThat(open.getClosedAt()).isNotNull();
    }

    /**
     * getActiveAlerts → OPEN alerts only
     */
    @Test
    void getActiveAlerts_returnsOpenAlerts() {
        Alert open = Alert.builder().status(AlertStatus.OPEN).build();

        when(alertRepository.findByStatus(AlertStatus.OPEN))
                .thenReturn(List.of(open));

        List<Alert> result = alertService.getActiveAlerts();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(AlertStatus.OPEN);
    }

    /**
     * Trend buckets over N days
     */
    @Test
    void getTrendLastNDays_buildsBuckets() {
        ZoneId zone = ZoneId.of("UTC");

        Alert a1 = Alert.builder()
                .openedAt(Instant.now())
                .build();

        when(alertRepository.findAll()).thenReturn(List.of(a1));

        List<Map<String, Object>> trend =
                alertService.getTrendLastNDays(3, zone);

        assertThat(trend).hasSize(3);
        assertThat(trend.get(2)).containsKey("count");
    }

    /**
     * days <= 0 defaults to 14
     */
    @Test
    void getTrendLastNDays_defaultsWhenInvalidDays() {
        when(alertRepository.findAll()).thenReturn(List.of());

        List<Map<String, Object>> trend =
                alertService.getTrendLastNDays(0, ZoneId.systemDefault());

        assertThat(trend).hasSize(14);
    }
}
