package org.wso2.carbon.notebook.api.endpoint.api;

import com.google.gson.Gson;
import org.wso2.carbon.ml.core.exceptions.MLMalformedDatasetException;
import org.wso2.carbon.notebook.api.endpoint.dto.request.paragraph.InteractiveAnalyticsQuery;
import org.wso2.carbon.notebook.api.endpoint.dto.request.paragraph.ScatterPlotPointsQuery;
import org.wso2.carbon.notebook.api.endpoint.dto.response.GeneralResponse;
import org.wso2.carbon.notebook.api.endpoint.dto.response.ResponseConstants;
import org.wso2.carbon.notebook.api.endpoint.util.DataExplorerUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

/**
 * HTTP Responses for data explorer paragraph related requests
 */
@Path("/data-explorer")
public class DataExplorerEndpoint {
    @GET
    @Path("/scatter-plot")
    public Response getSamplePoints(@Context HttpServletRequest request, String queryString) {
        ScatterPlotPointsQuery scatterPlotPointsQuery = new Gson().fromJson(queryString, ScatterPlotPointsQuery.class);
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            List<Object> points = DataExplorerUtils.getScatterPlotPoints(tenantID, scatterPlotPointsQuery);
            jsonString = new Gson().toJson(points);
        } catch (MLMalformedDatasetException e) {
            e.printStackTrace();
            jsonString = new Gson().toJson(new GeneralResponse(ResponseConstants.ERROR));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
