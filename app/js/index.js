/**
 * Utility prototype constructor for homepage
 *
 * @constructor
 */
function Notebook() {
    var self = this;

    // Private variables
    var utils = new Utils();
    var notesList = $("#notes-list");

    /**
     * Initialize the home page
     */
    self.initialize = function () {
        $.ajax({
            type: "GET",
            url: constants.API_URI + "notes",
            success: function (response) {
                if (response.status == constants.response.SUCCESS) {
                    var notes = response.notes;
                    var columns = ["Note", "Actions"];

                    // Creating the 2D data array for the notes list table
                    var data = [];
                    $.each(notes, function(index, note) {
                        var row = [];
                        row.push(note);
                        row.push(
                            "<a href='note.html?note=" + note + "' class='btn padding-reduce-on-grid-view'>" +
                                "<span class='fw-stack'>" +
                                    "<i class='fw fw-ring fw-stack-2x'></i>" +
                                    "<i class='fw fw-edit fw-stack-1x'></i>" +
                                "</span>" +
                                "<span class='hidden-xs'>Edit</span>" +
                            "</a>" +
                            "<a href='#' class='btn padding-reduce-on-grid-view'>" +
                                "<span class='fw-stack'>" +
                                    "<i class='fw fw-ring fw-stack-2x'></i>" +
                                    "<i class='fw fw-delete fw-stack-1x'></i>" +
                                "</span>" +
                                "<span class='hidden-xs'>Delete</span>" +
                            "</a>"
                        );
                        data.push(row);
                    });

                    notesList.html(utils.generateListTable(columns, data,
                        { ordering : false, searching : false },
                        { "Actions" : "text-right" }
                    ));
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = "sign-in.html";
                } else {

                }
                utils.hideLoadingOverlay(notesList);
            },
            error : function() {
                utils.hideLoadingOverlay(notesList);
            }
        });

        // Registering event listeners
        $("#sign-out").click(function() {
            utils.signOut("./");
        });

        $("#create-note").click(function() {
            utils.clearPageNotification();

            // Creating the modal content elements
            var modalBody = $("<div class='pull-left'>");
            var noteNameInput = $(
                "<div class='form-group col-sm-12 output-table-container'>" +
                    "<input type='text' class='form-control' />" +
                "</div>"
            );
            var modalFooter = $("<div class='pull-right'>");
            var createButton = $("<button type='button' class='btn btn-primary'>Create</button>");

            // Appending to create the modal content structure
            modalBody.append(noteNameInput);
            modalFooter.append(createButton);

            var modal = utils.showModalPopup("Enter a name for your new note", modalBody, modalFooter);

            // Registering event listeners for the modal window
            createButton.click(function() {
                createNote(noteNameInput.children().first().val());
                modal.modal("hide");
            });
        });
    };

    function createNote(name) {
        if (name.indexOf(' ') > 0) {
            utils.handlePageNotification("error", "Error", "Note name cannot contain white spaces");
        } else {
            $.ajax({
                type: "PUT",
                url: constants.API_URI + "notes/" + name,
                success: function (response) {
                    if (response.status == constants.response.SUCCESS) {
                        window.location.href = "note.html?note=" + name;
                    } else if (response.status == constants.response.NOT_LOGGED_IN) {
                        window.location.href = "sign-in.html";
                    } else {
                        utils.handlePageNotification("error", "Error", response.message);
                    }
                },
                error : function(response) {
                    utils.handlePageNotification("error", "Error", utils.generateErrorMessageFromStatusCode(response.readyState));
                }
            });
        }
    }
}
