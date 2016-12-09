/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

constants.paragraphs = {
    batchAnalytics: {
        displayName: 'Batch Analytics',
        templateLink: 'batch-analytics.html',
        paragraphClientPrototype: BatchAnalyticsParagraphClient
    },
    interactiveAnalytics: {
        displayName: 'Interactive Analytics',
        templateLink: 'interactive-analytics.html',
        paragraphClientPrototype: InteractiveAnalyticsParagraphClient
    },
    dataExplore: {
        displayName: 'Data Explore',
        templateLink: 'data-explore.html',
        paragraphClientPrototype: DataExploreParagraphClient
    },
    markdown: {
        displayName: 'Markdown',
        templateLink: 'markdown.html',
        paragraphClientPrototype: MarkdownParagraphClient
    },
    preprocessor: {
        displayName: 'Preprocessor',
        templateLink: 'preprocessor.html',
        paragraphClientPrototype: PreprocessorParagraphClient
    }
};

/**
 * Note prototype constructor
 *
 * @constructor
 */
function Note() {
    var noteSelf = this;

    noteSelf.name = utils.getQueryParameters()['note'];
    noteSelf.paragraphs = [];
    noteSelf.uniqueParagraphIDCounter = 0;

    var paragraphs = $('#paragraphs');

    /*
     * Initializing
     */
    utils.showLoadingOverlay(paragraphs);
    $.ajax({
        type: 'GET',
        url: constants.API_URI + 'notes/' + noteSelf.name,
        success: function(response) {
            if (response.status == constants.response.SUCCESS) {
                // Server sends the value of key "note" as a string encoded into JSON
                var noteObject = JSON.parse(response.note);
                loadNextParagraphForLoadAllTask(noteObject);
            } else if (response.status == constants.response.NOT_LOGGED_IN) {
                window.location.href = 'sign-in.html';
            } else {
                utils.handlePageNotification('error', 'Error', response.message);
            }
            utils.hideLoadingOverlay($('#paragraphs'));
        },
        error: function(response) {
            utils.handlePageNotification('error', 'Error',
                utils.generateErrorMessageFromStatusCode(response.readyState)
            );
            utils.hideLoadingOverlay($('#paragraphs'));
        }
    });
    $('#note-name').html(noteSelf.name);

    // Making the paragraphs sortable
    paragraphs.sortable({
        start: function(event, ui) {
            ui.item.data('startPosition', ui.item.index());
        },
        update: function(event, ui) {
            // Reordering the paragraph array according to the new arrangement in the page
            var oldPosition = ui.item.data('startPosition');
            var newPosition = ui.item.index();
            var movedParagraph = noteSelf.paragraphs[oldPosition];
            noteSelf.paragraphs.splice(oldPosition, 1);
            noteSelf.paragraphs.splice(newPosition, 0, movedParagraph);
        }
    });

    /*
     * Registering event listeners
     */
    $('#run-all-paragraphs-button').click(function() {
        runAllParagraphs();
    });
    $('#toggle-all-source-views-button').click(function() {
        toggleVisibilityOfMultipleViews('source');
    });
    $('#toggle-all-output-views-button').click(function() {
        toggleVisibilityOfMultipleViews('output');
    });
    $('#add-paragraph-button').click(function() {
        addParagraph();
    });
    $('#show-overview-button').click(function() {
        showOverview();
    });
    $('#save-note-button').click(function() {
        saveNote();
    });
    $('#sign-out').click(function() {
        utils.signOut('./');
    });
    $(window).on('beforeunload', function() {
        // Checking if there are any unsaved changes
        $.each(noteSelf.paragraphs, function(index, paragraph) {
            if (paragraph.paragraphClient != undefined &&
                paragraph.paragraphClient.unsavedContentAvailable) {
                event.returnValue = true;
                return true;
            }
        });
    });

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
     * @param {string} type One of ["source", "output"]
     */
    function toggleVisibilityOfMultipleViews(type) {
        var toggleAllSourceOrOutputViewsButton = $('#toggle-all-' + type + '-views-button');
        var toggleSourceOrOutputViewButton = $('.toggle-' + type + '-view-button');
        var buttonTemplate;

        if (toggleAllSourceOrOutputViewsButton.html().indexOf('Show') != -1) {
            buttonTemplate =
                "<i class='fw fw-hide'></i> Hide " + type.charAt(0).toUpperCase() + type.slice(1);
            toggleAllSourceOrOutputViewsButton.html(buttonTemplate);
            toggleSourceOrOutputViewButton.html(buttonTemplate);
            $('.' + type).slideDown();
            if (type == 'source') {
                $('.paragraph-type-select-container').slideDown();
            }
        } else {
            buttonTemplate =
                "<i class='fw fw-view'></i> Show " + type.charAt(0).toUpperCase() + type.slice(1);
            toggleAllSourceOrOutputViewsButton.html(buttonTemplate);
            toggleSourceOrOutputViewButton.html(buttonTemplate);
            $('.' + type).slideUp();
            if (type == 'source') {
                $('.paragraph-type-select-container').slideUp();
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
        $('#toggle-all-source-views-button').html(
            "<i class='fw fw-hide'></i> Hide Source"
        );
        adjustNoteControls();
    }

    /**
     * Shows an overview of how the paragraphs are connected to each other according to the state of the note
     *
     * @private
     */
    function showOverview() {
        var links = [];
        $.each(noteSelf.paragraphs, function(index, paragraph) {
            if (paragraph.paragraphClient.getDependencies != undefined) {
                var dependencies = paragraph.paragraphClient.getDependencies();
                $.each(dependencies.inputTables, function(index, inputTable) {
                    links.push({ source: inputTable, target: dependencies.name });
                });
                $.each(dependencies.outputTables, function(index, outputTable) {
                    links.push({ source: dependencies.name, target: outputTable });
                });
            }
        });

        utils.showModalPopup('Overview', utils.generateDirectedGraph(links), $());
    }

    /**
     * Save the note in the server
     *
     * @private
     */
    function saveNote() {
        var noteContent = [];
        // Looping through the paragraphs and getting the contents of them
        $.each(noteSelf.paragraphs, function(index, paragraph) {
            noteContent.push(paragraph.getContent());
        });

        // Saving the note content in the server
        utils.showLoadingOverlay($('#paragraphs'));
        $.ajax({
            type: 'PUT',
            data: JSON.stringify(noteContent),
            url: constants.API_URI + 'notes/' + noteSelf.name,
            success: function(response) {
                if (response.status == constants.response.SUCCESS) {
                    utils.handlePageNotification('info', 'Info', 'Note successfully saved');

                    $.each(noteSelf.paragraphs, function(index, paragraph) {
                        if (paragraph.paragraphClient != null) {
                            paragraph.paragraphClient.unsavedContentAvailable = false;
                        }
                    });
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = 'sign-in.html';
                } else {
                    utils.handlePageNotification('error', 'Error', response.message);
                }
                utils.hideLoadingOverlay($('#paragraphs'));
            },
            error: function(response) {
                utils.handlePageNotification('error', 'Error',
                    utils.generateErrorMessageFromStatusCode(response.readyState)
                );
                utils.hideLoadingOverlay($('#paragraphs'));
            }
        });
    }


    /**
     * load the first paragraph in the array of paragraphs left to load in load all paragraphs task
     * The array will be passed to the Paragraph constructor after removing itself from the array
     * So that the one after it will be loaded next
     *
     * @private
     * @param {Object[]} remainingParagraphs The array of paragraphs left to run
     */
    function loadNextParagraphForLoadAllTask(remainingParagraphs) {
        if (remainingParagraphs != undefined && remainingParagraphs.length > 0) {
            // Starting a new async task for running the next paragraph
            setTimeout(function() {
                noteSelf.paragraphs.push(
                    new Paragraph(remainingParagraphs[0],
                    remainingParagraphs.slice(1, remainingParagraphs.length))
                );
                adjustNoteControls();
            }, 0);
        }
    }

    /**
     * Enable or disable the run all paragraphs, toggle all source views, toggle all output views buttons
     * Depending on whether there are any paragraphs
     *
     * @private
     */
    function adjustNoteControls() {
        var noteControls = $(
            '#run-all-paragraphs-button, #toggle-all-source-views-button, #toggle-all-output-views-button'
        );
        if (noteSelf.paragraphs.length > 0) {
            noteControls.prop('disabled', false);
        } else {
            noteControls.prop('disabled', true);
        }
    }

    /**
     * Paragraph prototype constructor
     *
     * Set the contents of paragraphContent object into the paragraph
     * The type of paragraph depends on the type specified in the object provided
     *
     * @constructor
     * @param {Object} [paragraphContent] The contents of the paragraph
     * @param {Object[]} [remainingParagraphs] The remoaining paragraphs to be loaded
     */
    function Paragraph(paragraphContent, remainingParagraphs) {
        var paragraphSelf = this;

        paragraphSelf.paragraphElement = $(
            "<div class='paragraph well fluid-container collapse'>"
        );
        paragraphSelf.paragraphClient = null;    // The client will be set when the paragraph type is selected
        paragraphSelf.id = noteSelf.uniqueParagraphIDCounter++;

        paragraphSelf.paragraphElement.load('paragraph-template.html', function() {
            // Start loading the next paragraph
            loadNextParagraphForLoadAllTask(remainingParagraphs);

            var paragraphTypeSelectElement = paragraphSelf.paragraphElement.find('.paragraph-type-select');
            paragraphTypeSelectElement.html(
                '<option disabled selected value> -- select an option --</option>'
            );
            for (var paragraphType in constants.paragraphs) {
                paragraphTypeSelectElement.append(
                    "<option value='" + paragraphType + "'>" +
                        constants.paragraphs[paragraphType].displayName +
                    '</option>'
                );
            }

            // CCreates a paragraph client of the type specified and loads the content into the paragraph
            if (paragraphContent != undefined && paragraphContent.type != undefined) {
                if (paragraphContent.content.source != undefined) {
                    paragraphSelf.paragraphElement.find('.paragraph-type-select').val(paragraphContent.type);
                    loadSourceViewByType(paragraphContent.type, paragraphContent.content);
                }
            }

            var paragraphContainer = $(
                "<li class='loading-overlay' data-toggle='loading' data-loading-style='overlay'>"
            );
            paragraphContainer.append(paragraphSelf.paragraphElement);
            $('#paragraphs').append(paragraphContainer);
            paragraphSelf.paragraphElement.slideDown(utils.positionFooter);

            // Registering event listeners for the new paragraph main controls
            paragraphSelf.paragraphElement.find('.run-paragraph-button').click(function() {
                paragraphSelf.run();
            });

            paragraphSelf.paragraphElement.find('.toggle-source-view-button').click(function() {
                toggleVisibilityOfSingleView('source');
            });

            paragraphSelf.paragraphElement.find('.toggle-output-view-button').click(function() {
                toggleVisibilityOfSingleView('output');
            });

            paragraphSelf.paragraphElement.find('.delete-paragraph-button').click(function() {
                removeParagraph();
            });

            paragraphSelf.paragraphElement.find('.paragraph-type-select').change(function() {
                loadSourceViewByType(
                    paragraphSelf.paragraphElement.find('.paragraph-type-select').val()
                );
            });
        });

        /**
         * Run the paragraph
         *
         * @param {Object[]} [paragraphs] Paragraphs remaining to be run
         */
        paragraphSelf.run = function(paragraphs) {
            if (paragraphSelf.paragraphClient.run != undefined) {
                paragraphSelf.paragraphClient.run(paragraphs);
            } else {
                paragraphUtils.handleNotification(paragraphSelf.paragraphElement, 'error', 'Error', 'Cannot run paragraph');
            }
        };

        /**
         * Get the contents of the paragraph and the paragraph type encoded into an object
         * Getting source or output may not be supported by some paragraphs
         * The object will not include them if not supported
         *
         * @return {Object} The paragraph contents and the type encoded into an object
         */
        paragraphSelf.getContent = function() {
            var paragraph = {};
            var saved = false;
            if (paragraphSelf.paragraphClient != undefined) {
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
                        saved = true;
                    } else {
                        paragraphUtils.handleNotification(paragraphSelf.paragraphElement, 'info', 'Info',
                            'No paragraph content to be saved'
                        );
                    }
                } else {
                    paragraphUtils.handleNotification(paragraphSelf.paragraphElement, 'info', 'Info',
                        'Paragraph does not support saving'
                    );
                }
            } else {
                paragraphUtils.handleNotification(paragraphSelf.paragraphElement, 'error', 'Error', 'Paragraph type not selected');
            }
            if (!saved) {
                utils.handlePageNotification('error', 'Error',
                    'Some paragraphs could not be saved'
                );
            }
            return paragraph;
        };

        /**
         * Toggle the visibility of a view (source or output view) in the paragraph
         *
         * @private
         * @param {string} type The type of views to toggle. Should be one of ["output", "source"]
         */
        function toggleVisibilityOfSingleView(type) {
            var view = paragraphSelf.paragraphElement.find('.' + type);
            var toggleButton = paragraphSelf.paragraphElement.find('.toggle-' + type + '-view-button');
            var toggleButtonInnerHTML = toggleButton.html();
            if (toggleButton.html().indexOf('Show') != -1) {
                toggleButtonInnerHTML =
                    "<i class='fw fw-hide'></i> Hide " + type.charAt(0).toUpperCase() + type.slice(1);
                view.slideDown();
                if (type == 'source') {
                    paragraphSelf.paragraphElement.find('.paragraph-type-select-container').slideDown();
                }
            } else {
                toggleButtonInnerHTML =
                    "<i class='fw fw-view'></i> Show " + type.charAt(0).toUpperCase() + type.slice(1);
                view.slideUp();
                if (type == 'source') {
                    paragraphSelf.paragraphElement.find('.paragraph-type-select-container').slideUp();
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
            paragraphSelf.paragraphElement.slideUp(function() {
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
                    paragraphUtils.handleNotification(paragraphSelf.paragraphElement, 'error', 'Error', 'Error in deleting paragraph');
                }
                utils.positionFooter();
            });
            adjustNoteControls();
        }

        /**
         * Load the source view by the paragraph type specified
         *
         * @private
         * @param {string} paragraphType The type of the paragraph to be loaded
         * @param {Object} [content]  content of the paragraph
         */
        function loadSourceViewByType(paragraphType, content) {
            var paragraphContent = paragraphSelf.paragraphElement.find('.paragraph-content');
            paragraphContent.slideUp(function() {
                var sourceViewContent = $('<div>');
                var paragraphClientInfo = constants.paragraphs[paragraphType];
                utils.showLoadingOverlay(paragraphSelf.paragraphElement);
                sourceViewContent.load('source-view-templates/' + paragraphClientInfo.templateLink, function() {
                    var sourceView = paragraphContent.find('.source');
                    var outputView = paragraphContent.find('.output');

                    sourceView.empty();
                    outputView.empty();
                    paragraphUtils.clearNotification(paragraphSelf.paragraphElement);
                    sourceView.append($("<p class='add-padding-bottom-2x lead'>Source</p>"));
                    sourceView.append(sourceViewContent);

                    var sourceContent;
                    if (content != undefined && content.source != undefined) {
                        sourceContent = content.source;
                    }

                    paragraphSelf.paragraphElement.find('.run-paragraph-button').prop('disabled', true);
                    paragraphSelf.paragraphElement.find('.toggle-source-view-button').prop('disabled', false);
                    paragraphSelf.paragraphElement.find('.toggle-output-view-button').prop('disabled', true);

                    paragraphSelf.paragraphClient = new paragraphClientInfo.paragraphClientPrototype(
                        paragraphSelf.paragraphElement, sourceContent
                    );
                    outputView.css({ display: 'none' });
                    paragraphContent.slideDown();
                    utils.hideLoadingOverlay(paragraphSelf.paragraphElement);
                });
            });
        }
    }   // End of Paragraph prototype constructor
}   // End of Note prototype constructor

/**
 * Paragraph utilities
 */
var paragraphUtils = (function() {
    var self = this;

    /**
     * Callback function for load tables method
     *
     * @callback LoadTablesCallback
     */

    /**
     * Load names of all the tables available in the server into the input table element in the paragraph
     * The paragraph should contain a select element with the class 'input-table'
     *
     * @param {jQuery} paragraph The paragraph in which the select element to which the table names should be loaded into
     * @param {LoadTablesCallback} [callback] Callback to be called after loading tables
     */
    self.loadTableNames = function(paragraph, callback) {
        var inputTableSelectElement = paragraph.find('.input-table');
        utils.showLoadingOverlay(self.paragraphElement);
        $.ajax({
            type: 'GET',
            url: constants.API_URI + 'tables',
            success: function(response) {
                if (response.status == constants.response.SUCCESS) {
                    inputTableSelectElement.html(
                        $('<option disabled selected value> -- select an option -- </option>')
                    );
                    $.each(response.tableNames, function(index, table) {
                        inputTableSelectElement.append($('<option>' + table + '</option>'));
                    });
                } else {
                    self.handleNotification(paragraph, 'error', 'Error', response.message);
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
     * The paragraph should contain an element with the class 'paragraph-notification-container'
     *
     * @param {jQuery} paragraph The paragraph in which the element to which the notification should be added
     * @param {string} type The type of notification to be displayed. Should be one of ["success", "info", "warning", "error"]
     * @param {string} title The title of the notification
     * @param {string} message Message to be displayed in the notification area
     */
    self.handleNotification = function(paragraph, type, title, message) {
        var notification = utils.generateAlertMessage(type, title, message);
        notification.addClass('collapse');
        paragraph.find('.paragraph-notification-container').html(notification);
        notification.slideDown();
    };

    /**
     * Callback function for chart run
     *
     * @callback ClearNotificationsCallback
     */

    /**
     * Clear the notifications in the paragraph
     * The paragraph should contain an element with the class 'paragraph-notification-container'
     *
     * @param {jQuery} paragraph The paragraph in which the element containing notifications exist
     * @param {ClearNotificationsCallback} [callback] Callback to be called after removing notification
     */
    self.clearNotification = function(paragraph, callback) {
        var notification = paragraph.find('.notification-container').children().first();
        if (notification.get(0) != undefined) {
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
     * The paragraph should contain a div with the class 'output'
     *
     * @param {jQuery} paragraph The paragraph to which the output should be added
     * @param {jQuery|jQuery[]} output output content to be set into the paragraph
     */
    self.setOutput = function(paragraph, output) {
        var outputView = paragraph.find('.output');
        outputView.slideUp(function() {
            self.clearNotification(paragraph);
            var newOutputViewContent = $("<div class='fluid-container'>");
            newOutputViewContent.html(output);
            outputView.html(newOutputViewContent);

            outputView.slideDown();
            paragraph.find('.toggle-output-view-button').prop('disabled', false);

            // Updating the hide/show output button text
            paragraph.find('.toggle-output-view-button').html(
                "<i class='fw fw-hide'></i> Hide Output"
            );
            $('#toggle-all-output-views-button').html(
                "<i class='fw fw-hide'></i> Hide Output"
            );
        });
    };

    /**
     * Run the first paragraph in the array of paragraphs left to run in run all paragraphs task
     * The array will be passed to the first paragraph's run method removing itself from the array
     * So that the one after it will be run next
     *
     * @param {Object[]} remainingParagraphs The array of paragraphs left to run
     */
    self.runNextParagraphForRunAllTask = function(remainingParagraphs) {
        if (remainingParagraphs != undefined && remainingParagraphs.length > 0) {
            // Starting a new async task for running the next paragraph
            setTimeout(function() {
                remainingParagraphs[0].run(remainingParagraphs.slice(1, remainingParagraphs.length));
            }, 0);
        }
    };

    return self;
})();   // End of paragraphUtils

/**
 * Callback function for paragraph client run
 *
 * @callback ParagraphClientRunCallback
 * @param {jQuery} output The output of the paragraph client run task as a jQuery object
 */
