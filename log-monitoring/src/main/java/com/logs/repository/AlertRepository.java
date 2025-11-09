package com.logs.repository;

import com.logs.model.Alert;
import com.logs.enums.AlertStatus;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.elasticsearch.annotations.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface AlertRepository extends ElasticsearchRepository<Alert, String> {

    List<Alert> findByStatus(AlertStatus status);

    Optional<Alert> findFirstByServiceNameAndRuleIdAndStatusOrderByOpenedAtDesc(
            String serviceName, String ruleId, AlertStatus status);

    @Query("""
      {
        "bool": {
          "must": [
            { "term": {"serviceName": "?0"} },
            { "term": {"ruleId": "?1"} },
            { "range": {"openedAt": {"gte": "?2"}} }
          ]
        }
      }
    """)
    List<Alert> findRecentForRule(String serviceName, String ruleId, Instant since);

    long countByStatus(AlertStatus status);

}
