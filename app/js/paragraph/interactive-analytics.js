/**
 * Interactive analytics paragraph client prototype
 *
 * @param {jQuery} paragraph The paragraph in which the client resides in
 * @constructor
 */
function InteractiveAnalyticsParagraphClient(paragraph) {
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);
    var timeFrom;
    var timeTo;
    var searchByAndMaxResultCountContainer;
    var timeRangeContainer;
    var primaryKeysContainer;
    var queryContainer;

    self.type = constants.paragraphs.interactiveAnalytics.key;
    self.unsavedContentAvailable = false;

    /**
     * Initialize the interactive analytics paragraph
     * If content is passed into this the source content will be set from it
     *
     * @param {Object} [content] Source content of the paragraph encoded into an object
     */
    self.initialize = function(content) {
        searchByAndMaxResultCountContainer =
            paragraph.find('.search-by-container, .maximum-result-count-container');
        timeRangeContainer = paragraph.find('.time-range-container');
        primaryKeysContainer = paragraph.find('.primary-keys-container');
        queryContainer = paragraph.find('.query-container');

        paragraphUtils.loadTableNames(function() {
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
                                onSearchByPrimaryKeysRadioButtonClick();
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

        // Registering event listeners
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
                        var primaryKeysTable = $('.primary-keys-table');
                        var headerArray = ['Primary Key', 'Search Value'];
                        var dataArray = [];
                        var primaryKeys = response.primaryKeys;
                        for (var i = 0; i < primaryKeys.length; i++) {
                            dataArray.push([
                                '<span class="primary-key">' + primaryKeys[i] + '</span>',
                                '<input type="text" class="form-control primary-key-value">'
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
                    } else if (response.status == constants.response.NOT_LOGGED_IN) {
                        window.location.href = 'sign-in.html';
                    } else {
                        paragraphUtils.handleNotification('error', 'Error', response.message);
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
            timeRangeContainer.slideUp();
            primaryKeysContainer.slideUp();
            queryContainer.slideDown();
        }
    };

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
                                queryParameters.primaryKeys.push({
                                    key: primaryKeys.get(i).innerHTML,
                                    value: primaryKeyValues.get(i).value
                                });
                            }
                        }
                    } else if (searchMethod == 'query') {
                        queryParameters.query = paragraph.find('.query').val();
                    } else {
                        searchMethod = 'query';
                        queryParameters.query = '';
                    }

                    paragraphUtils.setOutput(utils.generateDataTableWithLazyLoading(
                        'POST',
                        constants.API_URI + 'interactive-analytics/' + searchMethod,
                        queryParameters,
                        columns,
                        paragraph.find('.maximum-result-count').val()
                    ));
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = 'sign-in.html';
                } else {
                    paragraphUtils.handleNotification('error', 'Error', response.message);
                }
                utils.hideLoadingOverlay(paragraph);
            },
            error: function(response) {
                paragraphUtils.handleNotification(
                    'error', 'Error', utils.generateErrorMessageFromStatusCode(response.readyState)
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
                    case 'query' :
                        var query = paragraph.find('.query').val();
                        if (query != undefined) {
                            content.query = query;
                        }
                        break;
                    case 'time-range' :
                        if (timeFrom != undefined && timeTo != undefined) {
                            content.timeFrom = timeFrom;
                            content.timeTo = timeTo;
                        }
                        break;
                }
            }
        }
        return content;
    };
}   // End of InteractiveAnalyticsParagraphClient prototype constructor
