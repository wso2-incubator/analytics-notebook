package org.wso2.carbon.notebook.core.ml.transformation;

import org.apache.spark.api.java.function.Function;
import org.wso2.carbon.ml.commons.domain.Feature;
import org.wso2.carbon.notebook.commons.constants.MLConstants;
import org.wso2.carbon.notebook.core.util.MLUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Spark filter to remove discarded rows - Impute Option: Discard
 */
public class DiscardedRowsFilter implements Function<String[], Boolean> {
    private final List<Integer> indices;

    private DiscardedRowsFilter(Builder builder) {
        this.indices = builder.indices;
    }

    @Override
    public Boolean call(String[] tokens) {
        Boolean keep = true;
        for (Integer index : indices) {
            if (index >= tokens.length || MLConstants.MISSING_VALUES.contains(tokens[index])) {
                keep = false;
                break;
            }
        }
        return keep;
    }

    public static class Builder {
        private List<Integer> indices;

        public Builder init(List<Feature> features) {
            this.indices = MLUtils.getImputeFeatureIndices(features, new ArrayList<Integer>(),
                    MLConstants.DISCARD);
            return this;
        }

        public DiscardedRowsFilter build() {
            return new DiscardedRowsFilter(this);
        }
    }
}