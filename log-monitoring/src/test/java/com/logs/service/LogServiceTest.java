package com.logs.service;

import com.logs.dto.LogRequest;
import com.logs.dto.LogSearchRequest;
import com.logs.enums.Environment;
import com.logs.enums.LogLevel;
import com.logs.model.LogEvent;
import com.logs.repository.CacheRepository;
import com.logs.repository.LogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LogServiceTest {

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @Mock
    private LogRepository logRepository;

    @Mock
    private CacheRepository cacheRepository;

    @Mock
    private ElasticsearchOperations esOps;

    @InjectMocks
    private LogService logService;

    // ---------- processLog() ----------

    @Test
    void processLog_sendsToKafka_savesToEs_andUpdatesCache() {
        LogRequest req = new LogRequest();
        req.setServiceName("order-service");
        req.setLevel(LogLevel.ERROR);
        req.setMessage("Something failed");

        when(cacheRepository.getRecentLogs())
                .thenReturn(List.of()); // start empty

        logService.processLog(req);

        verify(kafkaTemplate, times(1))
                .send(eq("log-events"), anyString());

        verify(logRepository, times(1))
                .save(any(LogEvent.class));

        verify(cacheRepository, times(1))
                .saveRecentLogs(anyList());
    }

    @Test
    void processLog_trimsCacheWhenSizeExceedsLimit() {
        LogRequest req = new LogRequest();
        req.setServiceName("order-service");
        req.setMessage("Test");

        List<LogEvent> existing =
                new java.util.ArrayList<>(List.of(
                        new LogEvent(), new LogEvent(), new LogEvent(),
                        new LogEvent(), new LogEvent(), new LogEvent(),
                        new LogEvent(), new LogEvent(), new LogEvent(),
                        new LogEvent() // size = 10
                ));

        when(cacheRepository.getRecentLogs())
                .thenReturn(existing);

        logService.processLog(req);

        verify(cacheRepository).saveRecentLogs(argThat(list -> list.size() == 10));
    }

    // ---------- getRecentLogs() ----------

    @Test
    void getRecentLogs_returnsCache() {
        when(cacheRepository.getRecentLogs())
                .thenReturn(List.of(new LogEvent()));

        List<LogEvent> logs = logService.getRecentLogs();

        assertThat(logs).hasSize(1);
    }

}
