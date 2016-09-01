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

util.output.generateTable = function(callback, headerArray, dataRowArray) {
    var table = $("<table class='table table-striped table-hover table-bordered display data-table' cellspacing='0'>");
    callback(table);

    var columnArray = [];
    for (var i = 0; i < headerArray.length; i++) {
        columnArray.push({ title : headerArray[i] });
    }

    table.DataTable({
        responsive: true,
        data : dataRowArray,
        columns : columnArray
    });
};

util.output.generateLazyLoadedTable = function(callback, httpMethod, url) {
    var table = $("<table class='table table-striped table-hover table-bordered display data-table' cellspacing='0'>");
    callback(table);

    table.DataTable({
        responsive: true,
        serverSide : true,
        ajax : { type : httpMethod, url : url }
    });
};

// General Initializations
$(document).ready(function() {
    document.title = constants.PRODUCT_NAME;
    $(".username").html("John Doe");
});