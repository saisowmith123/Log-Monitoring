package com.logs.dto;

import lombok.*;
import com.logs.enums.LogLevel;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogRequest {
    private String serviceName;
    private LogLevel level;
    private String message;
    private String timestamp;
    private String traceId;
}