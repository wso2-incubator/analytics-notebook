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
import org.apache.commons.csv.CSVFormat;
import org.apache.spark.api.java.JavaRDD;
import org.wso2.carbon.analytics.datasource.commons.ColumnDefinition;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.ml.commons.domain.Feature;
import org.wso2.carbon.ml.commons.domain.FeatureType;
import org.wso2.carbon.notebook.commons.request.paragraph.PreprocessorRequest;
import org.wso2.carbon.notebook.commons.response.ErrorResponse;
import org.wso2.carbon.notebook.commons.response.GeneralResponse;
import org.wso2.carbon.notebook.commons.response.ResponseFactory;
import org.wso2.carbon.notebook.commons.response.Status;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.exception.PreprocessorException;
import org.wso2.carbon.notebook.core.util.MLUtils;
import org.wso2.carbon.notebook.core.util.paragraph.PreprocessorUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.*;

/**
 * HTTP response to perform pre-processing tasks
 */
@Path("/preprocessor")
public class PreprocessorEndpoint {
    /**
     * Process the selected the dataset
     *
     * @param request              Http servlet request
     * @param preprocessParameters JSON object string with parameters for pre-processing
     * @return response
     */
    @POST
    @Path("/preprocess")
    public Response preprocess(@Context HttpServletRequest request, String preprocessParameters) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        PreprocessorRequest preprocessRequest = new Gson().fromJson(preprocessParameters, PreprocessorRequest.class);
        String tableName = preprocessRequest.getTableName();
        String preprocessedTableName = preprocessRequest.getPreprocessedTableName();
        List<Feature> featureList = preprocessRequest.getFeatureList();
        List<Feature> orderedFeatureList = new ArrayList<>();
        String headerLine;
        String jsonString;
        JavaRDD<String[]> preprocessedLines;
        GeneralResponse response;

        //order the features according to the schema
        for (int i = 0; i < featureList.size(); i++) {
            orderedFeatureList.add(new Feature());
        }

        try {
            headerLine = MLUtils.extractHeaderLine(tableName, tenantID);
            for (Feature feature : featureList) {
                int index = MLUtils.getFeatureIndex(feature.getName(), headerLine, String.valueOf(CSVFormat.RFC4180.getDelimiter()));
                feature.setIndex(index);
                orderedFeatureList.set(index, feature);
            }

            preprocessedLines = PreprocessorUtils.preProcess(tenantID, tableName, orderedFeatureList, headerLine);
            PreprocessorUtils.saveTable(tenantID, tableName, preprocessedTableName, orderedFeatureList, preprocessedLines);
            response = new GeneralResponse(Status.SUCCESS);
        } catch (AnalyticsException | PreprocessorException e) {
            response = new ErrorResponse(e.getMessage());
        } catch (RuntimeException e) {
            response = new ErrorResponse("Internal Server Error");
        }

        jsonString = new Gson().toJson(response);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * List the columns of the selected table
     *
     * @param request   Http servlet request
     * @param tableName Name of the table of which the columns are fetched
     * @return Http servlet response
     */
    @GET
    @Path("/{tableName}/")
    public Response loadParameters(@Context HttpServletRequest request, @PathParam("tableName") String tableName) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;
        Map<String, String> columnList = new HashMap<>();

        try {
            Collection<ColumnDefinition> columns = ServiceHolder.getAnalyticsDataService()
                    .getTableSchema(tenantID, tableName).getColumns().values();
            for (ColumnDefinition column : columns) {

                //set Numerical or Categorical for the columns
                String type = column.getType().toString();
                if (type.equals("INTEGER") || type.equals("LONG") || type.equals("FLOAT") || type.equals("DOUBLE")) {
                    type = FeatureType.NUMERICAL;
                } else {
                    type = FeatureType.CATEGORICAL;
                }
                columnList.put(column.getName(), type);
            }

            Map<String, Object> response = ResponseFactory.getCustomSuccessResponse();
            response.put("columnList", columnList);
            jsonString = new Gson().toJson(response);
        } catch (AnalyticsException e) {
            jsonString = new Gson().toJson(new ErrorResponse(e.getMessage()));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

}


