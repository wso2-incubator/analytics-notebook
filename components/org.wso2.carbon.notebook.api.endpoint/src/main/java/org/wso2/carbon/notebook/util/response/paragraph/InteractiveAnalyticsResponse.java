package org.wso2.carbon.notebook.util.response.paragraph;

import org.wso2.carbon.analytics.dataservice.commons.SearchResultEntry;

import java.util.List;

public class InteractiveAnalyticsResponse {
    private String status;
    private List<SearchResultEntry> result;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<SearchResultEntry> getResult() {
        return result;
    }

    public void setResult(List<SearchResultEntry> result) {
        this.result = result;
    }
}
