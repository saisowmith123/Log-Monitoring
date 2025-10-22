package com.logs.repository;
import com.logs.model.LogEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Repository
@RequiredArgsConstructor
public class CacheRepository {
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String RECENT_LOGS_KEY = "recent_logs";

    public void saveRecentLogs(List<LogEvent> logs) {
        ValueOperations<String, Object> ops = redisTemplate.opsForValue();
        ops.set(RECENT_LOGS_KEY, logs, 5, TimeUnit.MINUTES);
    }

    @SuppressWarnings("unchecked")
    public List<LogEvent> getRecentLogs() {
        ValueOperations<String, Object> ops = redisTemplate.opsForValue();
        Object cached = ops.get(RECENT_LOGS_KEY);
        return cached != null ? (List<LogEvent>) cached : null;
    }

    public void pushRecent(LogEvent event, int maxSizeSecondsTtl) {
        var ops = redisTemplate.opsForList();

        ops.leftPush(RECENT_LOGS_KEY, event);
        ops.trim(RECENT_LOGS_KEY, 0, maxSizeSecondsTtl - 1);

        redisTemplate.expire(RECENT_LOGS_KEY, java.time.Duration.ofMinutes(5));
    }


    public void clearCache() {
        redisTemplate.delete(RECENT_LOGS_KEY);
    }
}
