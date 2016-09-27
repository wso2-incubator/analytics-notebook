package org.wso2.carbon.notebook.commons.response;

/**
 * Store the attributes of a general response
 * All other responses inherits from this apart from custom responses generated using ResponseFactory
 */
public class GeneralResponse {
    private String status;

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
