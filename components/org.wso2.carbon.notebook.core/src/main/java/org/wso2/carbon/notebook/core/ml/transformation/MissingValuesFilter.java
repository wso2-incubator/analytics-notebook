//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by Fernflower decompiler)
//

package org.wso2.carbon.notebook.core.ml.transformation;

import org.apache.spark.api.java.function.Function;
import org.wso2.carbon.ml.commons.constants.MLConstants.MISSING_VALUES;
import org.wso2.carbon.ml.core.exceptions.MLModelBuilderException;

public class MissingValuesFilter implements Function<String[], Boolean> {
    private static final long serialVersionUID = -4767804423665643237L;

    private MissingValuesFilter() {
    }

    public Boolean call(String[] tokens) throws Exception {
        try {
            Boolean e = Boolean.valueOf(true);
            String[] var3 = tokens;
            int var4 = tokens.length;

            for(int var5 = 0; var5 < var4; ++var5) {
                String token = var3[var5];
                if(MISSING_VALUES.contains(token)) {
                    e = Boolean.valueOf(false);
                    break;
                }
            }

            return e;
        } catch (Exception var7) {
            throw new MLModelBuilderException("An error occurred while removing missing value rows: " + var7.getMessage(), var7);
        }
    }

    public static class Builder {
        public Builder() {
        }

        public MissingValuesFilter build() {
            return new MissingValuesFilter();
        }
    }
}
