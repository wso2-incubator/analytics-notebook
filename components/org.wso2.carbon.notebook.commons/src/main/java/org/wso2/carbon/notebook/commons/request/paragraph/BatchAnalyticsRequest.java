package org.wso2.carbon.notebook.commons.request.paragraph;

/**
 * Store the attributes of a batch analytic query request
 */
public class BatchAnalyticsRequest {
    private String query;

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }
}
