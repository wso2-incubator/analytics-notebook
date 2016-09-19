package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.apache.spark.api.java.JavaRDD;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.ml.commons.domain.Feature;
import org.wso2.carbon.notebook.commons.request.paragraph.PreprocessorRequest;
import org.wso2.carbon.notebook.commons.response.ResponseFactory;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
        List<Feature> orderedFeatureList = new ArrayList<>();

        for (Feature feature : featureList){
            orderedFeatureList.add(new Feature());
        }
        String headerLine;
        List<String> headerArray = new ArrayList<>() ;
        String columnSeparator = ",";
        String jsonString;
        List<String[]> resultantArray = null;

        Map<String,Object> response = ResponseFactory.getCustomSuccessResponse();

        try {
            headerLine = MLUtils.extractHeaderLine(tableName, tenantID);
            for (Feature feature : featureList) {
                int index= MLUtils.getFeatureIndex(feature.getName(), headerLine, columnSeparator);
                feature.setIndex(index);
                orderedFeatureList.set(index, feature);
            }
            //create the header list in the order
            for (Feature feature : orderedFeatureList) {
                if (feature.isInclude()){
                    headerArray.add(feature.getName());
                }
            }
            DataSetPreprocessor preprocessor = new DataSetPreprocessor(tenantID,tableName,columnSeparator,orderedFeatureList,headerLine);
            resultantArray = preprocessor.preProcess();


        } catch (AnalyticsException e) {
            e.printStackTrace();
        }



        response.put("headerArray" , headerArray.toArray());
        response.put("resultList" , resultantArray);

        jsonString = new Gson().toJson(response);
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
