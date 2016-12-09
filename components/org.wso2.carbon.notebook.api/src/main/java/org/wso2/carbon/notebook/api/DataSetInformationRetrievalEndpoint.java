/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.datasource.commons.ColumnDefinition;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.notebook.commons.response.ErrorResponse;
import org.wso2.carbon.notebook.commons.response.ResponseFactory;
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
     * @param request Http servlet request
     * @return Http servlet response
     */
    @GET
    public Response listTableNames(@Context HttpServletRequest request) {
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
     * @param request   Http servlet request
     * @param tableName Name of the table from which columns are fetched
     * @return response
     */
    @GET
    @Path("/{table-name}/columns")
    public Response getColumnNames(@Context HttpServletRequest request, @PathParam("table-name") String tableName) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            List<String> columnNames = new ArrayList<>();
            List<ColumnDefinition> schema = GeneralUtils.getTableSchema(tableName, tenantID);
            for (ColumnDefinition column : schema) {
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
            List<ColumnDefinition> schema = GeneralUtils.getTableSchema(tableName, tenantID);
            Map<String, Object> response = ResponseFactory.getCustomSuccessResponse();
            response.put("schema", schema);
            jsonString = new Gson().toJson(response);
        } catch (AnalyticsException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * Retrieve the list of primary keys from the given table
     *
     * @param request   Http servlet request
     * @param tableName Name of the table from which the primary keys are fetched
     * @return Http servlet response
     */
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
