package org.wso2.carbon.notebook.core.util;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.DataFrame;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SQLContext;
import org.wso2.carbon.analytics.dataservice.core.AnalyticsDataService;
import org.wso2.carbon.analytics.datasource.commons.AnalyticsSchema;
import org.wso2.carbon.analytics.datasource.commons.ColumnDefinition;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsTableNotAvailableException;
import org.wso2.carbon.ml.commons.domain.Feature;
import org.wso2.carbon.ml.commons.domain.FeatureType;
import org.wso2.carbon.ml.commons.domain.SamplePoints;
import org.wso2.carbon.ml.core.exceptions.MLMalformedDatasetException;
import org.wso2.carbon.ml.core.spark.transformations.RowsToLines;
import org.wso2.carbon.notebook.commons.constants.MLConstants;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.exception.PreprocessorException;
import org.wso2.carbon.notebook.core.ml.transformation.HeaderFilter;
import org.wso2.carbon.notebook.core.ml.transformation.LineToTokens;
import org.wso2.carbon.notebook.core.ml.transformation.MissingValuesFilter;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Machine learner utility functions for the notebook
 */
public class MLUtils {
    /**
     * Generate a random sample of the dataset using Spark.
     */
    public static SamplePoints getSampleFromDAS(String path, int sampleSize, int tenantId)
            throws MLMalformedDatasetException {

        JavaSparkContext sparkContext = null;
        try {
            Map<String, Integer> headerMap = null;
            // List containing actual data of the sample.
            List<List<String>> columnData = new ArrayList<List<String>>();

            // java spark context
            sparkContext = ServiceHolder.getSparkContextService().getJavaSparkContext();
            JavaRDD<String> lines;
            String headerLine = extractHeaderLine(path, tenantId);
            headerMap = generateHeaderMap(headerLine, CSVFormat.RFC4180);

            // DAS case path = table name
            lines = getLinesFromDASTable(path, tenantId, sparkContext);

            return getSamplePoints(sampleSize, true, headerMap, columnData, CSVFormat.RFC4180, lines);

        } catch (Exception e) {
            throw new MLMalformedDatasetException("Failed to extract the sample points from path: " + path
                    + ". Cause: " + e, e);
        }
    }

    public static JavaRDD<String> getLinesFromDASTable(String tableName, int tenantId, JavaSparkContext sparkContext)
            throws AnalyticsTableNotAvailableException, AnalyticsException {
        JavaRDD<String> lines;
        String tableSchema = extractTableSchema(tableName, tenantId);
        SQLContext sqlCtx = new SQLContext(sparkContext);
        sqlCtx.sql("CREATE TEMPORARY TABLE ML_REF USING org.wso2.carbon.analytics.spark.core.sources.AnalyticsRelationProvider "
                + "OPTIONS ("
                + "tenantId \""
                + tenantId
                + "\", "
                + "tableName \""
                + tableName
                + "\", "
                + "schema \""
                + tableSchema + "\"" + ")");

        DataFrame dataFrame = sqlCtx.sql("select * from ML_REF");
        // Additional auto-generated column "_timestamp" needs to be dropped because it is not in the schema.
        JavaRDD<Row> rows = dataFrame.drop("_timestamp").javaRDD();

        lines = rows.map(new RowsToLines.Builder().separator(CSVFormat.RFC4180.getDelimiter() + "").build());
        return lines;
    }

    private static JavaRDD<String[]> getTokensFromLines(CSVFormat dataFormat, JavaRDD<String> lines) {
        String columnSeparator = String.valueOf(dataFormat.getDelimiter());
        HeaderFilter headerFilter = new HeaderFilter.Builder().init(lines.first()).build();

        JavaRDD<String> data = lines.filter(headerFilter).cache();
        Pattern pattern = getPatternFromDelimiter(columnSeparator);
        LineToTokens lineToTokens = new LineToTokens.Builder().separator(pattern).build();

        JavaRDD<String[]> tokens = data.map(lineToTokens);

        // remove from cache
        data.unpersist();

        return tokens;
    }

