package org.wso2.carbon.notebook.core.util.paragraph;


import org.apache.commons.collections.map.HashedMap;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.apache.spark.api.java.JavaRDD;
import org.wso2.carbon.analytics.datasource.commons.ColumnDefinition;
import org.wso2.carbon.analytics.datasource.commons.Record;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.ml.commons.domain.Feature;
import org.wso2.carbon.ml.core.spark.transformations.RemoveResponseColumn;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.exception.PreprocessorException;
import org.wso2.carbon.notebook.core.ml.transformation.*;
import org.wso2.carbon.notebook.core.util.GeneralUtils;
import org.wso2.carbon.notebook.core.util.MLUtils;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Preprocessor utility functions for the notebook
 */
public class PreprocessorUtils implements Serializable {
    /**
     * Save the preprocessed table data into a new table
     *
     * @param tenantID              Tenant ID
     * @param tableName             Name of the table
     * @param preprocessedTableName The new table into which the preprocessed lines should be saved to
     * @param featureList           List of features to save
     * @param lines                 List of preprocessed lines to save
     */
    public static void saveTable(int tenantID, String tableName, String preprocessedTableName, List<Feature> featureList, JavaRDD<String[]> lines)
            throws PreprocessorException, AnalyticsException {
        List<ColumnDefinition> includedColumnList = new ArrayList<>();
        List<ColumnDefinition> schema;

        schema = GeneralUtils.getTableSchema(tableName, tenantID);   //Get the schema of the table
        // Get the column list included in the preprocessed table
        for (Feature feature : featureList) {
            if (feature.isInclude()) {
                includedColumnList.add(schema.get(feature.getIndex()));
            }
        }


        // Convert the table data into a list of string arrays. each array representing one row
        if (lines.count() > 0) {
            List<String[]> rowsAsStringArray = lines.collect();
            // Create record from each row in the table.
            // Convert each string value into an object of the column data type
            List<Record> records = new ArrayList<>();
            for (String[] row : rowsAsStringArray) {
                Map<String, Object> values = new HashedMap();
                Object dataObject = null;
                for (int i = 0; i < row.length; i++) {
                    String dataType = includedColumnList.get(i).getType().toString();
                    switch (dataType) {
                        case "FACET":
                            dataObject = row[i];
                            break;
                        case "INTEGER":
                            dataObject = (int) Double.parseDouble(row[i]);
                            break;
                        case "LONG":
                            dataObject = Long.parseLong(row[i]);
                            break;
                        case "FLOAT":
                            dataObject = (float) Double.parseDouble(row[i]);
                            break;
                        case "DOUBLE":
                            dataObject = Double.parseDouble(row[i]);
                            break;
                        case "BOOLEAN":
                            dataObject = Boolean.parseBoolean(row[i]);
                            break;
                        default:    // For strings
                            dataObject = row[i];
                    }
                    values.put(includedColumnList.get(i).getName(), dataObject);
                }
                Record record = new Record(tenantID, preprocessedTableName, values);
                records.add(record);

                // Generate the schema string for the new table
                StringBuilder builder = new StringBuilder();
                for (ColumnDefinition includedColumn : includedColumnList) {
                    builder.append(includedColumn.getName() + ' ' + includedColumn.getType());
                    if (includedColumn.isScoreParam()) {
                        builder.append(" -sp" + ", ");
                    } else if (includedColumn.isIndexed()) {
                        builder.append(" -i" + ", ");
                    } else {
                        builder.append(", ");
                    }
                }

                // Create new table and insert data.
                String newSchema = builder.toString();
                newSchema = newSchema.substring(0, newSchema.length() - 2);
                String createTempTableQuery =
                        "CREATE TEMPORARY TABLE " +
                                preprocessedTableName +
                                " USING CarbonAnalytics OPTIONS (tableName \"" +
                                preprocessedTableName +
                                "\", schema \"" +
                                newSchema +
                                "\");";
                ServiceHolder.getAnalyticsProcessorService().executeQuery(tenantID, createTempTableQuery);
                ServiceHolder.getAnalyticsDataService().put(records);
            }
        } else {
            throw new PreprocessorException("No data found in table " + tableName);
        }
    }

