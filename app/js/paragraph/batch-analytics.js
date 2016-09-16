/**
 * Batch analytics paragraph client prototype constructor
 *
 * @param paragraph The paragraph in which the client resides in
 * @constructor
 */
function BatchAnalyticsParagraphClient(paragraph) {
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);

    self.initialize = function () {
        paragraphUtils.loadTableNames();

        // Adding event listeners for the batch analytics paragraph
        paragraph.find(".add-table-button").click(function (event) {
            addTable($(event.target));
        });

        paragraph.find(".input-table").change(function () {
            paragraph.find(".add-table-button").prop('disabled', false);
            paragraph.find(".temporary-table").val("");
        });
    };

    self.run = function (callback) {
        // TODO : run batch analytics paragraph
        var query = paragraph.find(".query");
        var output = [];
        utils.showLoadingOverlay(paragraph);
        $.ajax({
            type : "POST",
            data : JSON.stringify({query: query.val()}),
            url : constants.API_URI + "batch-analytics/execute-script",
            success: function (response) {
                $.each(response.tables, function (index, result) {
                    if (response.status == constants.response.SUCCESS) {
                        if (result.status == constants.response.INVALID_QUERY) {
                            output.push($('<p><strong>Query ' + ( index + 1 ) + ' : </strong> ERROR' + result.message + '</p>'));
                        } else {
                            if (result.columns.length == 0 || result.data.length == 0) {
                                output.push($('<p><strong>Query ' + ( index + 1 ) + ' : </strong> Executed. No results to show. </p>'));
                            } else {
                                output.push($('<p><strong>Query ' + ( index + 1 ) + ' : </strong></p>'));
                                output.push(utils.generateDataTable(result.columns, result.data));
                            }
                        }
                    } else if (response.status == constants.response.NOT_LOGGED_IN) {
                        window.location.href = "sign-in.html";
                    }
                });
                callback(output);
                utils.hideLoadingOverlay(paragraph);
            },
            error : function(response) {
                paragraphUtils.handleError(response.responseText);
                utils.hideLoadingOverlay(paragraph);
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

        generateSparkQuery(tableName, tempTableName, function (createTempTableQuery) {
            textArea.val(textArea.val() + createTempTableQuery + "\n");
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
        utils.showLoadingOverlay(paragraph);
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
                    paragraphUtils.handleError(response.message);
                }
                utils.hideLoadingOverlay(paragraph);
            },
            error : function(response) {
                paragraphUtils.handleError(response.responseText);
                utils.hideLoadingOverlay(paragraph);
            }
        });

    }
}
