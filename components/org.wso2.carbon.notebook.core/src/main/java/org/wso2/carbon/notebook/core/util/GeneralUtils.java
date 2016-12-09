/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

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

