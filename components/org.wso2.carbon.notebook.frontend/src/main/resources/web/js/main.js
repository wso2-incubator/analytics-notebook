var constants = {
    PRODUCT_NAME : "Notebook",
    PRODUCT_VERSION : "1.0-SNAPSHOT",
    response : {
        SUCCESS : "SUCCESS"
    },
    REST_API_URI : "rest",
    AUTH_API_URI : "auth"
};

$(document).ready(function() {
    document.title = constants.PRODUCT_NAME;
    $(".username").html("John Doe");
    $("#note-name").html("Note_1");
    $("#note-path").html("Main/Note_1")
});