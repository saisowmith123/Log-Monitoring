package com.logs.service;

import com.logs.dto.LogRequest;
import com.logs.enums.LogLevel;
import com.logs.enums.Environment;
import com.logs.model.LogEvent;
import com.logs.repository.CacheRepository;
import com.logs.repository.LogRepository;
import com.logs.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.*;
import org.springframework.data.elasticsearch.core.*;
import org.springframework.data.elasticsearch.core.query.*;
import com.logs.dto.LogSearchRequest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import java.util.Objects;

import static org.springframework.data.elasticsearch.core.SearchHitSupport.searchPageFor;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final LogRepository logRepository;
    private final CacheRepository cacheRepository;

    private final ElasticsearchOperations esOps;

    private static final String TOPIC_NAME = "log-events";

    /**
     * Save a new log event: send to Kafka, cache, and index in ES.
     */
    public void processLog(LogRequest dto) {
        LogEvent event = LogEvent.builder()
                .serviceName(dto.getServiceName())
                .env(Environment.DEV)
                .tenant("default")
                .level(dto.getLevel() != null ? dto.getLevel() : LogLevel.INFO)
                .message(dto.getMessage())
                .traceId(dto.getTraceId())
                .timestamp(dto.getTimestamp() != null ?
                        DateUtils.parseIsoInstant(dto.getTimestamp()) : Instant.now())
                .build();

        // Send to Kafka
        kafkaTemplate.send(TOPIC_NAME, event.toString());
        log.info("Published log to Kafka: {}", event);

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

    public List<LogEvent> getRecentLogs() { return cacheRepository.getRecentLogs(); }

    public Page<LogEvent> searchLogs(LogSearchRequest req) {
        Criteria rootCriteria = new Criteria();

        if (req.getServiceName() != null && !req.getServiceName().isBlank()) {
            rootCriteria.subCriteria(Criteria.where("serviceName").is(req.getServiceName()));
        }

        if (req.getTraceId() != null && !req.getTraceId().isBlank()) {
            rootCriteria.subCriteria(Criteria.where("traceId").is(req.getTraceId()));
        }

        if (req.getLevel() != null) {
            rootCriteria.subCriteria(Criteria.where("level").is(req.getLevel().name()));
        }

        if (req.getEnv() != null) {
            rootCriteria.subCriteria(Criteria.where("env").is(req.getEnv().name()));
        }

        if (req.getFrom() != null || req.getTo() != null) {
            Criteria timestampCriteria = Criteria.where("timestamp");
            if (req.getFrom() != null) timestampCriteria = timestampCriteria.greaterThanEqual(req.getFrom());
            if (req.getTo() != null) timestampCriteria = timestampCriteria.lessThanEqual(req.getTo());
            rootCriteria.subCriteria(timestampCriteria);
        }

        if (req.getMessage() != null && !req.getMessage().isBlank()) {
            String mode = Objects.toString(req.getMessageMode(), "contains").toLowerCase();

            Criteria messageCriteria;
            if ("exact".equals(mode)) {
                messageCriteria = Criteria.where("message.keyword").is(req.getMessage());
            } else if ("prefix".equals(mode)) {
                messageCriteria = Criteria.where("message").startsWith(req.getMessage());
            } else {
                messageCriteria = Criteria.where("message").contains(req.getMessage());
            }
            rootCriteria.subCriteria(messageCriteria);
        }

        System.out.println("Constructed Criteria: " + rootCriteria);

        int page = req.getPage() == null ? 0 : Math.max(req.getPage(), 0);
        int size = req.getSize() == null ? 20 : Math.min(Math.max(req.getSize(), 1), 200);
        Sort sort = Sort.by(
                "DESC".equalsIgnoreCase(req.getSortDir()) ? Sort.Direction.DESC : Sort.Direction.ASC,
                req.getSortBy() == null ? "timestamp" : req.getSortBy()
        );
        Pageable pageable = PageRequest.of(page, size, sort);

        Query q = new CriteriaQuery(rootCriteria, pageable);

        SearchHits<LogEvent> hits = esOps.search(q, LogEvent.class);
        return SearchHitSupport.searchPageFor(hits, pageable).map(SearchHit::getContent);
    }



}
