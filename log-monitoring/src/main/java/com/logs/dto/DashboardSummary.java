package com.logs.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummary {
    private long totalLogsToday;
    private long errorsLast5m;
    private long activeAlerts;
}
