package org.wso2.carbon.notebook.api.rest;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.datasource.commons.ColumnDefinition;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.base.MultitenantConstants;
import org.wso2.carbon.notebook.ServiceHolder;
import org.wso2.carbon.notebook.util.response.paragraph.ColumnResponse;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/*
 * HTTP Response for data source information
 */

@Path("/tables")
public class DataSourceInformationRetrievalEndPoints {
    /**
     * List the set of tables available in the system
     *
     * @return response
     */
    @GET
    public Response listTableName() {
        List<String> tableNames = new ArrayList<String>();
        try {
            tableNames = ServiceHolder.getAnalyticsDataService().listTables(MultitenantConstants.SUPER_TENANT_ID);
        } catch (AnalyticsException e) {
            e.printStackTrace();
        }

        String jsonString = new Gson().toJson(tableNames);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * List the column names of the selected table
     *
     * @return response
     */
    @GET
    @Path("/{tableName}/columns")
    public Response getColumns(@Context HttpServletRequest request, @PathParam("tableName") String tableName) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        Collection<ColumnDefinition> columns = null;
        List<String> columnNames = new ArrayList<String>();
        try {
            columns = ServiceHolder.getAnalyticsDataService().getTableSchema(tenantID, tableName).getColumns().values();
        } catch (AnalyticsException e) {
            e.printStackTrace();
        }
        if (columns != null) {
            for (ColumnDefinition column : columns) {
                columnNames.add(column.getName());
            }
        }

        String jsonString = new Gson().toJson(columnNames);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * Retrieves the table schema for the given table.
     *
     * @param request   The HttpServletRequest
     * @param tableName The table name
     * @return The schema of the table
     */
    @GET
    @Path("/{tableName}/schema")
    public Response getTableSchema(@Context HttpServletRequest request, @PathParam("tableName") String tableName) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        List<ColumnResponse> columnResponses = new ArrayList<ColumnResponse>();

        Collection<ColumnDefinition> columns = null;

        try {
            columns = ServiceHolder.getAnalyticsDataService().getTableSchema(tenantID, tableName).getColumns().values();
        } catch (AnalyticsException e) {
            e.printStackTrace();
        }
        if (columns != null) {
            for (ColumnDefinition column : columns) {
                columnResponses.add(new ColumnResponse(column.getName(), column.getType() ,column.isIndexed() , column.isScoreParam()));
            }
        }

        String jsonString = new Gson().toJson(columnResponses);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

}
