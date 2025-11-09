package com.logs.dto;

import lombok.*;
import java.util.List;
import com.logs.dto.TrendPoint;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrendResponse {
    private List<TrendPoint> trendPoints;
    private String interval;

}