    private static SamplePoints getSamplePoints(int sampleSize, boolean containsHeader, Map<String, Integer> headerMap,
                                                List<List<String>> columnData, CSVFormat dataFormat, JavaRDD<String> lines) {
        // take the first line
        String firstLine = lines.first();
        // count the number of features
        int featureSize = getFeatureSize(firstLine, dataFormat);

        int[] missing = new int[featureSize];
        int[] stringCellCount = new int[featureSize];
        int[] decimalCellCount = new int[featureSize];

        JavaRDD<String[]> tokens = getTokensFromLines(dataFormat, lines);
        tokens.cache();

        if (sampleSize >= 0 && featureSize > 0) {
            sampleSize = sampleSize / featureSize;
        }
        for (int i = 0; i < featureSize; i++) {
            columnData.add(new ArrayList<String>());
        }

        if (headerMap == null) {
            // generate the header map
            if (containsHeader) {
                headerMap = generateHeaderMap(lines.first(), dataFormat);
            } else {
                headerMap = generateHeaderMap(featureSize);
            }
        }

        // take a random sample
        List<String[]> sampleLines = tokens.takeSample(false, sampleSize);

        // remove from cache
        tokens.unpersist();

        // iterate through sample lines
        for (String[] columnValues : sampleLines) {
            for (int currentCol = 0; currentCol < featureSize; currentCol++) {
                // Check whether the row is complete.
                if (currentCol < columnValues.length) {
                    // Append the cell to the respective column.
                    columnData.get(currentCol).add(columnValues[currentCol]);

                    if (MLConstants.MISSING_VALUES.contains(columnValues[currentCol])) {
                        // If the cell is empty, increase the missing value count.
                        missing[currentCol]++;
                    } else {
                        // check whether a column value is a string
                        if (!NumberUtils.isNumber(columnValues[currentCol])) {
                            stringCellCount[currentCol]++;
                        } else if (columnValues[currentCol].indexOf('.') != -1) {
                            // if it is a number and has the decimal point
                            decimalCellCount[currentCol]++;
                        }
                    }
                } else {
                    columnData.get(currentCol).add(null);
                    missing[currentCol]++;
                }
            }
        }

        SamplePoints samplePoints = new SamplePoints();
        samplePoints.setHeader(headerMap);
        samplePoints.setSamplePoints(columnData);
        samplePoints.setMissing(missing);
        samplePoints.setStringCellCount(stringCellCount);
        samplePoints.setDecimalCellCount(decimalCellCount);
        return samplePoints;
    }

    public static String extractTableSchema(String path, int tenantId) throws AnalyticsTableNotAvailableException,
            AnalyticsException {
        if (path == null) {
            return null;
        }
        AnalyticsDataService analyticsDataApi = ServiceHolder.getAnalyticsDataService();
        // table schema will be something like; <col1_name> <col1_type>,<col2_name> <col2_type>
        StringBuilder sb = new StringBuilder();
        AnalyticsSchema analyticsSchema = analyticsDataApi.getTableSchema(tenantId, path);
        Map<String, ColumnDefinition> columnsMap = analyticsSchema.getColumns();
        for (Iterator<Map.Entry<String, ColumnDefinition>> iterator = columnsMap.entrySet().iterator(); iterator
                .hasNext(); ) {
            Map.Entry<String, ColumnDefinition> column = iterator.next();
            sb.append(column.getKey() + " " + column.getValue().getType().name() + ",");
        }

        return sb.substring(0, sb.length() - 1);
    }

    public static String extractHeaderLine(String path, int tenantId) throws AnalyticsTableNotAvailableException,
            AnalyticsException {
        if (path == null) {
            return null;
        }

        AnalyticsDataService analyticsDataService = ServiceHolder.getAnalyticsDataService();
        // header line will be something like; <col1_name>,<col2_name>
        StringBuilder sb = new StringBuilder();
        AnalyticsSchema analyticsSchema = analyticsDataService.getTableSchema(tenantId, path);
        Map<String, ColumnDefinition> columnsMap = analyticsSchema.getColumns();
        for (String columnName : columnsMap.keySet()) {
            sb.append(columnName + ",");
        }

        return sb.substring(0, sb.length() - 1);
    }

    /**
     * Retrieve the indices of features where discard row imputaion is applied.
     *
     * @param features     The list of features of the dataset
     * @param imputeOption Impute option
     * @return Returns indices of features where discard row imputaion is applied
     */
    public static List<Integer> getImputeFeatureIndices(List<Feature> features, List<Integer> newToOldIndicesList,
                                                        String imputeOption) {
        List<Integer> imputeFeatureIndices = new ArrayList<Integer>();
        for (Feature feature : features) {
            if (feature.getImputeOption().equals(imputeOption) && feature.isInclude() == true) {
                int currentIndex = feature.getIndex();
                int newIndex = newToOldIndicesList.indexOf(currentIndex) != -1 ? newToOldIndicesList
                        .indexOf(currentIndex) : currentIndex;
                imputeFeatureIndices.add(newIndex);
            }
        }
        return imputeFeatureIndices;
    }


    /**
     * Retrieve the index of a feature in the dataset.
     *
     * @param feature         Feature name
     * @param headerRow       First row (header) in the data file
     * @param columnSeparator ColumnDefinition separator character
     * @return Index of the response variable
     */
    public static int getFeatureIndex(String feature, String headerRow, String columnSeparator) {
        int featureIndex = 0;
        String[] headerItems = headerRow.split(columnSeparator);
        for (int i = 0; i < headerItems.length; i++) {
            if (headerItems[i] != null) {
                String column = headerItems[i].replace("\"", "").trim();
                if (feature.equals(column)) {
                    featureIndex = i;
                    break;
                }
            }
        }
        return featureIndex;
    }

