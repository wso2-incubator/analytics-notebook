/**
 * Event simulation paragraph client prototype
 *
 * @param paragraph The paragraph in which the client resides in
 * @constructor
 */
function EventSimulationParagraphClientClient(paragraph) {
    var self = this;
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);

    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".input-table").focusin(function () {
            paragraphUtils.loadAvailableParagraphOutputsToInputElement($(event.target), 'table');
        });
    };

    self.run = function () {
        // TODO : run preprocessor paragraph
    };
}
