package org.wso2.carbon.notebook.core.util.paragraph;


import org.apache.commons.collections.map.HashedMap;
import org.apache.spark.api.java.JavaRDD;
import org.wso2.carbon.analytics.datasource.commons.AnalyticsSchema;
import org.wso2.carbon.analytics.datasource.commons.ColumnDefinition;
import org.wso2.carbon.analytics.datasource.commons.Record;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.ml.commons.domain.Feature;
import org.wso2.carbon.notebook.commons.response.dto.Column;
import org.wso2.carbon.notebook.core.ServiceHolder;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class GeneralUtils implements Serializable {

    public static void saveTable(int tenantID, String tableName, String preprocessedTableName, List<Feature> featureList, JavaRDD<String[]> lines) {
        List<Column> includedColumnList = new ArrayList<>();
        List<Column> schema = null;

        //Get the schema of the table
        try {
            schema = getTableSchema(tableName, tenantID);
        } catch (AnalyticsException e) {
            e.printStackTrace();
        }
        //Get the column list included in the preprocessed table
        for (Feature feature : featureList) {
            if (feature.isInclude()) {
                includedColumnList.add(schema.get(feature.getIndex()));
            }
        }

        //Convert the table data into a list of string arrays. each array representing one row
        List<String[]> rowsAsStringArray = lines.collect();
        //Create record from each row in the table.
        //Convert each string value into an object of the column datatype
        List<Record> records = new ArrayList<>();
        for (String[] row : rowsAsStringArray) {
            Map<String, Object> values = new HashedMap();
            Object dataObject = null;
            for (int i = 0; i < row.length; i++) {
                String dataType = includedColumnList.get(i).getType().toString();
                switch (dataType) {
                    case "STRING":
                        dataObject = row[i];
                        break;
                    case "FACET":
                        dataObject = row[i];
                        break;
                    case "INTEGER":
                        dataObject = Integer.parseInt(row[i]);
                        break;
                    case "LONG":
                        dataObject = Long.parseLong(row[i]);
                        break;
                    case "FLOAT":
                        dataObject = Float.parseFloat(row[i]);
                        break;
                    case "DOUBLE":
                        dataObject = Double.parseDouble(row[i]);
                        break;
                    case "BOOLEAN":
                        dataObject = Boolean.parseBoolean(row[i]);
                        break;
                }
                values.put(includedColumnList.get(i).getName(), dataObject);
            }
            Record record = new Record(tenantID, preprocessedTableName, values);
            records.add(record);
        }
        //Generate the schema string for the new table
        String newSchema = "";
        for (Column includedColumn : includedColumnList) {
            if (includedColumn.isScoreParam()) {
                newSchema += includedColumn.getName() + ' ' + includedColumn.getType() + " -sp" + ", ";
            } else if (includedColumn.isIndexed()) {
                newSchema += includedColumn.getName() + ' ' + includedColumn.getType() + " -i" + ", ";
            } else {
                newSchema += includedColumn.getName() + ' ' + includedColumn.getType() + ", ";
            }
        }
        newSchema = newSchema.substring(0, newSchema.length() - 2);
        String createTempTableQuery =
                "CREATE TEMPORARY TABLE " +
                        preprocessedTableName +
                        " USING CarbonAnalytics OPTIONS (tableName \"" +
                        preprocessedTableName +
                        "\", schema \"" +
                        newSchema +
                        "\");";

        //Create new table and insert data.
        try {
            ServiceHolder.getAnalyticsProcessorService().executeQuery(tenantID, createTempTableQuery);
            ServiceHolder.getAnalyticsDataService().put(records);
        } catch (AnalyticsException e) {
            e.printStackTrace();
        }
    }

    public static List<Column> getTableSchema(String tableName, int tenantID) throws AnalyticsException {

        List<Column> schema = new ArrayList<Column>();
        Collection<ColumnDefinition> columns = null;

        columns = ServiceHolder.getAnalyticsDataService()
                .getTableSchema(tenantID, tableName).getColumns().values();

        for (ColumnDefinition column : columns) {
            schema.add(new Column(column.getName(), column.getType(), column.isIndexed(), column.isScoreParam()));
        }
        return schema;
    }

    public static List<String> getPrimaryKeys(int tenantID, String tableName) throws AnalyticsException {
        AnalyticsSchema schema = ServiceHolder.getAnalyticsDataService().getTableSchema(tenantID, tableName);
        return schema.getPrimaryKeys();
    }
}

