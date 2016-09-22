/**
 * Markdown paragraph client prototype constructor
 *
 * @param paragraph {jQuery} The paragraph in which the client resides in
 * @constructor
 */
function Markdown(paragraph) {
    var self = this;
    var paragraphUtils = new ParagraphUtils(paragraph);

    self.type = constants.paragraphs.MARKDOWN.key;

    /**
     * Initialize the markdown paragraph
     * If content is passed into this the source content will be set from it
     *
     * @param [content] {Object} Source content of the paragraph encoded into an object
     */
    self.initialize = function(content) {
        // Load source content
        if (content != undefined) {
            paragraph.find(".markdown-source").val(content.text);
        }

        var markdownSource = paragraph.find(".markdown-source");
        markdownSource.keyup(function() {
            if (markdownSource.val().length > 0) {
                paragraph.find(".run-paragraph-button").prop('disabled', false);
            } else {
                paragraph.find(".run-paragraph-button").prop('disabled', true);
            }
        });
    };

    /**
     * Run the markdown paragraph
     *
     * @param [paragraphsLeftToRun] {Object[]} The array of paragraphs left to be run in run all paragraphs task
     */
    self.run = function(paragraphsLeftToRun) {
        paragraphUtils.clearNotification();
        paragraphUtils.setOutput(marked(paragraph.find(".markdown-source").val()));
        paragraphUtils.runNextParagraphForRunAllTask(paragraphsLeftToRun);
    };

    /**
     * Get the source content of the paragraph encoded into an object
     *
     * @return {Object} source content of the paragraph encoded into an object
     */
    self.getSourceContent = function() {
        var content;
        var markdownSourceText = paragraph.find(".markdown-source").val();
        if (markdownSourceText != undefined) {
            content = { text : markdownSourceText };
        }
        return content;
    };
}