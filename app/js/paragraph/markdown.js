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
