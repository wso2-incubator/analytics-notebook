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
    var queryParameters = {
        tableName : paragraph.find(".input-table").val(),
        query : paragraph.find(".query").val(),
        start : 0,
        count : 100
    };

    $.ajax({
        type: "POST",
        url : constants.API_URI + "interactive-analytics/execute",
        data : JSON.stringify(queryParameters),
        success : function(data) {
            callback(util.output.generateTable(callback, data.columns, data.rows));
        }
    });
};
