package org.wso2.carbon.notebook.commons.response.dto;

import org.wso2.carbon.notebook.commons.response.GeneralResponse;
import org.wso2.carbon.notebook.commons.response.Status;

import java.util.List;
import java.util.Map;

/**
 * Store the attributes of a table response with lazy loading
 * Some fields are specific for the data table plugin used in the front end
 */
public class LazyLoadedTable extends GeneralResponse {
    private int draw;
    private long recordsCount;
    private List<Map<String, Object>> data;

    public LazyLoadedTable(int draw, long recordsCount, List<Map<String, Object>> data) {
        super(Status.SUCCESS);
        this.draw = draw;
        this.recordsCount = recordsCount;
        this.data = data;
    }

    public int getDraw() {
        return draw;
    }

    public void setDraw(int draw) {
        this.draw = draw;
    }

    public long getRecordsCount() {
        return recordsCount;
    }

    public void setRecordsCount(long recordsCount) {
        this.recordsCount = recordsCount;
    }

    public List<Map<String, Object>> getData() {
        return data;
    }

    public void setData(List<Map<String, Object>> data) {
        this.data = data;
    }
}
