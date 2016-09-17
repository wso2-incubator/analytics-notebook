/**
 * Interactive analytics paragraph client prototype
 *
 * @param paragraph {jQuery} The paragraph in which the client resides in
 * @constructor
 */
function InteractiveAnalyticsParagraphClient(paragraph) {
    // Private variables used in the prototype
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);
    var timeFrom;
    var timeTo;

    var searchByContainer;
    var timeRangeContainer;
    var queryContainer;

    /**
     * Initialize the interactive analytics paragraph
     */
    self.initialize = function () {
        searchByContainer = paragraph.find(".search-by-container");
        timeRangeContainer = paragraph.find(".time-range-container");
        queryContainer = paragraph.find(".query-container");

        // Adding event listeners
        paragraph.find(".input-table").change(function () {
            var searchMethod = paragraph.find("input[name=search-by-option]:checked").val();
            switch(searchMethod) {
                case "time-range" :
                    timeRangeContainer.slideUp(function() {
                        searchByContainer.slideDown();
                    });
                    break;
                case "query" :
                    queryContainer.slideUp(function() {
                        searchByContainer.slideDown();
                    });
                    break;
                default :
                    searchByContainer.slideDown();
            }
            paragraph.find("input[name=search-by-option]").prop('checked', false);
            paragraph.find(".run-paragraph-button").prop('disabled', false);
        });

        paragraph.find(".search-by-time-range").click(function (event) {
            queryContainer.slideUp();
            timeRangeContainer.slideDown();
        });

        paragraph.find(".search-by-query").click(function (event) {
            timeRangeContainer.slideUp();
            queryContainer.slideDown();
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
                    columns.push("_timestamp");
                    columns.push("_version");

                    var searchMethod = paragraph.find("input[name=search-by-option]:checked").val();
                    if(searchMethod == undefined) {
                        searchMethod = "query";
                    }

                    var queryParameters = {
                        tableName: tableName
                    };
                    if (searchMethod == "time-range") {
                        queryParameters.timeFrom = timeFrom;
                        queryParameters.timeTo = timeTo;
                    } else {
                        queryParameters.query = paragraph.find(".query").val();
                    }

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
