/**
 * Utility prototype constructor for sign in page
 *
 * @constructor
 */
function Authenticator() {
    var self = this;

    // Private variables
    var utils = new Utils();
    var notificationContainer = $("#notification-container");
    var usernameField = $("#username");
    var passwordField = $("#password");

    /**
     * Initialize the sign in page
     */
    self.initialize = function () {
        // Registering event listeners
        $("#sign-in").click(function () {
            clearError();
            singIn();
        });

        $(".form-control").keyup(function (event) {
            if (event.keyCode == 13) {
                if($.trim(usernameField.val()).length > 0 && $.trim(passwordField.val()).length > 0) {
                    singIn();
                } else if($.trim(usernameField.val()).length > 0) {
                    passwordField.focus();
                } else if($.trim(passwordField.val()).length > 0) {
                    usernameField.focus();
                }
            }
            clearError();
        });

        usernameField.focus();
        utils.hideLoadingOverlay(notificationContainer);
    };

    /**
     * Sign in using the credentials provided by the user
     *
     * @private
     */
    function singIn() {
        var credentials = {
            username: usernameField.val(),
            password: passwordField.val()
        };

        // Checking if the username and password had been entered by the user
        if($.trim(credentials.username).length <= 0 ||
                $.trim(credentials.password).length <= 0) {
            showError("Error", "Please enter both username and password");
        } else {
            // Authenticating the user
            utils.showLoadingOverlay(notificationContainer);
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
                        showError("Login Error", response.message);
                    }
                    utils.hideLoadingOverlay(notificationContainer);
                },
                error : function(response) {
                    showError("Error", utils.generateErrorMessageFromStatusCode(response.readyState));
                    utils.hideLoadingOverlay(notificationContainer);
                }
            });
        }
    }

    /**
     * Show error in the sign in page
     *
     * @private
     */
    function showError(title, message) {
        var notification = utils.generateAlertMessage("error", title, message);
        notification.addClass("collapse");
        notificationContainer.html(notification);
        notification.slideDown();
    }

    function clearError() {
        var notification = notificationContainer.children().first();
        notification.slideUp(function() {
            notification.remove();
        });
    }
}
