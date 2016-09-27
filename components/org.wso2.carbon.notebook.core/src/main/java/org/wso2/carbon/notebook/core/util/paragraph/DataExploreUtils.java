package org.wso2.carbon.notebook.core.util.paragraph;

import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.mllib.clustering.KMeans;
import org.apache.spark.mllib.clustering.KMeansModel;
import org.apache.spark.mllib.linalg.Vector;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.ml.commons.domain.ClusterPoint;
import org.wso2.carbon.ml.commons.domain.FeatureType;
import org.wso2.carbon.ml.commons.domain.SamplePoints;
import org.wso2.carbon.ml.core.exceptions.MLMalformedDatasetException;
import org.wso2.carbon.ml.core.exceptions.MLModelHandlerException;
import org.wso2.carbon.ml.core.spark.transformations.MissingValuesFilter;
import org.wso2.carbon.ml.core.spark.transformations.TokensToVectors;
import org.wso2.carbon.notebook.commons.constants.MLConstants;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.ml.transformation.HeaderFilter;
import org.wso2.carbon.notebook.core.ml.transformation.LineToTokens;
import org.wso2.carbon.notebook.core.util.MLUtils;
import scala.Tuple2;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Data explorer utility functions for the notebook
 */
public class DataExploreUtils {
    /**
     * Identify whether each column of the given table is categorical or numerical
     *
     * @param tableName Name of the table
     * @param tenantID  Tenant ID
     * @return Map containing categorical and numerical feature names in two separate lists
     */
    public static Map<String, List<String>> identifyColumnDataType(String tableName, int tenantID)
            throws MLMalformedDatasetException {
        SamplePoints samplePoints = MLUtils.getSampleFromDAS(tableName, MLConstants.SAMPLE_SIZE, tenantID);
        List<String> categoricalFeatureNames = new ArrayList<String>();
        List<String> numericalFeatureNames = new ArrayList<String>();

        Map<String, Integer> headerMap = samplePoints.getHeader();
        String[] type = MLUtils.getColumnTypes(samplePoints);

        // Populating the categorical and numerical lists
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

    /**
     * Get the cluster points fro mthe table specified
     *
     * @param tableName         Name of the table
     * @param tenantID          Tenant ID
     * @param featureListString The independent feature and dependent feature as a comma separated string
     * @param noOfClusters      No of clusters
     * @return List of cluster points
     */
    public static List<ClusterPoint> getClusterPoints(String tableName, int tenantID,
                                                      String featureListString, int noOfClusters)
            throws MLMalformedDatasetException, MLModelHandlerException, AnalyticsException {
        List<String> features = Arrays.asList(featureListString.split("\\s*,\\s*"));
        List<ClusterPoint> clusterPoints = new ArrayList<ClusterPoint>();
        JavaSparkContext sparkContext = ServiceHolder.getSparkContextService().getJavaSparkContext();

        JavaRDD<String> lines = MLUtils.getLinesFromDASTable(tableName, tenantID, sparkContext);
        String headerRow = MLUtils.extractHeaderLine(tableName, tenantID);  // get header line
        String columnSeparator = MLUtils.ColumnSeparatorFactory.getColumnSeparator("das"); // get column separator
        Pattern pattern = MLUtils.getPatternFromDelimiter(columnSeparator);

        // get selected feature indices
        List<Integer> featureIndices = new ArrayList<Integer>();
        for (String feature : features) {
            featureIndices.add(MLUtils.getFeatureIndex(feature, headerRow, columnSeparator));
        }

        // Clean the data set and transform into LinesToVectors
        HeaderFilter headerFilter = new HeaderFilter.Builder().init(headerRow).build();
        LineToTokens lineToTokens = new LineToTokens.Builder().separator(pattern).build();
        MissingValuesFilter missingValuesFilter = new MissingValuesFilter.Builder().build();
        TokensToVectors tokensToVectors = new TokensToVectors.Builder().indices(featureIndices).build();

        JavaRDD<String> dataSet = lines.filter(headerFilter);
        double sampleFraction = MLConstants.SAMPLE_SIZE / (double) (lines.count() - 1);
        if (sampleFraction < 1.0) {
            // Use randomly selected sample fraction of rows if number of records > sample size
            dataSet = dataSet.sample(false, sampleFraction);
        }
        JavaRDD<Vector> featureVectors = dataSet
                .map(lineToTokens)
                .filter(missingValuesFilter)
                .map(tokensToVectors);

        // Train the KMeans model and predict the cluster points
        KMeansModel kMeansModel = KMeans.train(featureVectors.rdd(), noOfClusters, 100);
        List<Tuple2<Integer, Vector>> kMeansPredictions =
                kMeansModel.predict(featureVectors).zip(featureVectors).collect();

        // Populate cluster points list with predicted clusters and features
        for (Tuple2<Integer, Vector> kMeansPrediction : kMeansPredictions) {
            ClusterPoint clusterPoint = new ClusterPoint();
            clusterPoint.setCluster(kMeansPrediction._1());
            clusterPoint.setFeatures(kMeansPrediction._2().toArray());
            clusterPoints.add(clusterPoint);
        }
        return clusterPoints;
    }
}
