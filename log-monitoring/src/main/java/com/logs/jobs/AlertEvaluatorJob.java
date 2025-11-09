package com.logs.jobs;

import com.logs.model.LogEvent;
import com.logs.repository.LogRepository;
import com.logs.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Slf4j
@Component
@RequiredArgsConstructor
public class AlertEvaluatorJob {

    private final LogRepository logRepository;
    private final AlertService alertService;

    @Scheduled(fixedRate = 60_000L, initialDelay = 10_000L)
    public void run() {
        Set<String> services = StreamSupport.stream(logRepository.findAll().spliterator(), false)
                .map(LogEvent::getServiceName)
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.toSet());

        services.forEach(svc -> {
            try { alertService.evaluateForService(svc); }
            catch (Exception e) { log.error("Alert evaluation failed for {}", svc, e); }
        });
    }
}
