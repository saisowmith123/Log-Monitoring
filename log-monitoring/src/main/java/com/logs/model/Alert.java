package com.logs.model;
import com.logs.enums.AlertSeverity;
import com.logs.enums.AlertStatus;
import com.logs.enums.Environment;
import com.logs.enums.LogLevel;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.Instant;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "alerts")
public class Alert {
    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String ruleId;               // e.g., error.rate.high

    @Field(type = FieldType.Keyword)
    private String serviceName;

    @Field(type = FieldType.Keyword)
    private Environment env;

    @Field(type = FieldType.Keyword)
    private String tenant;

    @Field(type = FieldType.Keyword)
    private AlertSeverity severity;      // LOW | MEDIUM | HIGH | CRITICAL

    @Field(type = FieldType.Keyword)
    private AlertStatus status;          // OPEN | RESOLVED | SUPPRESSED

    @Field(type = FieldType.Double)
    private Double observed;             // e.g., observed error rate

    @Field(type = FieldType.Double)
    private Double threshold;            // threshold that triggered alert

    @Field(type = FieldType.Date, format = DateFormat.date_optional_time)
    private Instant openedAt;

    @Field(type = FieldType.Date, format = DateFormat.date_optional_time)
    private Instant closedAt;            // null while OPEN

    @Field(type = FieldType.Text)
    private String note;                 // optional runbook / message
}
