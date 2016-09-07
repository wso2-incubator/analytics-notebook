package org.wso2.carbon.notebook.api.endpoint.preprocessor.algorithm;

import org.apache.spark.api.java.JavaRDD;
import org.wso2.carbon.notebook.api.endpoint.dto.response.FeatureResponse;
import org.wso2.carbon.notebook.api.endpoint.preprocessor.transformation.DiscardedRowsFilter;
import org.wso2.carbon.notebook.api.endpoint.preprocessor.transformation.HeaderFilter;
import org.wso2.carbon.notebook.api.endpoint.preprocessor.transformation.LineToTokens;
import org.wso2.carbon.notebook.api.endpoint.preprocessor.transformation.RemoveDiscardedFeatures;

import java.util.List;


public class DatasetPreprocessor {

    public JavaRDD<String[]> preProcess(JavaRDD<String> lines, String header, String columnSeparator,
                                         List<FeatureResponse> features){
        try {

            HeaderFilter headerFilter = new HeaderFilter.Builder().init(header).build();
            LineToTokens lineToTokens = new LineToTokens.Builder().init(columnSeparator).build();
            DiscardedRowsFilter discardedRowsFilter = new DiscardedRowsFilter.Builder().init(features).build();
            RemoveDiscardedFeatures removeDiscardedFeatures = new RemoveDiscardedFeatures.Builder().init(features)
                    .build();

            return lines.filter(headerFilter).map(lineToTokens).filter(discardedRowsFilter)
                    .map(removeDiscardedFeatures);
        } finally {
            if (lines != null) {
                lines.unpersist();
            }
        }

    }
}
