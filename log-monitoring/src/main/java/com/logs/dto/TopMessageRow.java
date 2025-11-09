package com.logs.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopMessageRow {
    private String message;
    private long count;
    private String serviceName;
    private Instant lastOccurred;
}
