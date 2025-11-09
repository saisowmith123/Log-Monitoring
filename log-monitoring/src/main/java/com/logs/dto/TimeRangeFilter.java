package com.logs.dto;
import com.logs.enums.LogLevel;
import lombok.*;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeRangeFilter {
    private Instant from;
    private Instant to;
    private String serviceName;
    private LogLevel level;
    private String env;
}
