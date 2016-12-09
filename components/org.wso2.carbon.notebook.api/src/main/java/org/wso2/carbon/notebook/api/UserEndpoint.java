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
import org.wso2.carbon.notebook.commons.response.ResponseFactory;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Map;

/**
 * For handling user management
 */
@Path("/user")
public class UserEndpoint {
    /**
     * Get the name of the user currently sending the request
     * This is used for showing the name of the user in the upper left corner of the web app page
     *
     * @param request HTTP servlet request
     * @return HTTP servlet response
     */
    @GET
    @Path("/logged-in")
    public Response getLoggedInUser(@Context HttpServletRequest request) {
        HttpSession session = request.getSession();

        String username = (String) session.getAttribute("username");
        Map<String, Object> response = ResponseFactory.getCustomSuccessResponse();
        response.put("username", username);

        return Response.ok(new Gson().toJson(response), MediaType.APPLICATION_JSON).build();
    }
}
