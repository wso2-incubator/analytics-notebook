/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Batch analytics paragraph client prototype constructor
 *
 * @param {jQuery} paragraph The paragraph in which the client resides in
 * @param {Object} [content] Source content of the paragraph encoded into an object
 * @constructor
 */
function BatchAnalyticsParagraphClient(paragraph, content) {
    var self = this;

    self.type = 'batchAnalytics';
    self.unsavedContentAvailable = false;

    /*
     * Initializing
     */
    paragraphUtils.loadTableNames(paragraph, function() {
        // Load source content
        if (content != undefined && content.query != undefined) {
            paragraph.find('.query').val(content.query);
            adjustRunButton();
        }
    });

    /*
     * Adding event listeners for the batch analytics paragraph
     */
    paragraph.find('.add-table-button').click(function() {
        self.unsavedContentAvailable = true;
        addTable();
    });
    paragraph.find('.input-table').change(function() {
        paragraph.find('.add-table-button').prop('disabled', false);
        paragraph.find('.temporary-table').val('');
    });
    paragraph.find('.query').keyup(function() {
        self.unsavedContentAvailable = true;
        adjustRunButton();
    });

    /**
     * Run the batch analytics paragraph
     *
     * @param {Object[]} [paragraphsLeftToRun] The array of paragraphs left to be run in run all paragraphs task
     */
    self.run = function(paragraphsLeftToRun) {
        var query = paragraph.find('.query');
        var output = [];
        utils.showLoadingOverlay(paragraph);
        $.ajax({
            type: 'POST',
            data: JSON.stringify({query: query.val()}),
            url: constants.API_URI + 'batch-analytics/execute-script',
            success: function(response) {
                $.each(response.tables, function(index, result) {
                    if (response.status == constants.response.SUCCESS) {
                        if (result.status == constants.response.INVALID_QUERY) {
                            output.push($(
                                '<p><strong>Query ' + (index + 1) + ' : </strong> ' +
                                'ERROR ' + result.message + '</p>'
                            ));
                        } else {
                            if (result.columns.length == 0 || result.data.length == 0) {
                                output.push($(
                                    '<p><strong>Query ' + (index + 1) + ' : </strong> ' +
                                    'Executed. No results to show. </p>'
                                ));
                            } else {
                                output.push($(
                                    '<p><strong>Query ' + (index + 1) + ' : </strong></p>'
                                ));
                                output.push(utils.generateDataTable(result.columns, result.data));
                            }
                        }
                    } else if (response.status == constants.response.NOT_LOGGED_IN) {
                        window.location.href = 'sign-in.html';
                    }
                });
                paragraphUtils.setOutput(paragraph, output);
                utils.hideLoadingOverlay(paragraph);
                paragraphUtils.runNextParagraphForRunAllTask(paragraphsLeftToRun);
            },
            error: function(response) {
                paragraphUtils.handleNotification(paragraph, 'error', 'Error',
                    utils.generateErrorMessageFromStatusCode(response.readyState)
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
        var query = paragraph.find('.query').val();
        if (query != undefined) {
            content = { query: query };
        }
        return content;
    };

    /**
     * Get the tables on which this paragraph depends on
     * Tables used in this paragraph are returned as inputTables attribute in the return object
     * Tables updates by this paragraph are returned as outputTables attribute in the return object
     *
     * @return {Object} tables on which this paragraph depends on
     */
    self.getDependencies = function () {
        var queries = paragraph.find('.query').val().split(';');
        var dependencies = {
            name: constants.paragraphs.batchAnalytics.displayName,
            inputTables: [],
            outputTables: []
        };
        var tablesMap = {};

        for (var i = 0; i < queries.length; i++) {
            var query = queries[i].trim().replace(/\s\s+/g, ' ');
            var querySubstring;
            if (query.substring(0, 23).toUpperCase() == 'CREATE TEMPORARY TABLE ') {
                var tempTableName = /CREATE TEMPORARY TABLE \w+ USING/i.exec(query)[0];
                tempTableName = tempTableName.substring(23, tempTableName.length - 6);
                querySubstring = /TABLENAME"\w+"/i.exec(query.replace(/ /g, ''))[0];
                tablesMap[tempTableName] = querySubstring.substring(10, querySubstring.length - 1);
            } else if (query.substring(0, 7).toUpperCase() == 'INSERT ') {
                querySubstring = /TABLE \w+ /i.exec(query)[0];
                var outputTableName = querySubstring.substring(6, querySubstring.length - 1);
                dependencies.outputTables.push(tablesMap[outputTableName]);
            } else if (query.substring(0, 7).toUpperCase() == 'SELECT ') {
                querySubstring = /FROM \w+ /i.exec(query)[0];
                var inputTableName = querySubstring.substring(5, querySubstring.length - 1);
                dependencies.inputTables.push(tablesMap[inputTableName]);
            }
        }
        return dependencies;
    };

    /**
     * Import the selected table generating the query
     *
     * @private
     */
    function addTable() {
        var textArea = paragraph.find('.query');
        var tableName = paragraph.find('.input-table').val();
        var tempTable = paragraph.find('.temporary-table');
        var tempTableName;

        if (!tempTable.val()) {
            tempTable.val(tableName.toLowerCase());
        }
        tempTableName = tempTable.val();

        generateSparkQuery(tableName, tempTableName, function(createTempTableQuery) {
            textArea.val(textArea.val() + createTempTableQuery + '\n');
        });
    }

    /**
     * Callback function for generate spark query
     *
     * @callback GenerateSparkQueryCallback
     * @param {string} query The query which will be generated
     */

    /**
     * Generate a spark query using the specified parameters
     *
     * @param {string} tableName The name of the table
     * @param {string} tempTableName The name of the temp table into which the data will be loaded
     * @param {GenerateSparkQueryCallback} callback The callback function into which the query will be passed after generating the query
     */
    function generateSparkQuery(tableName, tempTableName, callback) {
        var schema = '';
        utils.showLoadingOverlay(paragraph);
        $.ajax({
            type: 'GET',
            url: constants.API_URI + 'tables/' + tableName + '/schema',
            success: function(response) {
                if (response.status == constants.response.SUCCESS) {
                    $.each(response.schema, function(index, column) {
                        schema += column.name + ' ' + column.type;
                        if (column.scoreParam == true) {
                            schema += ' -sp' + ', ';
                        }
                        else if (column.indexed == true) {
                            schema += ' -i' + ', ';
                        }
                        else {
                            schema += ', ';
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
                    window.location.href = 'sign-in.html';
                } else {
                    paragraphUtils.handleNotification(paragraph, 'error', 'Error', response.message);
                }
                adjustRunButton();
                utils.hideLoadingOverlay(paragraph);
            },
            error: function(response) {
                paragraphUtils.handleNotification(
                    paragraph, 'error', 'Error',
                    utils.generateErrorMessageFromStatusCode(response.readyState
                    )
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
        if ($.trim(paragraph.find('.query').val()).length > 0) {
            paragraph.find('.run-paragraph-button').prop('disabled', false);
        } else {
            paragraph.find('.run-paragraph-button').prop('disabled', true);
        }
    }
}   // End of BatchAnalyticsParagraphClient prototype constructor
