/**
 * Data explore paragraph client prototype
 *
 * @param paragraph The paragraph in which the client resides in
 * @param id {int} unique paragraph id assigned to the paragraph
 * @constructor
 */
function DataExploreParagraphClient(paragraph, id) {
    var self = this;

    var sampledData;

    var categoricalFeatureNames = [];
    var numericalFeatureNames = [];

    var scatterMarkerSize = -1;
    var trellisMarkerSize = -1;
    var clusterMarkerSize = -1;

    self.initialize = function () {
        new ParagraphUtils().loadTableNames(paragraph);
    };

    self.run = function (callback) {
        // Loading the chart into the output view
        callback($("<div>").load("output-view-templates/data-explore.html", function () {
            // Generating ids for tabs
            var chartClasses = ["scatter-plot", "parallel-sets", "trellis-chart", "cluster-diagram"];
            for (var i = 0; i < chartClasses.length; i++) {
                console.log(paragraph.find("." + chartClasses[i]).parent().html());
                console.log(paragraph.find("." + chartClasses[i] + "-link").parent().html());
                paragraph.find("." + chartClasses[i]).attr("id", chartClasses[i] + id);
                paragraph.find("." + chartClasses[i] + "-link").attr("href", "#" + chartClasses[i] + id);
            }

            // Setting event listeners for redrawing charts upon changes in selections
            paragraph.find("select[class='scatter-x'], select[class='scatter-y'], select[class='scatter-group']").change(function () {
                paragraph.find(".scatter").html("Loading chart...");
                drawPlotsAjax();
            });
            paragraph.find("input[class='categoricalFeatureNames']").change(function () {
                paragraph.find(".parallelSets").html("Loading chart...");
                drawParallelSets();
            });
            paragraph.find("input[class='numericalFeatureNames'], select[class='trellis-cat-features']").change(function () {
                paragraph.find(".trellisChart").html("Loading chart...");
                drawTrellisChart();
            });
            paragraph.find("select[class='cluster-independent'], select[class='cluster-dependent'], select[class='cluster-num-clusters']").change(function () {
                paragraph.find(".clusterDiagram").html("Loading chart...");
                drawClusterDiagram();
            });

            scatterMarkerSize = paragraph.find('.scatter-marker-size-input').val();
            trellisMarkerSize = paragraph.find('.trellis-marker-size-input').val();
            clusterMarkerSize = paragraph.find('.cluster-marker-size-input').val();

            // Binding events to chart links
            paragraph.find('.scatter-plot-link').click(function (e) {
                e.preventDefault();
                drawScatterPlotBase();
            });
            paragraph.find('.parallel-sets-link').click(function (e) {
                e.preventDefault();
                drawParallelSetsBase();
            });
            paragraph.find('.trellis-chart-link').click(function (e) {
                e.preventDefault();
                drawTrellisChartBase();
            });
            paragraph.find('.cluster-diagram-link').click(function (e) {
                e.preventDefault();
                drawClusterDiagramBase();
            });

            // Disabling tabs
            paragraph.find(".wr-tabs-grphs > li").click(function () {
                if ($(this).hasClass("disabled")) {
                    return false;
                }
            });

            // Event listeners for chart marker size changes
            paragraph.find(".scatter-marker-size").on("click", function (e) {
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
                paragraph.find(".scatter").html("Loading chart...");
                drawPlotsAjax();
            });

            paragraph.find(".trellis-marker-size").on("click", function (e) {
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
                drawTrellisChart();
            });

            paragraph.find(".cluster-marker-size").on("click", function (e) {
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


            var tableName = paragraph.find(".input-table").val();
            var sampleSize = paragraph.find(".sample-size").val();
            $.ajax({
                type: "GET",
                url: constants.API_URI + "data-explore/sample?table-name=" + tableName + "&sample-size=" + sampleSize,
                success: function (data) {
                    sampledData = data;

                    // Disable tabs based on the features
                    removeTabs();

                    // Select the active tab on page load
                    selectActiveTab();
                }
            });

            // Setting summary stats - sample size
            $('#scatter-desc-note, #parallel-sets-desc-note, #trellis-desc-note, #cluster-desc-note').html(
                "<b>*</b> Random " + paragraph.find(".sample-size").val() + ' data points from the selected table are used for visualizations.'
            );
        }));
    };


    // select the active tab based on the feature types
    function selectActiveTab() {
        if (numericalFeatureNames.length > 1 && categoricalFeatureNames.length > 0) {
            paragraph.find('.scatter-plot-link').click();
        } else if (categoricalFeatureNames.length > 1) {
            paragraph.find('.parallel-sets-link').click();
        } else if (categoricalFeatureNames.length > 0 && numericalFeatureNames.length > 0) {
            paragraph.find('.trellis-chart-link').click();
        } else if (numericalFeatureNames.length > 1) {
            paragraph.find('.cluster-diagram-link').click();
        }
    }

    // remove unsupported tabs
    function removeTabs() {
        if (!(numericalFeatureNames.length > 1 && categoricalFeatureNames.length > 0)) {
            paragraph.find('#scatter-plot-li').remove();
        }
        if (categoricalFeatureNames.length < 2) {
            paragraph.find('#parallel-sets-li').remove();
        }
        if (!(categoricalFeatureNames.length > 0 && numericalFeatureNames.length > 0)) {
            paragraph.find('#trellis-chart-li').remove();
        }
        if (numericalFeatureNames.length < 2) {
            paragraph.find('#cluster-diagram-li').remove();
        }
    }

    function drawScatterPlotBase() {
        if (numericalFeatureNames.length > 1 && categoricalFeatureNames.length > 0) {
            paragraph.find('.scatter-x, .scatter-y, .scatter-group').empty();
            $.each(numericalFeatureNames, function (index, feature) {
                paragraph.find('.scatter-x, .scatter-y').append($('<option>', {
                    value: sanitize(feature),
                    text: sanitize(feature)
                }));
            });
            paragraph.find('.scatter-y option')[1].selected = true;
            $.each(categoricalFeatureNames, function (index, feature) {
                paragraph.find('.scatter-group').append($('<option>', {
                    value: sanitize(feature),
                    text: sanitize(feature)
                }));
            });
            drawPlotsAjax();
        } else {
            var infoText = "Minimum of two numerical features and one categorical feature required to draw a scatter plot.";
            paragraph.find(".scatter").html(buildNotification(infoText, 'info'));
        }
    }

    function drawPlotsAjax() {
        var numFeatureIndependent = paragraph.find(".scatter-x").val().replace(/^\s+|\s+$/g, '');
        var numFeatureDependent = paragraph.find(".scatter-y").val().replace(/^\s+|\s+$/g, '');
        var catFeature = paragraph.find(".scatter-group").val().replace(/^\s+|\s+$/g, '');

        var numFeatureIndependentEscaped = paragraph.find(".scatter-x").val().replace(/^\s+|\s+$/g, '').replace(/"/g, "\\\"");
        var numFeatureDependentEscaped = paragraph.find(".scatter-y").val().replace(/^\s+|\s+$/g, '').replace(/"/g, "\\\"");
        var catFeatureEscaped = paragraph.find(".scatter-group").val().replace(/^\s+|\s+$/g, '').replace(/"/g, "\\\"");

        // get scatter plot data
        var jsonData = '{"xAxisFeature" : "' + numFeatureIndependentEscaped +
            '","yAxisFeature" : "' + numFeatureDependentEscaped +
            '","groupByFeature" : "' + catFeatureEscaped + '"}';
        $.ajax({
            type: "POST",
            url: constants.API_URI + "/data-explorer/scatter-plot",
            data: jsonData,
            async: false,
            success: function (data) {
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

                drawScatterPlot(scatterData, "#scatter", numFeatureIndependent, numFeatureDependent, scatterMarkerSize, true);
                paragraph.find(".scatterPlotTitle").html(numFeatureIndependent + " vs. " + numFeatureDependent);
            }
        });

        // get summary data for independent variable
        $.ajax({
            type: "GET",
            url: constants.API_URI + "/api/analyses/" + analysisId + "/stats?feature=" + numFeatureIndependent,
            async: false,
            success: function (res) {
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
            success: function (res) {
                var jsonObj = res;
                var summary = "Mean: " + jsonObj[0].mean + "&emsp;&emsp;&emsp; Median: " + jsonObj[0].median + "<br><br>Std: " + jsonObj[0].std + "&emsp;&emsp;&emsp; Skewness: " + jsonObj[0].skewness;
                paragraph.find(".histogramDependentTitle").html(numFeatureDependent);
                paragraph.find(".numFeatureDependentSummary").html(summary);
                drawHistogram(jsonObj, "#histogramDependent");
            }
        });
    }

    function drawHistogram(data, divID) {
        $(divID + ' svg').empty();

        nv.addGraph(function () {
            var chart = nv.models.linePlusBarChart()
                .margin({
                    top: 30,
                    right: 60,
                    bottom: 50,
                    left: 70
                })
                .x(function (d, i) {
                    return i
                })
                .y(function (d) {
                    return d[1]
                })
                .color(["#f16c20"]);

            chart.xAxis
                .showMaxMin(false)
                .tickFormat(function (d) {
                    return data[0].values[d][0];
                });

            chart.y1Axis
                .tickFormat(d3.format(',f'));

            chart.y2Axis
                .tickFormat(function (d) {
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

    function drawParallelSetsBase() {
        paragraph.find('.parallel-sets-features').empty();
        $.each(categoricalFeatureNames, function (index, feature) {
            if (index < 4) {
                paragraph.find('.parallel-sets-features').append("<label class='checkbox'><input type='checkbox' class='categoricalFeatureNames' id='inlineCheckbox1' value='" + categoricalFeatureNames[index].trim().replace(/"/g, "\\\"") + "' checked>" + categoricalFeatureNames[index] + "</label>");
            } else {
                paragraph.find('.parallel-sets-features').append("<label class='checkbox'><input type='checkbox' class='categoricalFeatureNames' id='inlineCheckbox1' value='" + categoricalFeatureNames[index].trim().replace(/"/g, "\\\"") + "'>" + categoricalFeatureNames[index] + "</label>");
            }
        });
        drawParallelSets();
    }

    function drawParallelSets() {
        // get categorical feature list from checkbox selection
        var catFeaturesDropdownValues = [];
        paragraph.find('.categoricalFeatureNames:checked').each(function () {
            catFeaturesDropdownValues.push($(this).val().replace(/^\s+|\s+$/g, '').replace(/\\"/g, '"'));
        });

        var noOfCategoricalFeatures = catFeaturesDropdownValues.length;

        if (noOfCategoricalFeatures > 1) {
            $.ajax({
                type: "GET",
                url: constants.API_URI + "/api/datasets/" + datasetId + "/charts?features=" + catFeaturesDropdownValues.toString(),
                async: false,
                success: function (res) {
                    var categoricalFeatureArray = [catFeaturesDropdownValues.length];
                    for (var i = 0; i < noOfCategoricalFeatures; i++) {
                        categoricalFeatureArray[i] = catFeaturesDropdownValues[i];
                    }
                    // clear the div contains parallel sets chart
                    paragraph.find(".parallelSets").html("");
                    var chart = d3.parsets().dimensions(categoricalFeatureArray).tension(1.0).width(800).height(670);
                    var vis = d3.select("#parallelSets").append("svg").attr("width", chart.width()).attr("height", chart.height()).style("font-size", "12px");

                    vis.datum(res).call(chart);
                }
            });
        } else {
            var infoText = "Minimum of two categorical features required for parallel sets.";
            paragraph.find(".parallelSets").html(buildNotification(infoText, 'info'));
        }
    }

    function drawTrellisChartBase() {
        if (categoricalFeatureNames.length > 0 && numericalFeatureNames.length > 0) {
            paragraph.find('#trellis-cat-features').empty();
            $.each(categoricalFeatureNames, function (index, feature) {
                $('#trellis-cat-features').append($('<option>', {
                    value: sanitize(feature).trim().replace(/"/g, "\\\""),
                    text: sanitize(feature)
                }));
            });

            $('#trellis-num-features').empty();
            $.each(numericalFeatureNames, function (index, feature) {
                // first 4 categorical features are plotted by default
                if (index < 4) {
                    paragraph.find('.trellis-num-features').append("<label class='checkbox'><input type='checkbox' class='numericalFeatureNames' value='" + numericalFeatureNames[index].trim().replace(/"/g, "\\\"") + "' checked>" + numericalFeatureNames[index] + "</label>");
                } else {
                    paragraph.find('.trellis-num-features').append("<label class='checkbox'><input type='checkbox' class='numericalFeatureNames' value='" + numericalFeatureNames[index].trim().replace(/"/g, "\\\"") + "'>" + numericalFeatureNames[index] + "</label>");
                }
            });
            drawTrellisChart();
        }
    }

    function drawTrellisChart() {
        var featureNames = [];
        // get selected categorical feature
        var categoricalHeader = paragraph.find(".trellis-cat-features").val().replace(/^\s+|\s+$/g, '');
        featureNames[0] = categoricalHeader.replace(/\\"/g, '"');
        // get numerical feature list from checkbox selection
        paragraph.find('.numericalFeatureNames:checked').each(function () {
            featureNames.push($(this).val().replace(/^\s+|\s+$/g, '').replace(/\\"/g, '"'));
        });

        $.ajax({
            type: "GET",
            url: constants.API_URI + "/api/datasets/" + datasetId + "/charts?features=" + featureNames.toString(),
            async: false,
            success: function (res) {
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
                        function (d) {
                            return d !== categoricalHeader;
                        }),
                    n = traits.length;

                traits.forEach(function (trait) {
                    domainByTrait[trait] = d3.extent(data, function (d) {
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
                    "class", "x axis").attr("transform", function (d, i) {
                    return "translate(" + (n - i - 1) * size + ",0)";
                }).each(function (d) {
                    x.domain(domainByTrait[d]);
                    d3.select(this).call(xAxis);
                });

                svg.selectAll(".y.axis").data(traits).enter().append("g").attr(
                    "class", "y axis").attr("transform", function (d, i) {
                    return "translate(0," + i * size + ")";
                }).each(function (d) {
                    y.domain(domainByTrait[d]);
                    d3.select(this).call(yAxis);
                });

                var cell = svg.selectAll(".cell").data(cross(traits, traits))
                    .enter().append("g").attr("class", "cell").attr(
                        "transform",
                        function (d) {
                            return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")";
                        }).each(plot);

                // Titles for the diagonal
                cell.filter(function (d) {
                    return d.i === d.j;
                }).append("text").attr("x", padding).attr("y", padding).attr("dy",
                    ".71em").text(function (d) {
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
                        .attr("cx", function (d) {
                            return x(d[p.x]);
                        }).attr("cy", function (d) {
                        return y(d[p.y]);
                    }).attr("r", trellisMarkerSize).style("fill", function (d) {
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
                        function (d) {
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

    function drawClusterDiagramBase() {
        if (numericalFeatureNames.length > 1) {
            paragraph.find('.cluster-independent, .cluster-dependent').empty();
            $.each(numericalFeatureNames, function (index, feature) {
                paragraph.find('.cluster-independent, #cluster-dependent').append($('<option>', {
                    value: sanitize(feature),
                    text: sanitize(feature)
                }));
            });
            // make second option selected by default
            paragraph.find('.cluster-dependent option')[1].selected = true;

            drawClusterDiagram();
        }
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
            success: function (response) {
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