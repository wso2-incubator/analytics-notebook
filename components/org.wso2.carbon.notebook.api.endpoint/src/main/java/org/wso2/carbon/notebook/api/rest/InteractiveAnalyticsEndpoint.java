package org.wso2.carbon.notebook.api.rest;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.dataservice.commons.SearchResultEntry;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.notebook.ServiceHolder;
import org.wso2.carbon.notebook.util.request.auth.Credentials;
import org.wso2.carbon.notebook.util.request.paragraph.InteractiveAnalyticsQuery;
import org.wso2.carbon.notebook.util.response.ResponseConstants;
import org.wso2.carbon.notebook.util.response.paragraph.InteractiveAnalyticsResponse;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

/*
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
    @Path("/execute")
    public Response executeQuery(@Context HttpServletRequest request, String queryString) {
        InteractiveAnalyticsQuery interactiveAnalyticsQuery = new Gson().fromJson(queryString, InteractiveAnalyticsQuery.class);
        HttpSession session = request.getSession();

        int tenantID = (Integer) session.getAttribute("tenantID");

        List<SearchResultEntry> searchResultEntries = null;
        try {
            searchResultEntries = ServiceHolder.getAnalyticsDataService().search(
                    tenantID,
                    interactiveAnalyticsQuery.getTableName(),
                    interactiveAnalyticsQuery.getQuery(),
                    interactiveAnalyticsQuery.getStart(),
                    interactiveAnalyticsQuery.getCount(),
                    interactiveAnalyticsQuery.getSortByFields()
            );
        } catch (AnalyticsException e) {
            e.printStackTrace();
        }

        String jsonString = new Gson().toJson(searchResultEntries);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
