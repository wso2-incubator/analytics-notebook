var preprocessorParagraph = {};

preprocessorParagraph.loadPreprocessorParameters = function(selectElement) {
    var preprocessorTable = selectElement.closest(".source").find(".preprocessor-table > tbody");
    preprocessorTable.html("");
    $.ajax({
        type: "GET",
        url : constants.API_URI + "tables/" + selectElement.val() + "/columns",
        success: function (data) {
            $.each(data, function (index, columnName) {
                preprocessorTable.append($("<tr>" +
                    '<td>' + columnName + '</td>'+
                    '<td>' + '<input type="checkbox" class="include-column" value = "' + columnName + '">' +'</td>'+
                    '<td>' + '<select class="form-control"> ' +
                    '<option>Discard</option>' +
                    '<option>Replace with mean</option>'+
                    '<option>Regression Imputation</option>'+
                    '</select>' + '</td>'+
                    '</tr>'
                    ));
            });
        }
    });
    selectElement.closest(".source").find(".preprocessor-table").fadeIn();
};

preprocessorParagraph.run = function(paragraph, callback) {
    // TODO : run preprocessor paragraph
    var selectedColumns = [];
    paragraph.find(".include-column").each(function () {
        if (this.checked){
            var columnName = $(this).val();
            selectedColumns.push(columnName);
        }
        });
    var tableName = paragraph.find(".input-table").val();
    var tempTableName = tableName.toLowerCase();
    var selectColumnsQuery = preprocessorParagraph.selectCoulmns(tableName, selectedColumns);
    console.log(selectColumnsQuery);
    
};

preprocessorParagraph.selectCoulmns = function (tableName , selectedColumns) {
    var columnList='';
    for( var i=0;i< selectedColumns.length;i++){
        columnList+=selectedColumns[i];
        columnList+= ', ';
    }
    columnList= columnList.substring(0, columnList.length - 2);
    var selectColumnsQuery = 'SELECT ' + columnList + ' FROM '+ tableName;
    return selectColumnsQuery;
    
}
