package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.dataservice.commons.AnalyticsDataResponse;
import org.wso2.carbon.analytics.dataservice.commons.SearchResultEntry;
import org.wso2.carbon.analytics.dataservice.core.AnalyticsDataServiceUtils;
import org.wso2.carbon.analytics.datasource.commons.ColumnDefinition;
import org.wso2.carbon.analytics.datasource.commons.Record;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.analytics.spark.core.util.AnalyticsQueryResult;
import org.wso2.carbon.notebook.ServiceHolder;
import org.wso2.carbon.notebook.util.request.paragraph.InteractiveAnalyticsQuery;
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
import java.util.Arrays;
import java.util.Collection;
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
    @Path("/execute")
    public Response executeQuery(@Context HttpServletRequest request, String queryString) {
        InteractiveAnalyticsQuery interactiveAnalyticsQuery = new Gson().fromJson(queryString, InteractiveAnalyticsQuery.class);
        HttpSession session = request.getSession();

        int tenantID = (Integer) session.getAttribute("tenantID");

        String jsonString;
        try {
            // Running the Lucene Query
            List<SearchResultEntry> searchResultEntries = ServiceHolder.getAnalyticsDataService().search(
                    tenantID,
                    interactiveAnalyticsQuery.getTableName(),
                    interactiveAnalyticsQuery.getQuery(),
                    interactiveAnalyticsQuery.getStart(),
                    interactiveAnalyticsQuery.getCount()
            );

            // Getting the list of IDs from Lucene Result
            List<String> ids = new ArrayList<String>();
            for (SearchResultEntry entry : searchResultEntries) {
                ids.add(entry.getId());
            }

            // Getting the list of column name
            Collection<ColumnDefinition> columnDefinitions
                    = ServiceHolder.getAnalyticsDataService().getTableSchema(tenantID, interactiveAnalyticsQuery.getTableName()).getColumns().values();
            String[] columnNames = new String[columnDefinitions.size() + 1];    // "+1" for adding the timestamp
            int i = 0;
            for (ColumnDefinition column : columnDefinitions) {
                columnNames[i] = column.getName();
                i++;
            }

            // Getting the set of record from the IDs
            AnalyticsDataResponse resp = ServiceHolder.getAnalyticsDataService()
                    .get(tenantID, interactiveAnalyticsQuery.getTableName(), 1, Arrays.asList(columnNames), ids);
            List<Record> records = AnalyticsDataServiceUtils.listRecords(ServiceHolder.getAnalyticsDataService(), resp);

            // Creating a Table Data 2D List
            List<List<Object>> tableData = new ArrayList<List<Object>>();
            for (Record record : records) {
                Map<String, Object> recordValues = record.getValues();
                List<Object> tableRow = new ArrayList<Object>();
                for (String columnName : columnNames) {
                    tableRow.add(recordValues.get(columnName));
                }
                tableRow.add(record.getTimestamp());
                tableData.add(tableRow);
            }
            columnNames[columnDefinitions.size()] = "Timestamp";

            jsonString = new Gson().toJson(new AnalyticsQueryResult(columnNames, tableData));
        } catch (AnalyticsException e) {
            e.printStackTrace();
            jsonString = new Gson().toJson(new GeneralResponse(ResponseConstants.QUERY_ERROR));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
