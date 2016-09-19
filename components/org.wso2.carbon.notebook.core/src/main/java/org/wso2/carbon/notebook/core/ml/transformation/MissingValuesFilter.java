//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by Fernflower decompiler)
//

package org.wso2.carbon.notebook.core.ml.transformation;

import org.apache.spark.api.java.function.Function;
import org.wso2.carbon.ml.core.exceptions.MLModelBuilderException;
import org.wso2.carbon.notebook.commons.constants.MLConstants;

/**
 * A filter to remove rows containing missing values
 */
public class MissingValuesFilter implements Function<String[], Boolean> {

    private static final long serialVersionUID = -4767804423665643237L;

    private MissingValuesFilter() {
    }

    @Override
    public Boolean call(String[] tokens) throws Exception {
        try {
            Boolean keep = true;
            for (String token : tokens) {
                if (MLConstants.MISSING_VALUES.contains(token)) {
                    keep = false;
                    break;
                }
            }
            return keep;
        } catch (Exception e) {
            throw new MLModelBuilderException("An error occurred while removing missing value rows: " + e.getMessage(),
                    e);
        }
    }

    public static class Builder {
        public MissingValuesFilter build() {
            return new MissingValuesFilter();
        }
    }
}
