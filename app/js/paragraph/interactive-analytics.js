/**
 * Interactive analytics paragraph client prototype
 *
 * @param paragraph The paragraph in which the client resides in
 * @constructor
 */
function InteractiveAnalyticsParagraphClient(paragraph) {
    // Private variables used in the prototype
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);
    var timeFrom;
    var timeTo;

    /**
     * Initialize the interactive analytics paragraph
     */
    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".input-table").change(function () {
            paragraph.find(".search-by-container").fadeIn();
        });

        paragraph.find(".search-by-time-range").click(function (event) {
            var sourceView = $(event.target).closest(".source");
            var dateRangeContainer = sourceView.find(".time-range-container");
            var queryContainer = sourceView.find(".query-container");

            queryContainer.fadeOut(function () {
                dateRangeContainer.fadeIn();
            });
        });

        paragraph.find(".search-by-query").click(function (event) {
            var sourceView = $(event.target).closest(".source");
            var dateRangeContainer = sourceView.find(".time-range-container");
            var queryContainer = sourceView.find(".query-container");

            dateRangeContainer.fadeOut(function () {
                queryContainer.fadeIn();
            });
        });

        // Initializing the interactive analytics paragraph
        paragraphUtils.loadTableNames();

        // Adding the date pickers
        paragraph.find(".time-range").daterangepicker({
            timePicker: true,
            autoApply: true,
            timePicker24Hour: true
        }, function (start, end, label) {
            timeFrom = new Date(start).getTime();
            timeTo = new Date(end).getTime();
        });
    };

    /**
     * Run the interactive analytics paragraph
     *
     * @param callback {ParagraphClientRunCallback} The callback that will be called after running the paragraph
     */
    self.run = function (callback) {
        var tableName = paragraph.find(".input-table").val();
        utils.showLoadingOverlay(paragraph);
        $.ajax({
            type: "GET",
            url: constants.API_URI + "tables/" + tableName + "/columns",
            success: function (response) {
                if (response.status == constants.response.SUCCESS) {
                    var columns = response.columnNames;
                    var searchMethod = paragraph.find("input[name=search-by-option]:checked").val();
                    var queryParameters = {
                        tableName: tableName
                    };
                    if (searchMethod == "query") {
                        queryParameters.query = paragraph.find(".query").val();
                    } else {
                        queryParameters.timeFrom = timeFrom;
                        queryParameters.timeTo = timeTo;
                    }
                    columns.push("_timestamp");
                    columns.push("_version");
                    callback(utils.generateDataTableWithLazyLoading(
                        "POST",
                        constants.API_URI + "interactive-analytics/search/" + searchMethod,
                        queryParameters,
                        columns
                    ));
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = "sign-in.html";
                } else {
                    paragraphUtils.handleError(response.message);
                }
                utils.hideLoadingOverlay(paragraph);
            },
            error : function(response) {
                paragraphUtils.handleError(response.responseText);
                utils.hideLoadingOverlay(paragraph);
            }
        });
    };
}
