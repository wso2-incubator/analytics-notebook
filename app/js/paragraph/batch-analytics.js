/**
 * Batch analytics paragraph client prototype constructor
 *
 * @param paragraph {jQuery} The paragraph in which the client resides in
 * @constructor
 */
function BatchAnalyticsParagraphClient(paragraph) {
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);

    self.type = constants.paragraphs.batchAnalytics.key;
    self.unsavedContentAvailable = false;

    /**
     * Initialize the batch analytics paragraph
     * If content is passed into this the source content will be set from it
     *
     * @param [content] {Object} Source content of the paragraph encoded into an object
     */
    self.initialize = function (content) {
        paragraphUtils.loadTableNames(function () {
            // Load source content
            if (content != undefined && content.query != undefined) {
                paragraph.find(".query").val(content.query);
                adjustRunButton();
            }
        });

        // Adding event listeners for the batch analytics paragraph
        paragraph.find(".add-table-button").click(function (event) {
            self.unsavedContentAvailable = true;
            addTable();
        });

        paragraph.find(".input-table").change(function () {
            paragraph.find(".add-table-button").prop('disabled', false);
            paragraph.find(".temporary-table").val("");
        });

        paragraph.find(".query").keyup(function() {
            self.unsavedContentAvailable = true;
            adjustRunButton();
        });
    };

    /**
     * Run the batch analytics paragraph
     *
     * @param [paragraphsLeftToRun] {Object[]} The array of paragraphs left to be run in run all paragraphs task
     */
    self.run = function (paragraphsLeftToRun) {
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
                paragraphUtils.setOutput(output);
                utils.hideLoadingOverlay(paragraph);
                paragraphUtils.runNextParagraphForRunAllTask(paragraphsLeftToRun);
            },
            error : function(response) {
                paragraphUtils.handleNotification(
                    "error", "Error", utils.generateErrorMessageFromStatusCode(response.readyState)
                );
                utils.hideLoadingOverlay(paragraph);
                paragraphUtils.runNextParagraphForRunAllTask(paragraphsLeftToRun);
            }
        });
    };

    /**
     * Get the source content of the paragraph encoded into an object
     *
     * @return {Object} source content of the paragraph encoded into an object
     */
    self.getSourceContent = function() {
        var content;
        var query = paragraph.find(".query").val();
        if (query != undefined) {
            content = { query : query };
        }
        return content;
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
     * @param Query {string} The query which will be generated
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
                    paragraphUtils.handleNotification("error", "Error", response.message);
                }
                adjustRunButton();
                utils.hideLoadingOverlay(paragraph);
            },
            error : function(response) {
                paragraphUtils.handleNotification(
                    "error", "Error", utils.generateErrorMessageFromStatusCode(response.readyState)
                );
                utils.hideLoadingOverlay(paragraph);
            }
        });
    }

    /**
     * Update the paragraph run button disabled status
     *
     * @private
     */
    function adjustRunButton() {
        if($.trim(paragraph.find(".query").val()).length > 0) {
            paragraph.find(".run-paragraph-button").prop('disabled', false);
        } else {
            paragraph.find(".run-paragraph-button").prop('disabled', true);
        }
    }
}
