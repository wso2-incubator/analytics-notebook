package org.wso2.carbon.notebook.serviceaccess;

import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.identity.authentication.AuthenticationService;
import org.wso2.carbon.utils.CarbonUtils;
import org.wso2.carbon.utils.TenantUtils;
import org.wso2.carbon.utils.multitenancy.MultitenantUtils;

public class AuthenticationServiceAccess {
    private static AuthenticationService authenticationService;

    static {
        authenticationService = (AuthenticationService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                .getOSGiService(AuthenticationService.class, null);
    }

    public static boolean login(String username, String password) {
        return authenticationService.authenticate(username, password);
//        MultitenantUtils.getTenantAwareUsername( )Domain()
    }
}
