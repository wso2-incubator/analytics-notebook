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
