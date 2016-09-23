package org.wso2.carbon.notebook.api;

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
import org.wso2.carbon.notebook.core.ml.DataSetPreprocessor;
import org.wso2.carbon.notebook.core.util.MLUtils;
import org.wso2.carbon.notebook.core.util.paragraph.GeneralUtils;

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
     * Pre-process the selected the dataset
     *
     * @param request              HttpServeletRequest
     * @param preprocessParameters Parameters required for preprocessing
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
        List<String> headerArray = new ArrayList<>();
        String jsonString;
        JavaRDD<String[]> preprocessedLines;
        List<String[]> resultantArray = null;
        GeneralResponse response;

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

            //create the header list in the order
            for (Feature feature : orderedFeatureList) {
                if (feature.isInclude()) {
                    headerArray.add(feature.getName());
                }
            }
            DataSetPreprocessor preprocessor = new DataSetPreprocessor(tenantID, tableName, orderedFeatureList, headerLine);
            preprocessedLines = preprocessor.preProcess();
            resultantArray = preprocessedLines.collect();
            GeneralUtils.saveTable(tenantID,tableName,preprocessedTableName,featureList, preprocessedLines);
            response = new GeneralResponse(Status.SUCCESS);

        } catch (AnalyticsException e) {
            e.printStackTrace();
            response = new 
        }

        response.put("headerArray", headerArray.toArray());
        response.put("resultList", resultantArray);

        jsonString = new Gson().toJson(response);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * List the columns of the selected table
     *
     * @return response
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

                //set Numerical or categorical
                String type = column.getType().toString();
                if (type.equals("INTEGER") || type.equals("LONG") ||
                        type.equals("FLOAT") || type.equals("DOUBLE")) {
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


