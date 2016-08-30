package org.wso2.carbon.notebook.api.auth;

import com.google.gson.Gson;
import org.wso2.carbon.notebook.serviceaccess.AuthenticationServiceAccess;
import org.wso2.carbon.notebook.util.response.APIResponse;
import org.wso2.carbon.notebook.util.response.APIResponseConstants;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/*
 * For handling user management
 */
@Path("/")
public class AuthenticationEndpoint {
    public AuthenticationEndpoint() {

    }

    /**
     * Sign in the user and save the username and tenant id
     *
     * @return respnse
     */
    @POST
    @Path("/sign-in")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response signIn(String username) {
        APIResponse apiResponse = new APIResponse();

//        if (AuthenticationServiceAccess.login(username, password)) {
//            apiResponse.setStatus(APIResponseConstants.SUCCESS);
//        } else {
//            apiResponse.setStatus(APIResponseConstants.CANNOT_LOGIN);
//        }
//
//        String jsonString = new Gson().toJson(apiResponse);
        return Response.ok(username, MediaType.APPLICATION_JSON).build();
    }
}
