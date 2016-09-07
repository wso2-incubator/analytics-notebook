package org.wso2.carbon.notebook.api.endpoint.util;

import org.apache.commons.lang.math.NumberUtils;
import org.wso2.carbon.ml.commons.domain.SamplePoints;
import org.wso2.carbon.ml.core.exceptions.MLMalformedDatasetException;
import org.wso2.carbon.notebook.api.endpoint.dto.request.paragraph.ScatterPlotPointsQuery;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Data explorer utility functions for the notebook
 */
public class DataExplorerUtils {
    public static List<Object> getScatterPlotPoints(int tenantID, ScatterPlotPointsQuery scatterPlotPointsQuery)
            throws MLMalformedDatasetException {
        List<Object> points = null;

        SamplePoints sample = MLUtils.getSampleFromDAS(
                scatterPlotPointsQuery.getTableName(),
                scatterPlotPointsQuery.getSampleSize(),
                tenantID
        );
        points = new ArrayList<Object>();

        // Converts the sample to a JSON array.
        List<List<String>> columnData = sample.getSamplePoints();
        Map<String, Integer> dataHeaders = sample.getHeader();

        int firstFeatureColumn = dataHeaders.get(scatterPlotPointsQuery.getxAxisFeature());
        int secondFeatureColumn = dataHeaders.get(scatterPlotPointsQuery.getyAxisFeature());
        int thirdFeatureColumn = dataHeaders.get(scatterPlotPointsQuery.getGroupByFeature());
        for (int row = 0; row < columnData.get(thirdFeatureColumn).size(); row++) {
            if (columnData.get(firstFeatureColumn).get(row) != null
                    && columnData.get(secondFeatureColumn).get(row) != null
                    && columnData.get(thirdFeatureColumn).get(row) != null
                    && !columnData.get(firstFeatureColumn).get(row).isEmpty()
                    && !columnData.get(secondFeatureColumn).get(row).isEmpty()
                    && !columnData.get(thirdFeatureColumn).get(row).isEmpty()) {
                Map<Double, Object> map1 = new HashMap<Double, Object>();
                Map<Double, Object> map2 = new HashMap<Double, Object>();
                String val1 = columnData.get(secondFeatureColumn).get(row);
                String val2 = columnData.get(firstFeatureColumn).get(row);
                if (NumberUtils.isNumber(val1) && NumberUtils.isNumber(val2)) {
                    map2.put(Double.parseDouble(val1), columnData.get(thirdFeatureColumn).get(row));
                    map1.put(Double.parseDouble(val2), map2);
                    points.add(map1);
                }
            }
        }

        return points;
    }
}
