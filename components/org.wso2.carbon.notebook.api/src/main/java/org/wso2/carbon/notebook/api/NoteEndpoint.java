package org.wso2.carbon.notebook.api;

import com.google.gson.Gson;
import org.wso2.carbon.notebook.commons.response.*;
import org.wso2.carbon.notebook.core.exception.NotebookPersistenceException;
import org.wso2.carbon.notebook.core.util.NoteUtils;
import org.wso2.carbon.registry.core.exceptions.RegistryException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * HTTP Responses for general notebook requests
 */
@Path("/notes")
public class NoteEndpoint {
    /**
     * Return the list of notes available in the notebook
     *
     * @return response
     */
    @GET
    public Response getAllNotes(@Context HttpServletRequest request) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        List<String> noteNamesList = new ArrayList<>();
        noteNamesList.add("Note_1");
        noteNamesList.add("Note_2");
        noteNamesList.add("Note_3");

        Map<String, Object> response = ResponseFactory.getCustomSuccessResponse();
        response.put("notes", noteNamesList);
        jsonString = new Gson().toJson(response);

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * Save the note content
     *
     * @return response
     */
    @POST
    @Path("/{note-name}")
    public Response addNoteContent(@Context HttpServletRequest request, @PathParam("note-name") String noteName) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        try {
            NoteUtils.addNewNote(tenantID, noteName);
            jsonString = new Gson().toJson(new GeneralResponse(Status.SUCCESS));
        } catch (NotebookPersistenceException e) {
            jsonString = new Gson().toJson(new ErrorResponse(Status.AlREADY_EXISTS, "Note Already Exists"));
        } catch (RegistryException e) {
            return Response.serverError().entity(e.getMessage()).build();
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * Save the note content
     *
     * @return response
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
        } catch (RegistryException | NotebookPersistenceException e) {
            return Response.serverError().entity(e.getMessage()).build();
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    /**
     * Return the content of the note specified
     *
     * @return response
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
        } catch (RegistryException | NotebookPersistenceException e) {
            return Response.serverError().entity(e.getMessage()).build();
        }

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }

    @DELETE
    @Path("/{note-name}")
    public Response deleteNoteContent(@Context HttpServletRequest request, @PathParam("note-name") String noteName) {
        HttpSession session = request.getSession();
        int tenantID = (Integer) session.getAttribute("tenantID");
        String jsonString;

        // TODO : implement the deleting of the note

        jsonString = new Gson().toJson(new GeneralResponse("NOT_IMPLEMENTED DELETE"));
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).build();
    }
}
