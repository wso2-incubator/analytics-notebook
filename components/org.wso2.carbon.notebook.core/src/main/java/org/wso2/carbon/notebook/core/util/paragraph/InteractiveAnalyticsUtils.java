package org.wso2.carbon.notebook.core.util.paragraph;

import org.apache.commons.csv.CSVFormat;
import org.wso2.carbon.analytics.dataservice.commons.AnalyticsDataResponse;
import org.wso2.carbon.analytics.dataservice.commons.SearchResultEntry;
import org.wso2.carbon.analytics.dataservice.commons.exception.AnalyticsIndexException;
import org.wso2.carbon.analytics.dataservice.core.AnalyticsDataServiceUtils;
import org.wso2.carbon.analytics.datasource.commons.Record;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.util.MLUtils;
import org.wso2.carbon.notebook.core.util.NotebookUtils;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class InteractiveAnalyticsUtils {
    public static List<Map<String, Object>> executeSearchQuery(int tenantID, String tableName, String query,
                                                               int paginationFrom, int paginationCount)
            throws AnalyticsException {
        AnalyticsDataResponse resp;
        if (query != null && !query.isEmpty()) {
            // Running the Lucene Query
            List<SearchResultEntry> searchResultEntries = ServiceHolder.getAnalyticsDataService().search(
                    tenantID,
                    tableName,
                    query,
                    paginationFrom,
                    paginationCount
            );

            // Fetching the list of IDs from Lucene Result
            List<String> ids = new ArrayList<String>();
            for (SearchResultEntry entry : searchResultEntries) {
                ids.add(entry.getId());
            }

            // Fetching the set of record from the IDs
            resp = ServiceHolder.getAnalyticsDataService()
                    .get(tenantID, tableName, 1, null, ids);
        } else {
            resp = ServiceHolder.getAnalyticsDataService().get(
                    tenantID, tableName, 1, null,
                    Long.MIN_VALUE, Long.MAX_VALUE,
                    paginationFrom, paginationCount
            );
        }

        List<Record> records = AnalyticsDataServiceUtils.listRecords(ServiceHolder.getAnalyticsDataService(), resp);
        return getResultsWithNullValuesAdded(tenantID, tableName, NotebookUtils.getTableDataFromRecords(records));
    }

    public static List<Map<String, Object>> searchByDateRange(int tenantID, String tableName, long timeFrom,
                                                              long timeTo, int paginationFrom, int paginationCount)
            throws AnalyticsException {
        // Fetching the analytics response for the records within the timestamp range
        int originalFrom = paginationFrom;
        String recordStoreName = ServiceHolder.getAnalyticsDataService()
                .getRecordStoreNameByTable(tenantID, tableName);
        if (!ServiceHolder.getAnalyticsDataService().isPaginationSupported(recordStoreName)) {
            paginationCount = paginationFrom + paginationCount;
            paginationFrom = 0;
        }
        AnalyticsDataResponse resp = ServiceHolder.getAnalyticsDataService().get(
                tenantID,
                tableName,
                1,
                null,
                timeFrom,
                timeTo,
                paginationFrom,
                paginationCount
        );

        // Fetching the list of records from the analytics response
        List<Record> records;
        if (!ServiceHolder.getAnalyticsDataService().isPaginationSupported(
                ServiceHolder.getAnalyticsDataService().getRecordStoreNameByTable(
                        tenantID, tableName
                )
        )) {
            Iterator<Record> itr = AnalyticsDataServiceUtils.responseToIterator(
                    ServiceHolder.getAnalyticsDataService(),
                    resp
            );
            records = new ArrayList<Record>();
            for (int i = 0; i < originalFrom && itr.hasNext(); i++) {
                itr.next();
            }
            for (int i = 0; i < paginationCount && itr.hasNext(); i++) {
                records.add(itr.next());
            }
        } else {
            records = AnalyticsDataServiceUtils.listRecords(ServiceHolder.getAnalyticsDataService(), resp);
        }

        return getResultsWithNullValuesAdded(tenantID, tableName, NotebookUtils.getTableDataFromRecords(records));
    }

    private static List<Map<String, Object>> getResultsWithNullValuesAdded(int tenantID, String tableName,
                                                                    List<Map<String, Object>> results)
            throws AnalyticsException {
        String headerLine = MLUtils.extractHeaderLine(tableName, tenantID);
        Map<String, Integer> headerMap = MLUtils.generateHeaderMap(headerLine, CSVFormat.RFC4180);
        Object[] headerArray = headerMap.keySet().toArray();
        for (Map<String, Object> row : results) {
            for (Object column : headerArray) {
                String columnName = (String) column;
                if (!row.containsKey(columnName)) {
                    row.put(columnName, null);
                }
            }
        }

        return results;
    }
}
