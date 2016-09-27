package org.wso2.carbon.notebook.core.util;

import org.wso2.carbon.analytics.datasource.commons.ColumnDefinition;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.notebook.core.ServiceHolder;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * General utilities for the Notebook
 */
public class GeneralUtils implements Serializable {
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

