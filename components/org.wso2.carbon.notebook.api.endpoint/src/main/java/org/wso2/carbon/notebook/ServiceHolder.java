package org.wso2.carbon.notebook;

import org.wso2.carbon.analytics.dataservice.core.AnalyticsDataService;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.event.receiver.core.EventReceiverService;
import org.wso2.carbon.identity.authentication.AuthenticationService;

public class ServiceHolder {
    private ServiceHolder() {

    }

    private static AuthenticationService authenticationService;
    private static AnalyticsDataService analyticsDataService;
    private static EventReceiverService eventReceiverService;

    public static AuthenticationService getAuthenticationService() {
        if (authenticationService == null) {
            authenticationService = (AuthenticationService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                    .getOSGiService(AuthenticationService.class, null);
        }
        return authenticationService;
    }

    public static AnalyticsDataService getAnalyticsDataService() {
        if (analyticsDataService == null) {
            analyticsDataService = (AnalyticsDataService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                    .getOSGiService(AnalyticsDataService.class, null);
        }
        return analyticsDataService;
    }

    public static EventReceiverService getEventReceiverService() {
        if (eventReceiverService == null) {
            eventReceiverService = (EventReceiverService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                    .getOSGiService(EventReceiverService.class, null);
        }
        return eventReceiverService;
    }
}
