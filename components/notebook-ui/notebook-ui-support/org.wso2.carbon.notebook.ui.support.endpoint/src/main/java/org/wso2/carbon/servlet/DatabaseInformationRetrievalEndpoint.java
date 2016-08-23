package org.wso2.carbon.servlet;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/*
 * Getting HTTP Response for Database Information
 */
@Path("/database")
public class DatabaseInformationRetrievalEndpoint {
    public DatabaseInformationRetrievalEndpoint() {

    }

    /**
     * Retrieve names of the databases available in the system
     *
     * @return respnse
     */
    @GET
    public Response retrieveDatabaseNames() {
        String jsonString = "Test - Database Names";
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).header("Access-Control-Allow-Origin",
                "*").build();
    }

    /**
     * Retrieve the tables available in the database specified
     *
     * @param databaseName - name of the database from which the tables will be considered
     * @return respnse
     */
    @GET
    @Path("/{databaseName}")
    public Response retrieveDatabaseTables(@PathParam("databaseName") String databaseName) {
        String jsonString = "Test - Table Names of " + databaseName;
        return Response.ok(jsonString, MediaType.APPLICATION_JSON).header("Access-Control-Allow-Origin",
                "*").build();
    }
}
