package org.wso2.carbon.notebook.commons.response.paragraph;

import org.wso2.carbon.notebook.commons.response.GeneralResponse;
import org.wso2.carbon.notebook.commons.response.Status;

import java.util.List;

/**
 * Store the attributes of a batch analytics response
 */
public class BatchAnalyticsResponse extends GeneralResponse {
    private List<Object> tables;

    public BatchAnalyticsResponse() {
        super(Status.SUCCESS);
    }

    public List<Object> getTables() {
        return tables;
    }

    public void setTables(List<Object> tables) {
        this.tables = tables;
    }
}
