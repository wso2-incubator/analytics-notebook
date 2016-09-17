/**
 * Note prototype constructor
 *
 * @constructor
 */
function Note() {
    var self = this;

    // Prototype fields
    self.paragraphs = [];
    self.uniqueParagraphIDCounter = 0;

    /**
     * Initialize the note
     */
    self.initialize = function () {
        // Initializing note
        $("#note-name").html(new Utils().getQueryParameters()["note"]);

        $("#run-all-paragraphs-button").click(function () {
            runAllParagraphs();
        });

        $("#toggle-all-source-views-button").click(function () {
            toggleVisibilityOfMultipleViews("source");
        });

        $("#toggle-all-output-views-button").click(function () {
            toggleVisibilityOfMultipleViews("output");
        });

        $("#add-paragraph-button").click(function () {
            addParagraph();
        });

        $("#delete-note-button").click(function () {
            remove();
        });
    };

    /**
     * Run all paragraphs in the current note
     *
     * @private
     */
    function runAllParagraphs() {
        // Looping through the paragraphs and running them
        $.each(self.paragraphs, function (index, paragraph) {
            paragraph.run();
        });
    }

    /**
     * Toggle the visibility of all views (source or output views) in the current note
     *
     * @private
     * @param type {string} One of ["source", "output"]
     */
    function toggleVisibilityOfMultipleViews(type) {
        var toggleAllSourceOrOutputViewsButton = $("#toggle-all-" + type + "-views-button");
        var toggleSourceOrOutputViewButton = $(".toggle-" + type + "-view-button");
        var buttonTemplate;
        if (toggleAllSourceOrOutputViewsButton.html().indexOf("Show") != -1) {
            buttonTemplate = "<i class='fw fw-hide'></i> Hide " + type;
            toggleAllSourceOrOutputViewsButton.html(buttonTemplate);
            toggleSourceOrOutputViewButton.html(buttonTemplate);
            $("." + type).slideDown();
        } else {
            buttonTemplate = "<i class='fw fw-view'></i> Show " + type;
            toggleAllSourceOrOutputViewsButton.html(buttonTemplate);
            toggleSourceOrOutputViewButton.html(buttonTemplate);
            $("." + type).slideUp();
        }
    }

    /**
     * Add a new paragraph to the current note
     *
     * @private
     */
    function addParagraph() {
        self.paragraphs.push(new Paragraph(self.uniqueParagraphIDCounter++));
    }

    /**
     * Delete the current note
     *
     * @private
     */
    function remove() {
        // TODO : send the request to delete the note to the notebook server
    }

    /**
     * Get the contents of the note as an array of objects.
     * Each object contains the contents of the relevant paragraph and the paragraph type
     *
     * @return {Object[]} Array of objects containing the paragraph content and the paragraph type
     */
    function getContent() {
        var noteContent = [];
        // Looping through the paragraphs and getting the contents of them
        $.each(self.paragraphs, function (index, paragraph) {
            noteContent.push(paragraph.getContent());
        });
        return noteContent;
    }

    /**
     * Set the contents of the note using the array of objects provided
     * Each object contains the contents of a paragraph and the paragraph type
     *
     * @param noteContent {Object[]} Array of paragraph contents and the paragraph type
     */
    function setContent(noteContent) {
        $.each(noteContent, function (index, paragraphContent) {
            var newParagraph = new Paragraph();
            self.paragraphs.push(newParagraph);
            newParagraph.setContent(paragraphContent)
        });
    }
}

/**
 * Paragraph prototype constructor
 *
 * @param id {int} unique paragraph id assigned to the paragraph
 * @constructor
 */
