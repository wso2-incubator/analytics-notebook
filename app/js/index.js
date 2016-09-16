/**
 * Utility prototype constructor for homepage
 *
 * @constructor
 */
function Notebook() {
    var self = this;
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
                    var columns = ["Note", "Running Status", "Deployed Status", "Actions"];
                    var data = [];
                    for(var i = 0; i < notes.length; i++) {
                        var row = [];
                        row.push(notes[i].name);
                        row.push(notes[i].runningStatus);
                        row.push(notes[i].deployedStatus);
                        row.push(
                            "<a href='note.html?note=" + notes[i].name + "' class='btn padding-reduce-on-grid-view'>" +
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
                    }
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
            error : function(response) {
                utils.hideLoadingOverlay(notesList);
            }
        });
    };
}