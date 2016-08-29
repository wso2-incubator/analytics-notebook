package org.wso2.carbon.notebook.serviceaccess;

import org.wso2.carbon.analytics.dataservice.core.AnalyticsDataService;
import org.wso2.carbon.analytics.datasource.commons.ColumnDefinition;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.base.MultitenantConstants;
import org.wso2.carbon.context.PrivilegedCarbonContext;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Perform OSGi services to retrieve data set information
 */
public class DataService {
    private static AnalyticsDataService analyticsDataService;

    static {
        analyticsDataService = (AnalyticsDataService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                .getOSGiService(AnalyticsDataService.class, null);
    }

    public static List<String> listTableNames(){
        List<String> tableNames= new ArrayList<String>();
        try {
            tableNames = analyticsDataService.listTables(MultitenantConstants.SUPER_TENANT_ID);
        } catch (AnalyticsException e) {
            e.printStackTrace();
        }
        return tableNames;
    }

    public static List<String> listColumnNames(String tableName){
        Collection<ColumnDefinition> columns = null;
        List<String> columnNames = new ArrayList<String>();
        try {
            columns = analyticsDataService.getTableSchema(MultitenantConstants.SUPER_TENANT_ID , tableName).getColumns().values();
        } catch (AnalyticsException e) {
            e.printStackTrace();
        }
        if (columns !=null){
            for (ColumnDefinition column : columns) {
                columnNames.add(column.getName());
            }
        }
        return columnNames;
    }

}
