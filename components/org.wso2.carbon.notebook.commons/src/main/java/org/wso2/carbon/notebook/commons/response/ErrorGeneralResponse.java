package org.wso2.carbon.notebook.commons.response;

public class ErrorGeneralResponse extends GeneralResponse {
    private String message;

    public ErrorGeneralResponse(String message) {
        super(Status.ERROR);
        this.message = message;
    }

    public ErrorGeneralResponse(String status, String message) {
        super(status);
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
