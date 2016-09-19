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
import org.wso2.carbon.ml.commons.domain.*;
import org.wso2.carbon.ml.commons.domain.config.MLProperty;
import org.wso2.carbon.ml.core.exceptions.MLMalformedDatasetException;
import org.wso2.carbon.ml.core.spark.transformations.RowsToLines;
import org.wso2.carbon.notebook.commons.constants.MLConstants;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.ml.transformation.DiscardedRowsFilter;
import org.wso2.carbon.notebook.core.ml.transformation.HeaderFilter;
import org.wso2.carbon.notebook.core.ml.transformation.LineToTokens;


import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Machine learner utility functions for the notebook
 */
public class MLUtils {
    /**
     * Generate a random sample of the dataset using Spark.
     */
    public static SamplePoints getSample(String path, String dataType, int sampleSize, boolean containsHeader)
            throws MLMalformedDatasetException {

        JavaSparkContext sparkContext = null;
        try {
            Map<String, Integer> headerMap = null;
            // List containing actual data of the sample.
            List<List<String>> columnData = new ArrayList<List<String>>();
            CSVFormat dataFormat = DataTypeFactory.getCSVFormat(dataType);

            // java spark context
            sparkContext = ServiceHolder.getSparkContextService().getJavaSparkContext();
            JavaRDD<String> lines;

            // parse lines in the dataset
            lines = sparkContext.textFile(path);
            // validates the data format of the file
            String firstLine = lines.first();
            if (!firstLine.contains("" + dataFormat.getDelimiter())) {
                throw new MLMalformedDatasetException(String.format(
                        "File content does not match the data format. [First Line] %s [Data Format] %s", firstLine,
                        dataType));
            }
            return getSamplePoints(sampleSize, containsHeader, headerMap, columnData, dataFormat, lines);

        } catch (Exception e) {
            throw new MLMalformedDatasetException("Failed to extract the sample points from path: " + path
                    + ". Cause: " + e, e);
        }
    }

