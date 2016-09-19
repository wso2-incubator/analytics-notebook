/**
 * Real time analytics paragraph client prototype constructor
 *
 * @param paragraph {jQuery} The paragraph in which the client resides in
 * @constructor
 */
function RealTimeAnalyticsParagraphClient(paragraph) {
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);

    /**
     * Initialize the real time analytics paragraph
     */
    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".input-table").focusin(function () {
            paragraphUtils.loadAvailableParagraphOutputsToInputElement('stream');
        });
    };

    /**
     * Run the real time analytics paragraph
     *
     * @param callback {ParagraphClientRunCallback} The callback that will be called after running the paragraph
     */
    self.run = function (callback) {
        // TODO : run real time analytics paragraph
        callback("Test");
    };
}
