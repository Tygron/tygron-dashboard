import { getLink } from "./Data";


export function barPlot(plotElementID, data, timeframe, properties, colors, titles, layout) {

    var traces = [];

    for (let i = 1;i < properties.length;i++) {

        let trace = {
            x: [],
            y: [],
            marker: {
                color: []
            },
            name: [],
            type: 'bar'
        }

        let property = properties[i];

        trace.x.push(titles[property]);
        trace.y.push(data[property][timeframe]);

        trace.marker.color.push("rgba(" + colors[property].join(",") + ")");
        trace.name = titles[property];

        traces.push(trace);
    }



    var layout = {
        showlegend: true,
    };

    copyAndStorePreviousTraceVisibility(plotElementID, traces);

    Plotly.newPlot(plotElementID, traces, layout);
}

function copyAndStorePreviousTraceVisibility(elementName, traceData) {
    let divElement = document.getElementById(elementName);
    if (divElement != null) {

        if (divElement.traceData != null) {

            for (oldTrace of divElement.traceData) {

                for (newTrace of traceData) {
                    if (newTrace.name == oldTrace.name) {
                        newTrace.visible = oldTrace.visible;
                    }
                }
            }
        }

        divElement.traceData = traceData;
    }
}

export function xyTraces(type, data, properties, colors, titles) {
    var traces = [];
    let timeframeProperty = properties[0];

    for (let i = 1;i < properties.length;i++) {

        let property = properties[i];
        let trace = {
            x: data[timeframeProperty],
            y: data[property],
            marker: {
                color: "black"
            },
            line: {
                color: "rgba(" + colors[property].join(",") + ")"
            },
            name: titles[property],
            type: type,
            mode: 'lines+markers'
        }

        traces.push(trace);
    }
    return traces;
}

/**
 * Function assumes 
 */
export function xyPlot(plotElementID,type, data, properties, colors, titles, layout) {

	let traces = xyTraces(type, data ,properties, colors, titles);

    if (layout == undefined) {
        layout = createLayout();
        layout.showLegend = true;
    }

    copyAndStorePreviousTraceVisibility(plotElementID, traces);

    Plotly.newPlot(plotElementID, traces, layout);
}

export function volumeStackedPlot(plotElementID, data, properties, colors, titles, layout, percentual = false) {

    var traces = [];
    for (let i = 1;i < properties.length;i++) {
        series = {};

        series.x = [];
        series.y = [];

        if (titles != null && titles[properties[i]] != null) {
            series.name = titles[properties[i]];
        }
        series.stackgroup = 'one';
        if (percentual) {
            series.groupnorm = 'percent';
        }
        series.fillcolor = "rgba(" + colors[properties[i]].join(",") + ")";

        for (let t = 0;t < data[properties[i]].length;t++) {
            series.x.push(data[properties[0]][t]);
            series.y.push(data[properties[i]][t]);
        }

        traces.push(series);
    }

    if (layout == undefined) {
        layout = {};
    }
    if (layout.title == undefined) {
        layout.title = {
            text: percentual ? 'Percentual Volume Stack' : 'Volume Stack'
        }
    }
    copyAndStorePreviousTraceVisibility(plotElementID, traces);

    Plotly.newPlot(plotElementID, traces, layout)
}





export function sankeyPlot(
    plotDivName,
    links,
    timeframe,
    properties,
    titles,
    layout,
    colors = null,
    positionsX = null,
    positionsY = null
) {

    let link = getLink(links, timeframe);

    labels = [];
    for (var i = 0;i < properties.length;i++) {
        labels.push(titles[properties[i]]);
    }

    let node = {
        pad: 15,
        thickness: 20,
        line: { color: "black", width: 0.5 },
        label: labels,
        align: "right"
    };

    if (colors !== null) {
        node.color = properties.map(p => colors[p]);
    }

    if (positionsX !== null && positionsY !== null) {
        node.x = properties.map(p => positionsX[p]);
        node.y = properties.map(p => positionsY[p]);
    }

    let data = {
        type: "sankey",
        orientation: "h",
        node: node,
        link: link
    };

    Plotly.newPlot(plotDivName, [data], layout);
}

