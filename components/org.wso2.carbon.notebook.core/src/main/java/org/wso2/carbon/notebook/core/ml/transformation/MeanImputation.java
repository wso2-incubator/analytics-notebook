package org.wso2.carbon.notebook.core.ml.transformation;

import org.apache.spark.api.java.function.Function;
import org.wso2.carbon.ml.commons.domain.Feature;
import org.wso2.carbon.ml.core.exceptions.MLModelBuilderException;
import org.wso2.carbon.notebook.commons.constants.MLConstants;
import org.wso2.carbon.notebook.core.util.MLUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MeanImputation implements Function<String[], String[]> {

    private static final long serialVersionUID = 6936249532612016896L;
    private final Map<Integer, Double> meanImputation;

    public MeanImputation(Builder builder) {
        this.meanImputation = builder.meanImputation;
    }

    @Override
    public String[] call(String[] tokens) throws MLModelBuilderException {
        try {
            String[] features = new String[tokens.length];
            for (int i = 0; i < tokens.length; ++i) {
                if (MLConstants.MISSING_VALUES.contains(tokens[i])) {
                    // if mean imputation is set
                    if (meanImputation.containsKey(i)) {
                        features[i] = String.valueOf(meanImputation.get(i));
                    }
                } else {
                    features[i] = tokens[i];
                }
            }
            return features;
        } catch (Exception e) {
            throw new MLModelBuilderException("An error occurred while applying mean imputation: " + e.getMessage(), e);
        }
    }

    public static class Builder {
        private Map<Integer, Double> meanImputation;

        public Builder init(Map<String, Double> meanOfEachColumn, List<Feature> featureList) {
            meanImputation = new HashMap<Integer, Double>();

            // get feature indices for mean imputation
            List<Integer> meanImputeIndices = MLUtils.getImputeFeatureIndices(featureList, new ArrayList<Integer>(),
                    MLConstants.MEAN_IMPUTATION);
            for (Feature feature : featureList) {
                if (meanImputeIndices.indexOf(feature.getIndex()) != -1) {
                    double mean = meanOfEachColumn.get(feature.getName());
                    meanImputation.put(feature.getIndex(), mean);
                }
            }
            return this;
        }

        public Builder imputations(Map<Integer, Double> meanImputation) {
            this.meanImputation = meanImputation;
            return this;
        }

        public MeanImputation build() {
            return new MeanImputation(this);
        }
    }
}

