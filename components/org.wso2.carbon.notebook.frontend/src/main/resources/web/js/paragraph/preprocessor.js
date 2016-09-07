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
        var selectedColumns = [];
        paragraph.find(".include-column").each(function () {
            if (this.checked){
                var columnName = $(this).val();
                selectedColumns.push(columnName);
            }
        });
        var tableName = paragraph.find(".input-table").val();
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
                    preprocessorTable.append($("<tr>" +
                        '<td>' + columnName + '</td>'+
                        '<td>' + '<input type="checkbox" class="include-column" value = "' + columnName + '">' +'</td>'+
                        '<td>' + '<select class="form-control"> ' +
                        '<option>Discard</option>' +
                        '<option>Replace with mean</option>'+
                        '<option>Regression Imputation</option>'+
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