    /**
     * Generate descriptive statistics for each column of the table
     *
     * @param tokenizeDataToSample dataset of the table; each cell as a token
     * @param features             columns of the table selected for processing
     * @param tableName            table selected for processing
     * @return List of Descriptive Statistics of each column
     * @throws PreprocessorException
     */
    public static List<DescriptiveStatistics> generateDescriptiveStat(JavaRDD<String[]> tokenizeDataToSample, List<Feature> features, String tableName)
            throws PreprocessorException {
        int featureSize;
        int[] stringCellCount;
        double cellValue;
        List<List<String>> columnData = new ArrayList<List<String>>();
        List<DescriptiveStatistics> descriptiveStats = new ArrayList<DescriptiveStatistics>();

        featureSize = features.size();
        stringCellCount = new int[featureSize];

        //initiate the columnData and descriptiveStat lists
        for (int count = 0; count < featureSize; count++) {
            columnData.add(new ArrayList<String>());
            descriptiveStats.add(new DescriptiveStatistics());
        }

        //calculate the sample size
        long dataSetSize = tokenizeDataToSample.count();
        if (dataSetSize > 0) {
            double sampleFraction
                    = org.wso2.carbon.notebook.commons.constants.MLConstants.SAMPLE_SIZE / (double) (dataSetSize - 1);
            if (sampleFraction > 1) {
                sampleFraction = 1;
            }

            // take a random sample removing null values in each row
            MissingValuesFilter missingValuesFilter = new MissingValuesFilter.Builder().build();
            JavaRDD<String[]> filteredDataToSample = tokenizeDataToSample.filter(missingValuesFilter);
            List<String[]> sampleLines = filteredDataToSample.sample(false, sampleFraction).collect();

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
                                && !org.wso2.carbon.notebook.commons.constants.MLConstants.MISSING_VALUES.contains(columnData.get(currentCol).get(row))) {
                            cellValue = Double.parseDouble(columnData.get(currentCol).get(row));
                            descriptiveStats.get(currentCol).addValue(cellValue);
                        }
                    }
                }
            }
            return descriptiveStats;
        } else {
            throw new PreprocessorException("No data found in table " + tableName);
        }
    }

    /**
     * Take a sample from the table and preprocess according to the parameters set
     *
     * @return preprocessed lines
     */
    public static JavaRDD<String[]> preProcess(int tenantID, String tableName, List<Feature> features, String headerLine) throws PreprocessorException, AnalyticsException {
        JavaRDD<String[]> preprocessedLines = null;
        JavaRDD<String> lines = MLUtils.getLinesFromDASTable(
                tableName, tenantID, ServiceHolder.getSparkContextService().getJavaSparkContext()
        );

        try {
            HeaderFilter headerFilter = new HeaderFilter.Builder().init(headerLine).build();
            JavaRDD<String> data = lines.filter(headerFilter);

            LineToTokens lineToTokens = new LineToTokens.Builder().init(String.valueOf(CSVFormat.RFC4180.getDelimiter())).build();
            JavaRDD<String[]> tokens = data.map(lineToTokens);

            //generate Descriptive Statistics for each column
            List<DescriptiveStatistics> descriptiveStats = generateDescriptiveStat(tokens, features, tableName);

            Map<String, Double> meanOfEachColumn = setMeanOfEachColumn(features, descriptiveStats);

            DiscardedRowsFilter discardedRowsFilter =
                    new DiscardedRowsFilter.Builder().init(features).build();
            RemoveDiscardedFeatures removeDiscardedFeatures =
                    new RemoveDiscardedFeatures.Builder().init(features).build();
            MeanImputation meanImputationFilter =
                    new MeanImputation.Builder().init(meanOfEachColumn, features).build();
            RemoveResponseColumn responseColumnFilter = new RemoveResponseColumn();

            preprocessedLines = tokens
                    .filter(discardedRowsFilter)
                    .map(removeDiscardedFeatures)
                    .map(responseColumnFilter)
                    .map(meanImputationFilter)
                    .cache();
        } finally {
            if (lines != null) {
                lines.unpersist();
            }
        }
        return preprocessedLines;
    }

    /**
     * Map the mean of each column with the column name
     */
    private static Map<String, Double> setMeanOfEachColumn(List<Feature> features, List<DescriptiveStatistics> descriptiveStats) {
        Map<String, Double> meanOfEachColumn = new HashMap<>();
        for (int currentCol = 0; currentCol < features.size(); currentCol++) {
            meanOfEachColumn.put(
                    features.get(currentCol).getName(),
                    descriptiveStats.get(currentCol).getMean()
            );
        }
        return meanOfEachColumn;
    }

}
