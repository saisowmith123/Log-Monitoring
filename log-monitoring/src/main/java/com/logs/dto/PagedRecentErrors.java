package com.logs.dto;

import com.logs.model.LogEvent;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagedRecentErrors {
    private List<LogEvent> items;
    private long total;
    private int page;
    private int size;
}
