package org.wso2.carbon.notebook.commons.response.paragraph;

import org.wso2.carbon.ml.commons.domain.SamplePoints;
import org.wso2.carbon.notebook.commons.response.GeneralResponse;
import org.wso2.carbon.notebook.commons.response.Status;

import java.util.List;

/**
 * Store the attributes of a data explore response
 */
public class DataExploreResponse extends GeneralResponse {
    private SamplePoints sample;
    private List<String> categoricalFeatureNames;
    private List<String> numericalFeatureNames;

    public DataExploreResponse(SamplePoints sample, List<String> categoricalFeatureNames,
                               List<String> numericalFeatureNames) {
        super(Status.SUCCESS);
        this.sample = sample;
        this.categoricalFeatureNames = categoricalFeatureNames;
        this.numericalFeatureNames = numericalFeatureNames;
    }

    public SamplePoints getSample() {
        return sample;
    }

    public void setSample(SamplePoints sample) {
        this.sample = sample;
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
