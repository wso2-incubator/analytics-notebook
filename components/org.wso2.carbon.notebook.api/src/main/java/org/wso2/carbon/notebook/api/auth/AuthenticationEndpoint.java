package org.wso2.carbon.notebook.api.auth;

import com.google.gson.Gson;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.notebook.api.ServiceHolder;
import org.wso2.carbon.notebook.api.dto.response.GeneralResponse;
import org.wso2.carbon.notebook.api.dto.request.auth.Credentials;
import org.wso2.carbon.notebook.api.dto.response.ResponseConstants;
import org.wso2.carbon.utils.multitenancy.MultitenantUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * For handling user management
 */
@Path("/auth")
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
    public Response signIn(@Context HttpServletRequest request, String credentialsString) {
        Credentials credentials = new Gson().fromJson(credentialsString, Credentials.class);
        HttpSession session = request.getSession();

        GeneralResponse generalResponse = new GeneralResponse();
        if (ServiceHolder.getAuthenticationService()
                .authenticate(credentials.getUsername(), credentials.getPassword())) {
            String tenantAwareUsername = MultitenantUtils.getTenantAwareUsername(credentials.getUsername());
            String tenantDomain = MultitenantUtils.getTenantDomain(credentials.getPassword());

            PrivilegedCarbonContext.startTenantFlow();
            PrivilegedCarbonContext.getThreadLocalCarbonContext().setTenantDomain(tenantDomain, false);
            int tenantID = PrivilegedCarbonContext.getThreadLocalCarbonContext().getTenantId(true);
            PrivilegedCarbonContext.endTenantFlow();

            session.setAttribute("username", tenantAwareUsername);
            session.setAttribute("tenantDomain", tenantDomain);
            session.setAttribute("tenantID", tenantID);
            generalResponse.setStatus(ResponseConstants.SUCCESS);
        } else {
            generalResponse.setStatus(ResponseConstants.ERROR);
        }

        String jsonString = new Gson().toJson(generalResponse);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
