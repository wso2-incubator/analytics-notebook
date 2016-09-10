package org.wso2.carbon.notebook.api.endpoint.dto.response;

import org.wso2.carbon.ml.commons.domain.SamplePoints;

import java.util.List;

public class DataExploreResponse {
    private SamplePoints samplePoints;
    private List<String> categoricalFeatureNames;
    private List<String> numericalFeatureNames;

    public SamplePoints getSamplePoints() {
        return samplePoints;
    }

    public void setSamplePoints(SamplePoints samplePoints) {
        this.samplePoints = samplePoints;
    }

    public List<String> getCategoricalFeatureNames() {
        return categoricalFeatureNames;
    }

    public void setCategoricalFeatureNames(List<String> categoricalFeatureNames) {
        this.categoricalFeatureNames = categoricalFeatureNames;
    }

    public List<String> getNumericalFeatureNames() {
        return numericalFeatureNames;
    }

    public void setNumericalFeatureNames(List<String> numericalFeatureNames) {
        this.numericalFeatureNames = numericalFeatureNames;
    }
}
