package com.logs.controller;
import com.logs.dto.DashboardSummary;
import com.logs.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashBoardController {
    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardSummary summary(
            @RequestParam(required = false, defaultValue = "UTC") String zone
    ) {
        return dashboardService.getSummary(ZoneId.of(zone));
    }
}
