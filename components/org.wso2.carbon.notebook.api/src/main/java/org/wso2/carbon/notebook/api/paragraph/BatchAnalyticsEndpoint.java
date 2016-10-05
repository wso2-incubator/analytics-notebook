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

package org.wso2.carbon.notebook.api.paragraph;

import com.google.gson.Gson;
import org.wso2.carbon.analytics.spark.core.exception.AnalyticsExecutionException;
import org.wso2.carbon.analytics.spark.core.util.AnalyticsQueryResult;
import org.wso2.carbon.notebook.commons.request.paragraph.BatchAnalyticsRequest;
import org.wso2.carbon.notebook.commons.response.ErrorResponse;
import org.wso2.carbon.notebook.commons.response.Status;
import org.wso2.carbon.notebook.commons.response.dto.Table;
import org.wso2.carbon.notebook.commons.response.paragraph.BatchAnalyticsResponse;
import org.wso2.carbon.notebook.core.ServiceHolder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * HTTP response to execute batch analytic queries
 */
@Path("/batch-analytics")
public class BatchAnalyticsEndpoint {
    /**
     * Execute a given script
     *
     * @param request       Http servlet request
     * @param scriptContent Spark scripts
     * @return Http servlet response
     */
    @POST
    @Path("/execute-script")
    public Response executeScript(@Context HttpServletRequest request, String scriptContent) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        BatchAnalyticsRequest batchAnalyticsRequest = new Gson().fromJson(scriptContent, BatchAnalyticsRequest.class);
        String jsonString;
        String[] queriesInScript = ServiceHolder.getAnalyticsProcessorService()
                .getQueries(batchAnalyticsRequest.getQuery());
        List<Object> tables = new ArrayList<>();

        try {
            for (String query : queriesInScript) {
                AnalyticsQueryResult result = ServiceHolder.getAnalyticsProcessorService()
                        .executeQuery(tenantID, query);
                tables.add(new Table(Arrays.asList(result.getColumns()), result.getRows()));
            }
        } catch (AnalyticsExecutionException e) {
            tables.add(new ErrorResponse(Status.INVALID_QUERY, e.getMessage()));
        } catch (RuntimeException e) {
            tables.add(new ErrorResponse("Internal Server Error"));
        }

        BatchAnalyticsResponse response = new BatchAnalyticsResponse();
        response.setTables(tables);
        jsonString = new Gson().toJson(response);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}

