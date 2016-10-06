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

package org.wso2.carbon.notebook.core.util;

import org.apache.log4j.Logger;
import org.wso2.carbon.notebook.commons.constants.NoteConstants;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.exception.NotePersistenceException;
import org.wso2.carbon.registry.core.Collection;
import org.wso2.carbon.registry.core.RegistryConstants;
import org.wso2.carbon.registry.core.Resource;
import org.wso2.carbon.registry.core.exceptions.RegistryException;
import org.wso2.carbon.registry.core.session.UserRegistry;
import org.wso2.carbon.registry.core.utils.RegistryUtils;

/**
 * General utility functions for the notebook
 */
public class NoteUtils {
    private static final Logger log = Logger.getLogger(NoteUtils.class);

    /**
     * Get the list of note names in the server
     *
     * @param tenantID Tenant ID
     * @return The list of note names
     */
    public static String[] getAllNotes(int tenantID) throws RegistryException {
        UserRegistry userRegistry = ServiceHolder.getRegistryService().getConfigSystemRegistry(tenantID);
        createNotesCollectionIfNotExists(userRegistry);
        Collection noteCollection = (Collection) userRegistry.get(NoteConstants.NOTE_LOCATION);
        String[] notes = noteCollection.getChildren();

        if (notes == null) {
            notes = new String[0];
        } else {
            for (int i = 0; i < notes.length; i++) {
                // Removing note registry path
                notes[i] = notes[i].replace(NoteConstants.NOTE_LOCATION, "");
                notes[i] = notes[i].replace(RegistryConstants.PATH_SEPARATOR, "");
                notes[i] = notes[i].replace(NoteConstants.NOTE_FILE_EXTENSION_SEPARATOR + NoteConstants.NOTE_FILE_EXTENSION, "");
            }
        }
        return notes;
    }

    /**
     * Add a new note into the server and add content
     *
     * @param tenantID Tenant ID
     * @param noteName Name of the note to be created
     */
    public static void addNewNote(int tenantID, String noteName, String content) throws NotePersistenceException, RegistryException {
        UserRegistry userRegistry = ServiceHolder.getRegistryService().getConfigSystemRegistry(tenantID);
        createNotesCollectionIfNotExists(userRegistry);
        String noteLocation = getNoteLocation(noteName);
        if (content == null) {
            content = "[]";
        }

        if (!userRegistry.resourceExists(noteLocation)) {
            Resource resource = userRegistry.newResource();
            resource.setContent(content);
            resource.setMediaType(NoteConstants.NOTE_MEDIA_TYPE);
            userRegistry.put(noteLocation, resource);
        } else {
            log.error("Cannot create new note with name " + noteName +
                    " for tenant with tenant ID " + tenantID + " because note already exists");
            throw new NotePersistenceException("Already a note exists with same name : " + noteName +
                    " for tenantId :" + tenantID);
        }
    }

    /**
     * Update the contents of the given note
     *
     * @param tenantID Tenant ID
     * @param noteName Name of the note
     * @param content  New content of the note to be updated
     */
    public static void updateNote(int tenantID, String noteName, String content) throws RegistryException, NotePersistenceException {
        UserRegistry userRegistry = ServiceHolder.getRegistryService().getConfigSystemRegistry(tenantID);
        String noteLocation = getNoteLocation(noteName);

        if (userRegistry.resourceExists(noteLocation)) {
            Resource resource = userRegistry.get(noteLocation);
            resource.setContent(content);
            resource.setMediaType(NoteConstants.NOTE_MEDIA_TYPE);
            userRegistry.put(noteLocation, resource);
        } else {
            log.warn("Cannot update note with name " + noteName + " for tenant with tenant ID " + tenantID +
                    " because it does not exist. Creating new note and adding the content.");
            addNewNote(tenantID, noteName, content);
        }
    }

    /**
     * Get the contents of the note as a JSON string
     *
     * @param tenantID Tenant ID
     * @param noteName Name of the note
     * @return JSON string containing the note content
     */
    public static String getNote(int tenantID, String noteName) throws RegistryException, NotePersistenceException {
        UserRegistry userRegistry = ServiceHolder.getRegistryService().getConfigSystemRegistry(tenantID);
        String noteLocation = getNoteLocation(noteName);

        if (userRegistry.resourceExists(noteLocation)) {
            return RegistryUtils.decodeBytes((byte[]) userRegistry.get(noteLocation).getContent());
        } else {
            log.error("Cannot retrieve note because a note with name " + noteName +
                    " for tenant with tenant ID " + tenantID + " does not exist");
            throw new NotePersistenceException("Cannot get note with name : "
                    + noteName + " for tenantId : " + tenantID + " beacause it does not exist");
        }
    }

    /**
     * Delete a note in the server
     *
     * @param tenantID Tenant ID
     * @param noteName Name of the note to be deleted
     */
    public static void deleteNote(int tenantID, String noteName) throws RegistryException {
        UserRegistry userRegistry = ServiceHolder.getRegistryService().getConfigSystemRegistry(tenantID);
        String noteLocation = getNoteLocation(noteName);

        if (userRegistry.resourceExists(noteLocation)) {
            userRegistry.delete(noteLocation);
        } else {
            log.error("Cannot to delete note note with name " + noteName +
                    " for tenant with tenant ID " + tenantID + " because it does not exist");
        }
    }

    /**
     * Create the note directory if it does not exist
     *
     * @param registry User registry
     */
    private static void createNotesCollectionIfNotExists(UserRegistry registry) throws RegistryException {
        if (!registry.resourceExists(NoteConstants.NOTE_LOCATION)) {
            Collection collection = registry.newCollection();
            registry.put(NoteConstants.NOTE_LOCATION, collection);
        }
    }

    /**
     * Get the location of the note
     * Including the note file name and extension
     *
     * @param noteName Name of the note of which the location returned
     * @return Location of the note
     */
    private static String getNoteLocation(String noteName) {
        return NoteConstants.NOTE_LOCATION + RegistryConstants.PATH_SEPARATOR + noteName +
                NoteConstants.NOTE_FILE_EXTENSION_SEPARATOR + NoteConstants.NOTE_FILE_EXTENSION;
    }
}
