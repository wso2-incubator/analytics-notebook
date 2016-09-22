/**
 * Preprocessor paragraph client prototype
 *
 * @param paragraph {jQuery} The paragraph in which the client resides in
 * @constructor
 */
function PreprocessorParagraphClient(paragraph) {
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);
    var table;

    /**
     * Initialize the preprocessor paragraph
     */
    self.initialize = function () {
        // Adding event receivers
        paragraph.find(".preprocessor-input.input-table").change(function () {
            loadPreprocessorParameters();
        });

        // Initializing paragraph
        paragraphUtils.loadTableNames();
    };

    /**
     * Run the preprocessor paragraph
     *
     * @param callback {ParagraphClientRunCallback} The callback that will be called after running the paragraph
     */
    self.run = function (callback) {
        // TODO : run preprocessor paragraph
        var tableName = paragraph.find(".input-table").val();
        var preprocessedTableName = paragraph.find(".output-table").val();
        var features = [];
        var output;
        var data;
        var headerArray = [];
        table.find("tbody > tr").each(function () {
            var feature = $(this);
            var feature_name = feature.find(".feature-include").val();
            var feature_include = false;
            if (feature.find(".feature-include").is(':checked')) {
                feature_include = true;
            }
            var feature_type = feature.find(".feature-type").val();
            var impute_option = feature.find(".impute-option").val();
            var featureResponse = {
                name: feature_name,
                index: null,
                type: feature_type,
                imputeOption: impute_option,
                include: feature_include
            };
            features.push(featureResponse);
        });
        utils.showLoadingOverlay(paragraph);
        $.ajax({
            type: "POST",
            data: JSON.stringify({tableName: tableName, preprocessedTableName : preprocessedTableName , featureList: features}),
            url: constants.API_URI + "preprocessor/preprocess",
            success: function (response) {
                if (response.status == constants.response.SUCCESS) {
                    $.each(response, function (index, result) {
                        if (index == "headerArray") {
                            headerArray = result;
                        }
                        else if (index == "resultList") {
                            data = result;
                        }
                    });
                    output = utils.generateDataTable(headerArray, data);
                    callback(output);
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = "sign-in.html";
                } else {
                    paragraphUtils.handleNotification("error", "Error", response.message);
                }
                utils.hideLoadingOverlay(paragraph);
            },
            error: function (response) {
                paragraphUtils.handleNotification(
                    "error", "Error", utils.generateErrorMessageFromStatusCode(response.readyState)
                );
                utils.hideLoadingOverlay(paragraph);
            }
        });
    };

    /**
     * Load preprocessor parameters table
     *
     * @private
     */
    function loadPreprocessorParameters() {
        var selectElement = paragraph.find(".preprocessor-input.input-table");
        var preprocessorTableContainer = paragraph.find(".preprocessor-table");
        var preprocessorTable = preprocessorTableContainer.find(".preprocessor-table > tbody");
        preprocessorTable.empty();
        utils.showLoadingOverlay(paragraph);
        $.ajax({
            type: "GET",
            url: constants.API_URI + "preprocessor/" + selectElement.val(),
            success: function (response) {
                if (response.status == constants.response.SUCCESS) {
                    var headerArray = ["Attribute", "Include", "Type", "Impute"];
                    var tableData = [];
                    $.each(response.columnList, function (columnName, type) {
                        var row = [
                            "<span class='feature-name'>" + columnName + "</span>",
                            "<label class='checkbox'>" +
                            "<input type='checkbox' class='feature-include' value='" + columnName + "'>" +
                            "<span class='helper'></span>" +
                            "</label>"
                        ];

                        if (type == constants.feature.CATEGORICAL) {
                            row.push("<select class='form-control feature-type'>" +
                                "<option value='CATEGORICAL'>Categorical</option>" +
                                "</select>");
                            row.push(
                                "<select class='form-control impute-option'>" +
                                "<option value='DISCARD'>Discard</option>" +
                                "</select>");

                        }
                        else {
                            row.push("<select class='form-control feature-type'>" +
                                "<option value='NUMERICAL'>Numerical</option>" +
                                "<option value='CATEGORICAL'>Categorical</option>" +
                                "</select>");
                            row.push(
                                "<select class='form-control impute-option'>" +
                                "<option value='DISCARD'>Discard</option>" +
                                "<option value='REPLACE_WITH_MEAN'>Replace with mean</option>" +
                                "</select>");
                        }
                        tableData.push(row);


                    });

                    table = utils.generateListTable(headerArray, tableData);
                    preprocessorTableContainer.slideUp(function () {
                        preprocessorTableContainer.html(table);
                        preprocessorTableContainer.slideDown();

                        paragraph.find(".feature-include").click(function () {
                            adjustRunButton();
                        });
                        paragraphUtils.clearNotification();

                        paragraph.find(".output-table").keyup(function () {
                            adjustRunButton();
                        });

                        function adjustRunButton() {
                            var runButton = paragraph.find(".run-paragraph-button");
                            if (paragraph.find('.feature-include:checked').size() > 0 && $(paragraph.find('.output-table')).val().length > 0) {
                                runButton.prop('disabled', false);
                            } else {
                                runButton.prop('disabled', true);
                            }
                            paragraphUtils.clearNotification();
                        }

                        paragraph.find(".output-table").focusout(function () {
                            var newTableName = $(paragraph.find(".output-table")).val();
                            paragraph.find(".input-table > option").each(function () {
                                var existingTable = $(this).html();
                                if (newTableName == existingTable) {
                                    paragraph.find(".preprocessor-alert").html(
                                        utils.generateAlertMessage("info", "Alert", "The existing table will be append with new data")
                                    );
                                }
                            });

                        });
                    });

                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = "sign-in.html";
                } else {
                    paragraphUtils.clearNotification();
                    clearPreprocessorParameters();
                    paragraphUtils.handleNotification("error", "Error", response.message);
                }
                utils.hideLoadingOverlay(paragraph);
            },
            error: function (response) {
                clearPreprocessorParameters();
                paragraphUtils.handleNotification(
                    "error", "Error", utils.generateErrorMessageFromStatusCode(response.readyState)
                );
                utils.hideLoadingOverlay(paragraph);
            }
        });
        selectElement.closest(".source").find(".preprocessor-table").slideDown();
    }

    /**
     * Clear preprocessor parameters table
     *
     * @private
     */
    function clearPreprocessorParameters() {
        var preprocessorTableContainer = paragraph.find(".preprocessor-table");
        preprocessorTableContainer.slideUp(function () {
            preprocessorTableContainer.empty();
        });
    }

}
