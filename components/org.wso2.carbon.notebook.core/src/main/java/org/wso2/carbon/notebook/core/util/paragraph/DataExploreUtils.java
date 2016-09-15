package org.wso2.carbon.notebook.core.util.paragraph;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.commons.math3.random.EmpiricalDistribution;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.wso2.carbon.ml.commons.constants.MLConstants;
import org.wso2.carbon.ml.commons.domain.FeatureType;
import org.wso2.carbon.ml.commons.domain.SamplePoints;
import org.wso2.carbon.ml.commons.domain.config.SummaryStatisticsSettings;
import org.wso2.carbon.ml.core.exceptions.MLMalformedDatasetException;
import org.wso2.carbon.ml.core.impl.SummaryStatsGenerator;
import org.wso2.carbon.ml.core.interfaces.DatasetProcessor;
import org.wso2.carbon.notebook.core.MLDataHolder;

import java.util.*;

/**
 * Data explorer utility functions for the notebook
 */
public class DataExploreUtils {
    private SamplePoints samplePoints;

    private List<String> categoricalFeatureNames;
    private List<String> numercalFeatureNames;

    private final double categoricalThreshold = 0.01;

    public DataExploreUtils(String tableName, int tenantID) throws MLMalformedDatasetException {
        samplePoints = MLDataHolder.getSamplePoints(tableName, tenantID);

        categoricalFeatureNames = new ArrayList<String>();
        numercalFeatureNames = new ArrayList<String>();

        identifyColumnDataType();
    }

    public List<String> getCategoricalFeatureNames() {
        return categoricalFeatureNames;
    }

    public List<String> getNumercalFeatureNames() {
        return numercalFeatureNames;
    }

    private void identifyColumnDataType() {
        Map<String, Integer> headerMap = samplePoints.getHeader();
        int[] stringCellCount = samplePoints.getStringCellCount();
        int[] decimalCellCount = samplePoints.getDecimalCellCount();
        String[] type = new String[headerMap.size()];
        List<Integer> numericDataColumnPositions = new ArrayList<Integer>();
        List<Integer> stringDataColumnPositions = new ArrayList<Integer>();

        // If at least one cell contains strings, then the column is considered to has string data.
        for (int col = 0; col < headerMap.size(); col++) {
            if (stringCellCount[col] > 0) {
                stringDataColumnPositions.add(col);
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
                numercalFeatureNames.add(pair.getKey());
            }
        }
    }

}
