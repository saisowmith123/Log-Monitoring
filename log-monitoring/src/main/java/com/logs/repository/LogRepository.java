package com.logs.repository;

import com.logs.model.LogEvent;
import com.logs.enums.LogLevel;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.elasticsearch.annotations.Query;

import java.time.Instant;
import java.util.List;

public interface LogRepository extends ElasticsearchRepository<LogEvent, String> {

    List<LogEvent> findByServiceName(String serviceName);

    List<LogEvent> findByServiceNameAndLevelAndTimestampAfter(
            String serviceName,
            LogLevel level,
            Instant timestamp);


    @Query("""
      { "size": 0,
        "aggs": {
          "services": { "terms": { "field": "serviceName", "size": 1000 } }
        }
      }
    """)
    List<LogEvent> listDistinctServicesAgg();
}
