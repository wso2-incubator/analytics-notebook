constants.paragraphs = {
    batchAnalytics : { key : "BATCH_ANALYTICS", displayName : "Batch Analytics" },
    interactiveAnalytics : { key : "INTERACTIVE_ANALYTICS", displayName : "Interactive Analytics" },
    dataExplore : { key : "DATA_EXPLORE", displayName : "Data Explore" },
    markdown : { key : "MARKDOWN", displayName : "Markdown" },
    preprocessor : { key : "PREPROCESSOR", displayName : "Preprocessor" }
};

/**
 * Note prototype constructor
 *
 * @constructor
 */
function Note() {
    var noteSelf = this;

    // Private variables
    var utils = new Utils();

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
            url: constants.API_URI + "notes/" + noteSelf.name,
            success: function (response) {
                if (response.status == constants.response.SUCCESS) {
                    var noteObject = JSON.parse(response.note); // Server sends the value of key "note" as a string encoded into JSON
                    loadNextParagraphForLoadAllTask(noteObject);
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = "sign-in.html";
                } else {
                    utils.handlePageNotification("error", "Error", response.message);
                }
            },
            error : function(response) {
                utils.handlePageNotification("error", "Error", utils.generateErrorMessageFromStatusCode(response.readyState));
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
            saveNote();
        });

        $("#sign-out").click(function() {
            utils.signOut("./");
        });
    };

    /**
     * Run all paragraphs in the current note
     *
     * @private
     */
    function runAllParagraphs() {
        noteSelf.paragraphs[0].run(noteSelf.paragraphs.slice(1, noteSelf.paragraphs.length));
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
        $("#toggle-all-source-views-button").html(
            "<i class='fw fw-hide'></i> Hide Source"
        );
        adjustNoteControls();
    }

    /**
     * Save the note in the server
     *
     * @private
     */
    function saveNote() {
        var noteContent = [];
        // Looping through the paragraphs and getting the contents of them
        $.each(noteSelf.paragraphs, function (index, paragraph) {
            noteContent.push(paragraph.getContent());
        });


        $.ajax({
            type: "PUT",
            data: JSON.stringify(noteContent),
            url: constants.API_URI + "notes/" + noteSelf.name,
            success: function (response) {

            }
        });
    }


    /**
     * load the first paragraph in the array of paragraphs left to load in load all paragraphs task
     * The array will be passed to the Paragraph constructor after removing itself from the array so that the one after it will be loaded next
     *
     * @param remainingParagraphs {Object[]} The array of paragraphs left to run
     */
    function loadNextParagraphForLoadAllTask(remainingParagraphs) {
        if (remainingParagraphs != undefined && remainingParagraphs.length > 0) {
            // Starting a new async task for running the next paragraph
            setTimeout(function() {
                noteSelf.paragraphs.push(new Paragraph(remainingParagraphs[0], remainingParagraphs.slice(1, remainingParagraphs.length)));
                adjustNoteControls();
            }, 0);
        }
    }

    /**
     * Enable or disable the run all paragraphs, toggle all source views, toggle all output views buttons
     * Depending on whether there are any paragraphs
     */
    function adjustNoteControls() {
        if (noteSelf.paragraphs.length > 0) {
            $("#run-all-paragraphs-button, #toggle-all-source-views-button, #toggle-all-output-views-button").prop("disabled", false);
        } else {
            $("#run-all-paragraphs-button, #toggle-all-source-views-button, #toggle-all-output-views-button").prop("disabled", true);
        }
    }

    /**
     * Paragraph prototype constructor
     *
     * Set the contents of paragraphContent object into the paragraph
     * The type of paragraph depends on the type specified in the object provided
     *
     * @constructor
     * @param [paragraphContent] {Object} The contents of the paragraph
     * @param [remainingParagraphs] {Object} The remoaining paragraphs to be loaded
     */
    function Paragraph(paragraphContent, remainingParagraphs) {
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
            // Start loading the next paragraph
            loadNextParagraphForLoadAllTask(remainingParagraphs);

            var paragraphTypeSelectElement = paragraphSelf.paragraphElement.find(".paragraph-type-select");
            paragraphTypeSelectElement.html("<option disabled selected value> -- select an option --</option>");
            for (var paragraphType in constants.paragraphs) {
                if (constants.paragraphs.hasOwnProperty(paragraphType)) {
                    var paragraph = constants.paragraphs[paragraphType];
                    paragraphTypeSelectElement.append(
                        "<option value='" + paragraph.key + "'>" + paragraph.displayName + "</option>"
                    );
                }
            }

            // creates a paragraph client of the type specified and loads the content into the paragraph
            if (paragraphContent != undefined && paragraphContent.type != undefined) {
                if (paragraphContent.content.source != undefined) {
                    paragraphSelf.paragraphElement.find(".paragraph-type-select").val(paragraphContent.type);
                    loadSourceViewByType(paragraphContent.type, paragraphContent.content);
                }
            }

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
                removeParagraph();
            });

            paragraphSelf.paragraphElement.find(".paragraph-type-select").change(function () {
                loadSourceViewByType(paragraphSelf.paragraphElement.find(".paragraph-type-select").val());
            });
        });

        /**
         * Run the paragraph
         */
        paragraphSelf.run = function (paragraphs) {
            if (paragraphSelf.paragraphClient.run != undefined) {
                paragraphSelf.paragraphClient.run(paragraphs);
            } else {
                paragraphUtils.handleNotification("error", "Error", "Cannot run paragraph");
            }
        };

        /**
         * Get the contents of the paragraph and the paragraph type encoded into an object
         * Getting source or output may not be supported by some paragraphs and the object will not include them if not supported
         *
         * @return {Object} The paragraph contents and the type encoded into an object
         */
        paragraphSelf.getContent = function() {
            var paragraph = {};
            if (paragraphSelf.paragraphClient.getSourceContent != undefined) {
                var source = paragraphSelf.paragraphClient.getSourceContent();
                if (source != undefined) {
                    paragraph.content = {};
                    paragraph.content.source = source;
                    paragraph.type = paragraphSelf.paragraphClient.type;

                    // If source is not obtained output will not be added
                    if (paragraphSelf.paragraphClient.getOutputContent != undefined) {
                        var output = paragraphSelf.paragraphClient.getOutputContent();
                        if (output != undefined) {
                            paragraph.content.output = output;
                        }
                    }
                } else {
                    paragraphUtils.handleNotification("error", "Error", "Paragraph cannot be saved");
                    utils.handlePageNotification("error", "Error", "Some paragraphs could not be saved");
                }
            } else {
                paragraphUtils.handleNotification("error", "Error", "Paragraph cannot be saved");
                utils.handlePageNotification("error", "Error", "Some paragraphs could not be saved");
            }
            return paragraph;
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
        function removeParagraph() {
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
            adjustNoteControls();
        }

        /**
         * Load the source view by the paragraph type specified
         *
         * @param paragraphType {string} The type of the paragraph to be loaded
         * @param [content] {Object}  content of the paragraph
         * @private
         */
        function loadSourceViewByType(paragraphType, content) {
            var paragraphContent = paragraphSelf.paragraphElement.find(".paragraph-content");
            paragraphContent.slideUp(function () {
                var sourceViewContent = $("<div>");
                var paragraphTemplateLink;
                switch (paragraphType) {
                    case constants.paragraphs.preprocessor.key :
                        paragraphSelf.paragraphClient = new PreprocessorParagraphClient(paragraphSelf.paragraphElement);
                        paragraphTemplateLink = "preprocessor.html";
                        break;
                    case constants.paragraphs.dataExplore.key :
                        paragraphSelf.paragraphClient = new DataExploreParagraphClient(paragraphSelf.paragraphElement);
                        paragraphTemplateLink = "data-explore.html";
                        break;
                    case constants.paragraphs.batchAnalytics.key :
                        paragraphSelf.paragraphClient = new BatchAnalyticsParagraphClient(paragraphSelf.paragraphElement);
                        paragraphTemplateLink = "batch-analytics.html";
                        break;
                    case constants.paragraphs.interactiveAnalytics.key :
                        paragraphSelf.paragraphClient = new InteractiveAnalyticsParagraphClient(paragraphSelf.paragraphElement);
                        paragraphTemplateLink = "interactive-analytics.html";
                        break;
                    case constants.paragraphs.markdown.key :
                        paragraphSelf.paragraphClient = new Markdown(paragraphSelf.paragraphElement);
                        paragraphTemplateLink = "markdown.html";
                        break;
                }

                utils.showLoadingOverlay(paragraphSelf.paragraphElement);
                sourceViewContent.load("source-view-templates/" + paragraphTemplateLink, function () {
                    var sourceView = paragraphContent.find(".source");
                    var outputView = paragraphContent.find(".output");

                    sourceView.empty();
                    outputView.empty();
                    paragraphUtils.clearNotification();
                    sourceView.append($("<p class='add-padding-bottom-2x lead'>Source</p>"));
                    sourceView.append(sourceViewContent);

                    var sourceContent;
                    if (content != undefined && content.source != undefined) {
                        sourceContent = content.source;
                    }

                    paragraphSelf.paragraphElement.find(".run-paragraph-button").prop('disabled', true);
                    paragraphSelf.paragraphElement.find(".toggle-source-view-button").prop('disabled', false);
                    paragraphSelf.paragraphElement.find(".toggle-output-view-button").prop('disabled', true);

                    paragraphSelf.paragraphClient.initialize(sourceContent);

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
        paragraph.find(".paragraph-notification-container").html(notification);
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
     * @param output {jQuery} output content to be set into the paragraph
     */
    self.setOutput = function (output) {
        var outputView = paragraph.find(".output");
        outputView.slideUp(function() {
            self.clearNotification();
            var newOutputViewContent = $("<div class='fluid-container'>");
            newOutputViewContent.html(output);
            outputView.html(newOutputViewContent);

            outputView.slideDown();
            paragraph.find(".toggle-output-view-button").prop('disabled', false);

            // Updating the hide/show output button text
            paragraph.find(".toggle-output-view-button").html(
                "<i class='fw fw-hide'></i> Hide Output"
            );
            $("#toggle-all-output-views-button").html(
                "<i class='fw fw-hide'></i> Hide Output"
            );
        });
    };

    /**
     * Run the first paragraph in the array of paragraphs left to run in run all paragraphs task
     * The array will be passed to the first paragraph's run method removing itself from the array so that the one after it will be run next
     *
     * @param remainingParagraphs {Object[]} The array of paragraphs left to run
     */
    self.runNextParagraphForRunAllTask = function(remainingParagraphs) {
        if (remainingParagraphs != undefined && remainingParagraphs.length > 0) {
            // Starting a new async task for running the next paragraph
            setTimeout(function() {
                remainingParagraphs[0].run(remainingParagraphs.slice(1, remainingParagraphs.length));
            }, 0);
        }
    };
}

/**
 * Callback function for paragraph client run
 *
 * @callback ParagraphClientRunCallback
 * @param output {jQuery} The output of the paragraph client run task as a jQuery object
 */
