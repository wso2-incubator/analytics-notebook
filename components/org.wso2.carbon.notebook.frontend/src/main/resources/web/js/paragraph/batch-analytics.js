var batchAnalyticsParagraph = {};

batchAnalyticsParagraph.run = function (paragraph, callback) {
    // TODO : run batch analytics paragraph
    var query = paragraph.find(".query");
    var output = [];
    $.ajax({
        type: "POST",
        data: JSON.stringify({query: query.val()}),
        url: constants.API_URI + "batch-analytics/execute-script",
        success: function (data) {
            $.each(data, function (index, result) {
                if (result.status == "QUERY_ERROR"){
                    output.push($('<p><strong>Query ' + ( index + 1 ) + ' : </strong> ERROR'+ result.message +'</p>'));
                }else {
                    if (result.columns.length == 0 || result.data.length == 0) {
                        output.push($('<p><strong>Query ' + ( index + 1 ) + ' : </strong> Executed. No results to show. </p>'));
                    } else {
                        output.push($('<p><strong>Query ' + ( index + 1 ) + ' : </strong></p>'));
                        output.push(util.output.generateTable(result.columns, result.data));
                    }
                }
            });
            callback(output);
        }
    });
};

//import the selected table generating the query
batchAnalyticsParagraph.addTable = function (paragraph) {
    var sourceElement = paragraph.closest(".source");
    var textArea = sourceElement.find(".query");
    var tableName = sourceElement.find(".input-table").val();
    var tempTable = sourceElement.find(".temporary-table");
    var tempTableName;

    if (!tempTable.val()) {
        tempTableName = tableName.toLowerCase();
    }
    else {
        tempTableName = tempTable.val();
    }

    paragraphUtil.generateSparkQuery(tableName , tempTableName ,  function (createTempTableQuery) {
        textArea.val( textArea.val() + createTempTableQuery + "\n");
    });

};

batchAnalyticsParagraph.enableImport = function (paragraph) {
    var sourceElement = paragraph.closest(".source");
    var button = $(sourceElement.find(".add-table-button"));
    $(button).prop('disabled' , false);
};
