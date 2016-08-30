var dataSourceDefinitionParagraph = {};

dataSourceDefinitionParagraph.onTypeSelect = function(selectElement) {
    var type;
    var url;
    var authHeader;
    switch (selectElement.val()) {
        case "Database" :
            type = "GET";
            url = "/tables";
            break;
        case "CSV File" :
            break;
    }
    $.ajax({
        type: type,
        url : constants.REST_API_URI + url,
        success: function(data) {
            var tablesSelectElement = selectElement.closest(".source").find(".data-source-table");
            tablesSelectElement.html($("<option disabled selected value> -- select an option -- </option>"));
            $.each(data, function(index, table) {
                 tablesSelectElement.append($("<option>" + table + "</option>"));
            });
            tablesSelectElement.parent().fadeIn();
        }
    });
};

dataSourceDefinitionParagraph.onTableChange = function(selectElement) {
    selectElement.closest(".source").find(".output-table").parent().fadeIn();
};

dataSourceDefinitionParagraph.onOutputTableKeyUp = function(inputElement) {
    if (inputElement.val().length != 0) {
//        sourceView.closest(".paragraph").find(".run").prop('disabled', false);
    } else {
//        sourceView.closest(".paragraph").find(".run").prop('disabled', true);
    }
};

dataSourceDefinitionParagraph.run = function(paragraph, callback) {
    // TODO : run data source definition paragraph
};
