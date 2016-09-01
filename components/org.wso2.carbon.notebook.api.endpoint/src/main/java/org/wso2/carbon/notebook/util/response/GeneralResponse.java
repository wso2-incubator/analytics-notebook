package org.wso2.carbon.notebook.util.response;

/**
 * Used for returning the status of a request sent to the server
 */
public class GeneralResponse {
    private String status;

    public GeneralResponse() {

    }

    public GeneralResponse(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
