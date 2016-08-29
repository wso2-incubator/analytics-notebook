$(document).ready(function() {
    $("#sign-in").click(function() {
        var credentials = {
            username : $("#username").val(),
            password : $("#password").val(),
            keepSignedIn : $("#keep-signed-in").val()
        };
        if (credentials.username.length > 0 && credentials.password.length > 0) {
            $.ajax({
                type: "POST",
                url : "auth/sign-in",
                data : credentials,
                success: function(data) {
                    console.log(JSON.stringify(data));
                    if (data.status == constants.response.SUCCESS) {
                        window.location.href = "./";
                    }
                }
            });
        }
    });
});