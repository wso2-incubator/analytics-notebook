package org.wso2.carbon.servlet;

import com.google.gson.Gson;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.event.receiver.core.EventReceiverService;
import org.wso2.carbon.event.receiver.core.config.EventReceiverConfiguration;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

/*
 * Getting HTTP Response for Event Stream Information
 */
@Path("/event-receiver")
public class EventReceiverInformationRetrievalEndpoint {
    private EventReceiverService eventReceiverService;

    public EventReceiverInformationRetrievalEndpoint() {
        eventReceiverService = (EventReceiverService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                .getOSGiService(EventReceiverService.class, null);
    }

    /**
     * Retrieve names of the event receivers available in the system
     *
     * @return respnse
     */
    @GET
    public Response retrieveEventReceiverNames() {
        List<EventReceiverConfiguration> eventReceiverConfigurations =
                eventReceiverService.getAllActiveEventReceiverConfigurations();
        int eventReceiverConfigurationsCount = eventReceiverConfigurations.size();
        String[] eventReceiverNames = new String[eventReceiverConfigurationsCount];
        for (int i = 0; i < eventReceiverConfigurationsCount; i++) {
            eventReceiverNames[i] = eventReceiverConfigurations.get(i).getEventReceiverName();
        }
        String jsonString = new Gson().toJson(eventReceiverNames);

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).header("Access-Control-Allow-Origin",
                "*").build();
    }
}
