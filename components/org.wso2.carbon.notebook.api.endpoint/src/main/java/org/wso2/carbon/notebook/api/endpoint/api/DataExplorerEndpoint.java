package org.wso2.carbon.notebook.api.endpoint.api;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * HTTP Responses for data explorer paragraph related requests
 */
@Path("/data-explorer")
public class DataExplorerEndpoint {
    @GET
    @Path("sample-points")
    public Response getSamplePoints() {
        return Response.ok("Test", MediaType.APPLICATION_JSON).build();
    }
}
