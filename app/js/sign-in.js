/**
 * Utility prototype for sign in page
 *
 * @constructor
 */
function Authenticator() {
    var self = this;
    var utils = new Utils();
    var pageContentWrapper = $(".page-content-wrapper");

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
        utils.hideLoadingOverlay(pageContentWrapper);
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
            utils.showLoadingOverlay(pageContentWrapper);
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
                    utils.hideLoadingOverlay(pageContentWrapper);
                },
                error : function(response) {
                    showError(response.responseText);
                    utils.hideLoadingOverlay(pageContentWrapper);
                }
            });
        }
    }

    function showError(message) {
        $("#error-container").html(utils.generateAlert("error", "Login Error", message));
    }
}
