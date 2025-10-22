package com.logs.dto;
import lombok.*;
import org.springframework.web.bind.annotation.BindParam;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AggregatedLogStatsDTO {
    private String serviceName;
    private long errorCount;
    private long warnCount;
    private long infoCount;
    private String lastUpdated;
}
