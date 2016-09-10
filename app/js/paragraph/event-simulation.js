/**
 * Event simulation paragraph client prototype
 *
 * @param paragraph The paragraph in which the client resides in
 * @constructor
 */
function EventSimulationParagraphClientClient(paragraph) {
    var self = this;

    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".input-table").focusin(function() {
            new ParagraphUtils().loadAvailableParagraphOutputsToInputElement($(event.target) ,'table');
        });
    };

    self.run = function() {
        // TODO : run org.wso2.carbon.notebook.core.preprocessor paragraph
    };
}
