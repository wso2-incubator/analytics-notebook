package org.wso2.carbon.notebook.api.endpoint.api;

import com.google.gson.Gson;
import org.apache.spark.api.java.JavaRDD;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.notebook.api.endpoint.ServiceHolder;
import org.wso2.carbon.notebook.api.endpoint.dto.request.paragraph.FeatureRequest;
import org.wso2.carbon.notebook.api.endpoint.dto.request.paragraph.PreprocessorRequest;
import org.wso2.carbon.notebook.api.endpoint.ml.preprocessor.algorithm.DatasetPreprocessor;
import org.wso2.carbon.notebook.api.endpoint.ml.preprocessor.transformation.DiscardedRowsFilter;
import org.wso2.carbon.notebook.api.endpoint.ml.preprocessor.transformation.HeaderFilter;
import org.wso2.carbon.notebook.api.endpoint.ml.preprocessor.transformation.LineToTokens;
import org.wso2.carbon.notebook.api.endpoint.ml.preprocessor.transformation.RemoveDiscardedFeatures;
import org.wso2.carbon.notebook.api.endpoint.util.MLUtils;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
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
     * @param preProcessParameters    Parameters required for preprocessing
     * @return response
     */
    @POST
    @Path("/preprocess")
    public Response preprocess(@Context HttpServletRequest request, String preProcessParameters) {

        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");

        PreprocessorRequest preprocessRequest = new Gson().fromJson(preProcessParameters, PreprocessorRequest.class);
        String tableName = preprocessRequest.getTableName();
        List<FeatureRequest> featureList = preprocessRequest.getFeatureList();
        String headerLine;
        String columnSeparator = ",";
        DatasetPreprocessor preprocessor = new DatasetPreprocessor();
        String jsonString;
        List<String[]> resultantArray=null;
        try {
            JavaRDD<String> lines = MLUtils.getLinesFromDASTable(tableName, tenantID, ServiceHolder.getSparkContextService().getJavaSparkContext());
            headerLine = MLUtils.extractHeaderLine(tableName, tenantID);
            for(FeatureRequest featureRequest : featureList){
                featureRequest.setIndex(MLUtils.getFeatureIndex(featureRequest.getName(),headerLine , columnSeparator));

            }
            resultantArray= preprocessor.preProcess(lines , headerLine ,columnSeparator, featureList);

        } catch (AnalyticsException e) {
            e.printStackTrace();
        }


        jsonString = new Gson().toJson(resultantArray);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();

    }

}
