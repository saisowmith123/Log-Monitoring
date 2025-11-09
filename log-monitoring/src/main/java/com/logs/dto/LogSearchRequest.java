package com.logs.dto;
import com.logs.enums.Environment;
import com.logs.enums.LogLevel;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.Instant;

@Data
public class LogSearchRequest {
    private String serviceName;
    private String message;
    private String traceId;
    private LogLevel level;
    private Environment env;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private Instant from;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private Instant to;

    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "timestamp";
    private String sortDir = "DESC";

    private String messageMode = "contains";
}
