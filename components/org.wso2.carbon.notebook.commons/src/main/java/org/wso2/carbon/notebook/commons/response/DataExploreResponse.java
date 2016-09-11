package org.wso2.carbon.notebook.commons.response;

import org.wso2.carbon.ml.commons.domain.SamplePoints;

import java.util.List;

public class DataExploreResponse extends Response {
    private SamplePoints samplePoints;
    private List<String> categoricalFeatureNames;
    private List<String> numericalFeatureNames;

    public DataExploreResponse(SamplePoints samplePoints, List<String> categoricalFeatureNames, List<String> numericalFeatureNames) {
        super(Status.SUCCESS);
        this.samplePoints = samplePoints;
        this.categoricalFeatureNames = categoricalFeatureNames;
        this.numericalFeatureNames = numericalFeatureNames;
    }

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
