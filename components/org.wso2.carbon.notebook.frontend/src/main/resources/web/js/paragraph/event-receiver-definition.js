var eventReceiverDefinitionParagraph = {};

eventReceiverDefinitionParagraph.init(paragraph, callback) {
    // Loading event receiver names into the  event receiver select element
    var eventReceiverSelectElement = $(paragraph).find(".event-receiver-name");
    $.ajax({
        type: "GET",
        url : constants.REST_API_URI + "/event-receivers",
        success: function(data) {
            eventReceiverSelectElement.html($("<option disabled selected value> -- select an option -- </option>"));
            $.each(data, function(index, eventReceiver) {
                 eventReceiverSelectElement.append($("<option>" + eventReceiver + "</option>"));
            });
        }
    });
};

eventReceiverDefinitionParagraph.run = function(paragraph, callback) {
    // TODO : run data visualization paragraph
    callback();
};
