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

    var searchByAndMaxResultCountContainer;
    var timeRangeContainer;
    var queryContainer;

    /**
     * Initialize the interactive analytics paragraph
     * If content is passed into this the source content will be set from it
     *
     * @param [content] {Object} Source content of the paragraph encoded into an object
     */
    self.initialize = function (content) {
        searchByAndMaxResultCountContainer = paragraph.find(".search-by-container, .maximum-result-count-container");
        timeRangeContainer = paragraph.find(".time-range-container");
        queryContainer = paragraph.find(".query-container");

        paragraphUtils.loadTableNames(function() {
            if (content != undefined) {
                // Loading the source content from the content object provided
                if (content.inputTable != undefined) {
                    paragraph.find(".input-table").val(content.tableName);
                    onInputTableChange();
                    if (content.searchMethod != undefined) {
                        switch (content.searchMethod) {
                            case "query" :
                                onSearchByQueryRadioButtonClick();
                                if (paragraph.timeFrom != undefined && paragraph.timeTo != undefined) {
                                    timeFrom = content.timeFrom;
                                    timeTo = content.timeTo;
                                }
                                break;
                            case "time-range" :
                                onSearchByTimeRangeRadioButtonClick();
                                if (paragraph.query != undefined) {
                                    paragraph.find(".query").val(content.query);
                                }
                                break;
                            default :
                                onSearchByQueryRadioButtonClick();
                                content.searchMethod = "query";
                        }
                        paragraph.find("input[value=" + content.searchMethod + "]").prop("checked", true);
                    }
                }
            }

            // Adding the date pickers
            // Content needed to be loaded for this to load
            var dateRangePickerOptions = {
                timePicker: true,
                autoApply: true,
                timePicker24Hour: true
            };
            if (timeFrom != undefined) {
                dateRangePickerOptions.startDate = new Date(timeFrom);
            }
            if (timeTo != undefined) {
                dateRangePickerOptions.endDate = new Date(timeTo);
            }
            paragraph.find(".time-range").daterangepicker(dateRangePickerOptions, function (start, end) {
                timeFrom = new Date(start).getTime();
                timeTo = new Date(end).getTime();
            });

            // Adding event listeners
            paragraph.find(".input-table").change(function () {
                onInputTableChange();
            });

            paragraph.find(".maximum-result-count").keyup(function() {
                adjustRunButton();
            });

            paragraph.find(".search-by-time-range").click(function () {
                onSearchByTimeRangeRadioButtonClick();
            });

            paragraph.find(".search-by-query").click(function () {
                onSearchByQueryRadioButtonClick();
            });
        });

        /**
         * Disable or enable the run button depending on whether the requirements to run the paragraph are met
         */
        function adjustRunButton() {
            if (paragraph.find(".maximum-result-count").val() > 0) {
                paragraph.find(".run-paragraph-button").prop('disabled', false);
            } else {
                paragraph.find(".run-paragraph-button").prop('disabled', true);
            }
        }

        /**
         * Run input table change tasks
         */
        function onInputTableChange() {
            var searchMethod = paragraph.find("input[name=search-by-option]:checked").val();
            switch(searchMethod) {
                case "time-range" :
                    timeRangeContainer.slideUp(function() {
                        searchByAndMaxResultCountContainer.slideDown();
                    });
                    break;
                case "query" :
                    queryContainer.slideUp(function() {
                        searchByAndMaxResultCountContainer.slideDown();
                    });
                    break;
                default :
                    searchByAndMaxResultCountContainer.slideDown();
            }
            paragraph.find("input[name=search-by-option]").prop('checked', false);
            adjustRunButton();
        }

        /**
         * Run search method changing to time range tasks
         */
        function onSearchByTimeRangeRadioButtonClick() {
            queryContainer.slideUp();
            timeRangeContainer.slideDown();
        }

        /**
         * Run search method changing to query tasks
         */
        function onSearchByQueryRadioButtonClick() {
            timeRangeContainer.slideUp();
            queryContainer.slideDown();
        }
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
                        columns,
                        paragraph.find(".maximum-result-count").val()
                    ));
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = "sign-in.html";
                } else {
                    paragraphUtils.handleNotification("error", "Error", response.message);
                }
                utils.hideLoadingOverlay(paragraph);
            },
            error : function(response) {
                paragraphUtils.handleNotification(
                    "error", "Error", utils.generateErrorMessageFromStatusCode(response.readyState)
                );
                utils.hideLoadingOverlay(paragraph);
            }
        });
    };

    /**
     * Get the source content of the paragraph encoded into an object
     *
     * @return {Object} source content of the paragraph encoded into an object
     */
    self.getSourceContent = function() {
        var content = {};
        var inputTable = paragraph.find(".input-table").val();
        if (inputTable != undefined) {
            content.inputTable = inputTable;
            var searchMethod = paragraph.find("input[name=search-by-option]:checked").val();
            if (searchMethod != undefined) {
                content.searchMethod = searchMethod;
                switch (searchMethod) {
                    case "query" :
                        var query = paragraph.find(".query").val();
                        if (query != undefined) {
                            content.query = query;
                        }
                        break;
                    case "time-range" :
                        if (timeFrom != undefined && timeTo != undefined) {
                            content.timeFrom = timeFrom;
                            content.timeTo = timeTo;
                        }
                        break;
                }
            }
        }
    };
}