export function createRadarPlot(plotDivName, labels, values, range, layout) {

    if (Array.isArray(values)) {
        console.error('Array provided for Radarplot rather than mapping. Placing values in mapping under key "Values".');
        values = { 'Values': values };
    }

    let plotLabels = labels.slice(0, labels.length);
    plotLabels.push(labels[0]);

    let plotData = [];
    for (let i in values) {

        let plotValues = [];
        for (let l = 0;l < labels.length;l++) {
            plotValues[l] = values[i][l] ?? 0;
        }

        plotValues.push(plotValues[0]);

        plotData.push({
            type: 'scatterpolar',
            r: plotValues,
            theta: plotLabels,
            fill: 'toself',
            name: i,
            showlegend: true,
        });
    }

    let plotLayout = JSON.parse(JSON.stringify(layout)); //deep copy

    plotLayout['polar'] ??= {
        radialaxis: {
            visible: true,
            direction: 'clockwise',
            range: [Math.min.apply(null, range), Math.max.apply(null, range)]
        },
        angularaxis: {
            direction: 'clockwise'
        },
    };

    Plotly.newPlot(plotDivName, plotData, plotLayout);

}

export function createPiePlot(plotDivName, labels, values, layout) {
    if (!Array.isArray(values)) {
        throw new Error('PiePlot requires an array of values. Provided was: ' + (typeof values));
    }

    let plotLabels = labels;
    let plotValues = values;

    let plotData = [{
        'labels': plotLabels,
        'values': plotValues,
        'type': 'pie',
        'sort': false
    }];

    let plotLayout = layout;

    Plotly.newPlot(plotDivName, plotData, plotLayout);

}

export function createLayout() {
    /**
     * See https://plotly.com/javascript/reference/layout/
     */

    const layout = {
        title: {
            automargin: undefined,
            font: undefined, /*{color, family, lineposition,shadow, size style, textcase, variant, weight}*/
            pad: undefined,  /*b, l ,r ,t*/
            subtitle: undefined, /*{
						font: undefined, 
						text: undefined		
						x: undefined,
						xanchor: undefined,
						xref: undefined,
						y: undefined, 
						yanchor: undefined, 
						yref: undefined,}*/

            text: undefined,
            x: undefined,
            xanchor: undefined,
            xref: undefined,
            y: undefined,
            yanchor: undefined,
            yref: undefined,
        },
        showLegend: undefined,

        legend: {
            bgcolor: undefined,
            bordercolor: undefined,
            borderwidth: undefined,
            entrywidth: undefined,
            entrywidthmode: undefined,
            font: undefined,
            groupclick: undefined,
            grouptitlefont: undefined,
            indentation: undefined,
            itemclick: undefined,
            itemdoubleclick: undefined,
            itemsizing: undefined,
        }, //etc

        xaxis: {

            title: {

                text: '',

                font: {

                }

            },

        },

        yaxis: {

            title: {

                text: '',

                font: {

                }

            }

        }
    };
    return layout;
}

export function createVolumePlotLayout() {
    const layout = createLayout();
    /**
     * Override specific settings
     */
    return layout;
}

export function createBarPlotLayout(title) {
    const layout = createLayout();
    /**
     * Override specific settings
     */
    layout.title.text = title;
    return layout;
}

export function createSankeyPlotLayout() {
    const layout = createLayout();
    /**
     * Override specific settings
     */
    return layout;
}

export function createRadarPlotLayout() {
    const layout = createLayout();
    layout['legend'] ??= {};
    layout['margin'] ??= {};

    Object.assign(layout['margin'], {
        t: 32,
        b: 32,
        l: 48,
        r: 48,
        pad: 0,
        autoexpand: true,
    });
    layout['showlegend'] ??= true;
    layout['autosize'] ??= true;

    return layout;
}

export function createPiePlotLayout() {
    const layout = createLayout();
    /**
     * Override specific settings
     */
    return layout;
}

