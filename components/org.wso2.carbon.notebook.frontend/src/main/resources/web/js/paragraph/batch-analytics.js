var batchAnalyticsParagraph = {};

batchAnalyticsParagraph.run = function(paragraph, callback) {
    // TODO : run batch analytics paragraph
    var query = paragraph.find(".query");
    $.ajax({
        type: "POST",
        data: JSON.stringify({ query : query.val() }),
        url : constants.API_URI + "batch-analytics/execute-script",
        success: function (data) {
            console.log(data);
            $.each(data, function (index, result)  {
                console.log(result);
            });
        }
    });
    callback("Test");
};
