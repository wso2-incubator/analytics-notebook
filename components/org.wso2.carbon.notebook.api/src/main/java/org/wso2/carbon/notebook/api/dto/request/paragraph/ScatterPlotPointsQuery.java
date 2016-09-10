package org.wso2.carbon.notebook.api.dto.request.paragraph;

public class ScatterPlotPointsQuery {
    private String tableName;
    private String xAxisFeature;
    private String yAxisFeature;
    private String groupByFeature;
    private int sampleSize;

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getxAxisFeature() {
        return xAxisFeature;
    }

    public void setxAxisFeature(String xAxisFeature) {
        this.xAxisFeature = xAxisFeature;
    }

    public String getyAxisFeature() {
        return yAxisFeature;
    }

    public void setyAxisFeature(String yAxisFeature) {
        this.yAxisFeature = yAxisFeature;
    }

    public String getGroupByFeature() {
        return groupByFeature;
    }

    public void setGroupByFeature(String groupByFeature) {
        this.groupByFeature = groupByFeature;
    }

    public int getSampleSize() {
        return sampleSize;
    }

    public void setSampleSize(int sampleSize) {
        this.sampleSize = sampleSize;
    }
}
