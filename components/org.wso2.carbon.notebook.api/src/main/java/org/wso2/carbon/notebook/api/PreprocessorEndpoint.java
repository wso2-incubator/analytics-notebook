package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.apache.spark.api.java.JavaRDD;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.ml.commons.domain.Feature;
import org.wso2.carbon.notebook.commons.request.paragraph.PreprocessorRequest;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.ml.DataSetPreprocessor;
import org.wso2.carbon.notebook.core.util.MLUtils;

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
     * @param request              HttpServeletRequest
     * @param preProcessParameters Parameters required for preprocessing
     * @return response
     */
    @POST
    @Path("/preprocess")
    public Response preprocess(@Context HttpServletRequest request, String preProcessParameters) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");

        PreprocessorRequest preprocessRequest = new Gson().fromJson(preProcessParameters, PreprocessorRequest.class);
        String tableName = preprocessRequest.getTableName();
        List<Feature> featureList = preprocessRequest.getFeatureList();
        String headerLine;
        String columnSeparator = ",";
        DataSetPreprocessor preprocessor = new DataSetPreprocessor();
        String jsonString;
        List<String[]> resultantArray = null;
        try {
            JavaRDD<String> lines = MLUtils.getLinesFromDASTable(tableName, tenantID, ServiceHolder.getSparkContextService().getJavaSparkContext());
            headerLine = MLUtils.extractHeaderLine(tableName, tenantID);
            for (Feature feature : featureList) {
                feature.setIndex(MLUtils.getFeatureIndex(feature.getName(), headerLine, columnSeparator));

            }
            resultantArray = preprocessor.preProcess(lines, headerLine, columnSeparator, featureList);

        } catch (AnalyticsException e) {
            e.printStackTrace();
        }


        jsonString = new Gson().toJson(resultantArray);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
