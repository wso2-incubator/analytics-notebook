package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.event.receiver.core.config.EventReceiverConfiguration;
import org.wso2.carbon.notebook.commons.response.ResponseFactory;
import org.wso2.carbon.notebook.core.ServiceHolder;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Getting HTTP GeneralResponse for Event Stream Information
 */
@Path("/event-receivers")
public class EventReceiverInformationRetrievalEndpoint {
    /**
     * Retrieve names of the event receivers available in the system
     *
     * @return respnse
     */
    @GET
    public Response retrieveEventReceiverNames() {
        String jsonString;

        List<String> eventReceiverNames = new ArrayList<>();
        List<EventReceiverConfiguration> eventReceiverConfigurations = ServiceHolder.getEventReceiverService()
                .getAllActiveEventReceiverConfigurations();
        for (EventReceiverConfiguration eventReceiverConfiguration : eventReceiverConfigurations) {
            eventReceiverNames.add(eventReceiverConfiguration.getEventReceiverName());
        }

        Map<String, Object> response = ResponseFactory.getCustomSuccessResponseObject();
        response.put("eventReceiverNames", eventReceiverNames);
        jsonString = new Gson().toJson(response);

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
