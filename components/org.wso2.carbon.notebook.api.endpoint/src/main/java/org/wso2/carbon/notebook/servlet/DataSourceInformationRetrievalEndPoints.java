package org.wso2.carbon.notebook.servlet;

import com.google.gson.Gson;
import org.wso2.carbon.notebook.serviceaccess.DataService;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

/*
 * HTTP Response for data source information
 */

@Path("/tables")
public class DataSourceInformationRetrievalEndPoints {


    /**
     * List the set of tables available in the system
     *
     * @return response
     */
    @GET()
    public  Response listTableName(){
        List<String> tableNames = DataService.listTableNames();
        String jsonString = new Gson().toJson(tableNames);

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).header("Access-Control-Allow-Origin",
                "*").build();
    }

    /**
     * List the column names of the selected table
     *
     * @return response
     */
    @GET
    @Path("/columns/{tableName}")
    public Response getColumns(@PathParam("tableName") String tableName){
        List<String> columnNames = DataService.listColumnNames(tableName);
        String jsonString = new Gson().toJson(columnNames);

        return Response.ok(jsonString, MediaType.APPLICATION_JSON).header("Access-Control-Allow-Origin",
                "*").build();
    }

}
