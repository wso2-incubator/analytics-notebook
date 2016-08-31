var signInUtil = {};

signInUtil.singIn = function() {
    var credentials = {
        username : $("#username").val(),
        password : $("#password").val()
    };
    var setError = function(title, message) {
        $("#error-msg").html();
    };
    if (credentials.username.length > 0 && credentials.password.length > 0) {
        $.ajax({
            type: "POST",
            url : constants.API_URI + "auth/sign-in",
            data : JSON.stringify(credentials),
            success : function(data) {
                if (data.status == constants.response.SUCCESS) {
                    window.location.href = "index.html";
                } else if (data.status == constants.response.LOGIN_ERROR) {
                    setError("Login Error !", "Invalid Credentials");
                }
            }
        });
    }
};
