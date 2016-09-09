/**
 * Preprocessor paragraph client prototype
 *
 * @param paragraph The paragraph in which the client resides in
 * @constructor
 */
function PreprocessorParagraphClient(paragraph) {
    var self = this;

    self.initialize = function() {
        // Adding event receivers
        paragraph.find(".preprocessor-input.input-table").change(function() {
            loadPreprocessorParameters();
        });

        // Initializing paragraph
        new ParagraphUtils().loadTableNames(paragraph);
    };

    self.run = function(callback) {
        // TODO : run preprocessor paragraph
        var tableName = paragraph.find(".input-table").val();
        var features= [];
        var i=0;
        paragraph.find(".feature-details").each(function () {
            var feature = $(this);
            var feature_name = feature.find(".feature-include").val();
            var feature_include = false;
            if (feature.find(".feature-include").is(':checked')){
                feature_include = true;
            }
            var feature_type = feature.find(".feature-type").val();
            var impute_option = feature.find(".impute-option").val();
            var featureResponse = {name : feature_name , index : null , type : feature_type , imputeOption : impute_option,include : feature_include};

            i += 1;
            features.push(featureResponse);
        });
        $.ajax({
            type: "POST",
            data: JSON.stringify({ tableName : tableName , featureList : features }),
            url: constants.API_URI + "preprocessor/preprocess",
            success: function (data) {
                $.each(data, function (index, result) {
                        console.log(result);
                });
            }
        });

    };

    /**
     * Load preprocessor parameters table
     *
     * @private
     */
    var loadPreprocessorParameters = function() {
        var selectElement = paragraph.find(".preprocessor-input.input-table");
        var preprocessorTable = paragraph.find(".preprocessor-table > tbody");
        preprocessorTable.html("");
        $.ajax({
            type: "GET",
            url : constants.API_URI + "tables/" + selectElement.val() + "/columns",
            success: function (data) {
                $.each(data, function (index, columnName) {
                    preprocessorTable.append($('<tr class="feature-details">' +
                        '<td class="feature-name">' + columnName + '</td>'+
                        '<td>' + '<input type="checkbox" class="feature-include" value = "' + columnName + '">' +'</td>'+
                        '<td>' + '<select class="form-control feature-type"> ' +
                        '<option value = "NUMERICAL">Numerical</option>' +
                        '<option value = "CATEGORICAL">Categorical</option>'+
                        '</select>' + '</td>'+
                        '<td>' + '<select class="form-control impute-option"> ' +
                        '<option value = "DISCARD">Discard</option>' +
                        '<option value = "REPLACE_WITH_MEAN">Replace with mean</option>'+
                        '</select>' + '</td>'+
                        '</tr>'
                    ));
                });
            }
        });
        selectElement.closest(".source").find(".preprocessor-table").fadeIn();
    };

    /**
     * Generate select query for a table
     *
     * @param tableName {string} The table to select from
     * @param selectedColumns {string[]} The columns to select
     * @return {string} Query
     */
    var generateSelectColumnsQuery = function (tableName, selectedColumns) {
        var columnList='';
        for( var i=0;i< selectedColumns.length;i++){
            columnList+=selectedColumns[i];
            columnList+= ', ';
        }
        columnList= columnList.substring(0, columnList.length - 2);
        return 'SELECT ' + columnList + ' FROM '+ tableName;
    };
}
