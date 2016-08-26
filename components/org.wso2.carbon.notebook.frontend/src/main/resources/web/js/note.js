var serverURI = "../";

// Events for the note
function onRunAllParagraphsButtonClick() {
    // Looping through the paragraphs and running them
    $(".paragraph").each(function(index, paragraph) {
        runParagraph($(paragraph));
    });
}

function onToggleAllSourceViewsButtonClick() {
    toggleVisibilityOfMultipleViews("source");
}

function onToggleAllOutputViewsButtonClick() {
    toggleVisibilityOfMultipleViews("output");
}

function toggleVisibilityOfMultipleViews(type) {
    var toggleAllSourceOrOutputViewsButton = $("#toggle-all-" + type + "-views");
    var toggleSourceOrOutputViewButton = $(".toggle-" + type + "-view");
    if (toggleAllSourceOrOutputViewsButton.html().indexOf("Show") != -1) {
        toggleAllSourceOrOutputViewsButton.html(
            toggleAllSourceOrOutputViewsButton.html().replace("Show", "Hide")
        );
        toggleSourceOrOutputViewButton.html(
            toggleSourceOrOutputViewButton.html().replace("Show", "Hide")
        );
        $("." + type).slideDown();
    } else {
        toggleAllSourceOrOutputViewsButton.html(
            toggleAllSourceOrOutputViewsButton.html().replace("Hide", "Show")
        );
        toggleSourceOrOutputViewButton.html(
            toggleSourceOrOutputViewButton.html().replace("Hide", "Show")
        );
        $("." + type).slideUp();
    }
}

function onAddParagraphButtonClick() {
    var paragraph = $("<div class='paragraph well fluid-container'>");
    paragraph.css({ display : "none" });
    paragraph.load('paragraph.html', function() {
        $("#paragraphs").append(paragraph);
        paragraph.slideDown();
    });
}

function onDeleteNoteButtonClick() {
    // TODO : send the request to delete the note to the notebook server
}

// Event functions for individual paragraphs
function onRunParagraphButtonClick(runButton) {
    runParagraph($(runButton).closest(".paragraph"));
}

function runParagraph(paragraph) {  // TODO : This method needs to be changed after deciding on the architecture
    var paragraphType = paragraph.find("select[name='paragraph-type']").val();
    var outputView = paragraph.find(".output");
    var runParagraphTask = function() { // The function for running the run paragraph task
        var newOutputView = $("<div class='output fluid-container' style='display: none;'>");
        var callbackFunction = function(output) {
            newOutputView.append($("<p>Output</p>"));

            var outputViewContent = $("<div class='row'>");   // TODO : modify this line after the server side REST API is connected
            outputViewContent.append(output);
            newOutputView.append(outputViewContent);
            paragraph.find(".paragraph-content").append(newOutputView);

            newOutputView.slideDown();
            paragraph.find(".toggle-output-view").prop('disabled', false);
        };
        switch (paragraphType) {
            case "Data Source Definition" :
                runDataSourceDefinitionParagraph(paragraph);
                break;
            case "Preprocessor" :
                runPreprocessorParagraph(paragraph);
                break;
            case "Data Visualization" :
                runDataVisualizationParagraph(paragraph, callbackFunction);
                break;
            case "Batch Analytics" :
                runBatchAnalyticsParagraph(paragraph, callbackFunction);
                break;
            case "Interactive Analytics" :
                runInteractiveAnalyticsParagraph(paragraph, callbackFunction);
                break;
            case "Event Receiver Definition" :
                runEventReceiverParagraph(paragraph, callbackFunction);
                break;
            case "Real Time Analytics" :
                runRealTimeAnalyticsParagraph(paragraph, callbackFunction);
                break;
            case "Model Definition" :
                runModelDefinitionParagraph(paragraph, callbackFunction);
                break;
            case "Prediction" :
                runPredictionParagraph(paragraph, callbackFunction);
                break;
            case "Event Simulation":
                runEvenSimulationParagraph(paragraph,callbackFunction);
                break;
            case "Custom" :
                runCustomParagraph(paragraph, callbackFunction);
                break;
        }
    };
    if (outputView.length > 0) {
        outputView.slideUp(function() {
            outputView.remove();
            runParagraphTask();
        });
    } else {
        runParagraphTask();
    }
}

