package org.wso2.carbon.notebook.core.ml;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.apache.spark.api.java.JavaRDD;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.ml.commons.domain.Feature;
import org.wso2.carbon.ml.core.spark.transformations.RemoveResponseColumn;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.exception.PreprocessorException;
import org.wso2.carbon.notebook.core.ml.transformation.*;
import org.wso2.carbon.notebook.core.util.MLUtils;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DataSetPreprocessor {

    private Map<String , Double> meanOfEachColumn;
    // List containing descriptive statistics for each feature.
    private List<DescriptiveStatistics> descriptiveStats;
    private JavaRDD<String> lines;
    private List<Feature> features;
    private int tenantID;
    private String tableName;
    private String columnSeparator;
    private String headerLine;

    public DataSetPreprocessor(int tenantID, String tableName , List<Feature> featureList , String headerLine){
        this.features = featureList;
        this.tableName = tableName;
        this.tenantID = tenantID;
        this.columnSeparator = String.valueOf(CSVFormat.RFC4180.getDelimiter());
        this.headerLine = headerLine;
        this.meanOfEachColumn = new HashMap<String, Double>();
    }

    public JavaRDD<String[]> preProcess() throws PreprocessorException, AnalyticsException {

        JavaRDD<String[]> preprocessedLines= null;
            this.lines = MLUtils.getLinesFromDASTable(this.tableName, this.tenantID, ServiceHolder.getSparkContextService().getJavaSparkContext());

        try {

            HeaderFilter headerFilter = new HeaderFilter.Builder().init(this.headerLine).build();
            JavaRDD<String> data = this.lines.filter(headerFilter);

            LineToTokens lineToTokens = new LineToTokens.Builder().init(this.columnSeparator).build();
            JavaRDD<String[]> tokens = data.map(lineToTokens);

            //generate Descriptive Statistics for each column
            this.descriptiveStats = MLUtils.generateDescriptiveStat(tokens, this.features , this.tableName);

            this.setMeanOfEachColumn();

            DiscardedRowsFilter discardedRowsFilter = new DiscardedRowsFilter.Builder().init(this.features).build();
            RemoveDiscardedFeatures removeDiscardedFeatures = new RemoveDiscardedFeatures.Builder().init(this.features)
                    .build();
            RemoveResponseColumn responseColumnFilter = new RemoveResponseColumn();

            MeanImputation meanImputationFilter = new MeanImputation.Builder().init(this.meanOfEachColumn , this.features).build();

            preprocessedLines = tokens.filter(discardedRowsFilter).map(removeDiscardedFeatures)
                    .map(responseColumnFilter).map(meanImputationFilter).cache();
        } finally {
            if (lines != null) {
                lines.unpersist();
            }
        }
        return preprocessedLines;
    }

    //map the mean of each column with the column name
    private void setMeanOfEachColumn(){
        for (int currentCol = 0 ; currentCol < this.features.size() ; currentCol++){
            this.meanOfEachColumn.put(this.features.get(currentCol).getName(), this.descriptiveStats.get(currentCol).getMean());
        }
    }

}

