/**
 * Prediction paragraph client prototype constructor
 *
 * @param paragraph {jQuery} The paragraph in which the client resides in
 * @constructor
 */
function PredictionParagraphClient(paragraph) {
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);

    /**
     * Initialize the prediction paragraph
     */
    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".input-model").focusin(function () {
            paragraphUtils.loadAvailableParagraphOutputsToInputElement('model');
        });
    };

    /**
     * Run the prediction paragraph
     *
     * @param callback {ParagraphClientRunCallback} The callback that will be called after running the paragraph
     */
    self.run = function (callback) {
        // TODO : run prediction paragraph
        callback("Test");
    };
}
