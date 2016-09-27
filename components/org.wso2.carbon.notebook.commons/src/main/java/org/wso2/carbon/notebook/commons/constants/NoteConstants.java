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
