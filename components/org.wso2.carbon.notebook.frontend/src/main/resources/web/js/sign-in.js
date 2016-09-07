/**
 * Utility prototype for sign in page
 *
 * @constructor
 */
function Authenticator() {
    var self = this;

    self.initialize = function () {
        $("#sign-in").click(function() {
            singIn();
        });

        $(".form-control").keyup(function(event) {
            if (event.keyCode == 13 && $("#username").val().length > 0 && $("#password").val().length > 0) {
                singIn();
            }
        });

        $("#username").focus();
    };

    /**
     * Sign in using the credentials provided by the user
     *
     * @private
     */
    var singIn = function() {
        var credentials = {
            username : $("#username").val(),
            password : $("#password").val()
        };
        var setError = function(title, message) {
            $("#error-msg").html(new Utils().generateAlert("error", title, message));
        };
        if (credentials.username.length > 0 && credentials.password.length > 0) {
            $.ajax({
                type: "POST",
                url : constants.API_URI + "auth/sign-in",
                data : JSON.stringify(credentials),
                success : function(data) {
                    if (data.status == constants.response.SUCCESS) {
                        var redirectURI = new Utils().getQueryParameters().from;
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
}
