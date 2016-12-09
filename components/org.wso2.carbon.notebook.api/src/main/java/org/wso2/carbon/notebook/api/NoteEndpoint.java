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

package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.notebook.commons.response.ErrorResponse;
import org.wso2.carbon.notebook.commons.response.GeneralResponse;
import org.wso2.carbon.notebook.commons.response.ResponseFactory;
import org.wso2.carbon.notebook.commons.response.Status;
import org.wso2.carbon.notebook.core.exception.NotePersistenceException;
import org.wso2.carbon.notebook.core.util.NoteUtils;
import org.wso2.carbon.registry.core.exceptions.RegistryException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Map;

/**
 * HTTP Responses for general notebook requests
 */
@Path("/notes")
public class NoteEndpoint {
    /**
     * Return the list of notes available in the notebook
     *
     * @param request Http servlet request
     * @return Http servlet response
     */
    @GET
    public Response getAllNoteNames(@Context HttpServletRequest request) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            Map<String, Object> response = ResponseFactory.getCustomSuccessResponse();
            response.put("notes", NoteUtils.getAllNotes(tenantID));
            jsonString = new Gson().toJson(response);
        } catch (RegistryException e) {
            jsonString = new Gson().toJson(new ErrorResponse("Internal Server Error"));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * Add new note
     *
     * @param request  Http servlet request
     * @param noteName Name of the note to be created
     * @return Http servlet response
     */
    @POST
    @Path("/{note-name}")
    public Response addNewNote(@Context HttpServletRequest request, @PathParam("note-name") String noteName) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            NoteUtils.addNewNote(tenantID, noteName, null);
            jsonString = new Gson().toJson(new GeneralResponse(Status.SUCCESS));
        } catch (NotePersistenceException e) {
            jsonString = new Gson().toJson(new ErrorResponse(Status.AlREADY_EXISTS, "Note Already Exists"));
        } catch (RegistryException e) {
            jsonString = new Gson().toJson(new ErrorResponse("Internal Server Error"));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * Update note content
     *
     * @param request  Http servlet request
     * @param noteName Name of the note of which the content should be updated
     * @param content  New content of the note
     * @return Http servlet response
     */
    @PUT
    @Path("/{note-name}")
    public Response updateNoteContent(@Context HttpServletRequest request, @PathParam("note-name") String noteName, String content) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            NoteUtils.updateNote(tenantID, noteName, content);
            jsonString = new Gson().toJson(new GeneralResponse(Status.SUCCESS));
        } catch (RegistryException | NotePersistenceException e) {
            jsonString = new Gson().toJson(new ErrorResponse("Internal Server Error"));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * Return the content of a note
     *
     * @param request  Http servlet request
     * @param noteName Name of the note of which the content are fetched
     * @return Http servlet response
     */
    @GET
    @Path("/{note-name}")
    public Response getNoteContent(@Context HttpServletRequest request, @PathParam("note-name") String noteName) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            Map<String, Object> response = ResponseFactory.getCustomSuccessResponse();
            response.put("note", NoteUtils.getNote(tenantID, noteName));
            jsonString = new Gson().toJson(response);
        } catch (RegistryException | NotePersistenceException e) {
            jsonString = new Gson().toJson(new ErrorResponse("Internal Server Error"));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * Delete a note
     *
     * @param request  Http servlet request
     * @param noteName Name of the note to be deleted
     * @return Http servlet response
     */
    @DELETE
    @Path("/{note-name}")
    public Response deleteNote(@Context HttpServletRequest request, @PathParam("note-name") String noteName) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            NoteUtils.deleteNote(tenantID, noteName);
            jsonString = new Gson().toJson(new GeneralResponse(Status.SUCCESS));
        } catch (RegistryException e) {
            jsonString = new Gson().toJson(new ErrorResponse("Internal Server Error"));
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
