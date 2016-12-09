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

package org.wso2.carbon.notebook.commons.constants;

/**
 * Constants used by machine learning related tasks
 */
public class MLConstants {
    // Feature settings
    public static final String DISCARD = "DISCARD";
    public static final String MEAN_IMPUTATION = "REPLACE_WITH_MEAN";

    // Constants
    public static final int SAMPLE_SIZE = 10000;
    public static final double CATEGORICAL_THRESHOLD = 0.01;

    private MLConstants() {

    }

    public enum MISSING_VALUES {
        EMPTY(""), NA("NA"), QUESTION("?"), NULL("null");

        private final String value;

        MISSING_VALUES(final String str) {
            this.value = str;
        }

        public static boolean contains(String s) {
            for (MISSING_VALUES val : values()) {
                if (val.toString().equals(s)) {
                    return true;
                }
            }
            return false;
        }

        @Override
        public String toString() {
            return value;
        }
    }
}
