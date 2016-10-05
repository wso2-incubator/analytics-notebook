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

/**
 * Utility prototype constructor for homepage
 *
 * @constructor
 */
function Notebook() {
    var utils = new Utils();

    loadNoteNamesList();

    /*
     * Registering event listeners
     */
    $('#sign-out').click(function() {
        utils.signOut('./');
    });
    $('#create-note').click(function() {
        showCreateNoteModal();
    });

    /**
     * Load the notes list from the server
     * Display it in the UI
     *
     * @private
     */
    function loadNoteNamesList() {
        var notesList = $('#notes-list');
        utils.showLoadingOverlay(notesList);
        $.ajax({
            type: 'GET',
            url: constants.API_URI + 'notes',
            success: function(response) {
                if (response.status == constants.response.SUCCESS) {
                    var notes = response.notes;
                    var columns = ['Note Name', 'Actions'];

                    // Creating the 2D data array for the notes list table
                    var data = [];
                    $.each(notes, function(index, note) {
                        var row = [];
                        row.push('<span class="note-name">' + note + '</span>');
                        row.push(
                            '<a href="note.html?note=' + note + '" class="btn padding-reduce-on-grid-view">' +
                                '<span class="fw-stack">' +
                                    '<i class="fw fw-ring fw-stack-2x"></i>' +
                                    '<i class="fw fw-view fw-stack-1x"></i>' +
                                '</span>' +
                                '<span class="hidden-xs">View</span>' +
                            '</a>' +
                            '<a class="delete-note btn padding-reduce-on-grid-view">' +
                                '<span class="fw-stack">' +
                                    '<i class="fw fw-ring fw-stack-2x"></i>' +
                                    '<i class="fw fw-delete fw-stack-1x"></i>' +
                                '</span>' +
                                '<span class="hidden-xs">Delete</span>' +
                            '</a>'
                        );
                        data.push(row);
                    });

                    var listTable = utils.generateListTable(columns, data,
                        { ordering: false, searching: false },
                        { 'Actions' : 'text-right' }
                    );

                    // Registering event listeners to the list table
                    listTable.find('.delete-note').click(function(event) {
                        showDeleteNoteModal(
                            $(event.target).closest('tr').find('.note-name').html()
                        );
                    });

                    notesList.html(listTable);
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = 'sign-in.html';
                } else {

                }
                utils.hideLoadingOverlay(notesList);
            },
            error: function() {
                utils.handlePageNotification('error', 'Error',
                    utils.generateErrorMessageFromStatusCode(response.readyState)
                );
                utils.hideLoadingOverlay(notesList);
            }
        });
    }

    /**
     * Show the create note modal
     *
     * @private
     */
    function showCreateNoteModal() {
        utils.clearPageNotification();

        // Creating the modal content elements
        var modalBody = $('<div >');
        var noteNameInput = $('<input type="text" class="form-control form-control-lg" />');
        var noteNameInputContainer = $('<div class="pull-left"><div class="form-group col-sm-12">');
        var modalFooter = $('<div class="pull-right">');
        var createButton = $('<button type="button" class="btn btn-primary">Create</button>');

        // Appending to create the modal content structure
        noteNameInputContainer.append(noteNameInput);
        modalBody.append(noteNameInputContainer);
        modalFooter.append(createButton);

        var modal = utils.showModalPopup('Enter a name for your new note', modalBody, modalFooter);

        // Registering event listeners for the modal window
        createButton.click(function() {
            createNote(noteNameInput.val());
            modal.modal('hide');
        });
    }

    /**
     * Create the Note with the name specified
     *
     * @private
     * @param {string} name Name of the note to be created
     */
    function createNote(name) {
        if (name.indexOf(' ') > 0) {
            utils.handlePageNotification('error', 'Error',
                'Note name cannot contain white spaces'
            );
        } else {
            $.ajax({
                type: 'POST',
                url: constants.API_URI + 'notes/' + name,
                success: function(response) {
                    if (response.status == constants.response.SUCCESS) {
                        window.location.href = 'note.html?note=' + name;
                    } else if (response.status == constants.response.NOT_LOGGED_IN) {
                        window.location.href = 'sign-in.html';
                    } else {
                        utils.handlePageNotification('error', 'Error', response.message);
                    }
                },
                error: function(response) {
                    utils.handlePageNotification('error', 'Error',
                        utils.generateErrorMessageFromStatusCode(response.readyState)
                    );
                }
            });
        }
    }

    /**
     * Show the delete note confirmation modal
     *
     * @private
     * @param noteName The name of the note to be deleted
     */
    function showDeleteNoteModal(noteName) {
        utils.clearPageNotification();

        // Creating the modal content elements
        var modalFooter = $('<div class="pull-right">');
        var deleteButton = $('<button type="button" class="btn btn-primary">Delete</button>');

        // Appending to create the modal content structure
        modalFooter.append(deleteButton);

        var modal = utils.showModalPopup(
            'Do you want to delete ' + noteName + ' ?', $(), modalFooter
        );

        // Registering event listeners for the modal window
        deleteButton.click(function() {
            deleteNote(noteName);
            modal.modal('hide');
        });
    }

    /**
     * Delete the note deleted
     *
     * @private
     * @param {string} name The name of the note to be deleted
     */
    function deleteNote(name) {
        $.ajax({
            type: 'DELETE',
            url: constants.API_URI + 'notes/' + name,
            success: function(response) {
                if (response.status == constants.response.SUCCESS) {
                    utils.handlePageNotification('info', 'Info', 'Note successfully deleted');
                    loadNoteNamesList();
                } else if (response.status == constants.response.NOT_LOGGED_IN) {
                    window.location.href = 'sign-in.html';
                } else {
                    utils.handlePageNotification('error', 'Error', response.message);
                }
            },
            error: function(response) {
                utils.handlePageNotification('error', 'Error',
                    utils.generateErrorMessageFromStatusCode(response.readyState)
                );
            }
        });
    }
}   // End of Notebook prototype constructor
