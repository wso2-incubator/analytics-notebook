package org.wso2.carbon.notebook.serviceaccess;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.dataservice.core.AnalyticsDataService;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.event.receiver.core.EventReceiverService;
import org.wso2.carbon.event.receiver.core.config.EventReceiverConfiguration;

import java.util.ArrayList;
import java.util.List;

/**
 * Perform OSGi services to access event receiver information
 */
public class EventReceiverServiceAccess {
    private static EventReceiverService eventReceiverService;

    static  {
        eventReceiverService = (EventReceiverService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                .getOSGiService(EventReceiverService.class, null);
    }

    public static List<String> retrieveEventReceiverNames(){
        List <String> eventReceiverNames =new ArrayList<String>();
        List<EventReceiverConfiguration> eventReceiverConfigurations =
                eventReceiverService.getAllActiveEventReceiverConfigurations();
        for (EventReceiverConfiguration eventReceiverConfiguration : eventReceiverConfigurations) {
            eventReceiverNames.add(eventReceiverConfiguration.getEventReceiverName());
        }   return eventReceiverNames;
    }

}