function Paragraph(id) {
    var self = this;

    // Initializing paragraph
    var paragraphContainer = $("<div class='loading-overlay' data-toggle='loading' data-loading-style='overlay'>");
    self.paragraphElement = $("<div class='paragraph well fluid-container'>");

    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(self.paragraphElement);

    self.paragraphElement.css({display: "none"});
    self.paragraphElement.load('paragraph-template.html', function () {
        paragraphContainer.append(self.paragraphElement);
        $("#paragraphs").append(paragraphContainer);
        self.paragraphElement.slideDown();

        // Adding event listeners for the new paragraph main controls
        self.paragraphElement.find(".run-paragraph-button").click(function () {
            self.run();
        });

        self.paragraphElement.find(".toggle-source-view-button").click(function () {
            toggleVisibilityOfSingleView("source");
        });

        self.paragraphElement.find(".toggle-output-view-button").click(function () {
            toggleVisibilityOfSingleView("output");
        });

        self.paragraphElement.find(".delete-paragraph-button").click(function () {
            remove();
        });

        self.paragraphElement.find(".paragraph-type-select").change(function () {
            loadSourceViewByType(self.paragraphElement.find(".paragraph-type-select").val());
        });
    });

    // Prototype variables
    self.paragraphClient = null;    // The client will be set when the paragraph type is selected
    self.paragraphID = id;

    /**
     * Run the paragraph
     */
    self.run = function () {  // TODO : This method needs to be changed after deciding on the architecture
        self.paragraphClient.run(function (output) {
            var outputView = self.paragraphElement.find(".output");
            outputView.slideUp(function() {
                outputView.empty();
                paragraphUtils.clearError();
                outputView.append($("<p>Output</p>"));
                var newOutputViewContent = $("<div class='fluid-container'>");
                newOutputViewContent.append(output);
                outputView.append(newOutputViewContent);

                outputView.slideDown();
                self.paragraphElement.find(".toggle-output-view-button").prop('disabled', false);
            });
        });
    };

    /**
     * Toggle the visibility of a view (source or output view) in the paragraph
     *
     * @private
     * @param type {string} The type of views to toggle. Should be one of ["output", "source"]
     */
    function toggleVisibilityOfSingleView(type) {
        var view = self.paragraphElement.find("." + type);
        var toggleButton = self.paragraphElement.find(".toggle-" + type + "-view-button");
        var toggleButtonInnerHTML = toggleButton.html();
        if (toggleButton.html().indexOf("Show") != -1) {
            toggleButtonInnerHTML = "<i class='fw fw-hide'></i> Hide " + type;
            view.slideDown();
        } else {
            toggleButtonInnerHTML = "<i class='fw fw-view'></i> Show " + type;
            view.slideUp();
        }
        toggleButton.html(toggleButtonInnerHTML);
    }

    /**
     * Delete the paragraph
     *
     * @private
     */
    function remove() {
        // TODO : send the relevant query to the notebook server to delete
        self.paragraphElement.slideUp(function () {
            self.paragraphElement.remove();
        });
    }

    /**
     * Get the contents of the paragraph and the paragraph type encoded into an object
     *
     * @return {Object} The paragraph contents and the type encoded into an object
     */
    self.getContent = function() {
        return self.paragraphClient.getContent();
    };

    /**
     * Set the contents of the object into the paragraph paragraph
     * The type of paragraph depends on the type specified in the object provided
     *
     * @param paragraphContent {Object} object to be used for setting the content of the paragraph
     */
    self.setContent = function(paragraphContent) {
        if(paragraphContent.type != undefined) {
            loadSourceViewByType(paragraphContent.type);
            if(paragraphContent.content != undefined) {
                self.paragraphClient.setContent(paragraphContent.content);
            }
        }
    };

    /**
     * Load the source view of the paragraph
     *
     * @param paragraphType {string} The type of the paragraph to be loaded
     * @private
     */
    function loadSourceViewByType(paragraphType) {
        var paragraphContent = self.paragraphElement.find(".paragraph-content");
        paragraphContent.slideUp(function () {
            var sourceViewContent = $("<div>");
            var paragraphTemplateLink;
            switch (paragraphType) {
                case "Data Source Definition" :
                    self.paragraphClient = new DataSourceDefinitionParagraphClient(self.paragraphElement);
                    paragraphTemplateLink = "source-view-templates/data-source-definition.html";
                    break;
                case "Preprocessor" :
                    self.paragraphClient = new PreprocessorParagraphClient(self.paragraphElement);
                    paragraphTemplateLink = "source-view-templates/preprocessor.html";
                    break;
                case "Data Explore" :
                    self.paragraphClient = new DataExploreParagraphClient(self.paragraphElement);
                    paragraphTemplateLink = "source-view-templates/data-explore.html";
                    break;
                case "Batch Analytics" :
                    self.paragraphClient = new BatchAnalyticsParagraphClient(self.paragraphElement);
                    paragraphTemplateLink = "source-view-templates/batch-analytics.html";
                    break;
                case "Interactive Analytics" :
                    self.paragraphClient = new InteractiveAnalyticsParagraphClient(self.paragraphElement);
                    paragraphTemplateLink = "source-view-templates/interactive-analytics.html";
                    break;
                case "Event Receiver Definition" :
                    self.paragraphClient = new EventReceiverDefinitionParagraphClient(self.paragraphElement);
                    paragraphTemplateLink = "source-view-templates/event-receiver-definition.html";
                    break;
                case "Real Time Analytics" :
                    self.paragraphClient = new RealTimeAnalyticsParagraphClient(self.paragraphElement);
                    paragraphTemplateLink = "source-view-templates/real-time-analytics.html";
                    break;
                case "Model Definition" :
                    self.paragraphClient = new ModelDefinitionParagraphClient(self.paragraphElement);
                    paragraphTemplateLink = "source-view-templates/model-definition.html";
                    break;
                case "Prediction" :
                    self.paragraphClient = new PredictionParagraphClient(self.paragraphElement);
                    paragraphTemplateLink = "source-view-templates/prediction.html";
                    break;
                case "Event Simulation" :
                    self.paragraphClient = new EventSimulationParagraphClientClient(self.paragraphElement);
                    paragraphTemplateLink = "source-view-templates/event-simulation.html";
                    break;
            }

            utils.showLoadingOverlay(self.paragraphElement);
            sourceViewContent.load(paragraphTemplateLink, function () {
                var sourceView = paragraphContent.find(".source");
                sourceView.empty();
                paragraphContent.find(".output").empty();
                paragraphUtils.clearError(self.paragraphElement);
                sourceView.append($("<p>Source</p>"));
                sourceView.append(sourceViewContent);
                self.paragraphClient.initialize();
                paragraphContent.slideDown();

                // paragraph.find(".run").prop('disabled', true);
                self.paragraphElement.find(".toggle-source-view-button").prop('disabled', false);
                self.paragraphElement.find(".toggle-output-view-button").prop('disabled', true);

                utils.hideLoadingOverlay(self.paragraphElement);
            });
        });
    }
}

