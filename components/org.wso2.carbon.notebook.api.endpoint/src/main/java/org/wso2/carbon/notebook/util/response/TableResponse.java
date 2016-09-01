package org.wso2.carbon.notebook.util.response;

import java.util.List;

public class TableResponse {
    private String[] columns;
    private List<List<Object>> data;

    public TableResponse() {

    }

    public TableResponse(String[] columns, List<List<Object>> data) {
        this.columns = columns;
        this.data = data;
    }

    public String[] getColumns() {
        return columns;
    }

    public void setColumns(String[] columns) {
        this.columns = columns;
    }

    public List<List<Object>> getData() {
        return data;
    }

    public void setData(List<List<Object>> data) {
        this.data = data;
    }
}
