/**
 * Data explore paragraph client prototype
 *
 * @param paragraph The paragraph in which the client resides in
 * @param id {int} unique paragraph id assigned to the paragraph
 * @constructor
 */
function DataExploreParagraphClient(paragraph, id) {
    var self = this;

    var sample;

    var categoricalFeatureNames = [];
    var numericalFeatureNames = [];

    var chart;

    var scatterMarkerSize = -1;
    var trellisMarkerSize = -1;
    var clusterMarkerSize = -1;

    self.initialize = function () {
        new ParagraphUtils().loadTableNames(paragraph);

        paragraph.find(".input-table").change(function () {
            var tableName = paragraph.find(".input-table").val();
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
                        new ParagraphUtils().handleError(paragraph, response.message);
                    }
                }
            });
            paragraph.find(".scatter-plot-options").fadeOut();
            paragraph.find(".chart-type-container").fadeIn();
        });

        paragraph.find(".chart-type").change(function(event) {
            var chartType = $(event.target).val();

            switch(chartType) {
                case "Scatter Plot" :
                    chart = new ScatterPlot();
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
        });
    };

    self.run = function(callback) {
        chart.draw(callback);
    };

    function ScatterPlot() {
        var scatterPlotSelf = this;

        if (numericalFeatureNames.length > 1 && categoricalFeatureNames.length > 0) {
            scatterMarkerSize = paragraph.find('.scatter-plot-marker-size-input').val();

            // Event listener for chart marker size changes
            paragraph.find(".scatter-plot-marker-size").click(function(e) {
                e.preventDefault();
                var $button = $(this);
                var oldValue = $button.closest('.sp-quantity').find("input.quntity-input").val();

                var newValue;
                if ($button.data('operator') == "+") {
                    newValue = parseFloat(oldValue) + 1;
                } else {
                    // Don't allow decrementing below 1
                    if (oldValue > 1) {
                        newValue = parseFloat(oldValue) - 1;
                    } else {
                        newValue = 1;
                    }
                }
                scatterMarkerSize = newValue;
                $button.closest('.sp-quantity').find("input.quntity-input").val(newValue);
                paragraph.find(".scatter-plot").html("Loading chart...");
            });

            // Showing the relevant options for the chart
            paragraph.find('.scatter-plot-x, .scatter-plot-y, .scatter-plot-group').html("<option disabled selected value> -- select an option -- </option>");
            $.each(numericalFeatureNames, function(index, feature) {
                paragraph.find('.scatter-plot-x, .scatter-plot-y').append("<option>" + sanitize(feature) + "</option>");
            });
            $.each(categoricalFeatureNames, function(index, feature) {
                paragraph.find('.scatter-plot-group').append("<option>" + sanitize(feature) + "</option>");
            });

            paragraph.find(".parallel-sets-options").fadeOut();
            paragraph.find(".trellis-chart-options").fadeOut();
            paragraph.find(".cluster-diagram-options").fadeOut();
            paragraph.find(".scatter-plot-options").fadeIn();
        } else {
            new Utils().handleError(
                paragraph,
                "Minimum of two numerical features and one categorical feature required to draw a scatter plot"
            );
        }

        scatterPlotSelf.draw = function(callback) {
            var numFeatureIndependent = paragraph.find(".scatter-plot-x").val().replace(/^\s+|\s+$/g, '');
            var numFeatureDependent = paragraph.find(".scatter-plot-y").val().replace(/^\s+|\s+$/g, '');
            var catFeature = paragraph.find(".scatter-plot-group").val().replace(/^\s+|\s+$/g, '');

            var numFeatureIndependentEscaped = paragraph.find(".scatter-plot-x").val().replace(/^\s+|\s+$/g, '').replace(/"/g, "\\\"");
            var numFeatureDependentEscaped = paragraph.find(".scatter-plot-y").val().replace(/^\s+|\s+$/g, '').replace(/"/g, "\\\"");
            var catFeatureEscaped = paragraph.find(".scatter-plot-group").val().replace(/^\s+|\s+$/g, '').replace(/"/g, "\\\"");

            // get scatter plot data
            var jsonData = '{"xAxisFeature" : "' + numFeatureIndependentEscaped +
                '","yAxisFeature" : "' + numFeatureDependentEscaped +
                '","groupByFeature" : "' + catFeatureEscaped + '"}';
            $.ajax({
                type: "POST",
                url: constants.API_URI + "/data-explorer/scatter-plot-plot",
                data: jsonData,
                async: false,
                success: function(data) {
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

                    drawScatterPlot(scatterData, ".scatter-plot", numFeatureIndependent, numFeatureDependent, scatterMarkerSize, true);
                    paragraph.find(".scatterPlotTitle").html(numFeatureIndependent + " vs. " + numFeatureDependent);
                }
            });

            // get summary data for independent variable
            $.ajax({
                type: "GET",
                url: constants.API_URI + "/api/analyses/" + analysisId + "/stats?feature=" + numFeatureIndependent,
                async: false,
                success: function(res) {
                    var jsonObj = res;
                    var summary = "Mean: " + jsonObj[0].mean + "&emsp;&emsp;&emsp;  Median: " + jsonObj[0].median + "<br><br>Std: " + jsonObj[0].std + "&emsp;&emsp;&emsp; Skewness: " + jsonObj[0].skewness;
                    paragraph.find(".histogramIndependentTitle").html(numFeatureIndependent);
                    paragraph.find(".numFeatureIndependentSummary").html(summary);
                    drawHistogram(jsonObj, "#histogramIndependent");
                }
            });

            // get summary data for dependent variable
            $.ajax({
                type: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                url: constants.API_URI + "/api/analyses/" + analysisId + "/stats?feature=" + numFeatureDependent,
                async: false,
                success: function(res) {
                    var jsonObj = res;
                    var summary = "Mean: " + jsonObj[0].mean + "&emsp;&emsp;&emsp; Median: " + jsonObj[0].median + "<br><br>Std: " + jsonObj[0].std + "&emsp;&emsp;&emsp; Skewness: " + jsonObj[0].skewness;
                    paragraph.find(".histogramDependentTitle").html(numFeatureDependent);
                    paragraph.find(".numFeatureDependentSummary").html(summary);
                    drawHistogram(jsonObj, "#histogramDependent");
                }
            });
        };
    }

    function ParallelSets() {
        var parallelSetsSelf = this;

        paragraph.find('.parallel-sets-features').empty();
        $.each(categoricalFeatureNames, function(index, feature) {
            paragraph.find('.parallel-sets-features').append(
                "<div class='row'><label class='checkbox'>" +
                    "<input type='checkbox' class='parallel-sets-feature-names' value='" + feature.trim().replace(/"/g, "\\\"") + "' " + (index < 4 ? "checked" : "") + ">" +
                    "<span class='helper'>" + feature + "</span>" +
                "</label></div>"
            );
        });

        paragraph.find(".scatter-plot-options").fadeOut();
        paragraph.find(".trellis-chart-options").fadeOut();
        paragraph.find(".cluster-diagram-options").fadeOut();
        paragraph.find(".parallel-sets-options").fadeIn();

        parallelSetsSelf.draw = function(callback) {
            // get categorical feature list from checkbox selection
            var parallelSetsFeatureNames = [];
            paragraph.find('.parallel-sets-feature-names:checked').each(function() {
                parallelSetsFeatureNames.push($(this).val().replace(/^\s+|\s+$/g, '').replace(/\\"/g, '"'));
            });

            var noOfCategoricalFeatures = parallelSetsFeatureNames.length;

            if (noOfCategoricalFeatures > 1) {
                var samplePoints = sample.samplePoints;
                var dataHeaders = sample.headerMap;
                var points = [];

                // for each row in a selected categorical feature, iterate through all features
                for (var row = 0; row < samplePoints[dataHeaders[parallelSetsFeatureNames[0]]].length; row++) {
                    var data = {};

                    // for each categorical feature in same row put value into a point(JSONObject)
                    // {"Soil_Type1":"0","Soil_Type11":"0","Soil_Type10":"0","Cover_Type":"4"}
                    for (var featureCount = 0; featureCount < parallelSetsFeatureNames.length; featureCount++) {
                        data[parallelSetsFeatureNames[featureCount]] =
                            samplePoints[dataHeaders[parallelSetsFeatureNames[featureCount]]][row];
                    }

                    points.push(data);
                }

                var chartElement = $("<div>");
                var chart = d3.parsets().dimensions(parallelSetsFeatureNames).tension(1.0).width(800).height(670);
                var vis = d3.select(chartElement.get(0)).append("svg").attr("width", chart.width()).attr("height", chart.height()).style("font-size", "12px");
                vis.datum(points).call(chart);
                callback(chartElement);
            } else {
                new Utils().handleError(
                    paragraph,
                    "Minimum of two categorical features required for parallel sets"
                );
            }
        };
    }

    function TrellisChart() {
        var trellisChartSelf = this;

        if (categoricalFeatureNames.length > 0 && numericalFeatureNames.length > 0) {
            trellisMarkerSize = paragraph.find('.trellis-marker-size-input').val();

            // Event listener for chart marker size changes
            paragraph.find(".trellis-marker-size").click(function(e) {
                e.preventDefault();
                var $button = $(this);
                var oldValue = $button.closest('.sp-quantity').find("input.quntity-input").val();

                var newValue;
                if ($button.data('operator') == "+") {
                    newValue = parseFloat(oldValue) + 1;
                } else {
                    // Don't allow decrementing below 1
                    if (oldValue > 1) {
                        newValue = parseFloat(oldValue) - 1;
                    } else {
                        newValue = 1;
                    }
                }
                trellisMarkerSize = newValue;
                $button.closest('.sp-quantity').find("input.quntity-input").val(newValue);
                paragraph.find(".trellisChart").html("Loading chart...");
            });

            paragraph.find('.trellis-chart-categorical-features').html(
                "<option disabled selected value> -- select an option -- </option>"
            );
            $.each(categoricalFeatureNames, function(index, feature) {
                paragraph.find('.trellis-chart-categorical-features').append(
                    "<option value='" + sanitize(feature).trim().replace(/"/g, "\\\"") + "'>" + sanitize(feature) + "</option>"
                );
            });

            paragraph.find('.trellis-chart-numerical-features').empty();
            $.each(numericalFeatureNames, function(index, feature) {
                paragraph.find('.trellis-chart-numerical-features').append(
                    "<label class='checkbox'>" +
                        "<input type='checkbox' class='numericalFeatureNames' value='" + feature.trim().replace(/"/g, "\\\"") + "' " + (index < 4 ? "checked" : "") + ">" + feature +
                    "</label>"
                );
            });

            paragraph.find(".scatter-plot-options").fadeOut();
            paragraph.find(".parallel-sets-options").fadeOut();
            paragraph.find(".cluster-diagram-options").fadeOut();
            paragraph.find(".trellis-chart-options").fadeIn();
        } else {
            new Utils().handleError(
                paragraph,
                "Minimum of one numerical features and one categorical feature required to draw a trellis chart"
            );
        }

        trellisChartSelf.draw = function(callback) {

        };
    }

    function ClusterDiagram() {
        var clusterDiagramSelf = this;

        if (numericalFeatureNames.length > 1) {
            clusterMarkerSize = paragraph.find('.cluster-marker-size-input').val();

            // Event listener for chart marker size changes
            paragraph.find(".cluster-marker-size").click(function(e) {
                e.preventDefault();
                var $button = $(this);
                var oldValue = $button.closest('.sp-quantity').find("input.quntity-input").val();

                var newValue;
                if ($button.data('operator') == "+") {
                    newValue = parseFloat(oldValue) + 1;
                } else {
                    // Don't allow decrementing below 1
                    if (oldValue > 1) {
                        newValue = parseFloat(oldValue) - 1;
                    } else {
                        newValue = 1;
                    }
                }
                clusterMarkerSize = newValue;
                $button.closest('.sp-quantity').find("input.quntity-input").val(newValue);
                paragraph.find(".clusterDiagram").html("Loading chart...");
                redrawClusterDiagram();
            });

            paragraph.find('.cluster-independent-feature, .cluster-dependent-feature').html(
                "<option disabled selected value> -- select an option -- </option>"
            );
            $.each(numericalFeatureNames, function(index, feature) {
                paragraph.find('.cluster-independent-feature, .cluster-dependent-feature').append(
                    "<option value='" + sanitize(feature) + "'>" + sanitize(feature) + "</option>"
                );
            });
            // make second option selected by default
            paragraph.find('.cluster-dependent option')[1].selected = true;

            paragraph.find(".scatter-plot-options").fadeOut();
            paragraph.find(".parallel-sets-options").fadeOut();
            paragraph.find(".trellis-chart-options").fadeOut();
            paragraph.find(".cluster-diagram-options").fadeIn();
        }

        clusterDiagramSelf.draw = function(callback) {

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


    function drawTrellisChart() {
        var featureNames = [];
        // get selected categorical feature
        var categoricalHeader = paragraph.find(".trellis-cat-features").val().replace(/^\s+|\s+$/g, '');
        featureNames[0] = categoricalHeader.replace(/\\"/g, '"');
        // get numerical feature list from checkbox selection
        paragraph.find('.numericalFeatureNames:checked').each(function() {
            featureNames.push($(this).val().replace(/^\s+|\s+$/g, '').replace(/\\"/g, '"'));
        });

        $.ajax({
            type: "GET",
            url: constants.API_URI + "/api/datasets/" + datasetId + "/charts?features=" + featureNames.toString(),
            async: false,
            success: function(res) {
                /* D3.js Trellis Chart code */
                var width = 960,
                    size = 155,
                    padding = 19.5;
                var x = d3.scale.linear().range([padding / 2, size - padding / 2]);
                var y = d3.scale.linear().range([size - padding / 2, padding / 2]);
                var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);
                var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
                var color = d3.scale.category10();

                var data = res;

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

                paragraph.find(".trellisChart").html("");
                var svg = d3.select("#trellisChart").append("svg").attr("width",
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

                    cell.append("rect").attr("class", "frame").attr("x",
                        padding / 2).attr("y", padding / 2).attr("width",
                        size - padding).attr("height", size - padding);

                    cell.selectAll("circle").data(data).enter().append("circle")
                        .attr("cx", function(d) {
                            return x(d[p.x]);
                        }).attr("cy", function(d) {
                        return y(d[p.y]);
                    }).attr("r", trellisMarkerSize).style("fill", function(d) {
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

                d3.select(self.frameElement).style("height", size * n + padding + 20 + "px");
                // array for parsets dimensions with categorical feature names
            }
        });
    }

    // keeps cluster data to redraw chart on marker size change
    var redrawClusterData = [];

    function drawClusterDiagram() {
        // get categorical feature list from checkbox selection
        var numericalFeatureIndependent = paragraph.find(".cluster-independent").val().replace(/^\s+|\s+$/g, '');
        var numericalFeatureDependent = paragraph.find(".cluster-dependent").val().replace(/^\s+|\s+$/g, '');
        var noOfClusters = paragraph.find(".cluster-num-clusters").val().replace(/^\s+|\s+$/g, '');

        // make ajax call
        $.ajax({
            type: "GET",
            url: constants.API_URI + "/api/datasets/" + datasetId + "/cluster?features=" + numericalFeatureIndependent + "," + numericalFeatureDependent + "&noOfClusters=" + noOfClusters,
            success: function(response) {
                var dataArray = response;
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
                drawScatterPlot(clusterData, "#clusterDiagram", numericalFeatureIndependent, numericalFeatureDependent, clusterMarkerSize, false);
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
        scatter.setMarkerSize(clusterMarkerSize);
        scatter.setLegend(false);
        scatter.setXAxisText(numericalFeatureIndependent);
        scatter.setYAxisText(numericalFeatureDependent);
        scatter.plot(d3.select(paragraph.find(".clusterDiagram").get(0)));
    }

    // drawing a simple scatter graph
    function drawScatterPlot(data, cssClass, xLabel, yLabel, markerSize, legendEnabled) {
        paragraph.find(cssClass).empty();
        var scatter = new ScatterPlot(data);

        scatter.setPlotingAreaWidth(720);
        scatter.setPlotingAreaHeight(560);
        scatter.setMarkerSize(markerSize);
        scatter.setLegend(legendEnabled);
        scatter.setXAxisText(xLabel);
        scatter.setYAxisText(yLabel);
        scatter.plot(d3.select(cssClass));
    }
}