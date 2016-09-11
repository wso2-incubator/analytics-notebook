package org.wso2.carbon.notebook.commons.request.dto;

import java.io.Serializable;

public class Feature implements Serializable {
    private String name;
    private int index;
    private String type;
    private String imputeOption;
    private boolean include;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getImputeOption() {
        return imputeOption;
    }

    public void setImputeOption(String imputeOption) {
        this.imputeOption = imputeOption;
    }

    public boolean isInclude() {
        return include;
    }

    public void setInclude(boolean include) {
        this.include = include;
    }


}
