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
            callback(util.output.generateTableWithLazyLoading(
                "POST", constants.API_URI + "interactive-analytics/search/" + searchMethod, queryParameters, data
            ));
        }
    });
};
