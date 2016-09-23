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
    API_URI : "api/",
    feature : {
        NUMERICAL : "NUMERICAL",
        CATEGORICAL : "CATEGORICAL"
    }
};

// General Initializations
$(document).ready(function() {
    var utils = new Utils();
    $.ajax({
        type: "GET",
        url: constants.API_URI + "user/logged-in",
        success: function (response) {
            if (response.status == constants.response.SUCCESS) {
                $(".username").html(response.username);
            } else if (response.status != constants.response.NOT_LOGGED_IN) {
                utils.handlePageNotification("error", "Error", utils.generateErrorMessageFromStatusCode(-1));
            }
        },
        error: function (response) {
            utils.handlePageNotification("error", "Error", utils.generateErrorMessageFromStatusCode(response.readyState));
        }
    });
    document.title = constants.PRODUCT_NAME;
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
     * -1 can be used for generating messages for unknown errors
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
        tableOptions.data = addNullToMissingCells(headerArray, dataRowArray);
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
        tableOptions.data = addNullToMissingCells(headerArray, dataRowArray);
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
                            data: addNullToMissingCells(headerArray, returnedData.data)
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
     *
     * @param headerArray {string[]} The array of column names
     * @param data {Object[]} The array of objects with a row represented by an object with column as key and cell value as value
     */
    function addNullToMissingCells(headerArray, data) {
        for(var i = 0; i < data.length; i++) {
            for(var j = 0; j < headerArray.length; j++) {
                if (data[i][headerArray[j]] == undefined) {
                    data[i][headerArray[j]] = null;
                }
            }
        }
        return data;
    }

    /**
     * Generate a table with the options provided
     *
     * @private
     * @param table {jQuery} The table Element in which the table will be generated
     * @param options {Object} The table options to be used by the data tables plugin
     * @param [cellClassNames] {Object} Cell class names with the column name as key and the class as value
     * @returns {jQuery} The div element containing the table
     */
    function generateTable(table, options, cellClassNames) {
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
    };


    /**
     * Handles paragraph error messages in the paragraph
     * The notification is shown in the element with the id "notification-container"
     *
     * @param type {string} The type of notification to be displayed. Should be one of ["success", "info", "warning", "error"]
     * @param title {string} The title of the notification
     * @param message {string} Message to be displayed in the notification area
     */
    self.handlePageNotification = function(type, title, message) {
        var notification = self.generateAlertMessage(type, title, message);
        notification.addClass("collapse");
        $("#notification-container").html(notification);
        notification.slideDown();

        setTimeout(function() {
            notification.slideUp(function() {
                notification.remove();
            });
        }, 5000);
    };

    /**
     * Callback function for chart run
     *
     * @callback ClearNotificationsCallback
     */

    /**
     * Clear the notifications in the paragraph
     *
     * @param [callback] {ClearNotificationsCallback} callback to be called after removing notification
     */
    self.clearPageNotification = function(callback) {
        var notificationsList = $("#notification-container").children();
        var notification = notificationsList.first();
        if (notificationsList.length > 0) {
            notification.slideUp(function() {
                notification.remove();
                if (callback != undefined) {
                    callback();
                }
            });
        } else {
            if (callback != undefined) {
                callback();
            }
        }
    };

    /**
     * Sign out the currently logged in user and redirect to sign in page
     *
     * @param relativeLinkToIndexPage {string} Relative page from the current page to the index page
     */
    self.signOut = function(relativeLinkToIndexPage) {
        $.ajax({
            type : "POST",
            url : constants.API_URI + "auth/sign-out",
            success : function (response) {
                if (response.status == constants.response.SUCCESS ||
                        response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = relativeLinkToIndexPage + "sign-in.html"
                } else {
                    self.handlePageNotification("error", "Error", response.message);
                }
            },
            error : function(response) {
                self.handlePageNotification("error", "Error",
                    self.generateErrorMessageFromStatusCode(response.readyState)
                );
            }
        });
    };

    /**
     * Generate a modal window and show the modal window
     *
     * @param title {string} The header of the modal
     * @param content {jQuery} The content of the modal
     * @param footer {jQuery} The content of the modal
     * @return {jQuery} The modal shown in the screen
     */
    self.showModalPopup = function(title, content, footer) {
        // Creating modal window elements
        var modalWindow = $("<div class='modal fade' tabindex='-1' role='dialog' aria-labelledby='modalDemo'>");
        var modalDialog = $("<div class='modal-dialog' role='document'>");
        var modalContent = $("<div class='modal-content clearfix'>");
        var modalHeader = $("<div class='modal-header'>");
        var modalTitle = $("<h3 class='modal-title'>");
        var modalFooter = $("<div class='modal-footer'>");

        // Appending the modal window elements to make the modal window structure
        modalTitle.html(title);
        modalHeader.html($(
            "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>" +
                "<i class='fw fw-cancel'></i>" +
            "</button>"
        ));
        modalHeader.append(modalTitle);
        modalFooter.html(footer);
        modalContent.html(modalHeader);
        modalContent.append(content);
        modalContent.append(modalFooter);
        modalDialog.html(modalContent);
        modalWindow.html(modalDialog);

        // Showing the modal window
        $("#modal-window-container").html(modalWindow);
        modalWindow.modal();

        return modalWindow;
    };
}
