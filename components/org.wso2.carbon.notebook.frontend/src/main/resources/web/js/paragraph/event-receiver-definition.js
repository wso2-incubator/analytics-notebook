function loadEventReceiverNames(paragraph) {
    var eventReceiverSelectElement = $(paragraph).find(".event-receiver-name > select");
    $.ajax({
        type: "GET",
        url : "../notebook-support/event-receiver",
        success: function(data) {
            eventReceiverSelectElement.html($("<option disabled selected value> -- select an option -- </option>"));
            $.each(data, function(index, eventReceiver) {
                 eventReceiverSelectElement.append($("<option>" + eventReceiver + "</option>"));
            });
        }
    });
}

function runEventReceiverParagraph(paragraph, callback) {
    // TODO : run data visualization paragraph
    callback();
}