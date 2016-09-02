var batchAnalyticsParagraph = {};

batchAnalyticsParagraph.run = function(paragraph, callback) {
    // TODO : run batch analytics paragraph
    var query = paragraph.find(".query");
    var output = [];
    $.ajax({
        type: "POST",
        data: JSON.stringify({ query : query.val() }),
        url : constants.API_URI + "batch-analytics/execute-script",
        success: function (data) {
            $.each(data, function (index , result)  {
                if (result.columns.length ==0 || result.rows.length == 0) {
                    output.push( $('<p> <strong>Query '+ ( index + 1 ) + ' : </strong> Executed. No results to show. </p>'));
                } else {
                    output.push( $('<p> <strong>Query '+ ( index + 1 ) + ' : </strong> </p>'));
                    output.push(util.output.generateTable( result.columns, result.rows));
                }
            });
            callback(output);
        }
    });

};

batchAnalyticsParagraph.addTable = function (paragraph) {
    var sourceElement = paragraph.closest(".source");
    var textArea = sourceElement.find(".query");
    var tableName = sourceElement.find(".input-table").val();
    var tempTable = sourceElement.find(".temporary-table");
    var schema = '';
    var tempTableName;

    if( ! tempTable.val() ) {
        tempTableName = tableName.toLowerCase();
    }
    else{
        tempTableName =tempTable.val();
    }
    $.ajax({
        type : "GET",
        url : constants.API_URI + "tables/"+ tableName +"/schema",
        success: function (data) {
            $.each(data , function ( index , column) {
                if (column.scoreParam == true){
                    schema+=column.name + ' ' + column.type + ' -sp' + ', ';
                }
                else if (column.indexed == true){
                    schema+=column.name + ' ' + column.type + ' -i' + ', ';
                }
                else {
                    schema+=column.name + ' ' + column.type + ', ';
                }

            });
            schema = schema.substring(0, schema.length-2);
            var createTempTableQuery= 'CREATE TEMPORARY TABLE ' +
                tempTableName +
                ' USING CarbonAnalytics OPTIONS (tableName "'+
                tableName +
                '", schema "' +
                schema +
                '");';
            textArea.append(createTempTableQuery + "\n");
        }

    });

};
