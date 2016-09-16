/**
 * Real time analytics paragraph client prototype
 *
 * @param paragraph The paragraph in which the client resides in
 * @constructor
 */
function RealTimeAnalyticsParagraphClient(paragraph) {
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);

    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".input-table").focusin(function () {
            paragraphUtils.loadAvailableParagraphOutputsToInputElement($(event.target), 'stream');
        });
    };

    self.run = function (callback) {
        // TODO : run real time analytics paragraph
        callback("Test");
    };
}
