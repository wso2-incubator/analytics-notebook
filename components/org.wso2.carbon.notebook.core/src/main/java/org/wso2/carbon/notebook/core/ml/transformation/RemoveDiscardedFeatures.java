/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

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
