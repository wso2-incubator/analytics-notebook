package org.wso2.carbon.notebook.api.endpoint.dto.request.paragraph;

//import org.wso2.carbon.analytics.dataservice.commons.SortByField;

public class InteractiveAnalyticsQuery {

    private int draw;
    private String tableName;
    private String query;
    private int paginationFrom;
    private int paginationCount;
    private long timeFrom;
    private long timeTo;
//    private List<SortByField> sortByFields;

    public int getDraw() {
        return draw;
    }

    public void setDraw(int draw) {
        this.draw = draw;
    }

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

    public int getPaginationFrom() {
        return paginationFrom;
    }

    public void setPaginationFrom(int paginationFrom) {
        this.paginationFrom = paginationFrom;
    }

    public int getPaginationCount() {
        return paginationCount;
    }

    public void setPaginationCount(int paginationCount) {
        this.paginationCount = paginationCount;
    }

    public long getTimeFrom() {
        return timeFrom;
    }

    public void setTimeFrom(long timeFrom) {
        this.timeFrom = timeFrom;
    }

    public long getTimeTo() {
        return timeTo;
    }

    public void setTimeTo(long timeTo) {
        this.timeTo = timeTo;
    }

//    public List<SortByField> getSortByFields() {
//        return sortByFields;
//    }
//
//    public void setSortByFields(List<SortByField> sortByFields) {
//        this.sortByFields = sortByFields;
//    }
}
