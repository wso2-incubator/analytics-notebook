var interactiveAnalyticsParagraph = {};

interactiveAnalyticsParagraph.init = function(paragraph) {
    var inputTableSelectElement = paragraph.find(".input-table");
    $.ajax({
        type: "GET",
        url : constants.API_URI + "tables",
        success: function(data) {
            inputTableSelectElement.html($("<option disabled selected value> -- select an option -- </option>"));
            $.each(data, function(index, table) {
                inputTableSelectElement.append($("<option>" + table + "</option>"));
            });
        }
    });
};

interactiveAnalyticsParagraph.run = function(paragraph, callback) {
    var tableName = paragraph.find(".input-table").val();
    $.ajax({
        type: "GET",
        url : constants.API_URI + "tables/" + tableName + "/columns",
        success: function(data) {
            var queryParameters = {
                tableName : tableName,
                query : paragraph.find(".query").val()
            };
            callback(util.output
                .generateLazyLoadedTable("POST", constants.API_URI + "interactive-analytics/search/query", queryParameters, data));
        }
    });
};
