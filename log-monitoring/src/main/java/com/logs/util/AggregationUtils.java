package com.logs.util;
import co.elastic.clients.elasticsearch._types.aggregations.Aggregate;
import org.springframework.data.elasticsearch.core.AggregationsContainer;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Component
public class AggregationUtils {
    public Aggregate getAggByName(SearchHits<?> hits, String name) {
        AggregationsContainer<?> container = hits.getAggregations();
        if (container == null) {
            throw new IllegalStateException("No aggregations present in SearchHits");
        }

        Object raw = container.aggregations();

        // Path 1: SDE returns a Map<String, Aggregate>
        if (raw instanceof Map<?, ?> map) {
            Object v = map.get(name);
            if (v instanceof Aggregate agg) return agg;
        }

        // Path 2: SDE returns a List of wrapper objects (e.g., ElasticsearchAggregation)
        if (raw instanceof List<?> list) {
            for (Object o : list) {
                try {
                    // reflectively access wrapper.getName() and wrapper.getAggregation()
                    var c = o.getClass();
                    var getName = c.getMethod("getName");
                    var getAggregation = c.getMethod("getAggregation");
                    Object n = getName.invoke(o);
                    if (Objects.equals(n, name)) {
                        Object inner = getAggregation.invoke(o); // should be co.elastic ... Aggregate
                        if (inner instanceof Aggregate agg) return agg;
                    }
                } catch (Exception ignore) {
                    // fall through and try next
                }
            }
        }

        throw new IllegalStateException("Aggregation '" + name + "' not found (container type: "
                + raw.getClass().getName() + ")");
    }


}
