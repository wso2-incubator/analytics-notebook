package org.wso2.carbon.notebook.core.ml.transformation;

import org.apache.spark.api.java.function.Function;
import org.wso2.carbon.ml.commons.domain.Feature;
import org.wso2.carbon.notebook.core.util.MLUtils;

import java.util.List;

/**
 * Spark transformation to remove columns with discarded features
 * Also will restructure the columns such that the response column is the last column.
 */
public class RemoveDiscardedFeatures implements Function<String[], String[]> {
    private final List<Integer> newToOldIndicesList;

    private RemoveDiscardedFeatures(Builder builder) {
        this.newToOldIndicesList = builder.newToOldIndicesList;
    }

    @Override
    public String[] call(String[] tokens) {
        int size = newToOldIndicesList.size() + 1;
        String[] features = new String[size];
        for (int i = 0; i < tokens.length; i++) {
            int newIndex = newToOldIndicesList.indexOf(i);
            if (newIndex != -1) {
                features[newIndex] = tokens[i];
            }
        }
        return features;
    }

    public static class Builder {
        private List<Integer> newToOldIndicesList;

        public Builder init(List<Feature> features) {
            this.newToOldIndicesList = MLUtils.getIncludedFeatureIndices(features);
            return this;
        }

        public RemoveDiscardedFeatures build() {
            return new RemoveDiscardedFeatures(this);
        }
    }
}
