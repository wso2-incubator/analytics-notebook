package org.wso2.carbon.notebook.api.endpoint.dto.request.paragraph;

import java.util.List;

public class PreprocessorRequest {
    private String tableName;
    private List<FeatureRequest> featureList;

    public PreprocessorRequest(String tableName, List<FeatureRequest> featureList) {
        this.tableName = tableName;
        this.featureList = featureList;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public List<FeatureRequest> getFeatureList() {
        return featureList;
    }

    public void setFeatureList(List<FeatureRequest> featureList) {
        this.featureList = featureList;
    }
}
