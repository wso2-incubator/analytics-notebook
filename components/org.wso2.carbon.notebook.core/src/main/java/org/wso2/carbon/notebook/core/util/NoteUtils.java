package org.wso2.carbon.notebook.core.util;

import org.wso2.carbon.notebook.commons.constants.NoteConstants;
import org.wso2.carbon.notebook.core.ServiceHolder;
import org.wso2.carbon.notebook.core.exception.NotebookPersistenceException;
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

    public static void addNewNote(int tenantID, String noteName) throws NotebookPersistenceException, RegistryException {
        UserRegistry userRegistry = ServiceHolder.getRegistryService().getConfigSystemRegistry(tenantID);
        createNotesCollectionIfNotExists(userRegistry);
        String noteLocation = getScriptLocation(noteName);

        if (!userRegistry.resourceExists(noteLocation)) {
            Resource resource = userRegistry.newResource();
            resource.setContent("[]");
            resource.setMediaType(NoteConstants.NOTE_MEDIA_TYPE);
            userRegistry.put(noteLocation, resource);
        } else {
            throw new NotebookPersistenceException("Already a note exists with same name : " + noteName
                    + " for tenantId :" + tenantID);
        }
    }

    public static void updateNote(int tenantID, String noteName, String content) throws RegistryException, NotebookPersistenceException {
        UserRegistry userRegistry = ServiceHolder.getRegistryService().getConfigSystemRegistry(tenantID);
        String noteLocation = getScriptLocation(noteName);

        if (userRegistry.resourceExists(noteLocation)) {
            Resource resource = userRegistry.get(noteLocation);
            resource.setContent(content);
            resource.setMediaType(NoteConstants.NOTE_MEDIA_TYPE);
            userRegistry.put(noteLocation, resource);
        } else {
            addNewNote(tenantID, noteName);
        }
    }

    public static String getNote(int tenantID, String noteName) throws RegistryException, NotebookPersistenceException {
        UserRegistry userRegistry = ServiceHolder.getRegistryService().getConfigSystemRegistry(tenantID);
        String noteLocation = getScriptLocation(noteName);

        if (userRegistry.resourceExists(noteLocation)) {
            return RegistryUtils.decodeBytes((byte[]) userRegistry.get(noteLocation).getContent());
        } else {
            throw new NotebookPersistenceException("No note exists with name : "
                    + noteName + " for tenantId : " + tenantID);
        }
    }

    public static void deleteNote(int tenantID, String noteName) throws RegistryException {
        UserRegistry userRegistry = ServiceHolder.getRegistryService().getConfigSystemRegistry(tenantID);
        String noteLocation = getScriptLocation(noteName);

        if (userRegistry.resourceExists(noteLocation)) {
            userRegistry.delete(noteLocation);
        }
    }

    private static void createNotesCollectionIfNotExists(UserRegistry registry) throws RegistryException {
        if (!registry.resourceExists(NoteConstants.NOTE_LOCATION)) {
            Collection collection = registry.newCollection();
            registry.put(NoteConstants.NOTE_LOCATION, collection);
        }
    }

    private static String getScriptLocation(String noteName) {
        return NoteConstants.NOTE_LOCATION + RegistryConstants.PATH_SEPARATOR + noteName +
                NoteConstants.NOTE_FILE_EXTENSION_SEPARATOR + NoteConstants.NOTE_FILE_EXTENSION;
    }
}
