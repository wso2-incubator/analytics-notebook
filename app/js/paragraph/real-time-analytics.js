/**
 * Real time analytics paragraph client prototype
 *
 * @param paragraph The paragraph in which the client resides in
 * @constructor
 */
function RealTimeAnalyticsParagraphClient(paragraph) {
    var self = this;

    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".input-table").focusin(function () {
            new ParagraphUtils().loadAvailableParagraphOutputsToInputElement($(event.target), 'stream');
        });
    };

    self.run = function (callback) {
        // TODO : run real time analytics paragraph
        callback("Test");
    };
}
