package org.wso2.carbon.notebook.commons.request.paragraph;


import org.wso2.carbon.ml.commons.domain.Feature;

import java.util.List;

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
