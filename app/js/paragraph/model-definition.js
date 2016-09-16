/**
 * Model definition paragraph client prototype
 *
 * @param paragraph {jQuery} The paragraph in which the client resides in
 * @constructor
 */
function ModelDefinitionParagraphClient(paragraph) {
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);

    /**
     * Initialize the model definition paragraph
     */
    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".input-table").focusin(function () {
            paragraphUtils.loadAvailableParagraphOutputsToInputElement('table');
        });
    };

    /**
     * Run the model definition paragraph
     *
     * @param callback {ParagraphClientRunCallback} The callback that will be called after running the paragraph
     */
    self.run = function (callback) {
        // TODO : run mode definition paragraph
        callback();
    };
}
