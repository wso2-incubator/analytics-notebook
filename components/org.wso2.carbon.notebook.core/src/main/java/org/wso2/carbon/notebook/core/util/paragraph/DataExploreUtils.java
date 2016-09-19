package org.wso2.carbon.notebook.core.util.paragraph;

import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.mllib.clustering.KMeans;
import org.apache.spark.mllib.clustering.KMeansModel;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.ml.commons.domain.ClusterPoint;
import org.wso2.carbon.ml.commons.domain.FeatureType;
import org.wso2.carbon.ml.commons.domain.SamplePoints;
import org.wso2.carbon.ml.core.exceptions.MLMalformedDatasetException;
import org.wso2.carbon.ml.core.exceptions.MLModelHandlerException;
import org.wso2.carbon.ml.core.spark.transformations.MissingValuesFilter;
import org.wso2.carbon.ml.core.spark.transformations.TokensToVectors;
import org.wso2.carbon.notebook.commons.constants.MLConstants;
import org.wso2.carbon.notebook.core.MLDataHolder;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.ml.transformation.HeaderFilter;
import org.wso2.carbon.notebook.core.ml.transformation.LineToTokens;
import org.wso2.carbon.notebook.core.util.MLUtils;
import scala.Tuple2;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Data explorer utility functions for the notebook
 */
public class DataExploreUtils {
    private final static double categoricalThreshold = 0.01;

    public static Map<String, List<String>> identifyColumnDataType(String tableName, int tenantID)
            throws MLMalformedDatasetException {
        SamplePoints samplePoints = MLDataHolder.getSamplePoints(tableName, tenantID);
        List<String> categoricalFeatureNames = new ArrayList<String>();
        List<String> numericalFeatureNames = new ArrayList<String>();

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
                        && (multipleOccurences / uniqueSet.size()) * 100 >= categoricalThreshold) {
                    type[currentCol] = FeatureType.CATEGORICAL;
                }
            }
        }

        for (Map.Entry<String, Integer> pair : headerMap.entrySet()) {
            if (type[pair.getValue()].equals(FeatureType.CATEGORICAL)) {
                categoricalFeatureNames.add(pair.getKey());
            } else {
                numericalFeatureNames.add(pair.getKey());
            }
        }

        Map<String, List<String>> features = new HashMap<String, List<String>>();
        features.put("numerical", numericalFeatureNames);
        features.put("categorical", categoricalFeatureNames);
        return features;
    }

    public static List<ClusterPoint> getClusterPoints(String tableName, int tenantID,
                                               String featureListString, int noOfClusters)
            throws MLMalformedDatasetException, MLModelHandlerException, AnalyticsException {
        List<String> features = Arrays.asList(featureListString.split("\\s*,\\s*"));

        List<ClusterPoint> clusterPoints = new ArrayList<ClusterPoint>();
        // java spark context
        JavaSparkContext sparkContext = ServiceHolder.getSparkContextService().getJavaSparkContext();

        JavaRDD<String> lines = MLUtils.getLinesFromDASTable(tableName, tenantID, sparkContext);
        // get column separator
        String columnSeparator = MLUtils.ColumnSeparatorFactory.getColumnSeparator("das");
        // get header line
        String headerRow = MLUtils.extractHeaderLine(tableName, tenantID);
        Pattern pattern = MLUtils.getPatternFromDelimiter(columnSeparator);
        // get selected feature indices
        List<Integer> featureIndices = new ArrayList<Integer>();
        for (String feature : features) {
            featureIndices.add(MLUtils.getFeatureIndex(feature, headerRow, columnSeparator));
        }
        double sampleFraction = MLConstants.SAMPLE_SIZE / (lines.count() - 1);

        HeaderFilter headerFilter = new HeaderFilter.Builder().init(headerRow).build();
        LineToTokens lineToTokens = new LineToTokens.Builder().separator(pattern).build();
        MissingValuesFilter missingValuesFilter = new MissingValuesFilter.Builder().build();
        TokensToVectors tokensToVectors = new TokensToVectors.Builder().indices(featureIndices).build();

        JavaRDD<org.apache.spark.mllib.linalg.Vector> featureVectors;
        // Use entire data set if number of records is less than or equal to sample fraction
        if (sampleFraction >= 1.0) {
            featureVectors = lines.filter(headerFilter).map(lineToTokens).filter(missingValuesFilter)
                    .map(tokensToVectors);
        }
        // Use randomly selected sample fraction of rows if number of records is > sample fraction
        else {
            featureVectors = lines.filter(headerFilter).sample(false, sampleFraction).map(lineToTokens)
                    .filter(missingValuesFilter).map(tokensToVectors);
        }

        KMeansModel kMeansModel = KMeans.train(featureVectors.rdd(), noOfClusters, 100);
        // Populate cluster points list with predicted clusters and features
        List<Tuple2<Integer, org.apache.spark.mllib.linalg.Vector>> kMeansPredictions = kMeansModel
                .predict(featureVectors).zip(featureVectors).collect();
        for (Tuple2<Integer, org.apache.spark.mllib.linalg.Vector> kMeansPrediction : kMeansPredictions) {
            ClusterPoint clusterPoint = new ClusterPoint();
            clusterPoint.setCluster(kMeansPrediction._1());
            clusterPoint.setFeatures(kMeansPrediction._2().toArray());
            clusterPoints.add(clusterPoint);
        }
        return clusterPoints;
    }
}
