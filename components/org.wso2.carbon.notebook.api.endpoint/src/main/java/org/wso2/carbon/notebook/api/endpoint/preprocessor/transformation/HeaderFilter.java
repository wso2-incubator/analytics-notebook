package org.wso2.carbon.notebook.api.endpoint.preprocessor.transformation;

import org.apache.spark.api.java.function.Function;

/**
 * A filter to remove header row
 */
public class HeaderFilter implements Function<String, Boolean> {

    private static final long serialVersionUID = -6996897057400853414L;
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

//        public Builder header(String header) {
//            this.header = header;
//            return this;
//        }

        public HeaderFilter build() {
            return new HeaderFilter(this);
        }
    }
}
