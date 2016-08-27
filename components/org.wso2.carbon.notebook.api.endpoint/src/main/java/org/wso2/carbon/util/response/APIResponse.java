package org.wso2.carbon.servlet.response;

/**
 * Used for returning the status of a request sent to the server
 */
public class APIResponse {
    private String status;

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
