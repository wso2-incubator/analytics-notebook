package org.wso2.carbon.notebook.api.api;

import com.google.gson.Gson;
import org.wso2.carbon.ml.core.exceptions.MLMalformedDatasetException;
import org.wso2.carbon.notebook.api.dto.response.DataExploreResponse;
import org.wso2.carbon.notebook.api.dto.response.GeneralResponse;
import org.wso2.carbon.notebook.api.dto.response.ResponseConstants;
import org.wso2.carbon.notebook.api.util.MLDataHolder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * HTTP Responses for data explorer paragraph related requests
 */
@Path("/data-explore")
public class DataExploreEndpoint {
    @GET
    @Path("/sample")
    public Response getSampleFromDas(@Context HttpServletRequest request,
                                     @QueryParam("table-name") String tableName) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            DataExploreResponse response = new DataExploreResponse();
            response.setSamplePoints(MLDataHolder.getSamplePoints(tableName, tenantID));

            jsonString = new Gson().toJson(response);
        } catch (MLMalformedDatasetException e) {
            e.printStackTrace();
            jsonString = new Gson().toJson(new GeneralResponse(ResponseConstants.ERROR));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
