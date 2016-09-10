package org.wso2.carbon.notebook.commons.response;

public class ErrorResponse extends Response {
    private String message;

    public ErrorResponse(String message) {
        super(ResponseConstants.ERROR);
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
