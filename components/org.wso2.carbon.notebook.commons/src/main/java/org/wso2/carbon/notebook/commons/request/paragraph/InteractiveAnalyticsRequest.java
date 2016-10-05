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

package org.wso2.carbon.notebook.commons.request.paragraph;

import java.util.List;
import java.util.Map;

/**
 * Store the attributes of a interactive analytics query request
 */
public class InteractiveAnalyticsRequest {
    private int draw;
    private String tableName;
    private String query;
    private int paginationFrom;
    private int paginationCount;
    private long timeFrom;
    private long timeTo;
    private List<Map<String, Object>> primaryKeys;

    public int getDraw() {
        return draw;
    }

    public void setDraw(int draw) {
        this.draw = draw;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public int getPaginationFrom() {
        return paginationFrom;
    }

    public void setPaginationFrom(int paginationFrom) {
        this.paginationFrom = paginationFrom;
    }

    public int getPaginationCount() {
        return paginationCount;
    }

    public void setPaginationCount(int paginationCount) {
        this.paginationCount = paginationCount;
    }

    public long getTimeFrom() {
        return timeFrom;
    }

    public void setTimeFrom(long timeFrom) {
        this.timeFrom = timeFrom;
    }

    public long getTimeTo() {
        return timeTo;
    }

    public void setTimeTo(long timeTo) {
        this.timeTo = timeTo;
    }

    public List<Map<String, Object>> getPrimaryKeys() {
        return primaryKeys;
    }

    public void setPrimaryKeys(List<Map<String, Object>> primaryKeys) {
        this.primaryKeys = primaryKeys;
    }
}
