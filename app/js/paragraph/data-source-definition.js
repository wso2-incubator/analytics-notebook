/**
 * Data source definition paragraph client prototype
 *
 * @param paragraph {jQuery} The paragraph in which the client resides in
 * @constructor
 */
function DataSourceDefinitionParagraphClient(paragraph) {
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);

    /**
     * Initialize the data source definition paragraph
     */
    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".data-source-type").change(function () {
            switch (paragraph.find(".data-source-type").val()) {
                case "Database" :
                    paragraphUtils.loadTableNames();
                    break;
                case "CSV File" :
                    break;
            }
            paragraph.find(".input-table-container").slideDown();
        });

        paragraph.find(".input-table").change(function () {
            paragraph.find(".output-table-container").slideDown();
        });

        paragraph.find(".output-table").keyup(function () {
            var inputElement = paragraph.find(".output-table");
            if (inputElement.val().length != 0) {
                paragraph.find(".run-paragraph-button").prop('disabled', false);
            } else {
                paragraph.find(".run-paragraph-button").prop('disabled', true);
            }
        });
    };

    /**
     * Initialize the data source definition paragraph
     *
     * @param callback {ParagraphClientRunCallback} The callback that will be called after running the paragraph
     */
    self.run = function (callback) {
        // TODO : run data source definition paragraph
    };
}
