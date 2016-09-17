package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.spark.core.exception.AnalyticsExecutionException;
import org.wso2.carbon.analytics.spark.core.util.AnalyticsQueryResult;
import org.wso2.carbon.notebook.commons.request.paragraph.BatchAnalyticsRequest;
import org.wso2.carbon.notebook.commons.response.ErrorResponse;
import org.wso2.carbon.notebook.commons.response.Status;
import org.wso2.carbon.notebook.commons.response.dto.Table;
import org.wso2.carbon.notebook.commons.response.paragraph.BatchAnalyticsGeneralResponse;
import org.wso2.carbon.notebook.core.ServiceHolder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;

/**
 * HTTP response to execute batch analytic queries
 */
@Path("/batch-analytics")
public class BatchAnalyticsEndpoint {
    /**
     * Execute a given script
     *
     * @param request       HttpServeletRequest
     * @param scriptContent The script
     * @return response
     */
    @POST
    @Path("/execute-script")
    public Response executeScript(@Context HttpServletRequest request, String scriptContent) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        BatchAnalyticsRequest batchAnalyticsRequest = new Gson().fromJson(scriptContent, BatchAnalyticsRequest.class);
        String jsonString;

        String[] queriesInScript = ServiceHolder.getAnalyticsProcessorService()
                .getQueries(batchAnalyticsRequest.getQuery());
        List<Object> tables = new ArrayList<>();

        try {
            for (String query : queriesInScript) {
                AnalyticsQueryResult result = ServiceHolder.getAnalyticsProcessorService()
                        .executeQuery(tenantID, query);
                tables.add(new Table(result.getColumns(), result.getRows()));
            }
        } catch (AnalyticsExecutionException | RuntimeException e) {
            tables.add(new ErrorResponse(Status.INVALID_QUERY, e.getMessage()));
        }

        BatchAnalyticsGeneralResponse response = new BatchAnalyticsGeneralResponse();
        response.setTables(tables);
        jsonString = new Gson().toJson(response);

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}

