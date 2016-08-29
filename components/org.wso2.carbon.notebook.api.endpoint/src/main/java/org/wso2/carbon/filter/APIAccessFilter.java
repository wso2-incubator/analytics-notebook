package org.wso2.carbon.filter;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

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

        String homePageURI = request.getContextPath() + "/index.html";
        String signInPageURI = request.getContextPath() + "/sign-in.html";
        String signUpPageURI = request.getContextPath() + "/sign-up.html";
        String signInURI = request.getContextPath() + "/sign-in";
        String signUpURI = request.getContextPath() + "/sign-up";

        boolean loggedIn = true;
        // TODO : check if the user had logged in and change loggedIn variable if needed

        boolean signInPageRequest = request.getRequestURI().equals(signInPageURI);
        boolean signUpPageRequest = request.getRequestURI().equals(signUpPageURI);
        boolean signInRequest = request.getRequestURI().equals(signInURI);
        boolean signUpRequest = request.getRequestURI().equals(signUpURI);

        if (loggedIn && (signInPageRequest || signUpPageRequest || signInRequest || signUpRequest)) {
            response.sendRedirect(homePageURI);
        } else if (loggedIn || signInPageRequest || signUpPageRequest || signInRequest || signUpRequest) {
            filterChain.doFilter(request, response);
        } else {
            response.sendRedirect(signInPageURI);
        }
    }

    @Override
    public void destroy() {

    }
}
