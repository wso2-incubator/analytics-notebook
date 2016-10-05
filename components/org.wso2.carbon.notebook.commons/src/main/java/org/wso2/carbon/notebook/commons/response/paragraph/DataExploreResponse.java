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

package org.wso2.carbon.notebook.commons.response.paragraph;

import org.wso2.carbon.ml.commons.domain.SamplePoints;
import org.wso2.carbon.notebook.commons.response.GeneralResponse;
import org.wso2.carbon.notebook.commons.response.Status;

import java.util.List;

/**
 * Store the attributes of a data explore response
 */
public class DataExploreResponse extends GeneralResponse {
    private SamplePoints sample;
    private List<String> categoricalFeatureNames;
    private List<String> numericalFeatureNames;

    public DataExploreResponse(SamplePoints sample, List<String> categoricalFeatureNames,
                               List<String> numericalFeatureNames) {
        super(Status.SUCCESS);
        this.sample = sample;
        this.categoricalFeatureNames = categoricalFeatureNames;
        this.numericalFeatureNames = numericalFeatureNames;
    }

    public SamplePoints getSample() {
        return sample;
    }

    public void setSample(SamplePoints sample) {
        this.sample = sample;
    }

    public List<String> getCategoricalFeatureNames() {
        return categoricalFeatureNames;
    }

    public void setCategoricalFeatureNames(List<String> categoricalFeatureNames) {
        this.categoricalFeatureNames = categoricalFeatureNames;
    }

    public List<String> getNumericalFeatureNames() {
        return numericalFeatureNames;
    }

    public void setNumericalFeatureNames(List<String> numericalFeatureNames) {
        this.numericalFeatureNames = numericalFeatureNames;
    }
}
