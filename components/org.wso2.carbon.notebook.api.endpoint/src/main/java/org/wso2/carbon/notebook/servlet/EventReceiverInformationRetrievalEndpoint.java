package org.wso2.carbon.notebook.servlet;

import com.google.gson.Gson;
import org.wso2.carbon.notebook.serviceaccess.EventService;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

/*
 * Getting HTTP Response for Event Stream Information
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
        List <String> eventReceiverNames = EventService.retrieveEventReceiverNames();
        String jsonString = new Gson().toJson(eventReceiverNames);

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
