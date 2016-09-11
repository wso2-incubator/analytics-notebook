package org.wso2.carbon.notebook.core.util.paragraph;

import org.apache.commons.lang.math.NumberUtils;
import org.wso2.carbon.ml.commons.domain.SamplePoints;
import org.wso2.carbon.ml.core.exceptions.MLMalformedDatasetException;
import org.wso2.carbon.notebook.core.util.MLUtils;

import java.util.*;

/**
 * Data explorer utility functions for the notebook
 */
public class DataExploreUtils {
//    public static List<String> getFeatureNames(int tenantID, String tableName) throws MLMalformedDatasetException {
//        SamplePoints samplePoints = MLDataHolder.getSamplePoints(tableName, tenantID);
//        Map<String, Integer> headerMap = samplePoints.getHeader();
//
//        // If at least one cell contains strings, then the column is considered to has string data.
//        for (int col = 0; col < headerMap.size(); col++) {
//            if (stringCellCount[col] > 0) {
//                this.stringDataColumnPositions.add(col);
//                this.type[col] = FeatureType.CATEGORICAL;
//            } else {
//                this.numericDataColumnPositions.add(col);
//                this.type[col] = FeatureType.NUMERICAL;
//            }
//        }
//
//        double categoricalThreshold = summarySettings.getCategoricalThreshold();
//        // Iterate through each column.
//        for (int currentCol = 0; currentCol < this.headerMap.size(); currentCol++) {
//            if (this.numericDataColumnPositions.contains(currentCol)) {
//
//                // Create a unique set from the column.
//                List<String> data = this.columnData.get(currentCol);
//
//                // Check whether it is an empty column
//                // Rows with missing values are not filtered at summery stat generation. Therefore it is possible to
//                // have all rows in sample with values missing in a column.
//                if (data.size() == 0) {
//                    String msg = String.format("Column %s is empty in the selected sample rows in dataset version %s",
//                            currentCol, this.datasetVersionId);
//                    logger.warn(msg);
//                    continue;
//                }
//
//                Set<String> uniqueSet = new HashSet<String>(data);
//                int multipleOccurences = 0;
//
//                for (String uniqueValue : uniqueSet) {
//                    int frequency = Collections.frequency(data, uniqueValue);
//                    if (frequency > 1) {
//                        multipleOccurences++;
//                    }
//                }
//
//                // if a column has at least one decimal value, then it can't be categorical.
//                // if a feature has more than X% of repetitive distinct values, then that feature can be a categorical
//                // one. X = categoricalThreshold
//                if (decimalCellCount[currentCol] == 0
//                        && (multipleOccurences / uniqueSet.size()) * 100 >= categoricalThreshold) {
//                    this.type[currentCol] = FeatureType.CATEGORICAL;
//                }
//
//            }
//        }
//
//    }
}
