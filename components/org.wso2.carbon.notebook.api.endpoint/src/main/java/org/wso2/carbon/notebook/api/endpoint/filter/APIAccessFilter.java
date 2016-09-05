package org.wso2.carbon.notebook.api.endpoint.filter;

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
    private FilterConfig filterConfig;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        this.filterConfig = filterConfig;
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
        String signInURI = request.getContextPath() + "/api/auth/sign-in";
        String signUpURI = request.getContextPath() + "/api/auth/sign-up";

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

        if (loggedIn && (signInPageRequest || signUpPageRequest || signInRequest || signUpRequest)) {
            response.sendRedirect(homePageURI);
        } else if (loggedIn || signInPageRequest || signUpPageRequest || signInRequest || signUpRequest) {
            filterChain.doFilter(request, response);
        } else {
            // Generating the ui to redirect to after logging in
            String uri = currentURI.substring(request.getContextPath().length()) + "?" + request.getQueryString();
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
