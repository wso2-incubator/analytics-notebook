/**
 * Interactive analytics paragraph client prototype
 *
 * @param paragraph The paragraph in which the client resides in
 * @constructor
 */
function InteractiveAnalyticsParagraphClient(paragraph) {
    var self = this;

    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".input-table").change(function () {
            paragraph.find(".search-by-container").fadeIn();
        });

        paragraph.find(".search-by-date-range").click(function(event) {
            var sourceView = $(event.target).closest(".source");
            var dateRangeContainer = sourceView.find(".date-range-container");
            var queryContainer = sourceView.find(".query-container");

            queryContainer.fadeOut(function() {
                dateRangeContainer.fadeIn();
            });
        });

        paragraph.find(".search-by-query").click(function(event) {
            var sourceView = $(event.target).closest(".source");
            var dateRangeContainer = sourceView.find(".date-range-container");
            var queryContainer = sourceView.find(".query-container");

            dateRangeContainer.fadeOut(function() {
                queryContainer.fadeIn();
            });
        });

        // Initializing the interactive analytics paragraph
        new ParagraphUtils().loadTableNames(paragraph);
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
                    console.log(paragraph.find(".time-from").val());
                    queryParameters.timeFrom = new Date(paragraph.find(".time-from").val()).getTime();
                    queryParameters.timeTo = new Date(paragraph.find(".time-to").val()).getTime();
                }
                data.push("_timestamp");
                data.push("_version");
                callback(new Utils().generateTableWithLazyLoading(
                    "POST", constants.API_URI + "interactive-analytics/search/" + searchMethod, queryParameters, data
                ));
            }
        });
    };
}
