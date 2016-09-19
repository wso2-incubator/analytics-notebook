package org.wso2.carbon.notebook.core.ml;

import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.apache.spark.api.java.JavaRDD;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.ml.commons.domain.Feature;
import org.wso2.carbon.ml.core.spark.transformations.RemoveResponseColumn;
import org.wso2.carbon.notebook.commons.constants.MLConstants;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.ml.transformation.*;
import org.wso2.carbon.notebook.core.util.MLUtils;
import java.util.ArrayList;
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
    private List<String[]> resultantArray;
    private double fraction;

    public DataSetPreprocessor(int tenantID, String tableName , String columnSeparaator, List<Feature> featureList , String headerLine){
        this.features = featureList;
        this.tableName = tableName;
        this.tenantID = tenantID;
        this.columnSeparator = columnSeparaator;
        this.headerLine = headerLine;
        this.meanOfEachColumn = new HashMap<String, Double>();
        this.resultantArray = null;
        this.fraction = 0.1;
    }

    public List<String[]> preProcess() {

        try {
            this.lines = MLUtils.getLinesFromDASTable(this.tableName, this.tenantID, ServiceHolder.getSparkContextService().getJavaSparkContext());
        } catch (AnalyticsException e) {
            e.printStackTrace();
        }

        try {

            HeaderFilter headerFilter = new HeaderFilter.Builder().init(this.headerLine).build();
            JavaRDD<String> data = this.lines.filter(headerFilter);

            LineToTokens lineToTokens = new LineToTokens.Builder().init(this.columnSeparator).build();
            JavaRDD<String[]> tokens = data.map(lineToTokens);

            //generate Descriptive Statistics for each column
            this.descriptiveStats = MLUtils.generateDescriptiveStat(tokens, this.features , this.fraction);

            this.setMeanOfEachColumn();

            DiscardedRowsFilter discardedRowsFilter = new DiscardedRowsFilter.Builder().init(this.features).build();
            RemoveDiscardedFeatures removeDiscardedFeatures = new RemoveDiscardedFeatures.Builder().init(this.features)
                    .build();
            RemoveResponseColumn responseColumnFilter = new RemoveResponseColumn();
            MeanImputation meanImputationFilter = new MeanImputation.Builder().init(this.meanOfEachColumn , this.features).build();

            JavaRDD<String[]> preprocessedLines = tokens.filter(discardedRowsFilter).map(removeDiscardedFeatures)
                    .map(responseColumnFilter).map(meanImputationFilter).cache();
            this.resultantArray = preprocessedLines.collect();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (lines != null) {
                lines.unpersist();
            }
        }
        return this.resultantArray;
    }


    private void generateDescriptiveStat(JavaRDD<String[]> tokenizeDataToSample) {
        int featureSize;
        List<List<String>> columnData = new ArrayList<List<String>>();
        int[] stringCellCount;
        double cellValue;
        List<Feature> featureListForSample = new ArrayList<Feature>();

        featureSize = this.features.size();
        stringCellCount = new int[featureSize];

        //create a new feature list for the sample preprocessing
        //initiate the columnData and descriptiveStat lists
        for (Feature feature : this.features) {
            columnData.add(new ArrayList<String>());
            this.descriptiveStats.add(new DescriptiveStatistics());
            Feature newFeature = new Feature();
            newFeature.setName(feature.getName());
            newFeature.setIndex(feature.getIndex());
            newFeature.setInclude(true);
            newFeature.setImputeOption(MLConstants.DISCARD);
            featureListForSample.add(newFeature);
        }

        // take a random sample
        JavaRDD<String[]> sampleRDD = tokenizeDataToSample.sample(false , 0.1);
        DiscardedRowsFilter discardedRowsFilter = new DiscardedRowsFilter.Builder().init(featureListForSample).build();
        List<String[]> sampleLines = sampleRDD.filter(discardedRowsFilter).collect();

        // remove from cache
        tokenizeDataToSample.unpersist();

        // iterate through sample lines
        for (String[] columnValues : sampleLines) {
            for (int currentCol = 0; currentCol < featureSize; currentCol++) {
                // Check whether the row is complete.
                if (currentCol < columnValues.length) {
                    // Append the cell to the respective column.
                    columnData.get(currentCol).add(columnValues[currentCol]);

                    if (!NumberUtils.isNumber(columnValues[currentCol])) {
                        stringCellCount[currentCol]++;
                    }
                }
            }
        }

        // Iterate through each column.
        for (int currentCol = 0; currentCol < featureSize; currentCol++) {
            // If the column is numerical.
            if (stringCellCount[currentCol] == 0) {
                // Convert each cell value to double and append to the
                // Descriptive-statistics object.
                for (int row = 0; row < columnData.get(currentCol).size(); row++) {
                    if (columnData.get(currentCol).get(row) != null
                            && !MLConstants.MISSING_VALUES.contains(columnData.get(currentCol).get(row))) {
                        cellValue = Double.parseDouble(columnData.get(currentCol).get(row));
                        this.descriptiveStats.get(currentCol).addValue(cellValue);
                    }
                }
            }
        }
    }
    //map the mean of each column with the column name
    private void setMeanOfEachColumn(){
        for (int currentCol = 0 ; currentCol < this.features.size() ; currentCol++){
            this.meanOfEachColumn.put(this.features.get(currentCol).getName(), this.descriptiveStats.get(currentCol).getMean());
        }
    }

}

