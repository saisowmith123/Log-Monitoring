package com.logs.model;

import com.logs.enums.LogLevel;
import com.logs.enums.Environment;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import javax.xml.stream.events.EndDocument;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(indexName = "logs")
public class LogEvent {
    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String serviceName;

    @Field(type = FieldType.Keyword)
    private Environment env;

    @Field(type = FieldType.Keyword)
    private String tenant;

    @Field(type = FieldType.Keyword)
    private LogLevel level;

    @Field(type = FieldType.Keyword)
    private String message;

    @Field(type = FieldType.Keyword)
    private String traceId;

    @Field(type = FieldType.Keyword)
    private Integer latencyMs;

    @Field(type = FieldType.Keyword)
    private String stack;

    @Field(type = FieldType.Date, format = DateFormat.date_optional_time)
    private Instant timestamp;

}

