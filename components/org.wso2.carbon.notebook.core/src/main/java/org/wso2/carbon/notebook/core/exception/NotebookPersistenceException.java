package org.wso2.carbon.notebook.core.exception;

public class NotebookPersistenceException extends Exception {
    public NotebookPersistenceException(String msg) {
        super(msg);
    }

    public NotebookPersistenceException(String msg, Throwable cause) {
        super(msg, cause);
    }
}
