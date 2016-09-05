package org.wso2.carbon.notebook;

import org.wso2.carbon.analytics.datasource.commons.Record;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class Utils {
    private static final SimpleDateFormat SIMPLE_DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss z");

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
