package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.dataservice.commons.AnalyticsDataResponse;
import org.wso2.carbon.analytics.dataservice.commons.SearchResultEntry;
import org.wso2.carbon.analytics.dataservice.core.AnalyticsDataServiceUtils;
import org.wso2.carbon.analytics.datasource.commons.Record;
import org.wso2.carbon.notebook.ServiceHolder;
import org.wso2.carbon.notebook.util.request.paragraph.InteractiveAnalyticsQuery;
import org.wso2.carbon.notebook.util.response.GeneralResponse;
import org.wso2.carbon.notebook.util.response.LazyLoadedTableResponse;
import org.wso2.carbon.notebook.util.response.ResponseConstants;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

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
    @Path("/search/query")
    public Response executeSearchQuery(@Context HttpServletRequest request, String queryString) {
        InteractiveAnalyticsQuery interactiveAnalyticsQuery = new Gson().fromJson(queryString, InteractiveAnalyticsQuery.class);
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            LazyLoadedTableResponse response = new LazyLoadedTableResponse();
            response.setDraw(interactiveAnalyticsQuery.getDraw());

            // Running the Lucene Query
            List<SearchResultEntry> searchResultEntries = ServiceHolder.getAnalyticsDataService().search(
                    tenantID,
                    interactiveAnalyticsQuery.getTableName(),
                    interactiveAnalyticsQuery.getQuery(),
                    interactiveAnalyticsQuery.getFrom(),
                    interactiveAnalyticsQuery.getTo()
            );

            // Getting the list of IDs from Lucene Result
            List<String> ids = new ArrayList<String>();
            for (SearchResultEntry entry : searchResultEntries) {
                ids.add(entry.getId());
            }

            // Getting the set of record from the IDs
            AnalyticsDataResponse resp = ServiceHolder.getAnalyticsDataService()
                    .get(tenantID, interactiveAnalyticsQuery.getTableName(), 1, null, ids);
            List<Record> records = AnalyticsDataServiceUtils.listRecords(ServiceHolder.getAnalyticsDataService(), resp);

            // Creating a list of data
            List<List<Object>> data = new ArrayList<List<Object>>();
            for (Record record : records) {
                Map<String, Object> row = record.getValues();
                row.remove("_version");
                row.put("_timestamp", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss z").format(new Date(record.getTimestamp())));
                data.add(new ArrayList<Object>(row.values()));
            }
            response.setData(data);

            // Fetching the actual count
            int actualCount = ServiceHolder.getAnalyticsDataService().searchCount(tenantID,
                interactiveAnalyticsQuery.getTableName(),
                interactiveAnalyticsQuery.getQuery()
            );
            response.setRecordsTotal(actualCount);
            response.setRecordsFiltered(actualCount);

            jsonString = new Gson().toJson(response);
        } catch (Exception e) {
            e.printStackTrace();
            jsonString = new Gson().toJson(new GeneralResponse(ResponseConstants.ERROR));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
