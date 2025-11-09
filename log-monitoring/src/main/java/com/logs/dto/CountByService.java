package com.logs.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CountByService {
    private String serviceName;
    private long count;
}
