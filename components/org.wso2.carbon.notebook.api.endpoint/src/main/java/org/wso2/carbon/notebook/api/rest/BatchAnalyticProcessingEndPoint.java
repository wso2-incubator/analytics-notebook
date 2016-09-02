package org.wso2.carbon.notebook.api.rest;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.spark.core.exception.AnalyticsExecutionException;
import org.wso2.carbon.analytics.spark.core.util.AnalyticsQueryResult;
import org.wso2.carbon.notebook.ServiceHolder;
import org.wso2.carbon.notebook.util.request.paragraph.BatchAnalyticsQuery;
import org.wso2.carbon.notebook.util.response.GeneralResponse;
import org.wso2.carbon.notebook.util.response.ResponseConstants;

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
public class BatchAnalyticProcessingEndPoint {


    /**
     * Execute a given script
     * @param request HttpServeletRequest
     * @param scriptContent The script
     * @return response
     */
    @POST
    @Path("/execute-script")
    public Response executeScript(@Context HttpServletRequest request, String scriptContent) {
        HttpSession session = request.getSession();
        int tenantID = (Integer)session.getAttribute("tenantID");

        BatchAnalyticsQuery batchAnalyticsQuery = new Gson().fromJson(scriptContent, BatchAnalyticsQuery.class);
        String[] queriesInScript;
        List<AnalyticsQueryResult> analyticsQueryResults = new ArrayList<AnalyticsQueryResult>();

        queriesInScript= ServiceHolder.getAnalyticsProcessorService()
                .getQueries(batchAnalyticsQuery.getQuery() );

        String jsonString;
        try {
            for (String query: queriesInScript) {
                analyticsQueryResults.add(ServiceHolder.getAnalyticsProcessorService()
                        .executeQuery(tenantID, query));
            }
            jsonString = new Gson().toJson(analyticsQueryResults);
        } catch (AnalyticsExecutionException e) {
            e.printStackTrace();
            GeneralResponse generalResponse = new GeneralResponse();
            generalResponse.setStatus(ResponseConstants.QUERY_ERROR);
            jsonString = new Gson().toJson(generalResponse);
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
//
//    @POST
//    @Path("/execute")
//    public Response executeQuery(@Context HttpServletRequest request , String query) {
//        HttpSession session = request.getSession();
//        int tenantID = (Integer)session.getAttribute("tenantID");
//
//        BatchAnalyticsQuery batchAnalyticsQuery = new Gson().fromJson(query , BatchAnalyticsQuery.class);
//
//        AnalyticsQueryResult analyticsQueryResult = null;
//        try {
//            analyticsQueryResult = ServiceHolder.getAnalyticsProcessorService()
//                    .executeQuery(tenantID , batchAnalyticsQuery.getQuery());
//        } catch (AnalyticsExecutionException e) {
//            e.printStackTrace();
//        }
//
//        String jsonString = new Gson().toJson(analyticsQueryResult);
//        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
//    }
}

