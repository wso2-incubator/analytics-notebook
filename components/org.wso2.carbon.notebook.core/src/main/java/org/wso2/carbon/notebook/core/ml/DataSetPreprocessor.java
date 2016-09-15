package org.wso2.carbon.notebook.core.ml;

import org.apache.spark.api.java.JavaRDD;
import org.wso2.carbon.databridge.commons.exception.MalformedEventException;
import org.wso2.carbon.ml.commons.domain.Feature;
import org.wso2.carbon.ml.core.spark.transformations.RemoveResponseColumn;
import org.wso2.carbon.notebook.core.ml.transformation.*;

import java.util.List;

public class DataSetPreprocessor {
    public List<String[]> preProcess(int tenantID , String tableName, JavaRDD<String> lines, String header, String columnSeparator,
                                     List<Feature> features) {
        List<String[]> resultantArray = null;
        try {

            HeaderFilter headerFilter = new HeaderFilter.Builder().init(header).build();

            LineToTokens lineToTokens = new LineToTokens.Builder().init(columnSeparator).build();

            DiscardedRowsFilter discardedRowsFilter = new DiscardedRowsFilter.Builder().init(features).build();

            RemoveDiscardedFeatures removeDiscardedFeatures = new RemoveDiscardedFeatures.Builder().init(features)
                    .build();

            RemoveResponseColumn responseColumnFilter = new RemoveResponseColumn();

            MeanImputation meanImputationFilter = new MeanImputation.Builder().init(tenantID, tableName, features).build();

            JavaRDD<String[]> preprocessedLines = lines.filter(headerFilter).map(lineToTokens).filter(discardedRowsFilter)
                    .map(removeDiscardedFeatures).map(responseColumnFilter).map(meanImputationFilter).cache();
            resultantArray = preprocessedLines.collect();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (lines != null) {
                lines.unpersist();
            }
        }
        return resultantArray;
    }
}
