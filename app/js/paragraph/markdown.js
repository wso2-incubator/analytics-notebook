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
 * Markdown paragraph client prototype constructor
 *
 * @param {jQuery} paragraph The paragraph in which the client resides in
 * @param {Object} [content] Source content of the paragraph encoded into an object
 * @constructor
 */
function MarkdownParagraphClient(paragraph, content) {
    var self = this;
    var paragraphUtils = new ParagraphUtils(paragraph);

    self.type = "markdown";
    self.unsavedContentAvailable = false;

    /*
     * Initializing
     */
    // Load source content
    if (content != undefined) {
        paragraph.find('.markdown-source').val(content.text);
        adjustRunButton();
    }

    /*
     * Registering event listeners
     */
    paragraph.find('.markdown-source').keyup(function() {
        self.unsavedContentAvailable = true;
        adjustRunButton();
    });

    /**
     * Run the markdown paragraph
     *
     * @param {Object[]} [paragraphsLeftToRun] The array of paragraphs left to be run in run all paragraphs task
     */
    self.run = function(paragraphsLeftToRun) {
        paragraphUtils.clearNotification();
        paragraphUtils.setOutput(marked(paragraph.find('.markdown-source').val()));
        paragraphUtils.runNextParagraphForRunAllTask(paragraphsLeftToRun);
    };

    /**
     * Get the source content of the paragraph encoded into an object
     *
     * @return {Object} source content of the paragraph encoded into an object
     */
    self.getSourceContent = function() {
        var content;
        var markdownSourceText = paragraph.find('.markdown-source').val();
        if (markdownSourceText != undefined) {
            content = { text: markdownSourceText };
        }
        return content;
    };

    /**
     * Update the paragraph run button disabled status
     *
     * @private
     */
    function adjustRunButton() {
        var runButton = paragraph.find('.run-paragraph-button');
        if (paragraph.find('.markdown-source').val().length > 0) {
            runButton.prop('disabled', false);
        } else {
            runButton.prop('disabled', true);
        }
    }
}   // End of MarkdownParagraphClient prototype constructor
