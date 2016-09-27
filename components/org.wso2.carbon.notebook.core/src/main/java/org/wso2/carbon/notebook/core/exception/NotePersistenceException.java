package org.wso2.carbon.notebook.core.exception;

/**
 * Exceptions in persisting notes
 */
public class NotePersistenceException extends Exception {
    public NotePersistenceException(String msg) {
        super(msg);
    }

    public NotePersistenceException(String msg, Throwable cause) {
        super(msg, cause);
    }
}
