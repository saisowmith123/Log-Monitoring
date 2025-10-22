package com.logs.controller;

import com.logs.dto.LogRequest;
import com.logs.model.ApiResponse;
import com.logs.model.LogEvent;
import com.logs.service.LogService;
import com.logs.util.ErrorUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    /**
     * Ingest a new log (from Node/Python script or other services)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Object>> receiveLog(@RequestBody LogRequest logRequestDTO) {
        try {
            logService.processLog(logRequestDTO);
            return ResponseEntity.ok(ApiResponse.ok("Log processed successfully"));
        } catch (Exception e) {
            log.error("Error while processing log: {}", e.getMessage());
            System.out.println(e.getMessage());
            return ErrorUtils.handleException(e);
        }
    }

    /**
     * Fetch recent logs (from Redis cache)
     */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<LogEvent>>> getRecentLogs() {
        try {
            List<LogEvent> logs = logService.getRecentLogs();
            return ResponseEntity.ok(ApiResponse.ok(logs));
        } catch (Exception e) {
            log.error("Error fetching recent logs: {}", e.getMessage());
            return ErrorUtils.handleException(e);
        }
    }

    /**
     * Fetch all logs (from Elasticsearch)
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Iterable<LogEvent>>> getAllLogs() {
        try {
            Iterable<LogEvent> logs = logService.getAllLogs();
            return ResponseEntity.ok(ApiResponse.ok(logs));
        } catch (Exception e) {
            log.error("Error fetching all logs: {}", e.getMessage());
            return ErrorUtils.handleException(e);
        }
    }
}
