package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.notebook.commons.response.ErrorResponse;
import org.wso2.carbon.notebook.commons.response.dto.LazyLoadedTable;
import org.wso2.carbon.notebook.core.util.paragraph.InteractiveAnalyticsUtils;
import org.wso2.carbon.notebook.commons.request.paragraph.InteractiveAnalyticsRequest;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

/**
 * HTTP Responses for interactive analytics paragraph related requests
 */
@Path("/interactive-analytics")
public class InteractiveAnalyticsEndpoint {
    /**
     * Run a lucene query for interactive analytics
     *
     * @return response
     */
    @POST
    @Path("/search/query")
    public javax.ws.rs.core.Response executeSearchQuery(@Context HttpServletRequest request, String queryString) {
        InteractiveAnalyticsRequest interactiveAnalyticsRequest = new Gson().fromJson(queryString, InteractiveAnalyticsRequest.class);
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            List<Map<String, Object>> data = InteractiveAnalyticsUtils.executeSearchQuery(
                tenantID,
                interactiveAnalyticsRequest.getTableName(),
                interactiveAnalyticsRequest.getQuery(),
                interactiveAnalyticsRequest.getPaginationFrom(),
                interactiveAnalyticsRequest.getPaginationCount()
            );
            jsonString = new Gson().toJson(new LazyLoadedTable(
                interactiveAnalyticsRequest.getDraw(),
                InteractiveAnalyticsUtils.getRecordCount(
                    tenantID,
                    interactiveAnalyticsRequest.getTableName(),
                    interactiveAnalyticsRequest.getQuery()
                ),
                data
            ));
        } catch (AnalyticsException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
            e.printStackTrace();
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * Run a lucene query for interactive analytics
     *
     * @return response
     */
    @POST
    @Path("/search/date-range")
    public javax.ws.rs.core.Response searchByDateRange(@Context HttpServletRequest request, String queryString) {
        InteractiveAnalyticsRequest interactiveAnalyticsRequest = new Gson().fromJson(queryString, InteractiveAnalyticsRequest.class);
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            List<Map<String, Object>> data = InteractiveAnalyticsUtils.searchByDateRange(
                tenantID,
                interactiveAnalyticsRequest.getTableName(),
                interactiveAnalyticsRequest.getTimeFrom(),
                interactiveAnalyticsRequest.getTimeTo(),
                interactiveAnalyticsRequest.getPaginationFrom(),
                interactiveAnalyticsRequest.getPaginationCount()
            );
            jsonString = new Gson().toJson(new LazyLoadedTable(
                interactiveAnalyticsRequest.getDraw(),
                InteractiveAnalyticsUtils.getRecordCount(
                    tenantID,
                    interactiveAnalyticsRequest.getTableName(),
                    interactiveAnalyticsRequest.getTimeFrom(),
                    interactiveAnalyticsRequest.getTimeTo()
                ),
                data
            ));
        } catch (AnalyticsException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
            e.printStackTrace();
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
