package org.wso2.carbon.servlet;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/*
 * Getting HTTP Response for Event Stream Information
 */
@Path("/event-receiver")
public class EventReceiverInformationRetrievalEndpoint {
    public EventReceiverInformationRetrievalEndpoint() {

    }

    /**
     * Retrieve names of the event receivers available in the system
     *
     * @return respnse
     */
    @GET
    public Response retrieveDatabaseNames() {
        String jsonString = "Test - Event Receiver";
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).header("Access-Control-Allow-Origin",
                "*").build();
    }
}
