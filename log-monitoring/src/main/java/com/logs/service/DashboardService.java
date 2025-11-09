package com.logs.service;

import com.logs.dto.DashboardSummary;
import com.logs.enums.LogLevel;
import com.logs.model.LogEvent;
import com.logs.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.client.elc.NativeQueryBuilder;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.stereotype.Service;
import co.elastic.clients.elasticsearch._types.query_dsl.*;
import co.elastic.clients.json.JsonData;

import java.time.*;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ElasticsearchOperations esOps;
    private final AlertRepository alertRepository;

    /** Neutral summary: no filters. */
    public DashboardSummary getSummary(ZoneId zone) {
        Instant startOfToday = LocalDate.now(zone).atStartOfDay(zone).toInstant();
        Instant now = Instant.now();

        long totalLogsToday = countLogs(startOfToday, now, null);
        long errorsLast5m   = countLogs(now.minus(5, ChronoUnit.MINUTES), now, LogLevel.ERROR);
        long activeAlerts   = alertRepository.countByStatus(com.logs.enums.AlertStatus.OPEN);

        return DashboardSummary.builder()
                .totalLogsToday(totalLogsToday)
                .errorsLast5m(errorsLast5m)
                .activeAlerts(activeAlerts)
                .build();
    }

    private long countLogs(Instant from, Instant to, LogLevel level) {
        BoolQuery.Builder bool = new BoolQuery.Builder();
        if (level != null) {
            bool.filter(q -> q.term(t -> t.field("level").value(level.name())));
        }
        if (from != null || to != null) {
            bool.filter(q -> q.range(r -> {
                r.field("timestamp");
                if (from != null) r.gte(JsonData.of(from.toString()));
                if (to != null)   r.lte(JsonData.of(to.toString()));
                return r;
            }));
        }
        Query query = Query.of(q -> q.bool(bool.build()));
        NativeQuery nq = new NativeQueryBuilder().withQuery(query).build();
        return esOps.count(nq, LogEvent.class);
    }
}
