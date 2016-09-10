// General Constants
var constants = {
    PRODUCT_NAME : "Notebook",
    PRODUCT_VERSION : "1.0-SNAPSHOT",
    response : {
        SUCCESS : "SUCCESS",
        LOGIN_ERROR : "LOGIN_ERROR",
        ERROR : "ERROR"
    },
    API_URI : "api/"
};

// General Initializations
$(document).ready(function() {
    document.title = constants.PRODUCT_NAME;
    $(".username").html("John Doe");
});


/**
 * General utilities prototype
 *
 * @constructor
 */
function Utils() {
    var self = this;

    /**
     * Parses the query parameters in the current page uri
     *
     * @return {Object} The object with the attribute name and attribute values in the query parameter.
     */
    self.getQueryParameters = function() {
        var keyValuePairMap = {};
        var query = window.location.search.substring(1);   // Removing the "?" from query string
        var parameters = query.split('&');
        for (var i = 0; i < parameters.length; i++) {
            var keyValuePair = parameters[i].split('=');
            keyValuePairMap[decodeURIComponent(keyValuePair[0])] = decodeURIComponent(keyValuePair[1]);
        }
        return keyValuePairMap;
    };

    /**
     * Generates alert element
     *
     * @param type {string} Should be one of ["success", "info", "warning", "error"]
     * @param title {string} Title of the error message
     * @param message {string} Alert message
     * @return {jQuery} The element containing the alert
     */
    self.generateAlert = function(type, title, message) {
        var alertClass;
        switch(type) {
            case "success" :
                alertClass = "success";
                break;
            case "info" :
                alertClass = "info";
                break;
            case "warning" :
                alertClass = "warning";
                break;
            case "danger" :
                alertClass = "danger";
                break;
        }
        return $("<div id='login-" + type + "' class='alert alert-" + alertClass + "' role='alert'>" +
            "<i class='icon fw fw-" + type + "'></i>" +
            "<strong>" + title + "</strong> " + message +
            "<button type='button' class='close' aria-label='close' data-dismiss='alert'>" +
            "<span aria-hidden='true'><i class='fw fw-cancel'></i></span>" +
            "</button>" +
            "</div>"
        );
    };

    /**
     * Generates a table with client side pagination, ordering and searching
     *
     * @param headerArray {string[]} Array of column names
     * @param dataRowArray {string[][]} 2D array of data
     * @return {jQuery} The table element
     */
    self.generateTable = function(headerArray, dataRowArray) {
        var tableContainer = $("<div>");
        var table = $("<table class='table table-striped table-hover table-bordered display data-table' cellspacing='0'>");
        tableContainer.append(table);

        var columnArray = [];
        for (var i = 0; i < headerArray.length; i++) {
            columnArray.push({ title : headerArray[i] });
        }

        table.DataTable({
            responsive: true,
            data : dataRowArray,
            columns : columnArray
        });

        return tableContainer;
    };

    /**
     * Generates a table with server side pagination. Ordering and searching disabled
     *
     * @param httpMethod {string} The http verb that should be used in the request sent for each draw
     * @param url {string} The uri that should be used in the request sent for each draw
     * @param queryParameters {Object} The custom parameters that should be added in the request sent for each draw
     * @param headerArray {string[]} The column names array of the tables
     * @return {jQuery} The table element
     */
    self.generateTableWithLazyLoading = function(httpMethod, url, queryParameters, headerArray) {
        var tableContainer = $("<div>");
        var table = $("<table class='table table-striped table-hover table-bordered display data-table' cellspacing='0'>");
        tableContainer.append(table);

        var columnArray = [];
        for (var i = 0; i < headerArray.length; i++) {
            columnArray.push({ data : headerArray[i], title : headerArray[i] });
        }

        table.DataTable({
            serverSide : true,
            searching : false,
            ordering:  false,
            columns : columnArray,
            ajax : function(data, callback, settings) {
                queryParameters.draw = data.draw;
                queryParameters.paginationFrom = data.start;
                queryParameters.paginationCount = data.length;
                $.ajax({
                    type: httpMethod,
                    url : url,
                    data : JSON.stringify(queryParameters),
                    success : function(returnedData) {
                        callback(returnedData)
                    }
                });
            }
        });

        return tableContainer;
    };
}
