/**
 * Prediction paragraph client prototype
 *
 * @param paragraph The paragraph in which the client resides in
 * @constructor
 */
function PredictionParagraphClient(paragraph) {
    var self = this;

    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".input-model").focusin(function () {
            new ParagraphUtils().loadAvailableParagraphOutputsToInputElement($(event.target), 'model');
        });
    };

    self.run = function (callback) {
        // TODO : run prediction paragraph
        callback("Test");
    };
}
