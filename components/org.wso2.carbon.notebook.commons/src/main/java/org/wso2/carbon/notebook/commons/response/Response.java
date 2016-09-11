package org.wso2.carbon.notebook.commons.response;

/**
 * Used for returning the status of a request sent to the server
 */
public class Response {
    private Status status;

    public Response(Status status) {
        this.status = status;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}
