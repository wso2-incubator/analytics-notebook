// General Constants
var constants = {
    PRODUCT_NAME : "Notebook",
    PRODUCT_VERSION : "1.0-SNAPSHOT",
    response : {
        SUCCESS : "SUCCESS"
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


// General Initializations
$(document).ready(function() {
    document.title = constants.PRODUCT_NAME;
    $(".username").html("John Doe");
});