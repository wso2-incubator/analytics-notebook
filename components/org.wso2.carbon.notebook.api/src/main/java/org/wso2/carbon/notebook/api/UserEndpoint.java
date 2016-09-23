package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.notebook.commons.response.ResponseFactory;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Map;

/**
 * For handling user management
 */
@Path("/user")
public class UserEndpoint {
    /**
     * Get the name of the logged in user
     *
     * @return respnse
     */
    @GET
    @Path("/logged-in")
    public Response signIn(@Context HttpServletRequest request, String credentialsString) {
        HttpSession session = request.getSession();

        String username = (String) session.getAttribute("username");
        Map<String, Object> response = ResponseFactory.getCustomSuccessResponse();
        response.put("username", username);

        return Response.ok(new Gson().toJson(response), MediaType.APPLICATION_JSON).build();
    }
}
