package org.wso2.carbon.notebook.api.paragraph;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.notebook.commons.request.paragraph.InteractiveAnalyticsRequest;
import org.wso2.carbon.notebook.commons.response.ErrorResponse;
import org.wso2.carbon.notebook.commons.response.dto.LazyLoadedTable;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.util.paragraph.InteractiveAnalyticsUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
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
     * Run interactive analytics query
     *
     * @param request      Http servlet request
     * @param searchMethod Search method for the interactive analytics
     * @param queryString  JSON object string with the query parameters
     * @return Http servlet response
     */
    @POST
    @Path("/{search-method}")
    public Response executeSearchQuery(@Context HttpServletRequest request,
                                       @PathParam("search-method") String searchMethod,
                                       String queryString) {
        InteractiveAnalyticsRequest interactiveAnalyticsRequest = new Gson().fromJson(queryString, InteractiveAnalyticsRequest.class);
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            List<Map<String, Object>> data;
            switch (searchMethod) {
                case "query":
                    data = InteractiveAnalyticsUtils.executeSearchQuery(
                            tenantID,
                            interactiveAnalyticsRequest.getTableName(),
                            interactiveAnalyticsRequest.getQuery(),
                            interactiveAnalyticsRequest.getPaginationFrom(),
                            interactiveAnalyticsRequest.getPaginationCount()
                    );
                    break;
                case "time-range":
                    data = InteractiveAnalyticsUtils.searchByDateRange(
                            tenantID,
                            interactiveAnalyticsRequest.getTableName(),
                            interactiveAnalyticsRequest.getTimeFrom(),
                            interactiveAnalyticsRequest.getTimeTo(),
                            interactiveAnalyticsRequest.getPaginationFrom(),
                            interactiveAnalyticsRequest.getPaginationCount()
                    );
                    break;
                case "primary-keys":
                    data = InteractiveAnalyticsUtils.searchByPrimaryKeys(
                            tenantID,
                            interactiveAnalyticsRequest.getTableName(),
                            interactiveAnalyticsRequest.getPrimaryKeys()
                    );
                    break;
                default:
                    data = null;
            }

            if (data == null) {
                jsonString = new Gson().toJson(new ErrorResponse("Invalid search method"));
            } else {
                jsonString = new Gson().toJson(new LazyLoadedTable(
                        interactiveAnalyticsRequest.getDraw(),
                        ServiceHolder.getAnalyticsDataService().searchCount(
                                tenantID,
                                interactiveAnalyticsRequest.getTableName(),
                                interactiveAnalyticsRequest.getQuery()
                        ),
                        data
                ));
            }
        } catch (AnalyticsException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
