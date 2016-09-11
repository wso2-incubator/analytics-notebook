/**ajax
 * Data visualization paragraph client prototype
 *
 * @param paragraph The paragraph in which the client resides in
 * @constructor
 */
function DataVisualizationParagraphClient(paragraph) {
    var self = this;

    self.initialize = function () {
        // Adding event listeners
        paragraph.find(".input-table").focusin(function() {
            new ParagraphUtils().loadAvailableParagraphOutputsToInputElement($(event.target) ,'table');
        });
    };

    self.run = function(callback) {
        // TODO : run data visualization paragraph
        var mockChart = $('<img src="images/line-chart.jpeg" style="width:300px; height:250px;">');
        callback(mockChart);
    };
}
