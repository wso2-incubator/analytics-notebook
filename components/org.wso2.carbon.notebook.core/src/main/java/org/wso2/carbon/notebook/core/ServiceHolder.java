package org.wso2.carbon.notebook.core;

import org.wso2.carbon.analytics.dataservice.core.AnalyticsDataService;
import org.wso2.carbon.analytics.spark.core.AnalyticsProcessorService;
import org.wso2.carbon.analytics.spark.core.interfaces.SparkContextService;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.event.receiver.core.EventReceiverService;
import org.wso2.carbon.identity.authentication.AuthenticationService;
import org.wso2.carbon.registry.core.service.RegistryService;
import org.wso2.carbon.registry.core.session.UserRegistry;
import org.wso2.carbon.utils.multitenancy.MultitenantConstants;

/**
 * For holding services for the notebook
 */
public class ServiceHolder {
    private static AuthenticationService authenticationService;
    private static AnalyticsDataService analyticsDataService;
    private static EventReceiverService eventReceiverService;
    private static AnalyticsProcessorService analyticsProcessorService;
    private static SparkContextService sparkContextService;
    private static RegistryService registryService;

    private ServiceHolder() {

    }

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

    public static AnalyticsProcessorService getAnalyticsProcessorService() {
        if (analyticsProcessorService == null) {
            analyticsProcessorService = (AnalyticsProcessorService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                    .getOSGiService(AnalyticsProcessorService.class, null);
        }
        return analyticsProcessorService;
    }

    public static SparkContextService getSparkContextService() {
        if (sparkContextService == null) {
            sparkContextService = (SparkContextService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                    .getOSGiService(SparkContextService.class, null);
        }
        return sparkContextService;
    }

    public static RegistryService getRegistryService() {
        if (registryService == null) {
            registryService = (RegistryService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                    .getOSGiService(RegistryService.class, null);
        }
        return registryService;
    }
}
