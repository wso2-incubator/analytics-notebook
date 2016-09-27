package org.wso2.carbon.notebook.core.util;

import org.apache.commons.collections.map.HashedMap;
import org.apache.spark.api.java.JavaRDD;
import org.wso2.carbon.analytics.datasource.commons.ColumnDefinition;
import org.wso2.carbon.analytics.datasource.commons.Record;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.ml.commons.domain.Feature;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.exception.PreprocessorException;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * General utilities for the Notebook
 */
public class GeneralUtils implements Serializable {
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

        schema = getTableSchema(tableName, tenantID);   //Get the schema of the table
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
     * Get the table schema for the given table
     *
     * @param tableName Name of the table
     * @param tenantID  Tenant ID
     * @return List of column definitions
     */
    public static List<ColumnDefinition> getTableSchema(String tableName, int tenantID) throws AnalyticsException {
        List<ColumnDefinition> schema = new ArrayList<ColumnDefinition>();
        Collection<org.wso2.carbon.analytics.datasource.commons.ColumnDefinition> columns;

        columns = ServiceHolder.getAnalyticsDataService()
                .getTableSchema(tenantID, tableName).getColumns().values();

        for (org.wso2.carbon.analytics.datasource.commons.ColumnDefinition column : columns) {
            schema.add(new ColumnDefinition(column.getName(), column.getType(), column.isIndexed(), column.isScoreParam()));
        }
        return schema;
    }
}

