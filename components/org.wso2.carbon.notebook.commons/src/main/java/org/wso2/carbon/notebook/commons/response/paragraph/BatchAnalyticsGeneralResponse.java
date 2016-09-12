package org.wso2.carbon.notebook.commons.response.paragraph;

import org.wso2.carbon.notebook.commons.response.GeneralResponse;
import org.wso2.carbon.notebook.commons.response.Status;
import org.wso2.carbon.notebook.commons.response.dto.Table;

import java.util.List;

public class BatchAnalyticsGeneralResponse extends GeneralResponse {
    private List<Object> tables;

    public BatchAnalyticsGeneralResponse() {
        super(Status.SUCCESS);
    }

    public List<Object> getTables() {
        return tables;
    }

    public void setTables(List<Object> tables) {
        this.tables = tables;
    }
}
