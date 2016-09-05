package org.wso2.carbon.notebook.util.request.paragraph;

import org.wso2.carbon.analytics.dataservice.commons.SortByField;
import org.wso2.carbon.analytics.dataservice.commons.SortType;
import org.wso2.carbon.analytics.datasource.commons.ColumnDefinition;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.notebook.ServiceHolder;
import org.wso2.carbon.notebook.util.request.OrderByField;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class InteractiveAnalyticsQuery {

    private int draw;
    private String tableName;
    private String query;
    private int from;
    private int to;
    private List<OrderByField> sortByFields;

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

    public int getFrom() {
        return from;
    }

    public void setFrom(int from) {
        this.from = from;
    }

    public int getTo() {
        return to;
    }

    public void setTo(int to) {
        this.to = to;
    }

    public List<OrderByField> getSortByFields() {
        return sortByFields;
    }

    public void setSortByFields(List<OrderByField> sortByFields) {
        this.sortByFields = sortByFields;
    }

//    public List<SortByField> getSortByFields(int tenantID) {
//        // Getting the list of column name
//        Collection<ColumnDefinition> columnDefinitions = null;
//        try {
//            columnDefinitions = ServiceHolder.getAnalyticsDataService().getTableSchema(tenantID, tableName).getColumns().values();
//        } catch (AnalyticsException e) {
//            e.printStackTrace();
//        }
//        String[] columnNames = new String[columnDefinitions.size() + 1];    // "+1" for adding the timestamp
//        int i = 0;
//        for (ColumnDefinition column : columnDefinitions) {
//            columnNames[i] = column.getName();
//            i++;
//        }
//
//        List<SortByField> sortByFields = new ArrayList<SortByField>();
//        for (OrderByField orderByField : order) {
//            String field = columnNames[orderByField.getColumn()];
//            SortType sortType = SortType.ASC;
//            if ("desc".equals(orderByField.getDir())) {
//                sortType = SortType.DESC;
//            }
//            sortByFields.add(new SortByField(field, sortType));
//        }
//        return sortByFields;
//    }
}
