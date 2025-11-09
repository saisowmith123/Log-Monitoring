package com.logs.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeverityCounts {
    private long error;
    private long info;
    private long warn;
}
