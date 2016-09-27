package org.wso2.carbon.notebook.core.ml.transformation;

import org.apache.spark.api.java.function.Function;
import org.wso2.carbon.notebook.core.util.MLUtils;

import java.util.regex.Pattern;

/**
 * Spark transformation to transform each line (line-by-line) into an array of String tokens
 */
public class LineToTokens implements Function<String, String[]> {
    private final Pattern tokenSeparator;

    public LineToTokens(Builder builder) {
        this.tokenSeparator = builder.tokenSeparator;
    }

    @Override
    public String[] call(String line) {
        return tokenSeparator.split(line);
    }

    public static class Builder {
        private Pattern tokenSeparator;

        public Builder init(String separator) {
            this.tokenSeparator = MLUtils.getPatternFromDelimiter(separator);
            return this;
        }

        public Builder separator(Pattern separator) {
            this.tokenSeparator = separator;
            return this;
        }

        public LineToTokens build() {
            return new LineToTokens(this);
        }
    }
}
