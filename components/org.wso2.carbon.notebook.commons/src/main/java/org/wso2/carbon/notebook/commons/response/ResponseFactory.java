package org.wso2.carbon.notebook.commons.response;

import java.util.HashMap;
import java.util.Map;

public class ResponseFactory {
    public static Map<String, Object> getCustomSuccessResponse() {
        Map<String, Object> response = new HashMap<String, Object>();
        response.put(Status.KEY, Status.SUCCESS);
        return response;
    }
}
