package org.wso2.carbon.notebook.commons.response.dto;

import org.wso2.carbon.notebook.commons.response.Response;
import org.wso2.carbon.notebook.commons.response.Status;

import java.util.List;

/**
 * Used for returning the result from a query execution
 */

public class Table extends Response {
    private String[] columns;
    private List<List<Object>> data;

    public Table(String[] columns, List<List<Object>> data) {
        super(Status.SUCCESS);
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
