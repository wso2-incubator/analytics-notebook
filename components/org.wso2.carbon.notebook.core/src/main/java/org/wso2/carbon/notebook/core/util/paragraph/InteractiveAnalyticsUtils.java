package org.wso2.carbon.notebook.core.util.paragraph;

import org.wso2.carbon.analytics.dataservice.commons.AnalyticsDataResponse;
import org.wso2.carbon.analytics.dataservice.commons.SearchResultEntry;
import org.wso2.carbon.analytics.dataservice.commons.exception.AnalyticsIndexException;
import org.wso2.carbon.analytics.dataservice.core.AnalyticsDataServiceUtils;
import org.wso2.carbon.analytics.datasource.commons.Record;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.util.NotebookUtils;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class InteractiveAnalyticsUtils {
    public static List<Map<String, Object>> executeSearchQuery(int tenantID, String tableName, String query,
                                                               int paginationFrom, int paginationCount)
            throws AnalyticsException {
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
        AnalyticsDataResponse resp = ServiceHolder.getAnalyticsDataService()
                .get(tenantID, tableName, 1, null, ids);
        List<Record> records = AnalyticsDataServiceUtils.listRecords(ServiceHolder.getAnalyticsDataService(), resp);

        return NotebookUtils.getTableDataFromRecords(records);
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

        return NotebookUtils.getTableDataFromRecords(records);
    }
}
