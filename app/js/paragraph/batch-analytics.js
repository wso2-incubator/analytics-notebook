/**
 * Batch analytics paragraph client prototype constructor
 *
 * @param paragraph The paragraph in which the client resides in
 * @constructor
 */
function BatchAnalyticsParagraphClient(paragraph) {
    var self = this;

    self.initialize = function() {
        new ParagraphUtils().loadTableNames(paragraph);

        // Adding event listeners for the batch analytics paragraph
        paragraph.find(".add-table-button").click(function (event) {
            addTable($(event.target));
        });

        paragraph.find(".input-table").change(function (){
            var button = paragraph.find(".add-table-button");
            button.prop('disabled' , false);
        });
    };

    self.run = function (callback) {
        // TODO : run batch analytics paragraph
        var query = paragraph.find(".query");
        var output = [];
        $.ajax({
            type: "POST",
            data: JSON.stringify({query: query.val()}),
            url: constants.API_URI + "batch-analytics/execute-script",
            success: function (data) {
                $.each(data, function (index, result) {
                    if (result.status == constants.response.ERROR){
                        output.push($('<p><strong>Query ' + ( index + 1 ) + ' : </strong> ERROR'+ result.message +'</p>'));
                    } else {
                        if (result.columns.length == 0 || result.data.length == 0) {
                            output.push($('<p><strong>Query ' + ( index + 1 ) + ' : </strong> Executed. No results to show. </p>'));
                        } else {
                            output.push($('<p><strong>Query ' + ( index + 1 ) + ' : </strong></p>'));
                            output.push(new Utils().generateDataTable(result.columns, result.data));
                        }
                    }
                });
                callback(output);
            }
        });
    };

    /**
     * Import the selected table generating the query
     *
     * @private
     */
    function addTable() {
        var textArea = paragraph.find(".query");
        var tableName = paragraph.find(".input-table").val();
        var tempTable = paragraph.find(".temporary-table");
        var tempTableName;

        if (!tempTable.val()) {
            tempTable.val(tableName.toLowerCase());
        }
        tempTableName = tempTable.val();

        new ParagraphUtils().generateSparkQuery(tableName , tempTableName ,  function (createTempTableQuery) {
            textArea.val( textArea.val() + createTempTableQuery + "\n");
        });
    }
}
