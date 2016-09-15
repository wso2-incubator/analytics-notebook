package org.wso2.carbon.notebook.core.ml;

import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.wso2.carbon.ml.commons.domain.FeatureType;
import org.wso2.carbon.ml.commons.domain.SamplePoints;
import org.wso2.carbon.ml.core.exceptions.MLMalformedDatasetException;
import org.wso2.carbon.notebook.commons.constants.MLConstants;
import org.wso2.carbon.notebook.core.MLDataHolder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Responsible for generating summary stats for a given set of sample points.
 */
public class SummaryStatGenerator {

    // List containing positions of columns with numerical data.
    private List<Integer> numericDataColumnPositions = new ArrayList<Integer>();
    // List containing positions of columns with string data.
    private List<Integer> stringDataColumnPositions = new ArrayList<Integer>();
    // List containing actual data of the sample.
    private List<List<String>> columnData = new ArrayList<List<String>>();
    // List containing descriptive statistics for each feature.
    private List<DescriptiveStatistics> descriptiveStats = new ArrayList<DescriptiveStatistics>();

    // Array containing number of unique values of each feature in the data-set.
    private int[] unique;
    private int[] missing;
    private int[] stringCellCount;
    private int[] decimalCellCount;
    // Array containing data-type of each feature in the data-set.
    private String[] type;
    // Map containing indices and names of features of the data-set.
    private Map<String, Integer> headerMap;
    private SamplePoints samplePoints = new SamplePoints();

    public SummaryStatGenerator(int tenantID, String tableName) {
        try {
            this.samplePoints = MLDataHolder.getSamplePoints(tableName, tenantID);
            this.samplePoints.setGenerated(true);
            this.headerMap = samplePoints.getHeader();
            this.columnData = samplePoints.getSamplePoints();
            this.missing = samplePoints.getMissing();
            this.stringCellCount = samplePoints.getStringCellCount();
            this.decimalCellCount = samplePoints.getDecimalCellCount();
            int noOfFeatures = this.headerMap.size();

            //Initialize the lists
            this.unique = new int[noOfFeatures];
            this.type = new String[noOfFeatures];
            for (int i = 0; i < noOfFeatures; i++) {
                this.descriptiveStats.add(new DescriptiveStatistics());
            }

            // Find the columns containing String and Numeric data.
            identifyColumnsWithNumerals();
            calculateDescriptiveStats();

        } catch (MLMalformedDatasetException e) {
            e.printStackTrace();
        }
    }

    /**
     * Finds the columns with Strings and Numerical. Stores the raw-data in a list.
     */
    protected void identifyColumnsWithNumerals() {
        // If at least one cell contains strings, then the column is considered to has string data.
        for (int col = 0; col < headerMap.size(); col++) {
            if (stringCellCount[col] > 0) {
                this.stringDataColumnPositions.add(col);
            } else {
                this.numericDataColumnPositions.add(col);
            }
        }
    }


    /**
     * Calculate descriptive statistics for Numerical columns.
     */
    protected List<DescriptiveStatistics> calculateDescriptiveStats() {
        double cellValue;
        int currentCol;
        // Iterate through each column.
        for (currentCol = 0; currentCol < this.headerMap.size(); currentCol++) {
            // If the column is numerical.
            if (this.numericDataColumnPositions.contains(currentCol)) {
                // Convert each cell value to double and append to the
                // Descriptive-statistics object.
                for (int row = 0; row < this.columnData.get(currentCol).size(); row++) {
                    if (this.columnData.get(currentCol).get(row) != null
                            && !MLConstants.MISSING_VALUES.contains(this.columnData.get(currentCol).get(row))) {
                        cellValue = Double.parseDouble(columnData.get(currentCol).get(row));
                        this.descriptiveStats.get(currentCol).addValue(cellValue);
                    }
                }
            }
        }

        return descriptiveStats;
    }

    public List<DescriptiveStatistics> getDescriptiveStats() {
        return descriptiveStats;
    }

    public List<Integer> getNumericDataColumnPositions() {
        return numericDataColumnPositions;
    }
}
