/**
 * Data explore paragraph client prototype
 *
 * @param paragraph {jQuery} The paragraph in which the client resides in
 * @constructor
 */
function DataExploreParagraphClient(paragraph) {
    var self = this;

    /*
     * Private variables
     */
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);

    var chart;
    var markerSize = 2;

    // For storing the data related to the sample taken from the server
    var sample;
    var categoricalFeatureNames = [];
    var numericalFeatureNames = [];

    self.type = constants.paragraphs.dataExplore.key;
    self.unsavedContentAvailable = false;

    /**
     * Initialize the data explore paragraph
     * If content is passed into this the source content will be set from it
     *
     * @param [content] {Object} Source content of the paragraph encoded into an object
     */
    self.initialize = function (content) {
        paragraphUtils.loadTableNames(function() {
            // Load source content
            if (content != undefined) {
                // Loading the source content from the content object provided
                if (content.inputTable != undefined && content.sampleInfo != undefined) {
                    paragraph.find(".input-table").val(content.inputTable);
                    onInputTableChange(content.sampleInfo);
                    if (content.chartType != undefined && content.chartOptions != undefined) {
                        paragraph.find(".chart-type").val(content.chartType);
                        onChartTypeChange(content.chartOptions);
                    }
                }
            }
        });

        //Adding event listeners
        paragraph.find(".input-table").change(function () {
            self.unsavedContentAvailable = true;
            onInputTableChange();
        });

        paragraph.find(".chart-type").change(function() {
            self.unsavedContentAvailable = true;
            onChartTypeChange();
        });

        /**
         * Run input table change tasks
         *
         * @param [sampleInfo] {Object} The object containing the sample, categorical feature names and numerical feature names
         */
        function onInputTableChange(sampleInfo) {
            var tableName = paragraph.find(".input-table").val();
            paragraphUtils.clearNotification();

            if (sampleInfo == undefined) {
                // Loading sample information from server
                utils.showLoadingOverlay(paragraph);
                $.ajax({
                    type: "GET",
                    url: constants.API_URI + "data-explore/sample?table-name=" + tableName,
                    success: function(response) {
                        if (response.status == constants.response.SUCCESS) {
                            prepareSample(response);
                        } else if (response.status == constants.response.NOT_LOGGED_IN) {
                            window.location.href = "sign-in.html";
                        } else {
                            paragraphUtils.handleNotification("error", "Error", response.message);
                        }
                        utils.hideLoadingOverlay(paragraph);
                    },
                    error : function(response) {
                        paragraphUtils.handleNotification(
                            "error", "Error", utils.generateErrorMessageFromStatusCode(response.readyState)
                        );
                        utils.hideLoadingOverlay(paragraph);
                    }
                });
            } else {
                // Loading sample information from object
                prepareSample(sampleInfo);
            }

            /**
             * Run prepare sample tasks
             *
             * @param sampleInfo {Object} The object containing the sample, categorical feature names and numerical feature names
             */
            function prepareSample(sampleInfo) {
                sample = sampleInfo.sample;
                categoricalFeatureNames = sampleInfo.categoricalFeatureNames;
                numericalFeatureNames = sampleInfo.numericalFeatureNames;

                paragraph.find(".scatter-plot-options").slideUp();
                paragraph.find(".parallel-sets-options").slideUp();
                paragraph.find(".trellis-chart-options").slideUp();
                paragraph.find(".cluster-diagram-options").slideUp();
                paragraph.find(".chart-type-container").slideDown();

                paragraph.find(".chart-type option").eq(0).prop("selected", true);
            }
        }

        /**
         * Run chart type change tasks
         *
         * @param [chartOptions] {Object} The chart options to be set
         */
        function onChartTypeChange(chartOptions) {
            paragraphUtils.clearNotification(function() {
                paragraph.find(".run-paragraph-button").prop("disabled", true);
                var chartType = paragraph.find(".chart-type").val();
                switch(chartType) {
                    case "Scatter Plot" :
                        chart = new ScatterPlotDiagram(chartOptions);
                        break;
                    case "Parallel Sets" :
                        chart = new ParallelSets(chartOptions);
                        break;
                    case "Trellis Chart" :
                        chart = new TrellisChart(chartOptions);
                        break;
                    case "Cluster Diagram" :
                        chart = new ClusterDiagram(chartOptions);
                        break;
                }
            });
        }
    };

    /**
     * Run the data explore paragraph
     *
     * @param [paragraphsLeftToRun] {Object[]} The array of paragraphs left to be run in run all paragraphs task
     */
    self.run = function(paragraphsLeftToRun) {
        chart.draw();
        paragraphUtils.runNextParagraphForRunAllTask(paragraphsLeftToRun);
    };

    /**
     * Get the source content of the paragraph encoded into an object
     *
     * @return {Object} source content of the paragraph encoded into an object
     */
    self.getSourceContent = function() {
        var content;
        var inputTable = paragraph.find(".input-table").val();
        if (inputTable != undefined) {
            content = { inputTable : inputTable };
            content.sampleInfo = {
                sample : sample,
                categoricalFeatureNames : categoricalFeatureNames,
                numericalFeatureNames : numericalFeatureNames
            };
            var chartType = paragraph.find(".chart-type").val();
            if (chartType != undefined) {
                content.chartType = chartType;
                var chartOptions = {};
                switch(chartType) {
                    case "Scatter Plot" :
                        var scatterPlotX = paragraph.find(".scatter-plot-x").val();
                        if (scatterPlotX != undefined) {
                            chartOptions.scatterPlotX = scatterPlotX;
                        }
                        var scatterPlotY = paragraph.find(".scatter-plot-y").val();
                        if (scatterPlotY != undefined) {
                            chartOptions.scatterPlotY = scatterPlotY;
                        }
                        var scatterPlotGroup = paragraph.find(".scatter-plot-group").val();
                        if (scatterPlotGroup != undefined) {
                            chartOptions.scatterPlotGroup = scatterPlotGroup;
                        }
                        break;
                    case "Parallel Sets" :
                        chartOptions.parallelSetsFeatures = [];
                        paragraph.find('.parallel-sets-features:checked').each(function(index, radioButton) {
                            chartOptions.parallelSetsFeatures.push($(radioButton).val());
                        });
                        break;
                    case "Trellis Chart" :
                        // get selected categorical feature
                        var categoricalHeader = paragraph.find(".trellis-chart-categorical-feature").val();
                        if (categoricalHeader != undefined) {
                            chartOptions.categoricalHeader = categoricalHeader;
                        }

                        chartOptions.featureNames = [];
                        // get numerical feature list from checkbox selection
                        paragraph.find(".trellis-chart-numerical-features:checked").each(function(index, radioButton) {
                            chartOptions.featureNames.push($(radioButton).val());
                        });
                        break;
                    case "Cluster Diagram" :
                        var numericalFeatureIndependent = paragraph.find(".cluster-diagram-independent-feature").val();
                        if (numericalFeatureIndependent != undefined) {
                            chartOptions.numericalFeatureIndependent = numericalFeatureIndependent;
                        }
                        var numericalFeatureDependent = paragraph.find(".cluster-diagram-dependent-feature").val();
                        if (numericalFeatureDependent != undefined) {
                            chartOptions.numericalFeatureDependent = numericalFeatureDependent;
                        }
                        var noOfClusters = paragraph.find(".cluster-diagram-features-count").val();
                        if (noOfClusters != undefined) {
                            chartOptions.noOfClusters = noOfClusters;
                        }
                        break;
                }
                content.chartOptions = chartOptions;
            }
        }
        return content;
    };

    /**
     * Chart prototype constructor definitions start here
     */

    /**
     * Scatter plot prototype constructor
     *
     * @constructor
     * @param [chartOptions] {Object} Chart options to set in the chart
     */
    function ScatterPlotDiagram(chartOptions) {
        var scatterPlotSelf = this;

        if (numericalFeatureNames.length > 1 && categoricalFeatureNames.length > 0) {
            // Showing the relevant options for the chart
            paragraph.find('.scatter-plot-x, .scatter-plot-y, .scatter-plot-group').html(
                "<option disabled selected value> -- select an option -- </option>"
            );
            $.each(numericalFeatureNames, function(index, feature) {
                paragraph.find('.scatter-plot-x, .scatter-plot-y').append("<option>" + sanitize(feature) + "</option>");
            });
            $.each(categoricalFeatureNames, function(index, feature) {
                paragraph.find('.scatter-plot-group').append("<option>" + sanitize(feature) + "</option>");
            });

            if (chartOptions == undefined) {
                paragraph.find(
                    ".scatter-plot-x option," +
                    ".scatter-plot-y option," +
                    ".scatter-plot-group option"
                ).eq(0).prop('selected', true);
            } else {
                if (chartOptions.scatterPlotX != undefined) {
                    paragraph.find(".scatter-plot-x").val(chartOptions.scatterPlotX);
                }
                if (chartOptions.scatterPlotY != undefined) {
                    paragraph.find(".scatter-plot-y").val(chartOptions.scatterPlotY);
                }
                if (chartOptions.scatterPlotGroup != undefined) {
                    paragraph.find(".scatter-plot-group").val(chartOptions.scatterPlotGroup);
                }
            }
            adjustRunButton();

            paragraph.find(".parallel-sets-options").slideUp();
            paragraph.find(".trellis-chart-options").slideUp();
            paragraph.find(".cluster-diagram-options").slideUp();
            paragraph.find(".scatter-plot-options").slideDown();

            paragraph.find(".scatter-plot-x, .scatter-plot-y, .scatter-plot-group").change(function() {
                self.unsavedContentAvailable = true;
                adjustRunButton();
            });
        } else {
            paragraphUtils.handleNotification("info", "Scatter plot cannot be drawn",
                "Minimum of two numerical features and one categorical feature required to draw"
            );
        }

        function adjustRunButton() {
            var runButton = paragraph.find(".run-paragraph-button");
            runButton.prop('disabled', false);
            paragraph.find(".scatter-plot-x, .scatter-plot-y, .scatter-plot-group").each(function (index, selectElement) {
                if(selectElement.selectedIndex == 0) {
                    runButton.prop('disabled', true);
                }
            });
            paragraphUtils.clearNotification();
        }

        /**
         * Draw the scatter plot
         */
        scatterPlotSelf.draw = function() {
            utils.showLoadingOverlay(paragraph);
            var numFeatureIndependent = paragraph.find(".scatter-plot-x").val().replace(/^\s+|\s+$/g, '');
            var numFeatureDependent = paragraph.find(".scatter-plot-y").val().replace(/^\s+|\s+$/g, '');

            var numFeatureIndependentEscaped = paragraph.find(".scatter-plot-x").val().replace(/^\s+|\s+$/g, '').replace(/"/g, "\\\"");
            var numFeatureDependentEscaped = paragraph.find(".scatter-plot-y").val().replace(/^\s+|\s+$/g, '').replace(/"/g, "\\\"");
            var catFeatureEscaped = paragraph.find(".scatter-plot-group").val().replace(/^\s+|\s+$/g, '').replace(/"/g, "\\\"");

            var data = getScatterPlotPoints(numFeatureIndependentEscaped, numFeatureDependentEscaped, catFeatureEscaped);

            // transforming response data to array of arrays: [[-5.1, 11.5, 'setosa'],[1.9, 3.0, 'versicolor'],...]
            var scatterData = [];
            for (var i = 0; i < data.length; i++) {
                var parentObject = data[i];
                var parentObjectKey = Object.keys(parentObject)[0];
                var childObject = parentObject[parentObjectKey];
                var childObjectKey = Object.keys(childObject)[0];
                var childObjectValue = childObject[childObjectKey];

                var dataRow = [];
                dataRow[0] = parseFloat(parentObjectKey);
                dataRow[1] = parseFloat(childObjectKey);
                dataRow[2] = childObjectValue;
                scatterData.push(dataRow);
            }

            drawSimpleChart(scatterData, numFeatureIndependent, numFeatureDependent, true);
        };

        /**
         * Returns the scatter plot points using the sampled data according to the x-axis, y-axis and group by features
         *
         * @param xAxisFeature {String} Feature to be used as the x-axis
         * @param yAxisFeature {String} Feature to be used as the y-axis
         * @param groupByFeature {String} Feature to be used as the group by feature
         * @return {Object[]} The scatter plot points
         */
        function getScatterPlotPoints(xAxisFeature, yAxisFeature, groupByFeature) {
            var samplePoints = sample.samplePoints;
            var dataHeaders = sample.headerMap;
            var points = [];

            var firstFeatureColumn = dataHeaders[xAxisFeature];
            var secondFeatureColumn = dataHeaders[yAxisFeature];
            var thirdFeatureColumn = dataHeaders[groupByFeature];
            for (var row = 0; row < samplePoints[thirdFeatureColumn].length; row++) {
                if (samplePoints[firstFeatureColumn][row] != null
                    && samplePoints[secondFeatureColumn][row] != null
                    && samplePoints[thirdFeatureColumn][row] != null
                    && samplePoints[firstFeatureColumn][row].length != 0
                    && samplePoints[secondFeatureColumn][row].length != 0
                    && samplePoints[thirdFeatureColumn][row].length != 0) {
                    var map1 = {};
                    var map2 = {};
                    var val1 = samplePoints[secondFeatureColumn][row];
                    var val2 = samplePoints[firstFeatureColumn][row];
                    if ($.isNumeric(val1) && $.isNumeric(val2)) {
                        map2[val1] = samplePoints[thirdFeatureColumn][row];
                        map1[val2] = map2;
                        points.push(map1);
                    }
                }
            }

            return points;
        }

    }

    /**
     * Parallel sets prototype constructor
     *
     * @constructor
     * @param [chartOptions] {Object} Chart options to set in the chart
     */
    function ParallelSets(chartOptions) {
        var parallelSetsSelf = this;

        if (categoricalFeatureNames.length > 1) {
            var parallelSetsFeatureContainer = paragraph.find('.parallel-sets-feature-container');
            parallelSetsFeatureContainer.empty();
            $.each(categoricalFeatureNames, function(index, feature) {
                parallelSetsFeatureContainer.append(
                    "<div class='row'><label class='checkbox'>" +
                    "<input type='checkbox' class='parallel-sets-features' value='" + feature.trim().replace(/"/g, "\\\"") + "'>" +
                    "<span class='helper'>" + feature + "</span>" +
                    "</label></div>"
                );
            });

            // Loading the saved chart options if provided
            if (chartOptions != undefined) {
                paragraph.find('.parallel-sets-features').each(function(index, radioButton) {
                    $.each(chartOptions.parallelSetsFeatures, function(index, parallelSetsFeature) {
                        if ($(radioButton).val() == parallelSetsFeature) {
                            $(radioButton).prop('checked', true)
                        }
                    });
                });
            }
            adjustRunButton();

            paragraph.find(".scatter-plot-options").slideUp();
            paragraph.find(".trellis-chart-options").slideUp();
            paragraph.find(".cluster-diagram-options").slideUp();
            paragraph.find(".parallel-sets-options").slideDown();

            paragraph.find(".parallel-sets-features").click(function () {
                self.unsavedContentAvailable = true;
                adjustRunButton();
            });
        } else {
            paragraphUtils.handleNotification("info", "Parallel sets cannot be drawn",
                "At least two categorical features required to draw"
            );
        }

        /**
         * Enable or disable the run button depending on whether the relevant requirements are met
         */
        function adjustRunButton() {
            var runButton = paragraph.find(".run-paragraph-button");
            if(paragraph.find('.parallel-sets-features:checked').size() > 1) {
                runButton.prop('disabled', false);
            } else {
                runButton.prop('disabled', true);
            }
            paragraphUtils.clearNotification();
        }

        /**
         * Draw the parallel sets
         */
        parallelSetsSelf.draw = function() {
            utils.showLoadingOverlay(paragraph);
            // get categorical feature list from checkbox selection
            var parallelSetsFeatureNames = [];
            paragraph.find('.parallel-sets-features:checked').each(function(index, radioButton) {
                parallelSetsFeatureNames.push($(radioButton).val().replace(/^\s+|\s+$/g, '').replace(/\\"/g, '"'));
            });

            var points = getChartPoints(parallelSetsFeatureNames);
            var chartElement = $("<div class='chart'>");
            var chart = d3.parsets().dimensions(parallelSetsFeatureNames).tension(1.0).width(800).height(670);
            var vis = d3.select(chartElement.get(0)).append("svg")
                .attr("width", chart.width())
                .attr("height", chart.height())
                .style("font-size", "12px");
            vis.datum(points).call(chart);
            paragraphUtils.setOutput(chartElement);

            utils.hideLoadingOverlay(paragraph);
        };
    }

    /**
     * Trellis chart prototype constructor
     *
     * @constructor
     * @param [chartOptions] {Object} Chart options to set in the chart
     */
    function TrellisChart(chartOptions) {
        var trellisChartSelf = this;

        if (categoricalFeatureNames.length > 0 && numericalFeatureNames.length > 0) {
            paragraph.find('.trellis-chart-categorical-features').html(
                "<option disabled selected value> -- select an option -- </option>"
            );
            $.each(categoricalFeatureNames, function(index, feature) {
                paragraph.find('.trellis-chart-categorical-feature').append(
                    "<option value='" + sanitize(feature).trim().replace(/"/g, "\\\"") + "'>" + sanitize(feature) + "</option>"
                );
            });

            var trellisChartNumericalFeatureContainer = paragraph.find('.trellis-chart-numerical-feature-container');
            trellisChartNumericalFeatureContainer.empty();
            $.each(numericalFeatureNames, function(index, feature) {
                trellisChartNumericalFeatureContainer.append(
                    "<div class='row'><label class='checkbox'>" +
                    "<input type='checkbox' class='trellis-chart-numerical-features' value='" + feature.trim().replace(/"/g, "\\\"") + "'>" +
                    "<span class='helper'>" + feature + "</span>" +
                    "</label></div>"
                );
            });

            if (chartOptions == undefined) {
                paragraph.find(".trellis-chart-categorical-feature option").eq(0).prop("selected", true);
            } else {
                if (chartOptions.categoricalHeader != undefined) {
                    paragraph.find(".trellis-chart-categorical-feature").val(chartOptions.categoricalHeader)
                }

                paragraph.find(".trellis-chart-numerical-features").each(function(index, radioButton) {
                    $.each(chartOptions.featureNames, function(index, featureName) {
                        if ($(radioButton).val() == featureName) {
                            $(radioButton).prop('checked', true)
                        }
                    });
                });
            }
            adjustRunButton();

            paragraph.find(".scatter-plot-options").slideUp();
            paragraph.find(".parallel-sets-options").slideUp();
            paragraph.find(".cluster-diagram-options").slideUp();
            paragraph.find(".trellis-chart-options").slideDown();

            paragraph.find(".trellis-chart-numerical-features").click(function () {
                self.unsavedContentAvailable = true;
                adjustRunButton();
            });
            paragraph.find(".trellis-chart-categorical-feature").change(function () {
                self.unsavedContentAvailable = true;
                adjustRunButton();
            });
        } else {
            paragraphUtils.handleNotification("info", "Trellis chart cannot be drawn",
                "Minimum of one numerical features and one categorical feature required to draw"
            );
        }

        /**
         * Adjust the run button in the paragraph if the requirements for trellis chart had been met
         */
        function adjustRunButton() {
            var runButton = paragraph.find(".run-paragraph-button");
            if (paragraph.find(".trellis-chart-categorical-feature").get(0).selectedIndex != 0 &&
                paragraph.find('.trellis-chart-numerical-features:checked').size() > 0) {
                runButton.prop('disabled', false);
            } else {
                runButton.prop('disabled', true);
            }
            paragraphUtils.clearNotification();
        }

        /**
         * Draw the trellis chart
         */
        trellisChartSelf.draw = function() {
            utils.showLoadingOverlay(paragraph);
            var featureNames = [];
            // get selected categorical feature
            var categoricalHeader = paragraph.find(".trellis-chart-categorical-feature").val().replace(/^\s+|\s+$/g, "");
            featureNames[0] = categoricalHeader.replace(/\\"/g, '"');
            // get numerical feature list from checkbox selection
            paragraph.find(".trellis-chart-numerical-features:checked").each(function(index, radioButton) {
                featureNames.push($(radioButton).val().replace(/^\s+|\s+$/g, "").replace(/\\"/g, '"'));
            });

            var data = getChartPoints(featureNames);
            var chartElement = $("<div class='chart'>");

            /* D3.js Trellis Chart code */
            var width = 960,
                size = 155,
                padding = 19.5;
            var x = d3.scale.linear().range([padding / 2, size - padding / 2]);
            var y = d3.scale.linear().range([size - padding / 2, padding / 2]);
            var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);
            var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
            var color = d3.scale.category10();

            var domainByTrait = {},
                traits = d3.keys(data[0]).filter(
                    function(d) {
                        return d !== categoricalHeader;
                    }),
                n = traits.length;

            traits.forEach(function(trait) {
                domainByTrait[trait] = d3.extent(data, function(d) {
                    return d[trait];
                });
            });

            xAxis.tickSize(size * n);
            yAxis.tickSize(-size * n);

            var brush = d3.svg.brush().x(x).y(y).on("brushstart", brushstart)
                .on("brush", brushmove).on("brushend", brushend);

            var svg = d3.select(chartElement.get(0)).append("svg").attr("width",
                size * n + padding).attr("height", size * n + padding)
                .append("g").attr("transform",
                    "translate(" + padding + "," + padding / 2 + ")");

            svg.selectAll(".x.axis").data(traits).enter().append("g").attr(
                "class", "x axis").attr("transform", function(d, i) {
                return "translate(" + (n - i - 1) * size + ",0)";
            }).each(function(d) {
                x.domain(domainByTrait[d]);
                d3.select(this).call(xAxis);
            });

            svg.selectAll(".y.axis").data(traits).enter().append("g").attr(
                "class", "y axis").attr("transform", function(d, i) {
                return "translate(0," + i * size + ")";
            }).each(function(d) {
                y.domain(domainByTrait[d]);
                d3.select(this).call(yAxis);
            });

            var cell = svg.selectAll(".cell").data(cross(traits, traits))
                .enter().append("g").attr("class", "cell").attr(
                    "transform",
                    function(d) {
                        return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")";
                    }).each(plot);

            // Titles for the diagonal
            cell.filter(function(d) {
                return d.i === d.j;
            }).append("text").attr("x", padding).attr("y", padding).attr("dy",
                ".71em").text(function(d) {
                return d.x;
            });

            cell.call(brush);

            function plot(p) {
                var cell = d3.select(this);

                x.domain(domainByTrait[p.x]);
                y.domain(domainByTrait[p.y]);

                cell.selectAll("circle").data(data).enter().append("circle")
                    .attr("cx", function(d) {
                        return x(d[p.x]);
                    }).attr("cy", function(d) {
                    return y(d[p.y]);
                }).attr("r", markerSize).style("fill", function(d) {
                    // replace current header of categorical feature header with common header
                    // can be accessed by color
                    var dString = JSON.stringify(d);
                    dString = dString.replace(categoricalHeader, "categoricalFeature");
                    var dNew = JSON.parse(dString);
                    return color(dNew.categoricalFeature);
                });
            }
            var brushCell;

            // Clear the previously-active brush, if any.
            function brushstart(p) {
                if (brushCell !== this) {
                    d3.select(brushCell).call(brush.clear());
                    x.domain(domainByTrait[p.x]);
                    y.domain(domainByTrait[p.y]);
                    brushCell = this;
                }
            }

            // Highlight the selected circles.
            function brushmove(p) {
                var e = brush.extent();
                svg.selectAll("circle").classed(
                    "hidden",
                    function(d) {
                        return e[0][0] > d[p.x] || d[p.x] > e[1][0] || e[0][1] > d[p.y] || d[p.y] > e[1][1];
                    });
            }

            // If the brush is empty, select all circles.
            function brushend() {
                if (brush.empty())
                    svg.selectAll(".hidden").classed("hidden", false);
            }

            function cross(a, b) {
                var c = [],
                    n = a.length,
                    m = b.length,
                    i, j;
                for (i = -1; ++i < n;)
                    for (j = -1; ++j < m;)
                        c.push({
                            x: a[i],
                            i: i,
                            y: b[j],
                            j: j
                        });
                return c;
            }

            d3.select(window.frameElement).style("height", size * n + padding + 20 + "px");

            var chartContainer = $("<div>");
            chartContainer.append(chartElement);
            chartContainer.append(generateMarkerSizeCalibrator());
            paragraphUtils.setOutput(chartContainer);
            utils.hideLoadingOverlay(paragraph);
        };
    }

    /**
     * Cluster diagram prototype constructor
     *
     * @constructor
     * @param [chartOptions] {Object} Chart options to set in the chart
     */
    function ClusterDiagram(chartOptions) {
        var clusterDiagramSelf = this;

        // keeps cluster data to redraw chart on marker size change
        var redrawClusterData;

        if (numericalFeatureNames.length > 1) {
            paragraph.find('.cluster-diagram-independent-feature, .cluster-diagram-dependent-feature').html(
                "<option disabled selected value> -- select an option -- </option>"
            );
            $.each(numericalFeatureNames, function(index, feature) {
                paragraph.find('.cluster-diagram-independent-feature, .cluster-diagram-dependent-feature').append(
                    "<option value='" + sanitize(feature) + "'>" + sanitize(feature) + "</option>"
                );
            });

            paragraph.find(".scatter-plot-options").slideUp();
            paragraph.find(".parallel-sets-options").slideUp();
            paragraph.find(".trellis-chart-options").slideUp();
            paragraph.find(".cluster-diagram-options").slideDown();

            if (chartOptions == undefined) {
                paragraph.find(
                    ".cluster-diagram-independent-feature option," +
                    ".cluster-diagram-dependent-feature option," +
                    ".cluster-diagram-features-count option"
                ).eq(0).prop("selected", true);
            } else {
                if (numericalFeatureIndependent != undefined) {
                    paragraph.find(".cluster-diagram-independent-feature").val(chartOptions.numericalFeatureIndependent);
                }
                if (numericalFeatureDependent != undefined) {
                    paragraph.find(".cluster-diagram-dependent-feature").val(chartOptions.numericalFeatureDependent);
                }
                if (noOfClusters != undefined) {
                    paragraph.find(".cluster-diagram-features-count").val(chartOptions.noOfClusters);
                }
            }
            adjustRunButton();

            paragraph.find(".cluster-diagram-independent-feature, " +
                    ".cluster-diagram-dependent-feature, " +
                    ".cluster-diagram-features-count").change(function() {
                self.unsavedContentAvailable = true;
                adjustRunButton();
            });
        } else {
            paragraphUtils.handleNotification("info", "Cluster diagram cannot be drawn",
                "At least two numerical features required to draw"
            );
        }

        /**
         * Enable or disable the run button depending on whether the relevant requirements are met
         */
        function adjustRunButton() {
            var runButton = paragraph.find(".run-paragraph-button");
            runButton.prop('disabled', false);
            paragraph.find(".cluster-diagram-independent-feature, " +
                    ".cluster-diagram-dependent-feature, " +
                    ".cluster-diagram-features-count").each(function (index, selectElement) {
                if(selectElement.selectedIndex == 0) {
                    runButton.prop('disabled', true);
                }
            });
            paragraphUtils.clearNotification();
        }

        /**
         * Draw the cluster diagram
         */
        clusterDiagramSelf.draw = function() {
            if (redrawClusterData == undefined) {
                drawClusterDiagram();
            } else {
                redrawClusterDiagram();
            }
        };

        /**
         * Draws the cluster diagram by loading the data from the server
         * The stored sample data cannot be used for drawing cluster diagram
         * A KMeans model needs to be trained in the server
         */
        function drawClusterDiagram() {
            // get categorical feature list from checkbox selection
            var numericalFeatureIndependent = paragraph.find(".cluster-diagram-independent-feature").val().replace(/^\s+|\s+$/g, '');
            var numericalFeatureDependent = paragraph.find(".cluster-diagram-dependent-feature").val().replace(/^\s+|\s+$/g, '');
            var noOfClusters = paragraph.find(".cluster-diagram-features-count").val().replace(/^\s+|\s+$/g, '');
            var tableName = paragraph.find(".input-table").val();

            utils.showLoadingOverlay(paragraph);
            // make ajax call
            $.ajax({
                type : "GET",
                url : constants.API_URI + "data-explore/cluster-points?" +
                "features=" + numericalFeatureIndependent + "," + numericalFeatureDependent + "&" +
                "no-of-clusters=" + noOfClusters + "&" +
                "table-name=" + tableName,
                success : function(response) {
                    if(response.status == constants.response.SUCCESS) {
                        var dataArray = response.clusterPoints;
                        // transforming response data to array of arrays: [[-5.1, 11.5, 'setosa'],[1.9, 3.0, 'versicolor'],...]
                        var clusterData = [];
                        for (var i = 0; i < dataArray.length; i++) {
                            var dataRow = [];
                            dataRow[0] = parseFloat(dataArray[i]['features']['0']);
                            dataRow[1] = parseFloat(dataArray[i]['features']['1']);
                            dataRow[2] = dataArray[i]['cluster'];
                            clusterData.push(dataRow);
                        }
                        redrawClusterData = clusterData;
                        drawSimpleChart(clusterData, numericalFeatureIndependent, numericalFeatureDependent, false);
                    } else {
                        paragraphUtils.handleNotification("error", "Error", response.message);
                    }
                },
                error : function(response) {
                    paragraphUtils.handleNotification(
                        "error", "Error", utils.generateErrorMessageFromStatusCode(response.readyState)
                    );
                    paragraphUtils.hideLoadingOverlay(paragraph);
                }
            });
        }

        /**
         * Redraws the cluster diagram using the cluster diagram loaded from the server before
         * The cluster data retrieved from the data in the first time is used
         * This is because training a model for cluster diagram each time it is redrawn is costly
         */
        function redrawClusterDiagram() {
            // get categorical feature list from checkbox selection
            var numericalFeatureIndependent = paragraph.find(".cluster-diagram-independent-feature").val().replace(/^\s+|\s+$/g, '');
            var numericalFeatureDependent = paragraph.find(".cluster-diagram-dependent-feature").val().replace(/^\s+|\s+$/g, '');

            drawSimpleChart(redrawClusterData, numericalFeatureIndependent, numericalFeatureDependent, false);
        }
    }

    /**
     * Draws a simple chart with the data points
     * This is used by Scatter plot and Cluster diagram
     *
     * @param data
     * @param xLabel
     * @param yLabel
     * @param legendEnabled
     */
    function drawSimpleChart(data, xLabel, yLabel, legendEnabled) {
        var chartElement = $("<div class='chart'>");
        var scatter = new ScatterPlot(data);

        scatter.setPlotingAreaWidth(720);
        scatter.setPlotingAreaHeight(560);
        scatter.setMarkerSize(markerSize);
        scatter.setLegend(legendEnabled);
        scatter.setXAxisText(xLabel);
        scatter.setYAxisText(yLabel);
        scatter.plot(d3.select(chartElement.get(0)));

        var chartContainer = $("<div>");
        chartContainer.append(chartElement);
        chartContainer.append(generateMarkerSizeCalibrator());
        paragraphUtils.setOutput(chartContainer);
        utils.hideLoadingOverlay(paragraph);
    }

    /**
     * Returns the chart points from the list of features
     * Gets the values from the sampled data for the list of features provided
     * This is used by Trellis chart and Parallel sets
     *
     * @param featuresList {String[]} The list of features
     * @return {Object[]} List of objects with feature names and values as key value pairs
     */
    function getChartPoints(featuresList) {
        var samplePoints = sample.samplePoints;
        var dataHeaders = sample.headerMap;
        var points = [];

        // for each row in a selected categorical feature, iterate through all features
        for (var row = 0; row < samplePoints[dataHeaders[featuresList[0]]].length; row++) {
            var data = {};

            // for each categorical feature in same row put value into a point(JSONObject)
            // {"Soil_Type1":"0","Soil_Type11":"0","Soil_Type10":"0","Cover_Type":"4"}
            for (var featureCount = 0; featureCount < featuresList.length; featureCount++) {
                data[featuresList[featureCount]] =
                    samplePoints[dataHeaders[featuresList[featureCount]]][row];
            }

            points.push(data);
        }

        return points;
    }

    /**
     * Generates the element for changing the size of the markers in the charts drawn
     * Used by Scatter plot, Trellis chart & Cluster diagram
     * The event for changing the marker size is automatically added
     * Charts are redrawn every time the marker size is changed
     *
     * @return {jQuery} The change marker size element
     */
    function generateMarkerSizeCalibrator() {
        var element = $(
            "<div class='sp-quantity'>" +
                "<div class='sp-minus'>" +
                    "<a class='marker-size' style='text-decoration: none'>" +
                        "<span class='fw fw-minus'></span>" +
                    "</a>" +
                "</div>" +
                "<div class='sp-input'>" +
                    "<input type='text' class='quantity-input marker-size-input' value='" + markerSize + "' disabled/>" +
                "</div>" +
                "<div class='sp-plus'>" +
                    "<a class='marker-size' style='text-decoration: none'>" +
                        "<span class='fw fw-add'></span>" +
                    "</a>" +
                "</div>" +
            "</div>"
        );

        element.find(".marker-size").click(function(e) {
            var button = $(e.target);
            var oldValue = button.closest('.sp-quantity').find("input.quantity-input").val();

            var newValue;
            if (button.closest("div").hasClass("sp-plus")) {
                newValue = parseFloat(oldValue) + 1;
            } else {
                // Don't allow decrementing below 1
                if (oldValue > 1) {
                    newValue = parseFloat(oldValue) - 1;
                } else {
                    newValue = 1;
                }
            }
            markerSize = newValue;
            button.closest('.sp-quantity').find("input.quntity-input").val(newValue);
            chart.draw(function(output) {
                var outputView = paragraph.find(".output");
                outputView.empty();
                outputView.append($("<p>Output</p>"));
                var newOutputViewContent = $("<div class='fluid-container'>");
                newOutputViewContent.append(output);
                outputView.append(newOutputViewContent);
            });
        });

        return element;
    }
}
