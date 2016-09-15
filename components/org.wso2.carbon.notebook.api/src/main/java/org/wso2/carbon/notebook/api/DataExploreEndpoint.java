package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.ml.core.exceptions.MLMalformedDatasetException;
import org.wso2.carbon.notebook.commons.response.paragraph.DataExploreResponse;
import org.wso2.carbon.notebook.commons.response.ErrorResponse;
import org.wso2.carbon.notebook.core.MLDataHolder;
import org.wso2.carbon.notebook.core.util.paragraph.DataExploreUtils;

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
            DataExploreUtils dataExploreUtils = new DataExploreUtils(tableName, tenantID);
            jsonString = new Gson().toJson(new DataExploreResponse(
                MLDataHolder.getSamplePoints(tableName, tenantID),
                dataExploreUtils.getCategoricalFeatureNames(),
                dataExploreUtils.getNumercalFeatureNames()
            ));
        } catch (MLMalformedDatasetException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
            e.printStackTrace();
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
