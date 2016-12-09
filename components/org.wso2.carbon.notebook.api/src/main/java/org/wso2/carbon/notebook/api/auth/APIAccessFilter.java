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

package org.wso2.carbon.notebook.api.auth;

import com.google.gson.Gson;
import org.wso2.carbon.notebook.commons.response.ErrorResponse;
import org.wso2.carbon.notebook.commons.response.Status;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.net.URLEncoder;

/**
 * Used for filtering requests sent to the api without logging in
 */
public class APIAccessFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse,
                         FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String currentURI = request.getRequestURI();
        String homePageURI = request.getContextPath() + "/index.html";
        String signInPageURI = request.getContextPath() + "/sign-in.html";
        String signUpPageURI = request.getContextPath() + "/sign-up.html";
        String apiRequestURIPrefix = request.getContextPath() + "/api";
        String signInURI = apiRequestURIPrefix + "/auth/sign-in";
        String signUpURI = apiRequestURIPrefix + "/auth/sign-up";

        boolean loggedIn = false;
        HttpSession session = request.getSession();
        if (session != null &&
                session.getAttribute("username") != null &&
                session.getAttribute("tenantDomain") != null &&
                session.getAttribute("tenantID") != null) {
            loggedIn = true;
        }

        boolean signInPageRequest = currentURI.equals(signInPageURI);
        boolean signUpPageRequest = currentURI.equals(signUpPageURI);
        boolean signInRequest = currentURI.equals(signInURI);
        boolean signUpRequest = currentURI.equals(signUpURI);
        boolean apiRequest = currentURI.substring(0, 13).equals(apiRequestURIPrefix);

        // Checking the users request and filtering
        if (loggedIn && (signInPageRequest || signUpPageRequest)) {
            response.sendRedirect(homePageURI);
        } else if (loggedIn && (signInRequest || signUpRequest)) {
            response.setHeader("Content-Type", "application/json");
            response.getWriter().print(new Gson().toJson(
                    new ErrorResponse(Status.ALREADY_LOGGED_IN, "You have already logged in")
            ));
        } else if (loggedIn || signInPageRequest || signUpPageRequest || signInRequest || signUpRequest) {
            filterChain.doFilter(request, response);
        } else if (apiRequest) {
            response.setHeader("Content-Type", "application/json");
            response.getWriter().print(new Gson().toJson(
                    new ErrorResponse(Status.NOT_LOGGED_IN, "Please login first")
            ));
        } else {
            // Generating the URI to redirect to after logging in
            String uri = currentURI.substring(request.getContextPath().length()) +
                    (request.getQueryString() == null ? "" : "?" + request.getQueryString());
            if (uri.charAt(0) == '/') {
                uri = uri.substring(1);
            }

            response.sendRedirect(signInPageURI + "?from=" + URLEncoder.encode(uri, "UTF-8"));
        }
    }

    @Override
    public void destroy() {

    }
}
