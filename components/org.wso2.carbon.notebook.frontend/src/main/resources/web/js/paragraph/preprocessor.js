function runPreprocessorParagraph(paragraph) {
    // TODO : run preprocessor paragraph

}

function loadTableNames(paragraph) {
    var inputTableSelectElement= $(paragraph).find(".input-table > select");
    $.ajax({
        type: "GET",
        url : constants.REST_API_URI + "/tables",
        success: function(data) {
            inputTableSelectElement.html($("<option disabled selected value> -- select an option -- </option>"));
            $.each(data, function(index, table) {
                inputTableSelectElement.append($("<option>" + table + "</option>"));
            });
        }
    });
    $(paragraph).closest(".source").find(".table-name").fadeIn();
}

function loadPreprocessorParameters(selectedElement) {
    var preprocessorTable = $(selectedElement).closest(".source").find(".preprocessor-table > tbody");
    preprocessorTable.html("");
    $.ajax({
        type: "GET",
        url : constants.REST_API_URI + "/tables/columns/" + selectedElement.value,
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
    $(selectedElement).closest(".source").find(".preprocessor-table").fadeIn();
}
