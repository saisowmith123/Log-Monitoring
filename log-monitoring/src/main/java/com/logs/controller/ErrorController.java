package com.logs.controller;

import com.logs.dto.*;
import com.logs.model.ApiResponse;
import com.logs.service.ErrorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/errors")
@RequiredArgsConstructor
public class ErrorController {

    private final ErrorService errorService;

    /** Trend over time (date histogram) */
    @PostMapping("/trend")
    public ResponseEntity<ApiResponse<TrendResponse>> trend(
            @RequestParam(defaultValue = "hour") String interval,
            @RequestBody(required = false) TimeRangeFilter filter
    ) {
        TrendResponse data = errorService.trend(filter, interval);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    /** Severity distribution (ERROR/WARN/INFO) */
    @PostMapping("/severity")
    public ResponseEntity<ApiResponse<SeverityCounts>> severity(
            @RequestBody(required = false) TimeRangeFilter filter
    ) {
        SeverityCounts data = errorService.severity(filter);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    /** Error count by service (top N) */
    @PostMapping("/byService")
    public ResponseEntity<ApiResponse<List<CountByService>>> errorsByService(
            @RequestParam(name = "top", defaultValue = "5") int top,
            @RequestBody(required = false) TimeRangeFilter filter
    ) {
        List<CountByService> data = errorService.errorsByService(filter, top);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    /** Recent logs (paginated, sorted by timestamp desc) */
    @PostMapping("/recent")
    public ResponseEntity<ApiResponse<PagedRecentErrors>> recent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestBody(required = false) TimeRangeFilter filter
    ) {
        PagedRecentErrors data = errorService.recent(filter, page, size);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
