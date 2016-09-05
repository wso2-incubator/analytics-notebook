package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.spark.core.exception.AnalyticsExecutionException;
import org.wso2.carbon.analytics.spark.core.util.AnalyticsQueryResult;
import org.wso2.carbon.notebook.ServiceHolder;
import org.wso2.carbon.notebook.util.request.paragraph.BatchAnalyticsQuery;
import org.wso2.carbon.notebook.util.response.GeneralResponse;
import org.wso2.carbon.notebook.util.response.ResponseConstants;
import org.wso2.carbon.notebook.util.response.TableResponse;

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

        BatchAnalyticsQuery batchAnalyticsQuery = new Gson().fromJson(scriptContent, BatchAnalyticsQuery.class);
        String[] queriesInScript;
        List<TableResponse> tableResponses = new ArrayList<TableResponse>();

        queriesInScript = ServiceHolder.getAnalyticsProcessorService()
                .getQueries(batchAnalyticsQuery.getQuery());

        String jsonString;
        try {
            for (String query : queriesInScript) {
                AnalyticsQueryResult result = ServiceHolder.getAnalyticsProcessorService()
                        .executeQuery(tenantID, query);
                tableResponses.add(new TableResponse(result.getColumns(), result.getRows(), ResponseConstants.SUCCESS,null));
            }
        } catch (AnalyticsExecutionException e) {
            e.printStackTrace();
            tableResponses.add(new TableResponse(null, null, ResponseConstants.ERROR, e.getMessage()));
        } catch (RuntimeException e){
            tableResponses.add(new TableResponse(null, null, ResponseConstants.ERROR, e.getMessage()));
        }

        jsonString = new Gson().toJson(tableResponses);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

}