/**
 * Paragraph utilities prototype constructor
 *
 * @constructor
 * @param paragraph {jQuery} The paragraph for which the utilities will be used
 */
function ParagraphUtils(paragraph) {
    var self = this;
    var utils = new Utils();

    /**
     * Loads all available output tables/streams/models into the paragraph in which this is located in
     *
     * @param type {string} One of ["table", "stream", "model"]
     */
    self.loadAvailableParagraphOutputsToInputElement = function (type) {
        var inputSelectElement = paragraph.find(".input-table");
        inputSelectElement.html($("<option disabled selected value> -- select an option -- </option>"));

        $(".output-" + type).each(function (index, selectElement) {
            if (selectElement.value.length > 0) {
                inputSelectElement.append($("<option>" + selectElement.value + "</option>"));
            }
        });
    };


    /**
     * Load names of all the tables available in the server into the input table element in the paragraph
     */
    self.loadTableNames = function () {
        var inputTableSelectElement = paragraph.find(".input-table");
        $.ajax({
            type: "GET",
            url: constants.API_URI + "tables",
            success: function (response) {
                if (response.status == constants.response.SUCCESS) {
                    inputTableSelectElement.html($("<option disabled selected value> -- select an option -- </option>"));
                    $.each(response.tableNames, function (index, table) {
                        inputTableSelectElement.append($("<option>" + table + "</option>"));
                    });
                } else {
                    self.handleError(response.message);
                }
            }
        });
    };

    /**
     * Handles paragraph error messages in the paragraph
     *
     * @param message {string} Error message to be displayed in the paragraph
     */
    self.handleError = function (message) {
        paragraph.find(".error-container").html(utils.generateAlertMessage("error", "Error", message))
    };

    /**
     * Clear the paragraph error messages in the paragraph
     */
    self.clearError = function() {
        paragraph.find(".error-container").empty();
    };
}

/**
 * Callback function for paragraph client run
 *
 * @callback ParagraphClientRunCallback
 * @param output {jQuery} The output of the paragraph client run task
 */
