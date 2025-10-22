package com.logs.util;

import java.time.*;
import java.time.format.DateTimeFormatter;

public class DateUtils {

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_INSTANT;
    private static final ZoneId UTC = ZoneId.of("UTC");

    public static Instant parseIsoInstant(String isoString) {
        return Instant.from(ISO_FORMATTER.parse(isoString));
    }

    public static Instant nowUtc() {
        return Instant.now();
    }

    public static String formatIso(Instant instant) {
        return ISO_FORMATTER.format(instant);
    }

    public static Instant toUtc(LocalDateTime localDateTime) {
        return localDateTime.atZone(ZoneId.systemDefault()).withZoneSameInstant(UTC).toInstant();
    }

    public static Instant addMinutes(Instant instant, long minutes) {
        return instant.plus(Duration.ofMinutes(minutes));
    }

    public static boolean isOlderThan(Instant timestamp, long minutes) {
        return timestamp.isBefore(Instant.now().minus(Duration.ofMinutes(minutes)));
    }
}