function onToggleSourceViewButtonClick(toggleButton) {
    toggleVisibilityOfSingleView(toggleButton, "source");
}

function onToggleOutputViewButtonClick(toggleButton) {
    toggleVisibilityOfSingleView(toggleButton, "output");
}

function toggleVisibilityOfSingleView(toggleButton, type) {
    toggleButton = $(toggleButton);
    var view = toggleButton.closest(".paragraph").find("." + type);
    var toggleButtonInnerHTML = toggleButton.html();
    if (toggleButton.html().indexOf("Show") != -1) {
        toggleButtonInnerHTML = toggleButtonInnerHTML.replace("Show", "Hide");
        view.slideDown();
    } else {
        toggleButtonInnerHTML = toggleButtonInnerHTML.replace("Hide", "Show");
        view.slideUp();
    }
    toggleButton.html(toggleButtonInnerHTML);
}

function onDeleteParagraph(deleteButton) {
    // TODO : send the relevant query to the notebook server to delete
    var paragraph = $(deleteButton).closest(".paragraph");
    paragraph.slideUp(function() {
        paragraph.remove();
    });
}

function onParagraphTypeSelect(selectElement) {
    var paragraph = $(selectElement).closest(".paragraph");
    var paragraphContent = paragraph.find(".paragraph-content");
    paragraphContent.slideUp(function() {
        paragraphContent.children().remove();

        var sourceViewContent = $("<div>");
        var paragraphTemplateLink;
        var initParagraphTask;
        switch ($(selectElement).val()) {
            case "Data Source Definition" :
                paragraphTemplateLink = "paragraph-templates/data-source-definition.html";
                break;
            case "Preprocessor" :
                paragraphTemplateLink = "paragraph-templates/preprocessor.html";
                break;
            case "Data Visualization" :
                paragraphTemplateLink = "paragraph-templates/data-visualization.html";
                break;
            case "Batch Analytics" :
                paragraphTemplateLink = "paragraph-templates/batch-analytics.html";
                break;
            case "Interactive Analytics" :
                paragraphTemplateLink = "paragraph-templates/interactive-analytics.html";
                break;
            case "Event Receiver Definition" :
                paragraphTemplateLink = "paragraph-templates/event-receiver-definition.html";
                initParagraphTask = function() {
                    loadEventReceiverNames(paragraph);
                };
                break;
            case "Real Time Analytics" :
                paragraphTemplateLink = "paragraph-templates/real-time-analytics.html";
                break;
            case "Model Definition" :
                paragraphTemplateLink = "paragraph-templates/model-definition.html";
                break;
            case "Prediction" :
                paragraphTemplateLink = "paragraph-templates/prediction.html";
                break;
            case "Event Simulation" :
                paragraphTemplateLink = "paragraph-templates/event-simulation.html";
                break;
            case "Custom" :
                paragraphTemplateLink = "paragraph-templates/custom.html";
                break;
        }
        sourceViewContent.load(paragraphTemplateLink, function() {
            var sourceView = $("<div class='source fluid-container'>");
            sourceView.append($("<p>Source</p>"));
            sourceView.append(sourceViewContent);
            paragraphContent.append(sourceView);
            paragraphContent.slideDown();

            // paragraph.find(".run").prop('disabled', true);
            paragraph.find(".toggle-source-view").prop('disabled', false);
            paragraph.find(".toggle-output-view").prop('disabled', true);

            if (initParagraphTask != undefined) {
                initParagraphTask();
            }
        });
    });
}

function loadAvailableParagraphOutputsToInputElement(selectElement, type) {
    var inputSelectElement = $(selectElement);
    inputSelectElement.html($("<option disabled selected value> -- select an option -- </option>"));

    $(".output-" + type + " > input").each(function (index, selectElement) {
        if (selectElement.value.length > 0) {
            inputSelectElement.append($("<option>" + selectElement.value + "</option>"));
        }
    });
}