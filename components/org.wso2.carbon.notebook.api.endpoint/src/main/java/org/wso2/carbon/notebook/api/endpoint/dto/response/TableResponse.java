package org.wso2.carbon.notebook.api.endpoint.dto.response;

import java.util.List;

/**
 * Used for returning the result from a query execution
 */

public class TableResponse extends GeneralResponse {
    private String[] columns;
    private List<List<Object>> data;

    public TableResponse() {

    }

    public TableResponse(String[] columns, List<List<Object>> data, String status, String message) {
        super(status, message);
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
