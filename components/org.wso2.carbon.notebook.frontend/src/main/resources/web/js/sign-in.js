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
            url : "auth/sign-in",
            data : credentials,
            success: function(data) {
                console.log(data);
                if (data.status == constants.response.SUCCESS) {
                    window.location.href = "./";
                } else {
                    setError("Error !", "Invalid Credentials");
                }
            }
        });
    }
};
