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
 * Interactive analytics paragraph client prototype
 *
 * @param {jQuery} paragraph The paragraph in which the client resides in
 * @param {Object} [content] Source content of the paragraph encoded into an object
 * @constructor
 */
function InteractiveAnalyticsParagraphClient(paragraph, content) {
    var self = this;

    var timeFrom;
    var timeTo;

    var searchByAndMaxResultCountContainer = paragraph.find('.search-by-container, .maximum-result-count-container');
    var timeRangeContainer = paragraph.find('.time-range-container');
    var primaryKeysContainer = paragraph.find('.primary-keys-container');
    var queryContainer = paragraph.find('.query-container');
    var runButton = paragraph.find('.run-paragraph-button');

    self.type = 'interactiveAnalytics';
    self.unsavedContentAvailable = false;

    /*
     * Initializing
     */
    paragraphUtils.loadTableNames(paragraph, function() {
        // Load source content
        if (content != undefined) {
            // Loading the source content from the content object provided
            if (content.inputTable != undefined) {
                paragraph.find('.input-table').val(content.inputTable);
                onInputTableChange();
                if (content.searchMethod != undefined) {
                    paragraph.find('input[value=' + content.searchMethod + ']').prop('checked', true);
                    switch (content.searchMethod) {
                        case 'query' :
                            onSearchByQueryRadioButtonClick();
                            if (content.query != undefined) {
                                paragraph.find('.query').val(content.query);
                            }
                            break;
                        case 'time-range' :
                            onSearchByTimeRangeRadioButtonClick();
                            if (content.timeFrom != undefined && content.timeTo != undefined) {
                                timeFrom = content.timeFrom;
                                timeTo = content.timeTo;
                            }
                            break;
                        case 'primary-keys':
                            if (content.primaryKeys != undefined) {
                                generatePrimaryKeySearchTable(content.primaryKeys);
                            }
                            break;
                        default :
                            onSearchByQueryRadioButtonClick();
                            content.searchMethod = 'query';
                    }
                }
            }
        }

        // Adding the date pickers. Content needed to be loaded before this
        var dateRangePickerOptions = {
            timePicker: true,
            autoApply: true,
            timePicker24Hour: true,
            drops: 'up'
        };
        if (timeFrom != undefined) {
            dateRangePickerOptions.startDate = new Date(timeFrom);
        }
        if (timeTo != undefined) {
            dateRangePickerOptions.endDate = new Date(timeTo);
        }
        paragraph.find('.time-range').daterangepicker(dateRangePickerOptions, function(start, end) {
            self.unsavedContentAvailable = true;
            timeFrom = new Date(start).getTime();
            timeTo = new Date(end).getTime();
        });
    });

    /*
     * Registering event listeners
     */
    paragraph.find('.input-table').change(function() {
        self.unsavedContentAvailable = true;
        onInputTableChange();
    });
    paragraph.find('input[name=search-by-option]').click(function(event) {
        self.unsavedContentAvailable = true;
        switch($(event.target).val()) {
            case "time-range":
                onSearchByTimeRangeRadioButtonClick();
                break;
            case "primary-keys":
                onSearchByPrimaryKeysRadioButtonClick();
                break;
            case "query":
                onSearchByQueryRadioButtonClick();
        }
    });
    var maxResultCount = paragraph.find('.maximum-result-count');
    maxResultCount.focusout(function() {
        if (maxResultCount.val() == '') {
            maxResultCount.val(1000);
        }
    });
    paragraph.find('.query').keyup(function() {
        self.unsavedContentAvailable = true;
    });

    /**
     * Run the interactive analytics paragraph
     *
     * @param {Object[]} [paragraphsLeftToRun] The array of paragraphs left to be run in run all paragraphs task
     */
    self.run = function(paragraphsLeftToRun) {
        var tableName = paragraph.find('.input-table').val();
        utils.showLoadingOverlay(paragraph);
        $.ajax({
            type: 'GET',
            url: constants.API_URI + 'tables/' + tableName + '/columns',
            success: function(response) {
                if (response.status == constants.response.SUCCESS) {
                    var columns = response.columnNames;
                    columns.push('_timestamp');
                    columns.push('_version');
                    var searchMethod = paragraph.find('input[name=search-by-option]:checked').val();
                    var queryParameters = {
                        tableName: tableName
                    };

                    if (searchMethod == 'time-range') {
                        queryParameters.timeFrom = timeFrom;
                        queryParameters.timeTo = timeTo;
                    } else if (searchMethod == 'primary-keys') {
                        var primaryKeys = paragraph.find('.primary-key');
                        var primaryKeyValues = paragraph.find('.primary-key-value');
                        queryParameters.primaryKeys = [];
                        for (var i = 0; i < primaryKeys.length; i++) {
                            if (primaryKeyValues.get(i).value != undefined) {
                                var primaryKeySearchPair = {};
                                primaryKeySearchPair[primaryKeys.get(i).innerHTML] =
                                    primaryKeyValues.get(i).value;
                                queryParameters.primaryKeys.push(primaryKeySearchPair);
                            }
                        }
                    } else if (searchMethod == 'query') {
                        queryParameters.query = paragraph.find('.query').val();
                    } else {
                        searchMethod = 'query';
                        queryParameters.query = '';
                    }

                    paragraphUtils.setOutput(paragraph, utils.generateDataTableWithLazyLoading(
                        'POST',
                        constants.API_URI + 'interactive-analytics/' + searchMethod,
                        queryParameters,
                        columns,
                        paragraph.find('.maximum-result-count').val()
                    ));
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = 'sign-in.html';
                } else {
                    paragraphUtils.handleNotification(paragraph, 'error', 'Error', response.message);
                }
                utils.hideLoadingOverlay(paragraph);
            },
            error: function(response) {
                paragraphUtils.handleNotification(
                    paragraph, 'error', 'Error', utils.generateErrorMessageFromStatusCode(response.readyState)
                );
                utils.hideLoadingOverlay(paragraph);
            }
        });
        paragraphUtils.runNextParagraphForRunAllTask(paragraphsLeftToRun);
    };

    /**
     * Get the source content of the paragraph encoded into an object
     *
     * @return {Object} source content of the paragraph encoded into an object
     */
    self.getSourceContent = function() {
        var content;
        var inputTable = paragraph.find('.input-table').val();
        if (inputTable != undefined) {
            content = { inputTable: inputTable };
            var searchMethod = paragraph.find('input[name=search-by-option]:checked').val();
            if (searchMethod != undefined) {
                content.searchMethod = searchMethod;
                var maxResultCount = paragraph.find('maximum-result-count').val();
                if (maxResultCount != undefined) {
                    content.maxResultCount = maxResultCount;
                }
                switch (searchMethod) {
                    case 'time-range' :
                        if (timeFrom != undefined && timeTo != undefined) {
                            content.timeFrom = timeFrom;
                            content.timeTo = timeTo;
                        }
                        break;
                    case 'primary-keys':
                        var primaryKeyElements = paragraph.find('.primary-key');
                        var primaryKeyValueElements = paragraph.find('.primary-key-value');
                        var primaryKeys;
                        if (primaryKeyValueElements != undefined &&
                                primaryKeyElements != undefined &&
                                primaryKeyElements.length > 0) {
                            primaryKeys = [];
                            for (var i = 0; i < primaryKeyElements.length; i++) {
                                if (primaryKeyValueElements.get(i).value != undefined) {
                                    primaryKeys.push({
                                        key: primaryKeyElements.get(i).innerHTML,
                                        value: primaryKeyValueElements.get(i).value
                                    });
                                }
                            }
                        }
                        if (primaryKeys != undefined) {
                            content.primaryKeys = primaryKeys;
                        }
                        break;
                    case 'query' :
                        var query = paragraph.find('.query').val();
                        if (query != undefined) {
                            content.query = query;
                        }
                        break;
                }
            }
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
        var dependencies = {
            name: constants.paragraphs.interactiveAnalytics.displayName,
            inputTables: [],
            outputTables: []
        };
        dependencies.inputTables.push(paragraph.find('.input-table').val());
        return dependencies;
    };

    /**
     * Run input table change tasks
     */
    function onInputTableChange() {
        timeRangeContainer.slideUp();
        queryContainer.slideUp();
        primaryKeysContainer.slideUp();
        searchByAndMaxResultCountContainer.slideDown();
        paragraph.find('input[name=search-by-option]').prop('checked', false);
        paragraph.find('.run-paragraph-button').prop('disabled', false);
    }

    /**
     * Run search method changing to time range tasks
     */
    function onSearchByTimeRangeRadioButtonClick() {
        runButton.prop('disabled', false);
        paragraphUtils.clearNotification(paragraph);
        primaryKeysContainer.slideUp();
        queryContainer.slideUp();
        timeRangeContainer.slideDown();
    }

    /**
     * Run search method changing to primary keys tasks
     */
    function onSearchByPrimaryKeysRadioButtonClick() {
        timeRangeContainer.slideUp();
        queryContainer.slideUp();
        var tableName = paragraph.find('.input-table').val();
        $.ajax({
            type: 'GET',
            url: constants.API_URI + 'tables/' + tableName + '/primary-keys',
            success: function (response) {
                if (response.status == constants.response.SUCCESS) {
                    var primaryKeys = response.primaryKeys;
                    if (primaryKeys.length > 0) {
                        var primaryKeyValuePairs = [];
                        for (var i = 0; i < primaryKeys.length; i++) {
                            primaryKeyValuePairs.push({
                                key: primaryKeys[i],
                                value: ""
                            });
                        }
                        generatePrimaryKeySearchTable(primaryKeyValuePairs);
                    } else {
                        paragraphUtils.handleNotification(paragraph, 'info', 'Info',
                            tableName + ' does not have any primary keys'
                        );
                    }
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = 'sign-in.html';
                } else {
                    paragraphUtils.handleNotification(paragraph, 'error', 'Error', response.message);
                }
            },
            error: function (response) {
                utils.handlePageNotification('error', 'Error',
                    utils.generateErrorMessageFromStatusCode(response.readyState)
                );
            }
        });
    }

    /**
     * Run search method changing to query tasks
     */
    function onSearchByQueryRadioButtonClick() {
        runButton.prop('disabled', false);
        paragraphUtils.clearNotification(paragraph);
        timeRangeContainer.slideUp();
        primaryKeysContainer.slideUp();
        queryContainer.slideDown();
    }

    /**
     * Generate a table for the primary key search
     *
     * @param {Object[]} primaryKeys Key value pairs of the primary keys and the search values for each primary key
     */
    function generatePrimaryKeySearchTable(primaryKeys) {
        var primaryKeysTable = $('.primary-keys-table');
        var headerArray = ['Primary Key', 'Search Value'];
        var dataArray = [];
        for (var i = 0; i < primaryKeys.length; i++) {
            dataArray.push([
                '<span class="primary-key">' + primaryKeys[i].key + '</span>',
                '<input type="text" class="form-control primary-key-value" value="' + primaryKeys[i].value + '">'
            ]);
        }

        // Updating the UI
        var table = utils.generateListTable(
            headerArray, dataArray, { searching : false }
        );
        if (primaryKeysContainer.hasClass('collapse')) {
            primaryKeysContainer.slideUp(function() {
                primaryKeysTable.html(table);
                primaryKeysContainer.slideDown();
            });
        } else {
            primaryKeysTable.html(table);
            primaryKeysContainer.slideDown();
        }
        adjustRunButton();

        // Registering event listeners for the table
        table.find('.primary-key-value').keyup(function() {
            adjustRunButton();
        });
    }

    /**
     * Enable or disable the run button depending on whether the relevant requirements are met
     */
    function adjustRunButton() {
        runButton.prop('disabled', false);
        paragraph.find('.primary-key-value').each(function(index, element) {
            if(element.value.length == undefined ||
                element.value.length == 0) {
                runButton.prop('disabled', true);
            }
        });
    }
}   // End of InteractiveAnalyticsParagraphClient prototype constructor
