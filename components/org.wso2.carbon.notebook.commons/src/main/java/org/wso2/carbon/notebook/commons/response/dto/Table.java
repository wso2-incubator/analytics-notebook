package org.wso2.carbon.notebook.commons.response.dto;

import org.wso2.carbon.notebook.commons.response.GeneralResponse;
import org.wso2.carbon.notebook.commons.response.Status;

import java.util.List;

/**
 * Used for returning the result from a query execution
 */

public class Table extends GeneralResponse {
    private List<String> columns;
    private List<List<Object>> data;

    public Table(List<String> columns, List<List<Object>> data) {
        super(Status.SUCCESS);
        this.columns = columns;
        this.data = data;
    }

    public List<String> getColumns() {
        return columns;
    }

    public void setColumns(List<String> columns) {
        this.columns = columns;
    }

    public List<List<Object>> getData() {
        return data;
    }

    public void setData(List<List<Object>> data) {
        this.data = data;
    }

}
