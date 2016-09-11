package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.spark.core.exception.AnalyticsExecutionException;
import org.wso2.carbon.analytics.spark.core.util.AnalyticsQueryResult;
import org.wso2.carbon.notebook.commons.request.paragraph.BatchAnalyticsRequest;
import org.wso2.carbon.notebook.commons.response.ErrorGeneralResponse;
import org.wso2.carbon.notebook.commons.response.paragraph.BatchAnalyticsGeneralResponse;
import org.wso2.carbon.notebook.commons.response.dto.Table;
import org.wso2.carbon.notebook.core.ServiceHolder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
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
    public javax.ws.rs.core.Response executeScript(@Context HttpServletRequest request, String scriptContent) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        BatchAnalyticsRequest batchAnalyticsRequest = new Gson().fromJson(scriptContent, BatchAnalyticsRequest.class);
        String jsonString;

        try {
            String[] queriesInScript = ServiceHolder.getAnalyticsProcessorService()
                    .getQueries(batchAnalyticsRequest.getQuery());
            List<Table> tables = new ArrayList<>();

            for (String query : queriesInScript) {
                AnalyticsQueryResult result = ServiceHolder.getAnalyticsProcessorService()
                        .executeQuery(tenantID, query);
                tables.add(new Table(result.getColumns(), result.getRows()));
            }

            BatchAnalyticsGeneralResponse response = new BatchAnalyticsGeneralResponse();
            response.setTables(tables);
            jsonString = new Gson().toJson(response);
        } catch (AnalyticsExecutionException | RuntimeException e) {
            jsonString = new Gson().toJson(new ErrorGeneralResponse(e.getMessage()));
            e.printStackTrace();
        }

        return javax.ws.rs.core.Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}

