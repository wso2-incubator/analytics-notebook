/**
 * Utility prototype constructor for sign in page
 *
 * @constructor
 */
function Authenticator() {
    var self = this;
    var utils = new Utils();
    var errorContainer = $("#error-container");

    /**
     * Initialize the sign in page
     */
    self.initialize = function () {
        $("#sign-in").click(function () {
            singIn();
        });

        $(".form-control").keyup(function (event) {
            if (event.keyCode == 13 && $("#username").val().length > 0 && $("#password").val().length > 0) {
                singIn();
            }
        });

        $("#username").focus();
        utils.hideLoadingOverlay(errorContainer);
    };

    /**
     * Sign in using the credentials provided by the user
     *
     * @private
     */
    function singIn() {
        var credentials = {
            username: $("#username").val(),
            password: $("#password").val()
        };
        if (credentials.username.length > 0 && credentials.password.length > 0) {
            utils.showLoadingOverlay(errorContainer);
            $.ajax({
                type: "POST",
                url: constants.API_URI + "auth/sign-in",
                data: JSON.stringify(credentials),
                success: function (response) {
                    if (response.status == constants.response.SUCCESS ||
                        response.status == constants.response.ALREADY_LOGGED_IN) {
                        var redirectURI = new Utils().getQueryParameters().from;
                        if (redirectURI == undefined) {
                            redirectURI = "index.html";
                        }
                        window.location.href = redirectURI;
                    } else {
                        showError(response.message);
                    }
                    utils.hideLoadingOverlay(errorContainer);
                },
                error : function(response) {
                    showError(response.responseText);
                    utils.hideLoadingOverlay(errorContainer);
                }
            });
        }
    }

    /**
     * Show error in the sign in page
     *
     * @private
     */
    function showError(message) {
        $("#error-container").html(utils.generateAlert("error", "Login Error", message));
    }
}
