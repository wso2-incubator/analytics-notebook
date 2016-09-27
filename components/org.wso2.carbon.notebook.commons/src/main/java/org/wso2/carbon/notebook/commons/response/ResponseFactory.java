package org.wso2.carbon.notebook.commons.response;

import java.util.HashMap;
import java.util.Map;

/**
 * Used for generating custom responses
 * This is used when creating a separate object for the response is not required
 * For example returning a list of table names
 */
public class ResponseFactory {
    /**
     * Creates a response map which can be used for returning custom responses
     * Status success is added before the returning the map
     *
     * @return The response map which can be used for encoding into JSON
     */
    public static Map<String, Object> getCustomSuccessResponse() {
        Map<String, Object> response = new HashMap<String, Object>();
        response.put(Status.STATUS, Status.SUCCESS);
        return response;
    }
}
