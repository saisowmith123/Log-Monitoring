package com.logs.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TrendPoint {
    private Instant bucketStart;
    private long count;
}
