/**
 * Interactive analytics paragraph client prototype
 *
 * @param paragraph The paragraph in which the client resides in
 * @constructor
 */
function InteractiveAnalyticsParagraphClient(paragraph) {
    var self = this;

    // Private variables used in the prototype
    var timeFrom;
    var timeTo;

    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".input-table").change(function () {
            paragraph.find(".search-by-container").fadeIn();
        });

        paragraph.find(".search-by-time-range").click(function(event) {
            var sourceView = $(event.target).closest(".source");
            var dateRangeContainer = sourceView.find(".time-range-container");
            var queryContainer = sourceView.find(".query-container");

            queryContainer.fadeOut(function() {
                dateRangeContainer.fadeIn();
            });
        });

        paragraph.find(".search-by-query").click(function(event) {
            var sourceView = $(event.target).closest(".source");
            var dateRangeContainer = sourceView.find(".time-range-container");
            var queryContainer = sourceView.find(".query-container");

            dateRangeContainer.fadeOut(function() {
                queryContainer.fadeIn();
            });
        });

        // Initializing the interactive analytics paragraph
        new ParagraphUtils().loadTableNames(paragraph);

        // Adding the date pickers
        paragraph.find(".time-range").daterangepicker({
            timePicker : true,
            autoApply : true,
            timePicker24Hour : true
        }, function(start, end, label) {
            timeFrom = start.format('MM/DD/YYYY hh:mm:ss').getTime();
            timeTo = end.format('MM/DD/YYYY hh:mm:ss').getTime();
        });
    };

    self.run = function(callback) {
        var tableName = paragraph.find(".input-table").val();
        $.ajax({
            type: "GET",
            url : constants.API_URI + "tables/" + tableName + "/columns",
            success: function(data) {
                var searchMethod = paragraph.find("input[name=search-by-option]:checked").val();
                var queryParameters = {
                    tableName : tableName
                };
                if (searchMethod == "query") {
                    queryParameters.query = paragraph.find(".query").val();
                } else {
                    queryParameters.timeFrom = timeFrom;
                    queryParameters.timeTo = timeTo;
                }
                data.push("_timestamp");
                data.push("_version");
                callback(new Utils().generateDataTableWithLazyLoading(
                    "POST", constants.API_URI + "interactive-analytics/search/" + searchMethod, queryParameters, data
                ));
            }
        });
    };
}
