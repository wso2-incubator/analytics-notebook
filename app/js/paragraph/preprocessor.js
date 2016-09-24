/**
 * Preprocessor paragraph client prototype
 *
 * @param {jQuery} paragraph The paragraph in which the client resides in
 * @constructor
 */
function PreprocessorParagraphClient(paragraph) {
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);
    var table;

    self.type = constants.paragraphs.preprocessor.key;
    self.unsavedContentAvailable = false;

    /**
     * Initialize the preprocessor paragraph
     * If content is passed into this the source content will be set from it
     *
     * @param {Object} [content] Source content of the paragraph encoded into an object
     */
    self.initialize = function(content) {
        paragraphUtils.loadTableNames(function() {
            // Load source content
            if (content != undefined) {
                // Loading the source content from the content object provided
                if (content.inputTable != undefined) {
                    paragraph.find('.input-table').val(content.inputTable);
                    displayOutputTableContainer();
                    loadPreprocessorTable(function() {
                        if (content.features != undefined) {
                            table.find('tbody > tr').each(function(index) {
                                var feature = $(this);
                                if (content.features[index].include == true) {
                                    feature.find('.feature-include').prop('checked', true);
                                } else {
                                    feature.find('.feature-include').prop('checked', false);
                                }
                                feature.find('.feature-type').val(content.features[index].type);
                                feature.find('.impute-option').val(content.features[index].imputeOption);

                            });
                        }
                        adjustRunButton();
                    });
                    if (content.outputTable != undefined) {
                        paragraph.find('.output-table').val(content.outputTable);
                        adjustRunButton();
                    }

                }
            }
        });

        // Registering event listeners
        paragraph.find('.preprocessor-input.input-table').change(function() {
            self.unsavedContentAvailable = true;
            displayOutputTableContainer();
            loadPreprocessorTable();
        });

        paragraph.find('.output-table').focusout(function() {
            //generate alert message
            var newTableName = $(paragraph.find('.output-table')).val().toUpperCase();
            paragraph.find('.input-table > option').each(function(index, option) {
                var existingTable = $(option).html();
                if (newTableName == existingTable) {
                    var alertContainer = paragraph.find('.preprocessor-alert');
                    var alertMessage =
                        'Table ' + existingTable + ' already exists.' +
                        'Pre-processing will append the table';
                    var alert = utils.generateAlertMessage('info', 'Alert', alertMessage);
                    alertContainer.html(alert);
                    alertContainer.addClass('collapse');
                    alertContainer.slideDown();
                }
            });
        });

        paragraph.find('.output-table').focusin(function() {
            var alert = paragraph.find('.preprocessor-alert').children().first();
            alert.slideUp(function() {
                alert.remove();
            });
        });

        /**
         * Generate the output table container when the input table is change
         *
         * @private
         */
        function displayOutputTableContainer() {
            var outputTableContainer = paragraph.find('.output-table-container');
            outputTableContainer.slideDown();

        }
    };

    /**
     * Run the preprocessor paragraph
     *
     * @param {Object[]} [paragraphsLeftToRun] The array of paragraphs left to be run in run all paragraphs task
     */
    self.run = function(paragraphsLeftToRun) {
        var tableName = paragraph.find('.input-table').val();
        var preprocessedTableName = paragraph.find('.output-table').val();
        var features = [];
        var output;

        table.find('tbody > tr').each(function() {
            var feature = $(this);
            var feature_name = feature.find('.feature-include').val();
            var feature_include = false;
            if (feature.find('.feature-include').is(':checked')) {
                feature_include = true;
            }
            var feature_type = feature.find('.feature-type').val();
            var impute_option = feature.find('.impute-option').val();
            var featureResponse = {
                name: feature_name,
                index: null,
                type: feature_type,
                imputeOption: impute_option,
                include: feature_include
            };
            features.push(featureResponse);
        });

        // Running the preprocessor on the selected table using selected parameters
        utils.showLoadingOverlay(paragraph);
        $.ajax({
            type: 'POST',
            data: JSON.stringify({
                tableName: tableName,
                preprocessedTableName: preprocessedTableName,
                featureList: features
            }),
            url: constants.API_URI + 'preprocessor/preprocess',
            success: function(response) {
                if (response.status == constants.response.SUCCESS) {
                    output = $('<p><strong> Successful: </strong>' + tableName +
                        ' was successfully preprocessed and saved to table ' +
                        preprocessedTableName + '</p>');
                    paragraphUtils.setOutput(output);
                    paragraphUtils.runNextParagraphForRunAllTask(paragraphsLeftToRun);
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
            var outputTable = paragraph.find('.output-table').val();
            if (outputTable != undefined) {
                content.outputTable = outputTable;
            }

            var features = [];
            table.find('tbody > tr').each(function() {
                var feature = $(this);
                var feature_name = feature.find('.feature-include').val();
                var feature_include = false;
                if (feature.find('.feature-include').is(':checked')) {
                    feature_include = true;
                }
                var feature_type = feature.find('.feature-type').val();
                var impute_option = feature.find('.impute-option').val();
                var featureObject = {
                    name: feature_name,
                    type: feature_type,
                    imputeOption: impute_option,
                    include: feature_include
                };
                features.push(featureObject);
            });
            content.features = features;
        }
        console.log(content);
        return content;
    };

    /**
     * Callback function for loading preprocessor parameters
     *
     * @callback LoadPreprocessorTableCallback
     */

    /**
     * Load preprocessor parameters table
     *
     * @private
     * @param {LoadPreprocessorTableCallback} callback callback to be called after loading the parameters
     */
    function loadPreprocessorTable(callback) {
        // Showing the output table element
        paragraph.find('.output-table-container').slideDown();

        // Loading preprocessor parameters table
        var selectElement = paragraph.find('.preprocessor-input.input-table');
        var preprocessorTableContainer = paragraph.find('.preprocessor-table');
        var preprocessorTable = preprocessorTableContainer.find('.preprocessor-table > tbody');
        preprocessorTable.empty();
        utils.showLoadingOverlay(paragraph);
        $.ajax({
            type: 'GET',
            url: constants.API_URI + 'preprocessor/' + selectElement.val(),
            success: function(response) {
                if (response.status == constants.response.SUCCESS) {
                    var headerArray = ['Attribute', 'Include', 'Type', 'Impute'];
                    var tableData = [];
                    $.each(response.columnList, function(columnName, type) {
                        var row = [
                            '<span class="feature-name">' + columnName + '</span>',
                            '<label class="checkbox">' +
                                '<input type="checkbox" class="feature-include" value="' + columnName + '">' +
                                '<span class="helper"></span>' +
                            '</label>'
                        ];

                        var typeColumn =
                            '<select class="form-control feature-type">' +
                                '<option value="CATEGORICAL">Categorical</option>';
                        var imputeColumn =
                            '<select class="form-control impute-option">' +
                                '<option value="DISCARD">Discard</option>';
                        if (type == constants.feature.NUMERICAL) {
                            typeColumn += '<option value="NUMERICAL">Numerical</option>';
                            imputeColumn +=
                                '<option value="REPLACE_WITH_MEAN">Replace with mean</option>';
                        }
                        typeColumn += '</select>';
                        imputeColumn += '</select>';

                        row.push(typeColumn);
                        row.push(imputeColumn);
                        tableData.push(row);
                    });

                    table = utils.generateListTable(headerArray, tableData);
                    preprocessorTableContainer.slideUp(function() {
                        preprocessorTableContainer.html(table);
                        if (callback != undefined) {
                            callback();
                        }
                        preprocessorTableContainer.slideDown();

                        paragraph.find('.feature-include').click(function() {
                            self.unsavedContentAvailable = true;
                            adjustRunButton();
                        });
                        paragraphUtils.clearNotification();

                        paragraph.find('.output-table').keyup(function() {
                            self.unsavedContentAvailable = true;
                            adjustRunButton();
                        });
                    });
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = 'sign-in.html';
                } else {
                    paragraphUtils.clearNotification();
                    clearPreprocessorParameters();
                    paragraphUtils.handleNotification('error', 'Error', response.message);
                }
                utils.hideLoadingOverlay(paragraph);
            },
            error: function(response) {
                clearPreprocessorParameters();
                paragraphUtils.handleNotification(
                    'error', 'Error', utils.generateErrorMessageFromStatusCode(response.readyState)
                );
                utils.hideLoadingOverlay(paragraph);
            }
        });
        selectElement.closest('.source').find('.preprocessor-table').slideDown();

        /**
         * Clear preprocessor parameters table
         *
         * @private
         */
        function clearPreprocessorParameters() {
            var preprocessorTableContainer = paragraph.find('.preprocessor-table');
            preprocessorTableContainer.slideUp(function() {
                preprocessorTableContainer.empty();
            });
        }
    }

    /**
     * Activate the run button when features are selected and
     * a output table name is set
     *
     * @private
     */
    function adjustRunButton() {
        var runButton = paragraph.find('.run-paragraph-button');
        if (paragraph.find('.feature-include:checked').size() > 0 &&
                $(paragraph.find('.output-table')).val().length > 0) {
            runButton.prop('disabled', false);
        } else {
            runButton.prop('disabled', true);
        }
        paragraphUtils.clearNotification();
    }
}   // End of PreprocessorParagraphClient prototype constructor
