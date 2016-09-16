/**
 * Prediction paragraph client prototype
 *
 * @param paragraph The paragraph in which the client resides in
 * @constructor
 */
function PredictionParagraphClient(paragraph) {
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);

    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".input-model").focusin(function () {
            paragraphUtils.loadAvailableParagraphOutputsToInputElement($(event.target), 'model');
        });
    };

    self.run = function (callback) {
        // TODO : run prediction paragraph
        callback("Test");
    };
}
