package org.wso2.carbon.notebook.api.paragraph;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.ml.core.exceptions.MLMalformedDatasetException;
import org.wso2.carbon.ml.core.exceptions.MLModelHandlerException;
import org.wso2.carbon.notebook.commons.response.ErrorResponse;
import org.wso2.carbon.notebook.commons.response.ResponseFactory;
import org.wso2.carbon.notebook.commons.response.paragraph.DataExploreResponse;
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
import java.util.List;
import java.util.Map;

/**
 * HTTP Responses for data explorer paragraph related requests
 */
@Path("/data-explore")
public class DataExploreEndpoint {
    /**
     * Sample the given table and return the sampled points and supporting information for data exploration
     *
     * @param request   HTTP request
     * @param tableName Name of the table from which the sample should be taken
     * @return HTTP response
     */
    @GET
    @Path("/sample")
    public Response getSampleFromDas(@Context HttpServletRequest request,
                                     @QueryParam("table-name") String tableName) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            Map<String, List<String>> features = DataExploreUtils.identifyColumnDataType(tableName, tenantID);
            jsonString = new Gson().toJson(new DataExploreResponse(
                    MLDataHolder.getSamplePoints(tableName, tenantID),
                    features.get("categorical"),
                    features.get("numerical")
            ));
        } catch (MLMalformedDatasetException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * Sample the given table and get the cluster points
     *
     * @param request           HTTP request
     * @param tableName         The table from which the sample should be taken
     * @param featureListString The independent feature and the dependent feature separated by comma
     * @param noOfClusters      No of cluster that should be in the cluster points
     * @return HTTP response
     */
    @GET
    @Path("/cluster-points")
    public Response getClusterPoints(@Context HttpServletRequest request,
                                     @QueryParam("table-name") String tableName,
                                     @QueryParam("features") String featureListString,
                                     @QueryParam("no-of-clusters") int noOfClusters) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            Map<String, Object> response = ResponseFactory.getCustomSuccessResponse();
            response.put(
                    "clusterPoints",
                    DataExploreUtils.getClusterPoints(tableName, tenantID, featureListString, noOfClusters)
            );
            jsonString = new Gson().toJson(response);
        } catch (MLMalformedDatasetException | MLModelHandlerException | AnalyticsException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
