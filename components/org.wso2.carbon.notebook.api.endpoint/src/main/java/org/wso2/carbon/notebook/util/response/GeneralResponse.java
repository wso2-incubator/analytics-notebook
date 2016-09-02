package org.wso2.carbon.notebook.util.response;

/**
 * Used for returning the status of a request sent to the server
 */
public class GeneralResponse {
    private String status;
    private String message;

    public GeneralResponse() {

    }

    public GeneralResponse(String status, String message) {
        this.status = status;
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
