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
    var query = {};
    query.tableName = paragraph.find("input-table");

    $.ajax({
        type: "POST",
        url : constants.API_URI + "interactive-analytics/execute",
        data : JSON.stringify(query),
        success : function(data) {
            if (data.status == constants.response.SUCCESS) {
                console.log(JSON.stringify(data));
            } else if (data.status == constants.response.QUERY_ERROR) {

            }
        }
    });
};
