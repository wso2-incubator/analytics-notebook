package org.wso2.carbon.notebook.api.auth;

import com.google.gson.Gson;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.identity.authentication.AuthenticationException;
import org.wso2.carbon.notebook.commons.request.LoginRequest;
import org.wso2.carbon.notebook.commons.response.ErrorResponse;
import org.wso2.carbon.notebook.commons.response.GeneralResponse;
import org.wso2.carbon.notebook.commons.response.Status;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.utils.multitenancy.MultitenantUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * For handling authentication management
 */
@Path("/auth")
public class AuthenticationEndpoint {
    /**
     * Sign in the user and save the username and tenant id as session variables
     *
     * @param request           Http servlet request
     * @param credentialsString JSON object string with the user credentials
     * @return Http servlet respnse
     */
    @POST
    @Path("/sign-in")
    public Response signIn(@Context HttpServletRequest request, String credentialsString) {
        LoginRequest loginRequest = new Gson().fromJson(credentialsString, LoginRequest.class);
        HttpSession session = request.getSession();
        String jsonString;

        try {
            if (ServiceHolder.getAuthenticationService()
                    .authenticate(loginRequest.getUsername(), loginRequest.getPassword())) {
                String tenantAwareUsername = MultitenantUtils.getTenantAwareUsername(loginRequest.getUsername());
                String tenantDomain = MultitenantUtils.getTenantDomain(loginRequest.getPassword());

                PrivilegedCarbonContext.startTenantFlow();
                PrivilegedCarbonContext.getThreadLocalCarbonContext().setTenantDomain(tenantDomain, false);
                int tenantID = PrivilegedCarbonContext.getThreadLocalCarbonContext().getTenantId(true);
                PrivilegedCarbonContext.endTenantFlow();

                session.setAttribute("username", tenantAwareUsername);
                session.setAttribute("tenantDomain", tenantDomain);
                session.setAttribute("tenantID", tenantID);
                jsonString = new Gson().toJson(new GeneralResponse(Status.SUCCESS));
            } else {
                jsonString = new Gson().toJson(new ErrorResponse("Invalid Credentials"));
            }
        } catch (AuthenticationException e) {
            jsonString = new Gson().toJson(new ErrorResponse("Unknown user"));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * Sign out the user currently logged in user
     *
     * @return Http servlet respnse
     */
    @POST
    @Path("/sign-out")
    public Response signIn(@Context HttpServletRequest request) {
        HttpSession session = request.getSession();
        session.invalidate();
        return Response.ok(new Gson().toJson(
                new GeneralResponse(Status.SUCCESS)), MediaType.APPLICATION_JSON
        ).build();
    }
}
