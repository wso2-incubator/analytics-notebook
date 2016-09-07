/**
 * Event receiver paragraph client prototype
 *
 * @param paragraph The paragraph in which the client resides in
 * @constructor
 */
function EventReceiverDefinitionParagraphClient(paragraph) {
    var self = this;

    self.initialize = function () {
        // Loading event receiver names into the  event receiver select element
        var eventReceiverSelectElement = $(paragraph).find(".event-receiver-name");
        $.ajax({
            type: "GET",
            url : constants.API_URI + "event-receivers",
            success: function(data) {
                eventReceiverSelectElement.html($("<option disabled selected value> -- select an option -- </option>"));
                $.each(data, function(index, eventReceiver) {
                    eventReceiverSelectElement.append($("<option>" + eventReceiver + "</option>"));
                });
            }
        });
    };

    self.run = function(callback) {
        // TODO : run data visualization paragraph
        callback();
    };
}
