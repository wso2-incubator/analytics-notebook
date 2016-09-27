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
     * Get the name of the user currently sending the request
     * This is used for showing the name of the user in the upper left corner of the web app page
     *
     * @param request HTTP servlet request
     * @return HTTP servlet response
     */
    @GET
    @Path("/logged-in")
    public Response getLoggedInUser(@Context HttpServletRequest request) {
        HttpSession session = request.getSession();

        String username = (String) session.getAttribute("username");
        Map<String, Object> response = ResponseFactory.getCustomSuccessResponse();
        response.put("username", username);

        return Response.ok(new Gson().toJson(response), MediaType.APPLICATION_JSON).build();
    }
}
