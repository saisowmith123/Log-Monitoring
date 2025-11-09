package com.logs.service;

import com.logs.dto.*;
import com.logs.enums.LogLevel;
import com.logs.model.LogEvent;
import com.logs.repository.LogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregation;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregations;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.client.elc.NativeQueryBuilder;
import org.springframework.data.elasticsearch.core.*;
import org.springframework.stereotype.Service;
import co.elastic.clients.elasticsearch._types.aggregations.Aggregation;
import co.elastic.clients.elasticsearch._types.aggregations.StringTermsAggregate;
import co.elastic.clients.elasticsearch._types.aggregations.StringTermsBucket;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.SearchHit;
import java.util.Map;


import co.elastic.clients.elasticsearch._types.aggregations.Aggregate;
import co.elastic.clients.elasticsearch._types.aggregations.DateHistogramAggregate;
import co.elastic.clients.elasticsearch._types.aggregations.DateHistogramAggregation;
import co.elastic.clients.elasticsearch._types.aggregations.DateHistogramBucket;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.json.JsonData;
import co.elastic.clients.elasticsearch._types.aggregations.CalendarInterval;


import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ErrorService {

    private final ElasticsearchOperations esOps;
    private final LogRepository logRepository;


    private Query buildFilter(TimeRangeFilter f) {
        BoolQuery.Builder bool = new BoolQuery.Builder();

        if (f != null) {
            if (f.getServiceName() != null && !f.getServiceName().isBlank()) {
                bool.filter(q -> q.term(t -> t.field("serviceName").value(f.getServiceName())));
            }
            if (f.getLevel() != null) {
                bool.filter(q -> q.term(t -> t.field("level").value(f.getLevel().name())));
            }
            if (f.getEnv() != null && !f.getEnv().isBlank()) {
                bool.filter(q -> q.term(t -> t.field("env").value(f.getEnv())));
            }
            if (f.getFrom() != null || f.getTo() != null) {
                bool.filter(q -> q.range(r -> {
                    // configure and return RangeQuery.Builder itself
                    r.field("timestamp");
                    if (f.getFrom() != null) r.gte(JsonData.of(f.getFrom().toString()));
                    if (f.getTo() != null)   r.lte(JsonData.of(f.getTo().toString()));
                    return r;
                }));
            }
        }
        return Query.of(q -> q.bool(bool.build()));
    }

    private Query andFilters(Query... queries) {
        return Query.of(q -> q.bool(b -> {
            for (Query qi : queries) b.filter(qi);
            return b;
        }));
    }

//    @SuppressWarnings("unchecked")
//    private Map<String, Aggregate> aggs(SearchHits<?> hits) {
//        ElasticsearchAggregations aggregations = (ElasticsearchAggregations) hits.getAggregations();
//        return aggregations.aggregations();
//    }

    private Aggregate getAggregation(SearchHits<?> hits, String name) {
        ElasticsearchAggregations aggregations = (ElasticsearchAggregations) hits.getAggregations();
        assert aggregations != null;
        List<ElasticsearchAggregation> aggList = aggregations.aggregations();

        return aggList.stream()
                .filter(agg -> agg.aggregation().getName().equals(name))
                .findFirst()
                .map(ElasticsearchAggregation::aggregation)
                .map(org.springframework.data.elasticsearch.client.elc.Aggregation::getAggregate)
                .orElseThrow(() -> new IllegalStateException("Aggregation not found: " + name));
    }


    public TrendResponse trend(TimeRangeFilter f, String interval) {
        String iv = (interval == null || interval.isBlank()) ? "hour" : interval.toLowerCase();

        NativeQuery nq = new NativeQueryBuilder()
                .withQuery(buildFilter(f))
                .withAggregation("trend", Aggregation.of(a -> a.dateHistogram(
                        DateHistogramAggregation.of(d -> d
                                .field("timestamp")
                                .calendarInterval(
                                        switch (iv) {
                                            case "minute" -> CalendarInterval.Minute;
                                            case "day"    -> CalendarInterval.Day;
                                            default       -> CalendarInterval.Hour;
                                        }
                                )
                                .minDocCount(0)
                                .timeZone("UTC")
                        ))))
                .build();

        SearchHits<LogEvent> hits = esOps.search(nq, LogEvent.class);
        DateHistogramAggregate dh = getAggregation(hits, "trend").dateHistogram();

        List<TrendPoint> points = new ArrayList<>();
        for (DateHistogramBucket b : dh.buckets().array()) {
            points.add(new TrendPoint(Instant.ofEpochMilli(b.key()), b.docCount()));
        }
        return new TrendResponse(points, iv);
    }

    public SeverityCounts severity(TimeRangeFilter f) {
        NativeQuery nq = new NativeQueryBuilder()
                .withQuery(buildFilter(f))
                .withAggregation("by_level", Aggregation.of(a -> a.terms(
                        t -> t.field("level").size(10))))
                .build();

        SearchHits<LogEvent> hits = esOps.search(nq, LogEvent.class);
        StringTermsAggregate st = getAggregation(hits, "by_level").sterms();

        long err = 0, warn = 0, info = 0;
        for (StringTermsBucket b : st.buckets().array()) {
            String k = b.key().stringValue();
            if ("ERROR".equals(k)) err = b.docCount();
            else if ("WARN".equals(k)) warn = b.docCount();
            else if ("INFO".equals(k)) info = b.docCount();
        }
        return new SeverityCounts(err, warn, info);
    }


    public List<CountByService> errorsByService(TimeRangeFilter f, int topN) {
        Query base = buildFilter(f);
        Query onlyError = Query.of(q -> q.term(t -> t.field("level").value(LogLevel.ERROR.name())));

        NativeQuery nq = new NativeQueryBuilder()
                .withQuery(andFilters(base, onlyError))
                .withAggregation("by_svc", Aggregation.of(a -> a.terms(
                        t -> t.field("serviceName").size(Math.max(topN, 5)))))
                .build();

        SearchHits<LogEvent> hits = esOps.search(nq, LogEvent.class);
        StringTermsAggregate st = getAggregation(hits, "by_svc").sterms();

        return st.buckets().array().stream()
                .map(b -> new CountByService(b.key().stringValue(), b.docCount()))
                .sorted(Comparator.comparingLong(CountByService::getCount).reversed())
                .limit(topN)
                .collect(Collectors.toList());
    }



    public PagedRecentErrors recent(TimeRangeFilter f, int page, int size) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "timestamp"));

        NativeQuery nq = new NativeQueryBuilder()
                .withQuery(buildFilter(f))
                .withPageable(pageable)
                .build();

        SearchHits<LogEvent> hits = esOps.search(nq, LogEvent.class);
        List<LogEvent> items = hits.getSearchHits().stream()
                .map(SearchHit::getContent)
                .toList();

        long total = hits.getTotalHits();


        return PagedRecentErrors.builder()
                .items(items)
                .total(total)
                .page(pageable.getPageNumber())
                .size(pageable.getPageSize())
                .build();
    }
}
