package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.notebook.commons.response.ErrorResponse;
import org.wso2.carbon.notebook.commons.response.ResponseFactory;
import org.wso2.carbon.notebook.commons.response.dto.Column;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.util.GeneralUtils;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * HTTP GeneralResponse for data source information
 */

@Path("/tables")
public class DataSetInformationRetrievalEndpoint {
    /**
     * List the set of tables available in the system
     *
     * @return response
     */
    @GET
    public Response listTableName(@Context HttpServletRequest request) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            Map<String, Object> response = ResponseFactory.getCustomSuccessResponse();
            response.put(
                    "tableNames",
                    ServiceHolder.getAnalyticsDataService().listTables(tenantID)
            );
            jsonString = new Gson().toJson(response);
        } catch (AnalyticsException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * List the column names of the selected table
     *
     * @return response
     */
    @GET
    @Path("/{table-name}/columns")
    public Response getColumns(@Context HttpServletRequest request, @PathParam("table-name") String tableName) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            List<String> columnNames = new ArrayList<>();
            List<Column> schema = GeneralUtils.getTableSchema(tableName , tenantID);
            for (Column column : schema) {
                columnNames.add(column.getName());
            }

            Map<String, Object> response = ResponseFactory.getCustomSuccessResponse();
            response.put("columnNames", columnNames);
            jsonString = new Gson().toJson(response);
        } catch (AnalyticsException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
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
    @Path("/{table-name}/schema")
    public Response getTableSchema(@Context HttpServletRequest request, @PathParam("table-name") String tableName) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            List<Column> schema = GeneralUtils.getTableSchema(tableName , tenantID);
            Map<String, Object> response = ResponseFactory.getCustomSuccessResponse();
            response.put("schema", schema);
            jsonString = new Gson().toJson(response);
        } catch (AnalyticsException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    @GET
    @Path("/{table-name}/primary-keys")
    public Response getPrimaryKeys(@Context HttpServletRequest request, @PathParam("table-name") String tableName) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            List<String> primaryKeys =
                    ServiceHolder.getAnalyticsDataService().getTableSchema(tenantID, tableName).getPrimaryKeys();
            Map<String, Object> response = ResponseFactory.getCustomSuccessResponse();
            response.put("primaryKeys", primaryKeys);
            jsonString = new Gson().toJson(response);
        } catch (AnalyticsException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
