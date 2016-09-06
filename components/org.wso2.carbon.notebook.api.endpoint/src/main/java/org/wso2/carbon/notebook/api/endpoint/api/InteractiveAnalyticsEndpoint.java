package org.wso2.carbon.notebook.api.endpoint.api;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.dataservice.commons.AnalyticsDataResponse;
import org.wso2.carbon.analytics.dataservice.commons.SearchResultEntry;
import org.wso2.carbon.analytics.dataservice.core.AnalyticsDataServiceUtils;
import org.wso2.carbon.analytics.datasource.commons.Record;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.notebook.api.endpoint.ServiceHolder;
import org.wso2.carbon.notebook.api.endpoint.util.NotebookUtils;
import org.wso2.carbon.notebook.api.endpoint.dto.request.paragraph.InteractiveAnalyticsQuery;
import org.wso2.carbon.notebook.api.endpoint.dto.response.GeneralResponse;
import org.wso2.carbon.notebook.api.endpoint.dto.response.LazyLoadedTableResponse;
import org.wso2.carbon.notebook.api.endpoint.dto.response.ResponseConstants;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

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
                    interactiveAnalyticsQuery.getPaginationFrom(),
                    interactiveAnalyticsQuery.getPaginationCount()
            );

            // Getting the list of IDs from Lucene Result
            List<String> ids = new ArrayList<>();
            for (SearchResultEntry entry : searchResultEntries) {
                ids.add(entry.getId());
            }

            // Getting the set of record from the IDs
            AnalyticsDataResponse resp = ServiceHolder.getAnalyticsDataService()
                    .get(tenantID, interactiveAnalyticsQuery.getTableName(), 1, null, ids);
            List<Record> records = AnalyticsDataServiceUtils.listRecords(ServiceHolder.getAnalyticsDataService(), resp);

            // Creating a list of data
            response.setData(NotebookUtils.getTableDataFromRecords(records));

            // Fetching the actual count
            int actualCount = ServiceHolder.getAnalyticsDataService().searchCount(tenantID,
                    interactiveAnalyticsQuery.getTableName(),
                    interactiveAnalyticsQuery.getQuery()
            );
            response.setRecordsTotal(actualCount);
            response.setRecordsFiltered(actualCount);

            response.setStatus(ResponseConstants.SUCCESS);
            jsonString = new Gson().toJson(response);
        } catch (Exception e) {
            e.printStackTrace();
            jsonString = new Gson().toJson(new GeneralResponse(ResponseConstants.ERROR));
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
    public Response getByDateRange(@Context HttpServletRequest request, String queryString) {
        InteractiveAnalyticsQuery interactiveAnalyticsQuery = new Gson().fromJson(queryString, InteractiveAnalyticsQuery.class);
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        String recordStoreName;
        boolean isRecordCountSupported;
        try {
            LazyLoadedTableResponse response = new LazyLoadedTableResponse();
            long timeFrom = interactiveAnalyticsQuery.getTimeFrom();
            long timeTo = interactiveAnalyticsQuery.getTimeTo();
            int paginationFrom = interactiveAnalyticsQuery.getPaginationFrom();
            int paginationCount = interactiveAnalyticsQuery.getPaginationCount();
            response.setDraw(interactiveAnalyticsQuery.getDraw());

            int originalFrom = interactiveAnalyticsQuery.getPaginationFrom();
            if (!ServiceHolder.getAnalyticsDataService().isPaginationSupported(
                    ServiceHolder.getAnalyticsDataService().getRecordStoreNameByTable(
                            tenantID, interactiveAnalyticsQuery.getTableName()
                    )
            )) {
                paginationCount = paginationFrom + paginationCount;
                paginationFrom = 0;
            }
            AnalyticsDataResponse resp = ServiceHolder.getAnalyticsDataService().get(
                    tenantID,
                    interactiveAnalyticsQuery.getTableName(),
                    1,
                    null,
                    timeFrom,
                    timeTo,
                    paginationFrom,
                    paginationCount
            );

            List<Record> records;
            if (!ServiceHolder.getAnalyticsDataService().isPaginationSupported(
                    ServiceHolder.getAnalyticsDataService().getRecordStoreNameByTable(
                            tenantID, interactiveAnalyticsQuery.getTableName()
                    )
            )) {
                Iterator<Record> itr = AnalyticsDataServiceUtils.responseToIterator(ServiceHolder.getAnalyticsDataService(), resp);
                records = new ArrayList<>();
                for (int i = 0; i < originalFrom && itr.hasNext(); i++) {
                    itr.next();
                }
                for (int i = 0; i < paginationCount && itr.hasNext(); i++) {
                    records.add(itr.next());
                }
            } else {
                records = AnalyticsDataServiceUtils.listRecords(ServiceHolder.getAnalyticsDataService(), resp);
            }

            // Creating a list of data
            response.setData(NotebookUtils.getTableDataFromRecords(records));

            // Fetching the actual count
            recordStoreName = ServiceHolder.getAnalyticsDataService().getRecordStoreNameByTable(
                    tenantID,
                    interactiveAnalyticsQuery.getTableName());
            isRecordCountSupported = ServiceHolder.getAnalyticsDataService().isRecordCountSupported(recordStoreName);
            long actualCount = -1;
            if (isRecordCountSupported) {
                actualCount = ServiceHolder.getAnalyticsDataService().getRecordCount(
                        tenantID,
                        interactiveAnalyticsQuery.getTableName(),
                        timeFrom,
                        timeTo
                );
            }
            response.setRecordsTotal(actualCount);
            response.setRecordsFiltered(actualCount);

            response.setStatus(ResponseConstants.SUCCESS);
            jsonString = new Gson().toJson(response);
        } catch (AnalyticsException e) {
            e.printStackTrace();
            jsonString = new Gson().toJson(new GeneralResponse(ResponseConstants.ERROR));
        }
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
