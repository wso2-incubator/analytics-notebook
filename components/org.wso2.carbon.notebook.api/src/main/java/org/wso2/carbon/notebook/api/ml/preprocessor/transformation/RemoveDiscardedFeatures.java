package org.wso2.carbon.notebook.api.ml.preprocessor.transformation;

import org.apache.spark.api.java.function.Function;
import org.wso2.carbon.notebook.api.dto.request.paragraph.FeatureRequest;
import org.wso2.carbon.notebook.api.util.MLUtils;

import java.util.List;

/**
 * This class removes columns with discarded features and also will restructure the columns such that the response
 * column is the last column.
 */
public class RemoveDiscardedFeatures implements Function< String[], String[]> {

    private final List<Integer> newToOldIndicesList;

    private RemoveDiscardedFeatures(Builder builder) {
        this.newToOldIndicesList = builder.newToOldIndicesList;
    }

    /**
     * Function to remove discarded columns.
     *
     * @param tokens String array of tokens
     * @return String array
     */
    @Override
    public String[] call(String[] tokens) {
        int size = newToOldIndicesList.size() + 1;
        String[] features = new String[size];
        for (int i = 0; i < tokens.length; i++) {
            int newIndex = newToOldIndicesList.indexOf(i);
            if (newIndex != -1) {
                features[newIndex] = tokens[i];
            } else {
                // discarded feature
                continue;
            }
        }
        return features;
    }

    public static class Builder {
        private List<Integer> newToOldIndicesList;

        public Builder init(List<FeatureRequest> features) {
            this.newToOldIndicesList = MLUtils.getIncludedFeatureIndices(features);
            return this;
        }


        public Builder indices(List<Integer> indices) {
            this.newToOldIndicesList = indices;
            return this;
        }
//        public Builder init(List<Integer> indices) {
//            this.newToOldIndicesList = indices;
//            return this;
//        }

        public RemoveDiscardedFeatures build() {
            return new RemoveDiscardedFeatures(this);
        }
    }
}
