/**
 * Data explore paragraph client prototype
 *
 * @param paragraph {jQuery} The paragraph in which the client resides in
 * @constructor
 */
function DataExploreParagraphClient(paragraph) {
    var self = this;

    // Private variables
    var utils = new Utils();
    var paragraphUtils = new ParagraphUtils(paragraph);

    var chart;
    var markerSize = 2;

    var sample;
    var categoricalFeatureNames = [];
    var numericalFeatureNames = [];

    /**
     * Initialize the data explore paragraph
     */
    self.initialize = function () {
        paragraphUtils.loadTableNames();

        paragraph.find(".input-table").change(function () {
            var tableName = paragraph.find(".input-table").val();
            utils.showLoadingOverlay(paragraph);
            $.ajax({
                type: "GET",
                url: constants.API_URI + "data-explore/sample?table-name=" + tableName,
                success: function(response) {
                    if (response.status == constants.response.SUCCESS) {
                        sample = response.sample;
                        categoricalFeatureNames = response.categoricalFeatureNames;
                        numericalFeatureNames = response.numericalFeatureNames;

                        // Setting summary stats - sample size
                        paragraph.find('.scatter-plot-desc-note, .parallel-sets-desc-note, .trellis-desc-note, .cluster-desc-note').html(
                            "<b>*</b> Random 10000 data points from the selected table are used for visualizations."
                        );
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

            paragraph.find(".scatter-plot-options").slideUp();
            paragraph.find(".parallel-sets-options").slideUp();
            paragraph.find(".trellis-chart-options").slideUp();
            paragraph.find(".cluster-diagram-options").slideUp();
            paragraph.find(".chart-type-container").slideDown();

            paragraph.find(".chart-type option").eq(0).prop("selected", true);
        });

        var chartTypeElement = paragraph.find(".chart-type");
        chartTypeElement.change(function() {
            var chartType = chartTypeElement.val();
            switch(chartType) {
                case "Scatter Plot" :
                    chart = new ScatterPlotDiagram();
                    break;
                case "Parallel Sets" :
                    chart = new ParallelSets();
                    break;
                case "Trellis Chart" :
                    chart = new TrellisChart();
                    break;
                case "Cluster Diagram" :
                    chart = new ClusterDiagram();
                    break;
            }
            paragraphUtils.clearNotification();
            paragraph.find(".run-paragraph-button").prop("disabled", true);
        });
    };

    /**
     * Run the data explore paragraph
     *
     * @param callback {ParagraphClientRunCallback} The callback that will be called after running the paragraph
     */
    self.run = function(callback) {
        chart.draw(callback);
    };

    /**
     * Callback function for chart run
     *
     * @callback ChartRunCallback
     * @param output {jQuery} The chart
     */

    /**
     * Scatter plot prototype constructor
     *
     * @constructor
     */
    function ScatterPlotDiagram() {
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

            paragraph.find(".parallel-sets-options").slideUp();
            paragraph.find(".trellis-chart-options").slideUp();
            paragraph.find(".cluster-diagram-options").slideUp();
            paragraph.find(".scatter-plot-options").slideDown();

            paragraph.find(
                ".scatter-plot-x option," +
                ".scatter-plot-y option," +
                ".scatter-plot-group option"
            ).eq(0).prop('selected', true);

            var chartOptionsInputElements = paragraph.find(".scatter-plot-x, .scatter-plot-y, .scatter-plot-group");
            chartOptionsInputElements.change(function() {
                var runButton = paragraph.find(".run-paragraph-button");
                runButton.prop('disabled', false);
                chartOptionsInputElements.each(function (index, selectElement) {
                    if(selectElement.selectedIndex == 0) {
                        runButton.prop('disabled', true);
                    }
                });
                paragraphUtils.clearNotification();
            });
        } else {
            paragraphUtils.handleNotification("info", "Scatter plot cannot be drawn",
                "Minimum of two numerical features and one categorical feature required to draw a scatter plot"
            );
        }

        /**
         * Draw the scatter plot
         *
         * @param callback {ChartRunCallback} The callback that will be called after drawing the chart
         */
        scatterPlotSelf.draw = function(callback) {
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

            drawScatterPlot(scatterData, function(chart) {
                var chartContainer = $("<div>");
                chartContainer.append(chart);
                chartContainer.append(generateMarkerSizeCalibrator());
                callback(chartContainer);
                utils.hideLoadingOverlay(paragraph);
            }, numFeatureIndependent, numFeatureDependent, markerSize, true);
        };
    }

    /**
     * Parallel sets prototype constructor
     *
     * @constructor
     */
    function ParallelSets() {
        var parallelSetsSelf = this;

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

        paragraph.find(".scatter-plot-options").slideUp();
        paragraph.find(".trellis-chart-options").slideUp();
        paragraph.find(".cluster-diagram-options").slideUp();
        paragraph.find(".parallel-sets-options").slideDown();

        paragraph.find(".run-paragraph-button").prop("disabled", false);

        paragraph.find(".parallel-sets-features").click(function () {
            var runButton = paragraph.find(".run-paragraph-button");
            if(paragraph.find('.parallel-sets-features:checked').size() > 1) {
                runButton.prop('disabled', false);
            } else {
                runButton.prop('disabled', true);
            }
            paragraphUtils.clearNotification();
        });

        /**
         * Draw the parallel sets
         *
         * @param callback {ChartRunCallback} The callback that will be called after drawing the chart
         */
        parallelSetsSelf.draw = function(callback) {
            utils.showLoadingOverlay(paragraph);
            // get categorical feature list from checkbox selection
            var parallelSetsFeatureNames = [];
            paragraph.find('.parallel-sets-features:checked').each(function() {
                parallelSetsFeatureNames.push($(this).val().replace(/^\s+|\s+$/g, '').replace(/\\"/g, '"'));
            });

            var points = getChartPoints(parallelSetsFeatureNames);
            var chartElement = $("<div class='chart'>");
            var chart = d3.parsets().dimensions(parallelSetsFeatureNames).tension(1.0).width(800).height(670);
            var vis = d3.select(chartElement.get(0)).append("svg")
                .attr("width", chart.width())
                .attr("height", chart.height())
                .style("font-size", "12px");
            vis.datum(points).call(chart);
            callback(chartElement);

            utils.hideLoadingOverlay(paragraph);
        };
    }

    /**
     * Trellis chart prototype constructor
     *
     * @constructor
     */
    function TrellisChart() {
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

            paragraph.find(".scatter-plot-options").slideUp();
            paragraph.find(".parallel-sets-options").slideUp();
            paragraph.find(".cluster-diagram-options").slideUp();
            paragraph.find(".trellis-chart-options").slideDown();

            paragraph.find(".trellis-chart-categorical-feature option").eq(0).prop("selected", true);

            var runButton = paragraph.find(".run-paragraph-button");
            paragraph.find(".trellis-chart-numerical-features").click(function () {
                adjustRunButton();
            });
            paragraph.find(".trellis-chart-categorical-feature").change(function () {
                adjustRunButton();
            });
        } else {
            paragraphUtils.handleNotification("info", "Trellis chart cannot be drawn",
                "Minimum of one numerical features and one categorical feature required to draw a trellis chart"
            );
        }

        /**
         * Adjust the run button in the paragraph if the requirements for trellis chart had been met
         */
        function adjustRunButton() {
            if(paragraph.find(".trellis-chart-categorical-feature").get(0).selectedIndex != 0 &&
                paragraph.find('.trellis-chart-numerical-features:checked').size() > 0) {
                runButton.prop('disabled', false);
            } else {
                runButton.prop('disabled', true);
            }
            paragraphUtils.clearNotification();
        }

        /**
         * Draw the trellis chart
         *
         * @param callback {ChartRunCallback} The callback that will be called after drawing the chart
         */
        trellisChartSelf.draw = function(callback) {
            utils.showLoadingOverlay(paragraph);
            var featureNames = [];
            // get selected categorical feature
            var categoricalHeader = paragraph.find(".trellis-chart-categorical-feature").val().replace(/^\s+|\s+$/g, "");
            featureNames[0] = categoricalHeader.replace(/\\"/g, '"');
            // get numerical feature list from checkbox selection
            paragraph.find(".trellis-chart-numerical-features:checked").each(function() {
                featureNames.push($(this).val().replace(/^\s+|\s+$/g, "").replace(/\\"/g, '"'));
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
            callback(chartContainer);
            utils.hideLoadingOverlay(paragraph);
        };
    }

    /**
     * Cluster diagram prototype constructor
     *
     * @constructor
     */
    function ClusterDiagram() {
        var clusterDiagramSelf = this;

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

            paragraph.find(
                ".cluster-diagram-independent-feature option," +
                ".cluster-diagram-dependent-feature option," +
                ".cluster-diagram-features-count option"
            ).eq(0).prop("selected", true);

            var chartOptionsInputElements = paragraph.find(".cluster-diagram-independent-feature, " +
                ".cluster-diagram-dependent-feature, " +
                ".cluster-diagram-features-count");
            chartOptionsInputElements.change(function() {
                var runButton = paragraph.find(".run-paragraph-button");
                runButton.prop('disabled', false);
                chartOptionsInputElements.each(function (index, selectElement) {
                    if(selectElement.selectedIndex == 0) {
                        runButton.prop('disabled', true);
                    }
                });
                paragraphUtils.clearNotification();
            });
        }

        /**
         * Draw the cluster diagram
         *
         * @param callback {ChartRunCallback} The callback that will be called after drawing the chart
         */
        clusterDiagramSelf.draw = function(callback) {
            drawClusterDiagram();

            // keeps cluster data to redraw chart on marker size change
            var redrawClusterData = [];

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
                            drawScatterPlot(clusterData, function (chart) {
                                var chartContainer = $("<div>");
                                chartContainer.append(chart);
                                chartContainer.append(generateMarkerSizeCalibrator());
                                callback(chartContainer);
                                utils.hideLoadingOverlay(paragraph);
                            }, numericalFeatureIndependent, numericalFeatureDependent, markerSize, false);
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

            // redraw cluster diagram with existing cluster data
            function redrawClusterDiagram() {
                // get categorical feature list from checkbox selection
                var numericalFeatureIndependent = paragraph.find(".cluster-independent").val().replace(/^\s+|\s+$/g, '');
                var numericalFeatureDependent = paragraph.find(".cluster-dependent").val().replace(/^\s+|\s+$/g, '');

                paragraph.find(".clusterDiagram").empty();
                var scatter = new ScatterPlot(redrawClusterData);

                scatter.setPlotingAreaWidth(720);
                scatter.setPlotingAreaHeight(560);
                scatter.setMarkerSize(markerSize);
                scatter.setLegend(false);
                scatter.setXAxisText(numericalFeatureIndependent);
                scatter.setYAxisText(numericalFeatureDependent);
                scatter.plot(d3.select(paragraph.find(".clusterDiagram").get(0)));
            }
        };
    }

    function drawHistogram(data, divID) {
        $(divID + ' svg').empty();

        nv.addGraph(function() {
            var chart = nv.models.linePlusBarChart()
                .margin({
                    top: 30,
                    right: 60,
                    bottom: 50,
                    left: 70
                })
                .x(function(d, i) {
                    return i
                })
                .y(function(d) {
                    return d[1]
                })
                .color(["#f16c20"]);

            chart.xAxis
                .showMaxMin(false)
                .tickFormat(function(d) {
                    return data[0].values[d][0];
                });

            chart.y1Axis
                .tickFormat(d3.format(',f'));

            chart.y2Axis
                .tickFormat(function(d) {
                    return '$' + d3.format(',f')(d)
                });

            chart.bars.forceY([0]);

            d3.select(divID + ' svg')
                .datum(data)
                .transition().duration(500)
                .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });
    }

    // drawing a simple scatter graph
    function drawScatterPlot(data, callback, xLabel, yLabel, markerSize, legendEnabled) {
        var chartElement = $("<div class='chart'>");
        var scatter = new ScatterPlot(data);

        scatter.setPlotingAreaWidth(720);
        scatter.setPlotingAreaHeight(560);
        scatter.setMarkerSize(markerSize);
        scatter.setLegend(legendEnabled);
        scatter.setXAxisText(xLabel);
        scatter.setYAxisText(yLabel);
        scatter.plot(d3.select(chartElement.get(0)));

        callback(chartElement);
    }

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
            self.run(function(output) {
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
