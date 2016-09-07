package org.wso2.carbon.notebook.api.endpoint.dto.response;

public class FeatureResponse {
    private String name;
    private int index;
    private String type;
    private String imputeOption;

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

    private boolean include;
}
