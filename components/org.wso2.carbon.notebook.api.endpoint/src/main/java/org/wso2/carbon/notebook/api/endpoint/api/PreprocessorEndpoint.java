package org.wso2.carbon.notebook.api.endpoint.api;

import com.google.gson.Gson;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.notebook.api.endpoint.dto.response.FeatureResponse;
import org.wso2.carbon.notebook.api.endpoint.preprocessor.algorithm.DatasetPreprocessor;
import org.wso2.carbon.notebook.api.endpoint.util.MLUtils;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

/**
 * HTTP response to perform pre-processing tasks
 */

@Path("/preprocessor")
public class PreprocessorEndpoint {
    /**
     * Pre-process the selected the dataset
     *
     * @param request       HttpServeletRequest
     * @param tableName     The dataset to pre-process
     * @param features      The set of columns of the dataset
     * @return response
     */
    @POST
    @Path("/preprocess")
    public Response preprocess(@Context HttpServletRequest request, String tableName, List<FeatureResponse> features) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String headerLine;
        String columnSeparator = ",";
        JavaRDD<String[]> preprocessedLines = null;
        DatasetPreprocessor preprocessor = new DatasetPreprocessor();
        String jsonString;
        try {
            JavaRDD<String> lines = MLUtils.getLinesFromDASTable(tableName, tenantID, new JavaSparkContext());
            headerLine = MLUtils.extractHeaderLine(tableName , tenantID);
            preprocessedLines = preprocessor.preProcess(lines, headerLine, columnSeparator, features );
        } catch (AnalyticsException e) {
            e.printStackTrace();
        }


        jsonString = new Gson().toJson(preprocessedLines);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();

    }

}
