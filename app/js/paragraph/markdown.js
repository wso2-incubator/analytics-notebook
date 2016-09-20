/**
 * Markdown paragraph client prototype constructor
 *
 * @param paragraph {jQuery} The paragraph in which the client resides in
 * @constructor
 */
function Markdown(paragraph) {
    var self = this;
    var paragraphUtils = new ParagraphUtils(paragraph);

    /**
     * Initialize the markdown paragraph
     * If content is passed into this the source content will be set from it
     *
     * @param [content] {Object} Source content of the paragraph encoded into an object
     */
    self.initialize = function(content) {
        var outputView = paragraph.find(".output");
        var markdownSource = paragraph.find(".markdown-source");
        var toggleOutputViewButton = paragraph.find(".toggle-output-view-button");

        if (content != undefined) {
            markdownSource.val(content.text);
            onMarkdownSourceKeyup();
        }

        markdownSource.keyup(function() {
            onMarkdownSourceKeyup();
        });

        /**
         * Run on markdown source keyup tasks
         */
        function onMarkdownSourceKeyup() {
            var markdownText = markdownSource.val();

            paragraphUtils.clearNotification();
            var newOutputViewContent = $("<div class='fluid-container'>");
            newOutputViewContent.html(marked(markdownText));
            outputView.html(newOutputViewContent);

            if(markdownText != undefined && markdownText != "") {
                outputView.slideDown();
                toggleOutputViewButton.prop('disabled', false);

                // Updating the hide/show output button text
                toggleOutputViewButton.html(
                    "<i class='fw fw-hide'></i> Hide Output"
                );
            } else {
                outputView.slideUp();
                toggleOutputViewButton.prop('disabled', true);
            }
        }
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