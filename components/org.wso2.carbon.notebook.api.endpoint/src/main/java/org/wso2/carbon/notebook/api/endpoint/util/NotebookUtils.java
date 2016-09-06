package org.wso2.carbon.notebook.api.endpoint.util;

import org.wso2.carbon.analytics.datasource.commons.Record;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * General utility functions for the notebook
 */
public class NotebookUtils {
    private static final SimpleDateFormat SIMPLE_DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss z");

    /**
     * Generates a list of maps with each map corresponding to a row and the column names as key and data in the cell as value in each map
     *
     * @param records Record objcets of the table from which the data needs to be extracted
     * @return List of rows of data of the table. Each row is represented by a map which maps each column header to an Object
     */
    public static List<Map<String, Object>> getTableDataFromRecords(List<Record> records) {
        List<Map<String, Object>> data = new ArrayList<>();
        for (Record record : records) {
            Map<String, Object> row = record.getValues();
            row.put("_timestamp", SIMPLE_DATE_FORMAT.format(new Date(record.getTimestamp())));
            data.add(row);
        }
        return data;
    }
}
