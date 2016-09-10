package org.wso2.carbon.notebook.api.endpoint.util;

import java.util.Objects;

public class MLDataHolderKey {
    private final String tableName;
    private final int tenantID;

    public MLDataHolderKey(String tableName, int tenantID) {
        this.tableName = tableName;
        this.tenantID = tenantID;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof MLDataHolderKey)) {
            return false;
        }
        MLDataHolderKey MLDataHolderKey = (MLDataHolderKey) o;
        return tenantID == MLDataHolderKey.tenantID && Objects.equals(tableName, MLDataHolderKey.tableName);
    }

    @Override
    public int hashCode() {
        return tenantID + tableName.hashCode();
    }
}