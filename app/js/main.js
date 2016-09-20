// General Constants
var constants = {
    PRODUCT_NAME : "Notebook",
    PRODUCT_VERSION : "1.0-SNAPSHOT",
    response : {
        SUCCESS : "SUCCESS",
        ERROR : "ERROR",
        INVALID_QUERY : "INVALID_QUERY",
        NOT_LOGGED_IN : "NOT_LOGGED_IN",
        ALREADY_LOGGED_IN : "ALREADY_LOGGED_IN"
    },
    API_URI : "api/"
};

// General Initializations
$(document).ready(function() {
    document.title = constants.PRODUCT_NAME;
    $(".username").html("John Doe");
});


/**
 * General utilities prototype constructor
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
     * @param message {string} The Alert message
     * @return {jQuery} The element containing the alert
     */
    self.generateAlertMessage = function(type, title, message) {
        return $(
            "<div id='login-" + type + "' class='alert alert-" + getClassByType(type) + "' role='alert'>" +
                "<i class='icon fw fw-" + type + "'></i>" +
                "<strong>" + title + "</strong> " + message +
                "<button type='button' class='close' aria-label='close' data-dismiss='alert'>" +
                    "<span aria-hidden='true'><i class='fw fw-cancel'></i></span>" +
                "</button>" +
            "</div>"
        );
    };

    /**
     * Returns the class name for alert/status type
     * Support function for generateAlertMessage() and generateStatusMessage() functions
     *
     * @param type {string} Should be one of ["success", "info", "warning", "error"]
     * @return {string} The relevant class name for the type. Will be one of  ["success", "info", "warning", "danger"]
     */
    var getClassByType = function(type) {
        var className;
        if(type == "error") {
            className = "danger";
        } else {
            className = type;
        }
        return className;
    };

    /**
     * Generated an error message for the http status code
     *
     * @param statusCode {int} http status code
     * @return {string} error message for the status code
     */
    self.generateErrorMessageFromStatusCode = function(statusCode) {
        var message;
        if(statusCode == 0) {
            message = "Server refused connection";
        } else {
            message = "Unknown error";
        }
        return message;
    };

    /**
     * Generates a data table with client side pagination, ordering and searching
     *
     * @param headerArray {string[]} The array of column names
     * @param dataRowArray {string[][]} The 2D array of data
     * @param [tableOptions] {Object} The table options object for the data tables plugin
     * @param [cellClassNames] {Object} Cell class names with the column name as key and the class as value
     * @return {jQuery} The table element
     */
    self.generateDataTable = function(headerArray, dataRowArray, tableOptions, cellClassNames) {
        if(tableOptions == undefined) {
            tableOptions = {};
        }
        tableOptions.columns = headerArray;
        tableOptions.data = dataRowArray;
        return generateTable(
            $("<table class='table table-striped table-hover table-bordered display data-table' cellspacing='0'>"),
            tableOptions, cellClassNames
        );
    };

    /**
     * Generates a list table with client side pagination, ordering and searching
     *
     * @param headerArray {string[]} The array of column names
     * @param dataRowArray {string[][]} The 2D array of data
     * @param [tableOptions] {Object} The table options object for the data tables plugin
     * @param [cellClassNames] {Object} Cell class names with the column name as key and the class as value
     * @return {jQuery} The table element
     */
    self.generateListTable = function(headerArray, dataRowArray, tableOptions, cellClassNames) {
        if(tableOptions == undefined) {
            tableOptions = {};
        }
        tableOptions.columns = headerArray;
        tableOptions.data = dataRowArray;
        return generateTable(
            $("<table class='table table-striped table-hover display' cellspacing='0'>"),
            tableOptions, cellClassNames
        );
    };

    /**
     * Generates a data table with server side pagination. Ordering and searching disabled
     *
     * @param httpMethod {string} The http verb that should be used in the request sent for each draw
     * @param url {string} The uri that should be used in the request sent for each draw
     * @param queryParameters {Object} The custom parameters that should be added in the request sent for each draw
     * @param headerArray {string[]} The column names array of the tables
     * @param [tableOptions] {Object} The table options object for the data tables plugin
     * @param [cellClassNames] {Object} Cell class names with the column name as key and the class as value
     * @param [maxResultCount] int Upper limit for the result count
     * @return {jQuery} The table element
     */
    self.generateDataTableWithLazyLoading = function(httpMethod, url, queryParameters, headerArray, maxResultCount, tableOptions, cellClassNames) {
        if(tableOptions == undefined) {
            tableOptions = {};
        }
        tableOptions.searching = false;
        tableOptions.ordering = false;
        tableOptions.serverSide = true;
        tableOptions.columns = headerArray;
        tableOptions.ajax = function(data, callback) {
            queryParameters.draw = data.draw;
            queryParameters.paginationFrom = data.start;
            queryParameters.paginationCount = data.length;
            self.showLoadingOverlay(table);
            $.ajax({
                type: httpMethod,
                url: url,
                data: JSON.stringify(queryParameters),
                success: function (returnedData) {
                    var options;
                    if (returnedData.status == constants.response.SUCCESS) {
                        options = {
                            draw: returnedData.draw,
                            recordsTotal: returnedData.recordsCount,
                            recordsFiltered: returnedData.recordsCount,
                            data: returnedData.data
                        };
                    } else {
                        options = {
                            draw: data.draw,
                            recordsTotal: 0,
                            recordsFiltered: 0,
                            data: [],
                            error: returnedData.message
                        };
                    }
                    if (maxResultCount != undefined) {
                        if (options.recordsTotal < 1) {
                            options.recordsTotal = maxResultCount;
                        }
                        if (options.recordsFiltered < 1) {
                            options.recordsFiltered = maxResultCount;
                        }
                    }
                    callback(options);
                    self.hideLoadingOverlay(table);
                },
                error : function() {
                    self.hideLoadingOverlay(table);
                }
            });
        };

        var table = $("<table class='table table-striped table-hover table-bordered display data-table' cellspacing='0'>");
        return generateTable(table, tableOptions, cellClassNames);
    };

    /**
     * Generate a table with the options provided
     *
     * @private
     * @param table {jQuery} The table Element in which the table will be generated
     * @param options {Object} The table options to be used by the data tables plugin
     * @param [cellClassNames] {Object} Cell class names with the column name as key and the class as value
     * @returns {jQuery} The div element containing the table
     */
    var generateTable = function (table, options, cellClassNames) {
        var tableContainer = $("<div>");
        tableContainer.append(table);

        options.responsive = true;

        // Creating the column object array
        var columnArray = [];
        for (var i = 0; i < options.columns.length; i++) {
            var columnData = {title: options.columns[i]};
            if(options.serverSide) {
                columnData.data = options.columns[i];
            }
            if(cellClassNames != undefined && cellClassNames[options.columns[i]] != undefined) {
                columnData.className = cellClassNames[options.columns[i]];
            }
            columnArray.push(columnData);
        }
        options.columns = columnArray;

        table.DataTable(options);
        return tableContainer;
    };

    /**
     * Shows the loading overlay over the element specified
     *
     * @param element {jQuery} The element which is enclosed inside the loading overlay
     */
    self.showLoadingOverlay = function(element) {
        $(element).closest(".loading-overlay").loading("show");
    };

    /**
     * Hides the loading overlay over the element specified
     *
     * @param element {jQuery} The element which is enclosed inside the loading overlay
     */
    self.hideLoadingOverlay = function(element) {
        $(element).closest(".loading-overlay").loading("hide");
    }
}
