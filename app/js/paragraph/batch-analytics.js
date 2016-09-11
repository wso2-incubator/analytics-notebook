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
            success: function (response) {
                if (response.status == constants.response.SUCCESS) {
                    $.each(response.tables, function (index, result) {
                        if (result.columns.length == 0 || result.data.length == 0) {
                            output.push($('<p><strong>Query ' + ( index + 1 ) + ' : </strong> Executed. No results to show. </p>'));
                        } else {
                            output.push($('<p><strong>Query ' + ( index + 1 ) + ' : </strong></p>'));
                            output.push(new Utils().generateDataTable(result.columns, result.data));
                        }
                    });
                    callback(output);
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = "sign-in.html";
                } else {
                    new ParagraphUtils().handleError(paragraph, response.message);
                }
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

        generateSparkQuery(tableName , tempTableName ,  function (createTempTableQuery) {
            textArea.val( textArea.val() + createTempTableQuery + "\n");
        });
    }

    /**
     * Callback function for generate spark query
     *
     * @callback GenerateSparkQueryCallback
     * @param Query {string}
     */

    /**
     * Generate a spark query using the specified parameters
     *
     * @param tableName {string} The name of the table
     * @param tempTableName {string} The name of the temp table into which the data will be loaded
     * @param callback {GenerateSparkQueryCallback} The callback function into which the query will be passed after generating the query
     */
    function generateSparkQuery(tableName, tempTableName, callback) {
        var schema = '';
        $.ajax({
            type: "GET",
            url: constants.API_URI + "tables/" + tableName + "/schema",
            success: function (response) {
                if (response.status == constants.response.SUCCESS) {
                    $.each(response.schema, function (index, column) {
                        if (column.scoreParam == true) {
                            schema += column.name + ' ' + column.type + ' -sp' + ', ';
                        }
                        else if (column.indexed == true) {
                            schema += column.name + ' ' + column.type + ' -i' + ', ';
                        }
                        else {
                            schema += column.name + ' ' + column.type + ', ';
                        }
                        if (index == response.schema.length - 1) {
                            schema = schema.substring(0, schema.length - 2);
                            var createTempTableQuery = 'CREATE TEMPORARY TABLE ' +
                                tempTableName +
                                ' USING CarbonAnalytics OPTIONS (tableName "' +
                                tableName +
                                '", schema "' +
                                schema +
                                '");';
                            callback(createTempTableQuery);
                        }
                    });
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = "sign-in.html";
                } else {
                    new ParagraphUtils().handleError(paragraph, response.message);
                }
            }
        });

    }
}
