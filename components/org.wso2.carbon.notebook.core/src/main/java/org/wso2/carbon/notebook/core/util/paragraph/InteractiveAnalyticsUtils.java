package org.wso2.carbon.notebook.core.util.paragraph;

import org.wso2.carbon.analytics.dataservice.commons.AnalyticsDataResponse;
import org.wso2.carbon.analytics.dataservice.commons.SearchResultEntry;
import org.wso2.carbon.analytics.dataservice.core.AnalyticsDataServiceUtils;
import org.wso2.carbon.analytics.datasource.commons.Record;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.notebook.core.ServiceHolder;

import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Utility class for interactive analytics
 */
public class InteractiveAnalyticsUtils {
    /**
     * Run a lucene query and fetch the results
     *
     * @param tenantID        Tenant ID
     * @param tableName       Name of the table
     * @param query           Lucene query
     * @param paginationFrom  Start of the current paginated page
     * @param paginationCount Number of rows in the current paginated page
     * @return Paginated results of the lucene query in the current paginated page of the table
     */
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
        return getTableDataFromRecords(records);
    }

    /**
     * Get the rows by the time at which it was persisted
     *
     * @param tenantID        Tenant ID
     * @param tableName       Name of the table
     * @param timeFrom        The start of the time range
     * @param timeTo          End of the time range
     * @param paginationFrom  Start of the current paginated page
     * @param paginationCount Number of rows in the current paginated page
     * @return Paginated results of the lucene query in the current paginated page of the table
     */
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
                ServiceHolder.getAnalyticsDataService().getRecordStoreNameByTable(tenantID, tableName))) {
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

        return getTableDataFromRecords(records);
    }

    /**
     * Search the table using the primary keys
     *
     * @param tenantID           Tenant ID
     * @param tableName          Table name
     * @param primaryKeySearches List of primary key id and search values
     * @return Result from the primary key search
     */
    public static List<Map<String, Object>> searchByPrimaryKeys(int tenantID, String tableName,
                                                                List<Map<String, Object>> primaryKeySearches)
            throws AnalyticsException {
        AnalyticsDataResponse resp = ServiceHolder.getAnalyticsDataService().getWithKeyValues(
                tenantID, tableName, 1, null, primaryKeySearches
        );
        List<Record> records = AnalyticsDataServiceUtils.listRecords(
                ServiceHolder.getAnalyticsDataService(), resp
        );
        return getTableDataFromRecords(records);
    }

    /**
     * Generates a list of maps with each map corresponding to a row and the column names as key and data in the cell as value in each map
     *
     * @param records Record objcets of the table from which the data needs to be extracted
     * @return List of rows of data of the table. Each row is represented by a map which maps each column header to an Object
     */
    private static List<Map<String, Object>> getTableDataFromRecords(List<Record> records) {
        List<Map<String, Object>> data = new ArrayList<Map<String, Object>>();
        for (Record record : records) {
            Map<String, Object> row = record.getValues();
            row.put(
                    "_timestamp",
                    new SimpleDateFormat("yyyy-MM-dd HH:mm:ss z").format(new Date(record.getTimestamp()))
            );
            data.add(row);
        }
        return data;
    }
}
