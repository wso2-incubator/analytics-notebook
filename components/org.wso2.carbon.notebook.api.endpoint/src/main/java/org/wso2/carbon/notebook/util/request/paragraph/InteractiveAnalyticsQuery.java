package org.wso2.carbon.notebook.util.request.paragraph;

import org.wso2.carbon.analytics.dataservice.commons.SortByField;

import java.util.List;

public class InteractiveAnalyticsQuery {
    private String tableName;
    private String query;
    private int start;
    private int count;
    private List<SortByField> sortByFields;

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public List<SortByField> getSortByFields() {
        return sortByFields;
    }

    public void setSortByFields(List<SortByField> sortByFields) {
        this.sortByFields = sortByFields;
    }
}
