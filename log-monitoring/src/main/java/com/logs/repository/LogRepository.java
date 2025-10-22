package com.logs.repository;

import com.logs.model.LogEvent;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogRepository extends ElasticsearchRepository<LogEvent, String> {

    List<LogEvent> findByServiceName(String serviceName);

    List<LogEvent> findByLevel(String level);

    List<LogEvent> findByServiceNameAndLevel(String serviceName, String level);
}