    public static String getFirstLine(String filePath) {
        JavaSparkContext sparkContext = ServiceHolder.getSparkContextService().getJavaSparkContext();
        return sparkContext.textFile(filePath).first();
    }

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
        List<String> testResult = lines.collect();
        return lines;
    }

    private static JavaRDD<String[]> getTokensFromLines(CSVFormat dataFormat, JavaRDD<String> lines) {
        // take the first line
        String firstLine = lines.first();
        // count the number of features
        int featureSize = getFeatureSize(firstLine, dataFormat);

        List<Integer> featureIndices = new ArrayList<Integer>();
        for (int i = 0; i < featureSize; i++) {
            featureIndices.add(i);
        }

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
     * @param columnSeparator Column separator character
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
     * Retrieve the index of a feature in the dataset.
     */
    public static int getFeatureIndex(String featureName, List<org.wso2.carbon.ml.commons.domain.Feature> features) {
        if (featureName == null || features == null) {
            return -1;
        }
        for (org.wso2.carbon.ml.commons.domain.Feature feature : features) {
            if (featureName.equals(feature.getName())) {
                return feature.getIndex();
            }
        }
        return -1;
    }

    /**
     * @param workflow Workflow
     * @return A list of indices of features to be included in the model
     */
    public static SortedMap<Integer, String> getIncludedFeaturesAfterReordering(Workflow workflow,
                                                                                List<Integer> newToOldIndicesList, int responseIndex) {
        SortedMap<Integer, String> inlcudedFeatures = new TreeMap<Integer, String>();
        List<org.wso2.carbon.ml.commons.domain.Feature> features = workflow.getFeatures();
        for (org.wso2.carbon.ml.commons.domain.Feature feature : features) {
            if (feature.isInclude() == true && feature.getIndex() != responseIndex) {
                int currentIndex = feature.getIndex();
                int newIndex = newToOldIndicesList.indexOf(currentIndex);
                inlcudedFeatures.put(newIndex, feature.getName());
            }
        }
        return inlcudedFeatures;
    }

    /**
     * @param workflow Workflow
     * @return A list of indices of features to be included in the model
     */
    public static SortedMap<Integer, String> getIncludedFeatures(Workflow workflow, int responseIndex) {
        SortedMap<Integer, String> inlcudedFeatures = new TreeMap<Integer, String>();
        List<org.wso2.carbon.ml.commons.domain.Feature> features = workflow.getFeatures();
        for (org.wso2.carbon.ml.commons.domain.Feature feature : features) {
            if (feature.isInclude() == true && feature.getIndex() != responseIndex) {
                inlcudedFeatures.put(feature.getIndex(), feature.getName());
            }
        }
        return inlcudedFeatures;
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

    /**
     * @param tenantId   Tenant ID of the current user
     * @param datasetId  ID of the datstet
     * @param userName   Name of the current user
     * @param name       Dataset name
     * @param version    Dataset version
     * @param targetPath path of the stored data set
     * @return Dataset Version Object
     */
    public static MLDatasetVersion getMLDatsetVersion(int tenantId, long datasetId, String userName, String name,
                                                      String version, String targetPath) {
        MLDatasetVersion valueSet = new MLDatasetVersion();
        valueSet.setTenantId(tenantId);
        valueSet.setDatasetId(datasetId);
        valueSet.setName(name);
        valueSet.setVersion(version);
        valueSet.setTargetPath(targetPath);
        valueSet.setUserName(userName);
        return valueSet;
    }

    /**
     * @return Current date and time
     */
    public static String getDate() {
        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss");
        Date date = new Date();
        return dateFormat.format(date);
    }

    /**
     * Get {@link Properties} from a list of {@link MLProperty}
     *
     * @param mlProperties list of {@link MLProperty}
     * @return {@link Properties}
     */
    public static Properties getProperties(List<MLProperty> mlProperties) {
        Properties properties = new Properties();
        for (MLProperty mlProperty : mlProperties) {
            if (mlProperty != null) {
                properties.put(mlProperty.getName(), mlProperty.getValue());
            }
        }
        return properties;

    }

    /**
     * @param inArray String array
     * @return Double array
     */
    public static double[] toDoubleArray(String[] inArray) {
        double[] outArray = new double[inArray.length];
        int idx = 0;
        for (String string : inArray) {
            outArray[idx] = Double.parseDouble(string);
            idx++;
        }

        return outArray;
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

    public static String[] getFeatures(String line, CSVFormat format) {
        String[] values = line.split("" + format.getDelimiter());
        return values;
    }

    /**
     * Applies the discard filter to a JavaRDD
     *
     * @param delimiter      Column separator of the dataset
     * @param headerRow      Header row
     * @param lines          JavaRDD which contains the dataset
     * @param featureIndices Indices of the features to apply filter
     * @return filtered JavaRDD
     */
    public static JavaRDD<String[]> filterRows(String delimiter, String headerRow, JavaRDD<String> lines,
                                               List<Integer> featureIndices) {
        String columnSeparator = String.valueOf(delimiter);
        HeaderFilter headerFilter = new HeaderFilter.Builder().init(headerRow).build();
        JavaRDD<String> data = lines.filter(headerFilter).cache();
        Pattern pattern = getPatternFromDelimiter(columnSeparator);
        LineToTokens lineToTokens = new LineToTokens.Builder().separator(pattern).build();
        JavaRDD<String[]> tokens = data.map(lineToTokens).cache();

        // get feature indices for discard imputation
        DiscardedRowsFilter discardedRowsFilter = new DiscardedRowsFilter.Builder().indices(featureIndices).build();
        // Discard the row if any of the impute indices content have a missing value
        JavaRDD<String[]> tokensDiscardedRemoved = tokens.filter(discardedRowsFilter).cache();

        return tokensDiscardedRemoved;
    }

    /**
     * format an error message.
     */
    public static String getErrorMsg(String customMessage, Exception ex) {
        if (ex != null) {
            return customMessage + " Cause: " + ex.getClass().getName() + " - " + ex.getMessage();
        }
        return customMessage;
    }

    /**
     * Utility method to get key from value of a map.
     *
     * @param map   Map to be searched for a key
     * @param value Value of the key
     */
    public static <T, E> T getKeyByValue(Map<T, E> map, E value) {
        for (Map.Entry<T, E> entry : map.entrySet()) {
            if (Objects.equals(value, entry.getValue())) {
                return entry.getKey();
            }
        }
        return null;
    }

    /**
     * Utility method to convert a String array to CSV/TSV row string.
     *
     * @param array     String array to be converted
     * @param delimiter Delimiter to be used (comma for CSV tab for TSV)
     * @return CSV/TSV row string
     */
    public static String arrayToCsvString(String[] array, char delimiter) {
        StringBuilder arrayString = new StringBuilder();
        for (String arrayElement : array) {
            arrayString.append(arrayElement);
            arrayString.append(delimiter);
        }
        return arrayString.toString();
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
     * Check for restricted characters in a given name
     *
     * @param file
     */
    public static boolean isValidName(String file) {
        return (!file.contains("../") && !file.contains("..\\"));
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

    public static List<DescriptiveStatistics> generateDescriptiveStat(JavaRDD<String[]> tokenizeDataToSample, List<Feature> features , double fraction) {
        int featureSize;
        int[] stringCellCount;
        double cellValue;
        List<List<String>> columnData = new ArrayList<List<String>>();
        List<DescriptiveStatistics> descriptiveStats = new ArrayList<DescriptiveStatistics>();

        featureSize = features.size();
        stringCellCount = new int[featureSize];

        //create a new feature list for the sample preprocessing
        //initiate the columnData and descriptiveStat lists
        for (int count= 0; count < featureSize; count++) {
            columnData.add(new ArrayList<String>());
            descriptiveStats.add(new DescriptiveStatistics());

        }

        //calculate the sample size
        double sampleFraction
                = org.wso2.carbon.notebook.commons.constants.MLConstants.SAMPLE_SIZE / (tokenizeDataToSample.count() - 1);
        if (sampleFraction > 1){
            sampleFraction = 1;
        }

        // take a random sample
        org.wso2.carbon.notebook.core.ml.transformation.MissingValuesFilter missingValuesFilter
                = new org.wso2.carbon.notebook.core.ml.transformation.MissingValuesFilter.Builder().build();
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
}
