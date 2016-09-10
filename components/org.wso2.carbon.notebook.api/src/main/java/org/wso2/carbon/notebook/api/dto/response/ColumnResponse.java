package org.wso2.carbon.notebook.api.dto.response;

import org.wso2.carbon.analytics.datasource.commons.AnalyticsSchema;


public class ColumnResponse {
    private String name;
    private AnalyticsSchema.ColumnType type;
    private boolean indexed;
    private boolean scoreParam;

    public ColumnResponse(String name, AnalyticsSchema.ColumnType type, boolean indexed, boolean scoreParam) {
        this.name = name;
        this.type = type;
        this.indexed = indexed;
        this.scoreParam = scoreParam;
    }


    public boolean isIndexed() {
        return indexed;
    }

    public void setIndexed(boolean indexed) {
        this.indexed = indexed;
    }

    public boolean isScoreParam() {
        return scoreParam;
    }

    public void setScoreParam(boolean scoreParam) {
        this.scoreParam = scoreParam;
    }



    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AnalyticsSchema.ColumnType getType() {
        return type;
    }

    public void setType(AnalyticsSchema.ColumnType type) {
        this.type = type;
    }
}
