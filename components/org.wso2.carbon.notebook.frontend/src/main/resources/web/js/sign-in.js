var signInUtil = {};

signInUtil.singIn = function() {
    var credentials = {
        username : $("#username").val(),
        password : $("#password").val()
    };
    var setError = function(title, message) {
        $("#error-msg").html("<div id='login-error' class='alert alert-danger' role='alert'>" +
            "<i class='icon fw fw-error'></i>" +
            "<strong>" + title + "</strong> " + message +
            "<button type='button' class='close' aria-label='close' data-dismiss='alert'>" +
            "<span aria-hidden='true'><i class='fw fw-cancel'></i></span>" +
            "</button>" +
            "</div>");
    };
    if (credentials.username.length > 0 && credentials.password.length > 0) {
        $.ajax({
            type: "POST",
            url : constants.API_URI + "auth/sign-in",
            data : JSON.stringify(credentials),
            success : function(data) {
                if (data.status == constants.response.SUCCESS) {
                    var redirectURI = util.getQueryParameters().from;
                    if (redirectURI == undefined) {
                        redirectURI = "index.html";
                    }
                    window.location.href = redirectURI;
                } else if (data.status == constants.response.LOGIN_ERROR) {
                    setError("Login Error !", "Invalid Credentials");
                }
            }
        });
    }
};
