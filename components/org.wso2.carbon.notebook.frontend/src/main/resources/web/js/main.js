// General Constants
var constants = {
    PRODUCT_NAME : "Notebook",
    PRODUCT_VERSION : "1.0-SNAPSHOT",
    response : {
        SUCCESS : "SUCCESS",
        LOGIN_ERROR : "LOGIN_ERROR",
        QUERY_ERROR : "QUERY_ERROR"
    },
    API_URI : "api/"
};


// Utility functions
var util = {};

util.getQueryParameters = function() {
    var keyValuePairMap = {};
    var query = window.location.search.substring(1);   // Removing the "?" from query string
    var parameters = query.split('&');
    for (var i = 0; i < parameters.length; i++) {
        var keyValuePair = parameters[i].split('=');
        keyValuePairMap[decodeURIComponent(keyValuePair[0])] = decodeURIComponent(keyValuePair[1]);
    }
    return keyValuePairMap;
};

/*
 * @param type Should be one of ["success", "info", "warning", "error"]
 * @param title Title of the error message
 * @param message Alert message
 */
util.generateAlert = function(type, title, message) {
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

util.output = {};

util.output.generateTable = function(headerArray, dataRowArray) {
    var table = $("<table id='ajax-table' class='table table-striped table-hover table-bordered display data-table' cellspacing='0'>");

    var tableHeaderRow = $("<tr>");
    for (var i = 0; i < headerArray.length; i++) {
        tableHeaderRow.append($("<th>" + headerArray[i] + "</th>"));
    }
    table.append($("<thead>").append(tableHeaderRow));

    var tableBody = $("<tbody>");
    for (var i = 0; i < dataRowArray.length; i++) {
        var dataRow = $("<tr>");
        for(var j = 0; j < dataRowArray[i].length; j++) {
            dataRow.append("<td>" + dataRowArray[i][j] + "<td>");
        }
        tableBody.append(dataRow);
    }

    table.append(tableBody);
    return table;
};

// General Initializations
$(document).ready(function() {
    document.title = constants.PRODUCT_NAME;
    $(".username").html("John Doe");
});