package com.logs.service;

import com.logs.enums.AlertSeverity;
import com.logs.enums.AlertStatus;
import com.logs.enums.LogLevel;
import com.logs.model.Alert;
import com.logs.model.LogEvent;
import com.logs.repository.AlertRepository;
import com.logs.repository.LogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final LogRepository logRepository;
    private final AlertRepository alertRepository;
    /**
     * Evaluate all alerting rules for a given service.
     * If any rule triggers, an Alert is created/updated and returned.
     * If conditions have recovered, any OPEN alerts are resolved.
     */
    public Optional<Alert> evaluateForService(String serviceName) {
        Optional<Alert> maybe = checkErrorRate(serviceName, 5, 5 /*threshold*/);
        maybe.ifPresent(a -> log.warn("Alert triggered: {}", a));
        resolveIfRecovered(serviceName);
        return maybe;
    }

    /** List current open alerts. */
    public List<Alert> getActiveAlerts() {
        return alertRepository.findByStatus(AlertStatus.OPEN);
    }

    /** Trend: counts per day for last 14 days (opened alerts). */
    public List<Map<String, Object>> getTrendLastNDays(int days, ZoneId zone) {
        if (days <= 0) days = 14;
        // Include today: start = today - (days-1)
        LocalDate start = LocalDate.now(zone).minusDays(days - 1);

        // Pre-build empty buckets for [start .. today]
        Map<LocalDate, Long> buckets = new LinkedHashMap<>();
        for (int i = 0; i < days; i++) {
            buckets.put(start.plusDays(i), 0L);
        }

        // Count alerts by local day
        Iterable<Alert> all = alertRepository.findAll();
        for (Alert a : all) {
            if (a.getOpenedAt() == null) continue;
            LocalDate d = a.getOpenedAt().atZone(zone).toLocalDate();
            if (!d.isBefore(start)) {
                buckets.computeIfPresent(d, (k, v) -> v + 1);
            }
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd", Locale.ENGLISH);
        return buckets.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new java.util.HashMap<>();
                    m.put("day", fmt.format(e.getKey()));
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(java.util.stream.Collectors.toList());

    }

    // --- RULES ---

    /**
     * Rule: ERROR count in last <windowMinutes> minutes > threshold.
     */
    public Optional<Alert> checkErrorRate(String serviceName, int windowMinutes, int threshold) {
        Instant cutoff = Instant.now().minus(windowMinutes, ChronoUnit.MINUTES);
        long errorCount = logRepository
                .findByServiceNameAndLevelAndTimestampAfter(serviceName, LogLevel.ERROR, cutoff)
                .size();

        if (errorCount > threshold) {
            Alert alert = openOrUpdateAlert(serviceName,
                    "error.rate.high",
                    AlertSeverity.HIGH,
                    (double) errorCount,
                    (double) threshold,
                    "High error rate detected for " + serviceName);
            return Optional.of(alert);
        }
        return Optional.empty();
    }

    // --- HELPERS ---

    private Alert openOrUpdateAlert(String serviceName,
                                    String ruleId,
                                    AlertSeverity sev,
                                    Double observed,
                                    Double threshold,
                                    String note) {

        Optional<Alert> currentOpen = alertRepository
                .findFirstByServiceNameAndRuleIdAndStatusOrderByOpenedAtDesc(serviceName, ruleId, AlertStatus.OPEN);

        if (currentOpen.isPresent()) {
            Alert a = currentOpen.get();
            a.setObserved(observed);
            a.setThreshold(threshold);
            a.setNote(note);
            return alertRepository.save(a);
        }

        Alert created = Alert.builder()
                .serviceName(serviceName)
                .ruleId(ruleId)
                .severity(sev)
                .status(AlertStatus.OPEN)
                .observed(observed)
                .threshold(threshold)
                .openedAt(Instant.now())
                .note(note)
                .build();

        return alertRepository.save(created);
    }

    /** Close OPEN alerts if conditions have recovered. */
    private void resolveIfRecovered(String serviceName) {
        // For this demo: if last 5m ERRORs <= threshold, close any OPEN error.rate.high
        int threshold = 5;
        Instant cutoff = Instant.now().minus(5, ChronoUnit.MINUTES);
        long recentErrors = logRepository.findByServiceNameAndLevelAndTimestampAfter(serviceName,
                LogLevel.ERROR, cutoff).size();

        if (recentErrors <= threshold) {
            alertRepository.findFirstByServiceNameAndRuleIdAndStatusOrderByOpenedAtDesc(
                            serviceName, "error.rate.high", AlertStatus.OPEN)
                    .ifPresent(a -> {
                        a.setStatus(AlertStatus.RESOLVED);
                        a.setClosedAt(Instant.now());
                        a.setNote((a.getNote() == null ? "" : a.getNote() + " ") + "Auto-resolved.");
                        alertRepository.save(a);
                    });
        }
    }
}
