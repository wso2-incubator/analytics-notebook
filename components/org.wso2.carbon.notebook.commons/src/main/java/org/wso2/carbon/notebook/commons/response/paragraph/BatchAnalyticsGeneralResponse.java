package org.wso2.carbon.notebook.commons.response.paragraph;

import org.wso2.carbon.notebook.commons.response.GeneralResponse;
import org.wso2.carbon.notebook.commons.response.Status;
import org.wso2.carbon.notebook.commons.response.dto.Table;

import java.util.List;

public class BatchAnalyticsGeneralResponse extends GeneralResponse {
    private List<Table> tables;

    public BatchAnalyticsGeneralResponse() {
        super(Status.SUCCESS);
    }

    public List<Table> getTables() {
        return tables;
    }

    public void setTables(List<Table> tables) {
        this.tables = tables;
    }
}
