/**
 * Event simulation paragraph client prototype
 *
 * @param paragraph {jQuery} The paragraph in which the client resides in
 * @constructor
 */
function EventSimulationParagraphClientClient(paragraph) {
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);

    /**
     * Initialize the event simulation paragraph
     */
    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".input-table").focusin(function () {
            paragraphUtils.loadAvailableParagraphOutputsToInputElement('table');
        });
    };

    /**
     * Run the event simulation paragraph
     *
     * @param callback {ParagraphClientRunCallback} The callback that will be called after running the paragraph
     */
    self.run = function (callback) {
        // TODO : run preprocessor paragraph
    };
}
