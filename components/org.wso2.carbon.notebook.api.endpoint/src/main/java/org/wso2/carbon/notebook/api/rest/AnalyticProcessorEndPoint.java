package org.wso2.carbon.notebook.api.rest;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.spark.core.exception.AnalyticsExecutionException;
import org.wso2.carbon.analytics.spark.core.util.AnalyticsQueryResult;
import org.wso2.carbon.base.MultitenantConstants;
import org.wso2.carbon.notebook.ServiceHolder;
import org.wso2.carbon.notebook.util.request.paragraph.BatchAnalyticsQuery;
import org.wso2.carbon.notebook.util.response.BatchAnalyticsResult;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;

/**
 * HTTP response to execute batch analytic queries
 */

@Path("/batch-analytics")
public class AnalyticProcessorEndPoint {

    @POST
    @Path("/execute-script")
    public Response executeScript(String scriptContent) {
        BatchAnalyticsQuery batchAnalyticsQuery = new Gson().fromJson(scriptContent, BatchAnalyticsQuery.class);
        String[] queriesInScript;
        List<AnalyticsQueryResult> analyticsQueryResults = new ArrayList<AnalyticsQueryResult>();

        queriesInScript= ServiceHolder.getAnalyticsProcessorService()
                .getQueries(batchAnalyticsQuery.getQuery() );

        for (String query: queriesInScript){
            try {
                analyticsQueryResults.add( ServiceHolder.getAnalyticsProcessorService()
                        .executeQuery(MultitenantConstants.SUPER_TENANT_ID, query));
            } catch (AnalyticsExecutionException e) {
                e.printStackTrace();
            }
        }

        String jsonString = new Gson().toJson(analyticsQueryResults);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    @POST
    @Path("/execute")
    public Response executeQuery(String query) {
        BatchAnalyticsQuery batchAnalyticsQuery = new Gson().fromJson(query, BatchAnalyticsQuery.class);

        AnalyticsQueryResult analyticsQueryResult = null;
        try {
            analyticsQueryResult = ServiceHolder.getAnalyticsProcessorService()
                    .executeQuery(MultitenantConstants.SUPER_TENANT_ID, batchAnalyticsQuery.getQuery());
        } catch (AnalyticsExecutionException e) {
            e.printStackTrace();
        }

        String jsonString = new Gson().toJson(analyticsQueryResult);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}

