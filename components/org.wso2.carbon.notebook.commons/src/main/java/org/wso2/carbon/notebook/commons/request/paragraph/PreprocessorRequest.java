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

package org.wso2.carbon.notebook.commons.request.paragraph;

import org.wso2.carbon.ml.commons.domain.Feature;

import java.util.List;

/**
 * Store the attributes of a preprocessor request
 */
public class PreprocessorRequest {
    private String tableName;
    private String preprocessedTableName;
    private List<Feature> featureList;

    public PreprocessorRequest(String tableName, List<Feature> featureList) {
        this.tableName = tableName;
        this.featureList = featureList;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getPreprocessedTableName() {
        return preprocessedTableName;
    }

    public void setPreprocessedTableName(String preprocessedTableName) {
        this.preprocessedTableName = preprocessedTableName;
    }

    public List<Feature> getFeatureList() {
        return featureList;
    }

    public void setFeatureList(List<Feature> featureList) {
        this.featureList = featureList;
    }
}