    /**
     * @param features list of features of the dataset
     * @return A list of indices of features to be included after processed
     */
    public static List<Integer> getIncludedFeatureIndices(List<Feature> features) {
        List<Integer> includedFeatureIndices = new ArrayList<Integer>();
        for (Feature feature : features) {
            if (feature.isInclude()) {
                includedFeatureIndices.add(feature.getIndex());
            }
        }
        return includedFeatureIndices;
    }


    public static Map<String, Integer> generateHeaderMap(int numberOfFeatures) {
        Map<String, Integer> headerMap = new HashMap<String, Integer>();
        for (int i = 1; i <= numberOfFeatures; i++) {
            headerMap.put("V" + i, i - 1);
        }
        return headerMap;
    }

    public static Map<String, Integer> generateHeaderMap(String line, CSVFormat format) {
        Map<String, Integer> headerMap = new HashMap<String, Integer>();
        String[] values = line.split("" + format.getDelimiter());
        int i = 0;
        for (String value : values) {
            headerMap.put(value, i);
            i++;
        }
        return headerMap;
    }

    public static int getFeatureSize(String line, CSVFormat format) {
        String[] values = line.split("" + format.getDelimiter());
        return values.length;
    }

    /**
     * Generates a pattern to represent CSV or TSV format.
     *
     * @param delimiter "," or "\t"
     * @return Pattern
     */
    public static Pattern getPatternFromDelimiter(String delimiter) {
        return Pattern.compile(delimiter + "(?=([^\"]*\"[^\"]*\")*(?![^\"]*\"))");
    }

    /**
     * Generate descriptive statistics for each column of the table
     *
     * @param tokenizeDataToSample dataset of the table; each cell as a token
     * @param features columns of the table selected for processing
     * @param tableName table selected for processing
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
            throw new PreprocessorException("No data found in table " + tableName );
        }
    }

    public static String[] getColumnTypes(SamplePoints samplePoints) {
        Map<String, Integer> headerMap = samplePoints.getHeader();
        int[] stringCellCount = samplePoints.getStringCellCount();
        int[] decimalCellCount = samplePoints.getDecimalCellCount();
        String[] type = new String[headerMap.size()];
        List<Integer> numericDataColumnPositions = new ArrayList<Integer>();

        // If at least one cell contains strings, then the column is considered to has string data.
        for (int col = 0; col < headerMap.size(); col++) {
            if (stringCellCount[col] > 0) {
                type[col] = FeatureType.CATEGORICAL;
            } else {
                numericDataColumnPositions.add(col);
                type[col] = FeatureType.NUMERICAL;
            }
        }

        List<List<String>> columnData = samplePoints.getSamplePoints();

        // Marking categorical data encoded as numerical data as categorical features
        for (int currentCol = 0; currentCol < headerMap.size(); currentCol++) {
            if (numericDataColumnPositions.contains(currentCol)) {
                // Create a unique set from the column.
                List<String> data = columnData.get(currentCol);

                // Check whether it is an empty column
                // Rows with missing values are not filtered. Therefore it is possible to
                // have all rows in sample with values missing in a column.
                if (data.size() == 0) {
                    continue;
                }

                Set<String> uniqueSet = new HashSet<String>(data);
                int multipleOccurences = 0;

                for (String uniqueValue : uniqueSet) {
                    int frequency = Collections.frequency(data, uniqueValue);
                    if (frequency > 1) {
                        multipleOccurences++;
                    }
                }

                // if a column has at least one decimal value, then it can't be categorical.
                // if a feature has more than X% of repetitive distinct values, then that feature can be a categorical
                // one. X = categoricalThreshold
                if (decimalCellCount[currentCol] == 0
                        && (multipleOccurences / uniqueSet.size()) * 100 >= MLConstants.CATEGORICAL_THRESHOLD) {
                    type[currentCol] = FeatureType.CATEGORICAL;
                }
            }
        }

        return type;
    }

    public static class DataTypeFactory {
        public static CSVFormat getCSVFormat(String dataType) {
            if ("TSV".equalsIgnoreCase(dataType)) {
                return CSVFormat.TDF;
            }
            return CSVFormat.RFC4180;
        }
    }

    public static class ColumnSeparatorFactory {
        public static String getColumnSeparator(String dataType) {
            CSVFormat csvFormat = DataTypeFactory.getCSVFormat(dataType);
            return csvFormat.getDelimiter() + "";
        }
    }
}
