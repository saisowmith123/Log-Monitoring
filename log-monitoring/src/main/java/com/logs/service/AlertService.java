package com.logs.service;

import com.logs.enums.AlertSeverity;
import com.logs.enums.AlertStatus;
import com.logs.enums.LogLevel;
import com.logs.model.Alert;
import com.logs.model.LogEvent;
import com.logs.repository.LogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final LogRepository logRepository;

    /**
     * Simple alert rule: if more than 5 ERROR logs for a service in the last 5 minutes.
     */
    public Alert checkErrorRate(String serviceName) {
        Instant cutoff = Instant.now().minusSeconds(300);
        List<LogEvent> logs = logRepository.findByServiceName(serviceName);

        long errorCount = logs.stream()
                .filter(l -> l.getLevel() == LogLevel.ERROR &&
                        l.getTimestamp().isAfter(LocalDateTime.ofInstant(cutoff, ZoneOffset.UTC)))
                .count();


        if (errorCount > 5) {
            Alert alert = Alert.builder()
                    .serviceName(serviceName)
                    .ruleId("error.rate.high")
                    .severity(AlertSeverity.HIGH)
                    .status(AlertStatus.OPEN)
                    .observed((double) errorCount)
                    .threshold(5.0)
                    .openedAt(Instant.now())
                    .note("High error rate detected for " + serviceName)
                    .build();

            log.warn("Alert triggered: {}", alert);
            return alert;
        }

        return null;
    }
}
