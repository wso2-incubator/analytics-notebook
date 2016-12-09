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

import org.wso2.carbon.registry.core.RegistryConstants;

/**
 * Constants used by note management related tasks
 */
public class NoteConstants {
    public static final String NOTE_MEDIA_TYPE = "application/json";
    public static final String NOTE_FILE_EXTENSION = "json";
    public static final String NOTE_FILE_EXTENSION_SEPARATOR = ".";
    public static final String NOTE_LOCATION = "repository" + RegistryConstants.PATH_SEPARATOR +
            "components" + RegistryConstants.PATH_SEPARATOR +
            "org.wso2.carbon.notebook.note";
}
