package org.wso2.carbon.notebook.servlet.auth;

import com.google.gson.Gson;
import org.wso2.carbon.notebook.util.response.APIResponse;
import org.wso2.carbon.notebook.util.response.APIResponseConstants;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/*
 * For handling user management
 */
@Path("/")
public class AuthorizationEndpoint {
    public AuthorizationEndpoint() {

    }

    /**
     * Sign in the user and save the username and tenant id
     *
     * @return respnse
     */
    @POST
    @Path("/sign-in")
    public Response signIn() {
        APIResponse apiResponse = new APIResponse();

        // TODO : Login using login osgi service
        apiResponse.setStatus(APIResponseConstants.SUCCESS);

        String jsonString = new Gson().toJson(apiResponse);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
