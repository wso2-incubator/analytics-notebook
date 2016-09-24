/**
 * Utility prototype constructor for sign in page
 *
 * @constructor
 */
function Authenticator() {
    var self = this;
    var utils = new Utils();
    var usernameField = $('#username');
    var passwordField = $('#password');
    var notificationContainer = $('#notification-container');

    /**
     * Initialize the sign in page
     */
    self.initialize = function() {
        // Registering event listeners
        $('#sign-in').click(function() {
            singIn();
        });

        $('.form-control').keyup(function(event) {
            if (event.keyCode == 13) {
                if ($.trim(usernameField.val()).length > 0 &&
                        $.trim(passwordField.val()).length > 0) {
                    singIn();
                } else if ($.trim(usernameField.val()).length > 0) {
                    passwordField.focus();
                } else if ($.trim(passwordField.val()).length > 0) {
                    usernameField.focus();
                }
            } else {
                clearError();
            }
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
        if ($.trim(credentials.username).length <= 0 ||
                $.trim(credentials.password).length <= 0) {
            showError('Error', 'Please enter both username and password');
        } else {
            // Authenticating the user
            utils.showLoadingOverlay(notificationContainer);
            $.ajax({
                type: 'POST',
                url: constants.API_URI + 'auth/sign-in',
                data: JSON.stringify(credentials),
                success: function(response) {
                    if (response.status == constants.response.SUCCESS ||
                        response.status == constants.response.ALREADY_LOGGED_IN) {
                        var redirectURI = new Utils().getQueryParameters().from;
                        if (redirectURI == undefined) {
                            redirectURI = 'index.html';
                        }
                        window.location.href = redirectURI;
                    } else {
                        showError('Login Error', response.message);
                    }
                    utils.hideLoadingOverlay(notificationContainer);
                },
                error: function(response) {
                    showError('Error',
                        utils.generateErrorMessageFromStatusCode(response.readyState)
                    );
                    utils.hideLoadingOverlay(notificationContainer);
                }
            });
        }
    }

    /**
     * Show error messages in the sign in page
     *
     * @private
     * @param {string} title Title of the error message to be shown
     * @param {string} message Message to be shown in the error
     */
    function showError(title, message) {
        clearError(function() {
            var notification = utils.generateAlertMessage('error', title, message);
            notification.addClass('collapse');
            notificationContainer.html(notification);
            notification.slideDown();
        });
    }

    /**
     * Callback function for clearing errors in sign in page
     *
     * @callback ClearErrorCallback
     */

    /**
     * Clear error messages in the sign in page
     *
     * @private
     * @param {ClearErrorCallback} [callback] Callback to be called after clearing error
     */
    function clearError(callback) {
        var notifications = notificationContainer.children();
        if (notifications.length > 0) {
            notifications.slideUp(function() {
                notifications.remove();
                if (callback != undefined) {
                    callback();
                }
            });
        } else {
            if (callback != undefined) {
                callback();
            }
        }
    }
}   // End of Authenticator prototype constructor
