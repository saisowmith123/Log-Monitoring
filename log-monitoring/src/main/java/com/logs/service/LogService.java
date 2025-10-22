package com.logs.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.logs.dto.LogRequest;
import com.logs.enums.LogLevel;
import com.logs.enums.Environment;
import com.logs.model.LogEvent;
import com.logs.repository.CacheRepository;
import com.logs.repository.LogRepository;
import com.logs.util.DateUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final LogRepository logRepository;
    private final CacheRepository cacheRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.pipeline.mode:direct}")
    private String mode;

    private static final String TOPIC_NAME = "log-events";
    private static final String STREAMING_MODE = "streaming";

    /**
     * Save a new log event: send to Kafka, cache, and index in ES.
     */
    public void processLog(LogRequest dto) throws JsonProcessingException {
        LogEvent event = LogEvent.builder()
                .serviceName(dto.getServiceName())
                .env(Environment.DEV)
                .tenant("default")
                .level(dto.getLevel() != null ? dto.getLevel() : LogLevel.INFO)
                .message(dto.getMessage())
                .traceId(dto.getTraceId())
                .timestamp(dto.getTimestamp() != null ?
                        LocalDateTime.ofInstant(DateUtils.parseIsoInstant(dto.getTimestamp()), ZoneOffset.UTC)
                        : LocalDateTime.ofInstant(Instant.now(), ZoneOffset.UTC))
                .build();
        String json = objectMapper.writeValueAsString(event);

        // Send to Kafka
        if(STREAMING_MODE.equalsIgnoreCase(mode)){
            kafkaTemplate.send(TOPIC_NAME, json);
            log.info("Published log to Kafka: {}", event);
            return;
        }

        // Save to Elasticsearch
        logRepository.save(event);
        log.info("Indexed log in Elasticsearch: {}", event.getId());

        // Update cache (keep last few logs in Redis)
        List<LogEvent> recentLogs = cacheRepository.getRecentLogs();
        if (recentLogs != null && recentLogs.size() >= 10) {
            recentLogs.remove(0);
        }
        if (recentLogs != null) {
            recentLogs.add(event);
            cacheRepository.saveRecentLogs(recentLogs);
        } else {
            cacheRepository.saveRecentLogs(List.of(event));
        }
    }

    /**
     * Retrieve recent logs from cache.
     */
    public List<LogEvent> getRecentLogs() {
        return cacheRepository.getRecentLogs();
    }

    /**
     * Fetch all logs (fallback to ES).
     */
    public Iterable<LogEvent> getAllLogs() {
        return logRepository.findAll();
    }
}
