/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

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
