package com.logs.stream;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.logs.model.LogEvent;
import com.logs.repository.LogRepository;
import com.logs.repository.CacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class LogIngestConsumer {
    private final LogRepository logRepository;
    private final CacheRepository cacheRepository;
    private final ObjectMapper objectMapper;

    private static final String TOPIC_NAME = "log-events";
    private static final String GROUP_ID = "log-ingest-group";

    @KafkaListener(topics = TOPIC_NAME, groupId = GROUP_ID)
    public void handle(String payload) {
        try {
            LogEvent event = objectMapper.readValue(payload, LogEvent.class);
            logRepository.save(event);
            cacheRepository.pushRecent(event, 10);
            log.info("Indexed log event: {}", event);
        } catch (Exception e) {
            log.error("Failed to process log message: {}", payload, e);
        }
    }
}
