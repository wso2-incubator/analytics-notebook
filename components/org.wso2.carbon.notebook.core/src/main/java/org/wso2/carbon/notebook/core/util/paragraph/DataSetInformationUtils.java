package org.wso2.carbon.notebook.core.util.paragraph;

import org.wso2.carbon.analytics.datasource.commons.ColumnDefinition;
import org.wso2.carbon.analytics.datasource.commons.exception.AnalyticsException;
import org.wso2.carbon.notebook.commons.response.dto.Column;
import org.wso2.carbon.notebook.core.ServiceHolder;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;


public class DataSetInformationUtils {

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
}
