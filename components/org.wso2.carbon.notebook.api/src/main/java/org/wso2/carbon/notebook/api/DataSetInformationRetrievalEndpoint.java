package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.datasource.commons.ColumnDefinition;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.base.MultitenantConstants;
import org.wso2.carbon.notebook.commons.response.dto.Column;
import org.wso2.carbon.notebook.commons.response.ErrorResponse;
import org.wso2.carbon.notebook.core.ServiceHolder;

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

/**
 * HTTP Response for data source information
 */

@Path("/tables")
public class DataSetInformationRetrievalEndpoint {
    /**
     * List the set of tables available in the system
     *
     * @return response
     */
    @GET
    public Response listTableName() {
        String jsonString;

        try {
            jsonString = new Gson().toJson(
                    ServiceHolder.getAnalyticsDataService().listTables(MultitenantConstants.SUPER_TENANT_ID)
            );
        } catch (AnalyticsException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
            e.printStackTrace();
        }

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
        String jsonString;

        try {
            List<String> columnNames = new ArrayList<>();
            Collection<ColumnDefinition> columns = ServiceHolder.getAnalyticsDataService()
                    .getTableSchema(tenantID, tableName).getColumns().values();
            for (ColumnDefinition column : columns) {
                columnNames.add(column.getName());
            }
            jsonString = new Gson().toJson(columnNames);
        } catch (AnalyticsException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
            e.printStackTrace();
        }

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
        String jsonString;

        try {
            List<Column> columnResponses = new ArrayList<>();
            Collection<ColumnDefinition> columns = ServiceHolder.getAnalyticsDataService()
                    .getTableSchema(tenantID, tableName).getColumns().values();
            for (ColumnDefinition column : columns) {
                columnResponses.add(new Column(column.getName(), column.getType(), column.isIndexed(), column.isScoreParam()));
            }
            jsonString = new Gson().toJson(columnResponses);
        } catch (AnalyticsException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
            e.printStackTrace();
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
