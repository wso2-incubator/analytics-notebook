package org.wso2.carbon.notebook.core.ml.transformation;

import org.apache.spark.api.java.function.Function;

/**
 * Spark filter to remove header row
 */
public class HeaderFilter implements Function<String, Boolean> {
    private final String header;

    private HeaderFilter(Builder builder) {
        this.header = builder.header;
    }

    @Override
    public Boolean call(String line) {
        Boolean isRow = true;
        if (line.equals(this.header)) {
            isRow = false;
        }
        return isRow;
    }

    public static class Builder {
        private String header;

        public Builder init(String header) {
            this.header = header;
            return this;
        }

        public HeaderFilter build() {
            return new HeaderFilter(this);
        }
    }
}
