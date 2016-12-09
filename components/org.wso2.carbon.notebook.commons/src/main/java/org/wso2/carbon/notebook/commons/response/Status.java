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

package org.wso2.carbon.notebook.commons.response;

/**
 * Constants used for returning responses for API requests
 */
public class Status {
    public static final String SUCCESS = "SUCCESS";
    public static final String ERROR = "ERROR";
    public static final String INVALID_QUERY = "INVALID_QUERY";
    public static final String NOT_LOGGED_IN = "NOT_LOGGED_IN";
    public static final String ALREADY_LOGGED_IN = "ALREADY_LOGGED_IN";
    public static final String AlREADY_EXISTS = "AlREADY_EXISTS";

    public static final String STATUS = "status";
}
