package org.wso2.carbon.notebook.util.response;

import java.util.List;

/**
 * Created by pamoda on 8/31/16.
 */
public class BatchAnalyticsResult {
    private Boolean status;

    public BatchAnalyticsResult(Boolean status, String[] columns, List<List<Object>> rows) {
        this.status = status;
        this.columns = columns;
        this.rows = rows;
    }

    private String[] columns;
    private List<List<Object>> rows;



    public String[] getColumns() {
        return columns;
    }

    public void setColumns(String[] columns) {
        this.columns = columns;
    }

    public List<List<Object>> getRows() {
        return rows;
    }

    public void setRows(List<List<Object>> rows) {
        this.rows = rows;
    }



}
