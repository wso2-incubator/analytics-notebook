/**
 * Note prototype
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
    self.initialize = function() {
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
        $.each(self.paragraphs, function(index, paragraph) {
            paragraph.run();
        });
    }

    /**
     * Toggle the visibility of all views (source or output views) in the current note
     *
     * @private
     * @param type Should be one of ["source", "output"]
     */
    function toggleVisibilityOfMultipleViews(type) {
        var toggleAllSourceOrOutputViewsButton = $("#toggle-all-" + type + "-views");
        var toggleSourceOrOutputViewButton = $(".toggle-" + type + "-view");
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
}

/**
 * Paragraph prototype
 *
 * @param id {int} unique paragraph id assigned to the paragraph
 * @constructor
 */
function Paragraph(id) {
    var self = this;

    // Initializing paragraph
    self.paragraphElement = $("<div class='paragraph well fluid-container'>");
    self.paragraphElement.css({ display : "none" });
    self.paragraphElement.load('paragraph-template.html', function() {
        $("#paragraphs").append(self.paragraphElement);
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
            loadSourceViewByType();
        });
    });

    // Prototype variables
    self.paragraphClient = null;    // The client will be set when the paragraph type is selected
    self.paragraphID = id;

    /**
     * Run the paragraph specified
     *
     * @private
     */
    self.run = function() {  // TODO : This method needs to be changed after deciding on the architecture
        var outputView = self.paragraphElement.find(".output");

        /*
         * The function for running the run paragraph task
         * This is called later after checking if the output view is empty or not
         */
        var runParagraphTask = function() {
            self.paragraphClient.run(function(output) {
                var newOutputView = $("<div class='output fluid-container' style='display: none;'>");
                newOutputView.append($("<p>Output</p>"));
                var newOutputViewContent = $("<div class='fluid-container'>");
                newOutputViewContent.append(output);
                newOutputView.append(newOutputViewContent);
                self.paragraphElement.find(".paragraph-content").append(newOutputView);

                newOutputView.slideDown();
                self.paragraphElement.find(".toggle-output-view").prop('disabled', false);
            });
        };

        if (outputView.length > 0) {
            outputView.slideUp(function() {
                outputView.remove();
                runParagraphTask();
            });
        } else {
            runParagraphTask();
        }
    };

    /**
     * Toggle the visibility of a view (source or output view) in the paragraph in which the toggle is located in
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
     * Delete the specified paragraph
     *
     * @private
     */
    function remove() {
        // TODO : send the relevant query to the notebook server to delete
        self.paragraphElement.slideUp(function() {
            self.paragraphElement.remove();
        });
    }

    /**
     * Load the source view of the paragraph in which the select element is located in
     *
     * @private
     */
    function loadSourceViewByType() {
        var selectElement = self.paragraphElement.find(".paragraph-type-select");
        var paragraphContent = self.paragraphElement.find(".paragraph-content");
        paragraphContent.slideUp(function() {
            paragraphContent.children().remove();

            var sourceViewContent = $("<div>");
            var paragraphTemplateLink;
            switch (selectElement.val()) {
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
                case "Data Visualization" :
                    self.paragraphClient = new DataVisualizationParagraphClient(self.paragraphElement);
                    paragraphTemplateLink = "source-view-templates/data-visualization.html";
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
                case "Custom" :
                    self.paragraphClient = new CustomParagraphClient(self.paragraphElement);
                    paragraphTemplateLink = "source-view-templates/custom.html";
                    break;
            }

            sourceViewContent.load(paragraphTemplateLink, function() {
                var sourceView = $("<div class='source fluid-container'>");
                sourceView.append($("<p>Source</p>"));
                sourceView.append(sourceViewContent);
                paragraphContent.append(sourceView);
                self.paragraphClient.initialize();
                paragraphContent.slideDown();

                // paragraph.find(".run").prop('disabled', true);
                self.paragraphElement.find(".toggle-source-view").prop('disabled', false);
                self.paragraphElement.find(".toggle-output-view").prop('disabled', true);
            });
        });
    }
}

/**
 * Utility prototype for paragraphs
 *
 * @constructor
 */
function ParagraphUtils() {
    var self = this;

    /**
     * Loads all available output tables/streams/models into the paragraph in which the select element is located in
     *
     * @param selectElement {jQuery} The select element which is located in the paragraph
     * @param type {string} Should be one of the following ["table", "stream", "model"]
     */
    self.loadAvailableParagraphOutputsToInputElement = function(selectElement, type) {
        var inputSelectElement = selectElement;
        inputSelectElement.html($("<option disabled selected value> -- select an option -- </option>"));

        $(".output-" + type).each(function (index, selectElement) {
            if (selectElement.value.length > 0) {
                inputSelectElement.append($("<option>" + selectElement.value + "</option>"));
            }
        });
    };


    /**
     * Load names of all the tables available in the server into the input table element in the paragraph specified
     *
     * @param paragraph The paragraph in which the input table select element is located
     */
    self.loadTableNames = function(paragraph) {
        var inputTableSelectElement = paragraph.find(".input-table");
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
    };

    /**
     * Callback function for generate spark query
     *
     * @callback GenerateSparkQueryCallback
     * @param Query {string}
     */

    /**
     * Generate a spark query using the specified parameters
     *
     * @param tableName {string} The name of the table
     * @param tempTableName {string} The name of the temp table into which the data will be loaded
     * @param callback {GenerateSparkQueryCallback} The callback function into which the query will be passed after generating the query
     */
    self.generateSparkQuery = function (tableName, tempTableName, callback) {
        var schema = '';
        $.ajax({
            type: "GET",
            url: constants.API_URI + "tables/" + tableName + "/schema",
            success: function (data) {
                $.each(data, function (index, column) {
                    if (column.scoreParam == true) {
                        schema += column.name + ' ' + column.type + ' -sp' + ', ';
                    }
                    else if (column.indexed == true) {
                        schema += column.name + ' ' + column.type + ' -i' + ', ';
                    }
                    else {
                        schema += column.name + ' ' + column.type + ', ';
                    }
                    if (index == data.length - 1) {
                        schema = schema.substring(0, schema.length - 2);
                        var createTempTableQuery = 'CREATE TEMPORARY TABLE ' +
                            tempTableName +
                            ' USING CarbonAnalytics OPTIONS (tableName "' +
                            tableName +
                            '", schema "' +
                            schema +
                            '");';
                        callback(createTempTableQuery);
                    }
                });
            }
        });

    };
}
