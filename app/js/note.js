/**
 * Note prototype constructor
 *
 * @constructor
 */
function Note() {
    var noteSelf = this;

    // Public fields
    noteSelf.name = new Utils().getQueryParameters()["note"];
    noteSelf.paragraphs = [];
    noteSelf.uniqueParagraphIDCounter = 0;

    /**
     * Initialize the note
     */
    noteSelf.initialize = function () {
        $.ajax({
            type: "GET",
            url: constants.API_URI + "notes/" + noteSelf.name + "/content",
            success: function (response) {
                console.log(response.status);
            }
        });

        // Initializing note
        $("#note-name").html(noteSelf.name);

        // Registering event listeners
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

        $("#save-note-button").click(function () {
            save();
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
        $.each(noteSelf.paragraphs, function (index, paragraph) {
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
            buttonTemplate = "<i class='fw fw-hide'></i> Hide " + type.charAt(0).toUpperCase() + type.slice(1);
            toggleAllSourceOrOutputViewsButton.html(buttonTemplate);
            toggleSourceOrOutputViewButton.html(buttonTemplate);
            $("." + type).slideDown();
            if(type == "source") {
                $(".paragraph-type-select-container").slideDown();
            }
        } else {
            buttonTemplate = "<i class='fw fw-view'></i> Show " + type.charAt(0).toUpperCase() + type.slice(1);
            toggleAllSourceOrOutputViewsButton.html(buttonTemplate);
            toggleSourceOrOutputViewButton.html(buttonTemplate);
            $("." + type).slideUp();
            if(type == "source") {
                $(".paragraph-type-select-container").slideUp();
            }
        }
    }

    /**
     * Add a new paragraph to the current note
     *
     * @private
     */
    function addParagraph() {
        noteSelf.paragraphs.push(new Paragraph());
    }

    /**
     * Save the note in the server
     *
     * @private
     */
    function save() {
        var noteContent = [];
        // Looping through the paragraphs and getting the contents of them
        $.each(noteSelf.paragraphs, function (index, paragraph) {
            noteContent.push(paragraph.getContent());
        });
        console.log(JSON.stringify(noteContent));


        $.ajax({
            type: "PUT",
            data: JSON.stringify(noteContent),
            url: constants.API_URI + "notes/" + noteSelf.name + "/content",
            success: function (response) {
                console.log(response.status);
            }
        });
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
     * Set the contents of the note using the array of objects provided
     * Each object contains the contents of a paragraph and the paragraph type
     *
     * @param noteContent {Object[]} Array of paragraph contents and the paragraph type
     */
    function setContent(noteContent) {
        $.each(noteContent, function (index, paragraphContent) {
            var newParagraph = new Paragraph();
            noteSelf.paragraphs.push(newParagraph);
            newParagraph.setContent(paragraphContent)
        });
    }

    /**
     * Paragraph prototype constructor
     *
     * @constructor
     */
    function Paragraph() {
        var paragraphSelf = this;


        // Initializing paragraph
        var paragraphContainer = $("<div class='loading-overlay' data-toggle='loading' data-loading-style='overlay'>");
        paragraphSelf.paragraphElement = $("<div class='paragraph well fluid-container collapse'>");

        // Private variables
        var utils = new Utils();
        var paragraphUtils = new ParagraphUtils(paragraphSelf.paragraphElement);

        // Public variables
        paragraphSelf.paragraphClient = null;    // The client will be set when the paragraph type is selected
        paragraphSelf.id = noteSelf.uniqueParagraphIDCounter++;

        paragraphSelf.paragraphElement.load('paragraph-template.html', function () {
            paragraphContainer.append(paragraphSelf.paragraphElement);
            $("#paragraphs").append(paragraphContainer);
            paragraphSelf.paragraphElement.slideDown();

            // Adding event listeners for the new paragraph main controls
            paragraphSelf.paragraphElement.find(".run-paragraph-button").click(function () {
                paragraphSelf.run();
            });

            paragraphSelf.paragraphElement.find(".toggle-source-view-button").click(function () {
                toggleVisibilityOfSingleView("source");
            });

            paragraphSelf.paragraphElement.find(".toggle-output-view-button").click(function () {
                toggleVisibilityOfSingleView("output");
            });

            paragraphSelf.paragraphElement.find(".delete-paragraph-button").click(function () {
                remove();
            });

            paragraphSelf.paragraphElement.find(".paragraph-type-select").change(function () {
                loadSourceViewByType(paragraphSelf.paragraphElement.find(".paragraph-type-select").val());
            });
        });

        /**
         * Run the paragraph
         */
        paragraphSelf.run = function () {
            if (paragraphSelf.paragraphClient.run != undefined) {
                paragraphSelf.paragraphClient.run(function (output) {
                    var outputView = paragraphSelf.paragraphElement.find(".output");
                    outputView.slideUp(function() {
                        paragraphUtils.clearNotification();
                        var newOutputViewContent = $("<div class='fluid-container'>");
                        newOutputViewContent.html(output);
                        outputView.html(newOutputViewContent);

                        outputView.slideDown();
                        paragraphSelf.paragraphElement.find(".toggle-output-view-button").prop('disabled', false);

                        // Updating the hide/show output button text
                        paragraphSelf.paragraphElement.find(".toggle-output-view-button").html(
                            "<i class='fw fw-hide'></i> Hide Output"
                        );
                    });
                });
            }
        };

        /**
         * Get the contents of the paragraph and the paragraph type encoded into an object
         * Getting source or output may not be supported by some paragraphs and the object will not include them if not supported
         *
         * @return {Object} The paragraph contents and the type encoded into an object
         */
        paragraphSelf.getContent = function() {
            var paragraphContent = {};
            if (paragraphSelf.paragraphClient.getSourceContent != undefined) {
                var source = paragraphSelf.paragraphClient.getSourceContent();
                if (source != undefined) {
                    paragraphContent.source = source;
                }
                if (paragraphSelf.paragraphClient.getOutputContent != undefined) {
                    var output = paragraphSelf.paragraphClient.getOutputContent();
                    if (output != undefined) {
                        paragraphContent.output = output;
                    }
                }
            }
            return paragraphContent;
        };

        /**
         * Set the contents of the object into the paragraph paragraph
         * The type of paragraph depends on the type specified in the object provided
         * Setting source or output may not be supported by some paragraphs and the object will not include them if not supported
         *
         * @param paragraphContent {Object} object to be used for setting the content of the paragraph
         */
        paragraphSelf.setContent = function(paragraphContent) {
            if (paragraphContent.type != undefined) {
                loadSourceViewByType(paragraphContent.type);
                if (paragraphContent.source != undefined) {
                    paragraphSelf.paragraphClient.initialize(paragraphContent.source);
                    if (paragraphContent.output != undefined) {
                        paragraphSelf.paragraphClient.run(paragraphContent.output);
                    }
                }
            }
        };

        /**
         * Toggle the visibility of a view (source or output view) in the paragraph
         *
         * @private
         * @param type {string} The type of views to toggle. Should be one of ["output", "source"]
         */
        function toggleVisibilityOfSingleView(type) {
            var view = paragraphSelf.paragraphElement.find("." + type);
            var toggleButton = paragraphSelf.paragraphElement.find(".toggle-" + type + "-view-button");
            var toggleButtonInnerHTML = toggleButton.html();
            if (toggleButton.html().indexOf("Show") != -1) {
                toggleButtonInnerHTML = "<i class='fw fw-hide'></i> Hide " + type.charAt(0).toUpperCase() + type.slice(1);
                view.slideDown();
                if(type == "source") {
                    paragraphSelf.paragraphElement.find(".paragraph-type-select-container").slideDown();
                }
            } else {
                toggleButtonInnerHTML = "<i class='fw fw-view'></i> Show " + type.charAt(0).toUpperCase() + type.slice(1);
                view.slideUp();
                if(type == "source") {
                    paragraphSelf.paragraphElement.find(".paragraph-type-select-container").slideUp();
                }
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
            paragraphSelf.paragraphElement.slideUp(function () {
                var removeIndex;
                $.each(noteSelf.paragraphs, function(index, paragraph) {
                    if (paragraph.id == paragraphSelf.id) {
                        removeIndex = index;
                    }
                });
                if (removeIndex != undefined) {
                    noteSelf.paragraphs.splice(removeIndex, 1);
                    paragraphSelf.paragraphElement.remove();
                } else {
                    paragraphUtils.handleNotification("error", "Error", "Error in deleting paragraph")
                }
            });
        }

        /**
         * Load the source view of the paragraph
         *
         * @param paragraphType {string} The type of the paragraph to be loaded
         * @private
         */
        function loadSourceViewByType(paragraphType) {
            var paragraphContent = paragraphSelf.paragraphElement.find(".paragraph-content");
            paragraphContent.slideUp(function () {
                var sourceViewContent = $("<div>");
                var paragraphTemplateLink;
                switch (paragraphType) {
                    case "Preprocessor" :
                        paragraphSelf.paragraphClient = new PreprocessorParagraphClient(paragraphSelf.paragraphElement);
                        paragraphTemplateLink = "source-view-templates/preprocessor.html";
                        break;
                    case "Data Explore" :
                        paragraphSelf.paragraphClient = new DataExploreParagraphClient(paragraphSelf.paragraphElement);
                        paragraphTemplateLink = "source-view-templates/data-explore.html";
                        break;
                    case "Batch Analytics" :
                        paragraphSelf.paragraphClient = new BatchAnalyticsParagraphClient(paragraphSelf.paragraphElement);
                        paragraphTemplateLink = "source-view-templates/batch-analytics.html";
                        break;
                    case "Interactive Analytics" :
                        paragraphSelf.paragraphClient = new InteractiveAnalyticsParagraphClient(paragraphSelf.paragraphElement);
                        paragraphTemplateLink = "source-view-templates/interactive-analytics.html";
                        break;
                    case "Markdown" :
                        paragraphSelf.paragraphClient = new Markdown(paragraphSelf.paragraphElement);
                        paragraphTemplateLink = "source-view-templates/markdown.html";
                        break;
                }

                utils.showLoadingOverlay(paragraphSelf.paragraphElement);
                sourceViewContent.load(paragraphTemplateLink, function () {
                    var sourceView = paragraphContent.find(".source");
                    var outputView = paragraphContent.find(".output");

                    sourceView.empty();
                    outputView.empty();
                    paragraphUtils.clearNotification();
                    sourceView.append($("<p class='add-padding-bottom-2x lead'>Source</p>"));
                    sourceView.append(sourceViewContent);
                    paragraphSelf.paragraphClient.initialize();

                    paragraphSelf.paragraphElement.find(".run-paragraph-button").prop('disabled', true);
                    paragraphSelf.paragraphElement.find(".toggle-source-view-button").prop('disabled', false);
                    paragraphSelf.paragraphElement.find(".toggle-output-view-button").prop('disabled', true);

                    outputView.css({ display : "none" });
                    paragraphContent.slideDown();
                    utils.hideLoadingOverlay(paragraphSelf.paragraphElement);
                });
            });
        }
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
     * Callback function for load tables method
     *
     * @callback LoadTablesCallback
     */

    /**
     * Load names of all the tables available in the server into the input table element in the paragraph
     *
     * @param [callback] {LoadTablesCallback} Callback to be called after loading tables
     */
    self.loadTableNames = function (callback) {
        var inputTableSelectElement = paragraph.find(".input-table");
        utils.showLoadingOverlay(self.paragraphElement);
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
                    self.handleNotification("error", "Error", response.message);
                }
                if (callback != undefined) {
                    callback();
                }
                utils.hideLoadingOverlay(self.paragraphElement);
            },
            error: function() {
                utils.hideLoadingOverlay(self.paragraphElement);
            }
        });
    };

    /**
     * Handles paragraph error messages in the paragraph
     *
     * @param type {string} The type of notification to be displayed. Should be one of ["success", "info", "warning", "error"]
     * @param title {string} The title of the notification
     * @param message {string} Message to be displayed in the notification area
     */
    self.handleNotification = function (type, title, message) {
        var notification = utils.generateAlertMessage(type, title, message);
        notification.addClass("collapse");
        paragraph.find(".notification-container").html(notification);
        notification.slideDown();
    };

    /**
     * Callback function for chart run
     *
     * @callback ClearNotificationsCallback
     */

    /**
     * Clear the notifications in the paragraph
     *
     * @param [callback] {ClearNotificationsCallback} callback to be called after removing notification
     */
    self.clearNotification = function(callback) {
        var notification =  paragraph.find(".notification-container").children().first();
        if (notification.get(0) !=  undefined) {
            notification.slideUp(function() {
                notification.remove();
                if (callback != undefined) {
                    callback();
                }
            });
        } else {
            if (callback != undefined) {
                callback();
            }
        }
    };

    /**
     * Sets the output content into the paragraph
     *
     * @param output {jQuery}
     */
    self.setOutput = function (output) {
        var outputView = paragraph.find(".output");
        outputView.slideUp(function() {
            self.clearNotification();
            var newOutputViewContent = $("<div class='fluid-container'>");
            newOutputViewContent.html(output);
            outputView.html(newOutputViewContent);

            outputView.slideDown();
            self.paragraphElement.find(".toggle-output-view-button").prop('disabled', false);

            // Updating the hide/show output button text
            self.paragraphElement.find(".toggle-output-view-button").html(
                "<i class='fw fw-hide'></i> Hide Output"
            );
        });
    }
}

/**
 * Callback function for paragraph client run
 *
 * @callback ParagraphClientRunCallback
 * @param output {jQuery} The output of the paragraph client run task as a jQuery object
 */
