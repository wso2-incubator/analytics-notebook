var preprocessorParagraph = {};

preprocessorParagraph.init = function(paragraph) {
    var inputTableSelectElement = paragraph.find(".preprocessor-input.input-table");
    $.ajax({
        type: "GET",
        url : constants.API_URI + "tables",
        success: function(data) {
            inputTableSelectElement.html($("<option disabled selected value> -- select an option -- </option>"));
            $.each(data, function(index, table) {
                inputTableSelectElement.append($("<option>" + table + "</option>"));
            });
        }
    });
    $(paragraph).closest(".source").find(".table-name").fadeIn();
};

preprocessorParagraph.loadPreprocessorParameters = function(selectElement) {
    var preprocessorTable = selectElement.closest(".source").find(".preprocessor-table > tbody");
    preprocessorTable.html("");
    $.ajax({
        type: "GET",
        url : constants.API_URI + "tables/" + selectElement.val() + "/columns",
        success: function (data) {
            $.each(data, function (index, columnName) {
                preprocessorTable.append($("<tr>" +
                    "<td>" + columnName + "</td>"+
                    "<td>" + '<input type="checkbox">' +"</td>"+
                    "<td>" + '<select class="form-control"> <option>Discard</option> <option>Average</option></select>' + "</td>"+
                    "</tr>"
                    ));
            });
        }
    });
    selectElement.closest(".source").find(".preprocessor-table").fadeIn();
};

preprocessorParagraph.run = function(paragraph, callback) {
    // TODO : run preprocessor paragraph
    callback("Test");
};
