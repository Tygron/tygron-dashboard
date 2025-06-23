
export function barPlot(plotDivName, data, timeframe, properties, colors, titles, layout) {

	var trace1 = {
		x: [],
		y: [],
		marker: {
			color: []
		}
		, type: 'bar'
	}

	for (let i = 1; i < properties.length; i++) {
		let property = properties[i];
		trace1.x.push(titles[property]);
		trace1.y.push(data[property][timeframe]);
		trace1.marker.color.push("rgba(" + colors[property].join(",") + ")");
	}

	var data = [trace1];

	Plotly.newPlot(plotDivName, data, layout);
}

export function volumeStackedPlot(plotDivName, data, properties, colors, titles, layout, percentual = false) {

	var traces = [];
	for (let i = 1; i < properties.length; i++) {
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

		for (let t = 0; t < data[properties[i]].length; t++) {
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

	Plotly.newPlot(plotDivName, traces, layout)
}






export function createLinks(properties) {
	return { properties: properties };
}

export function getLink(links, timeframe) {
	if (links.timeframeLinks == undefined) {
		links.timeframeLinks = [];
	}
	while (links.timeframeLinks.length - 1 < timeframe) {
		links.timeframeLinks.push({
			source: [],
			target: [],
			value: [],
		});
	}
	return links.timeframeLinks[timeframe];
}

export function addLink(links, timeframe, from, to, amount) {
	let link = getLink(links, timeframe)
	if (link.source == undefined) {
		link.source = [];
	}
	if (link.target == undefined) {
		link.target = [];
	}
	if (link.value == undefined) {
		link.value = [];
	}
	link.source.push(properties.indexOf(from));
	link.target.push(properties.indexOf(to));
	link.value.push(amount);
}

export function sankeyPlot(plotDivName, links, timeframe, properties, colors, titles, layout) {

	let link = getLink(links, timeframe);
	labels = [];
	for (var i = 0; i < properties.length; i++) {
		labels.push(titles[properties[i]]);
	}
	let data = {

		type: "sankey",
		orientation: "h",

		node: {
			label: labels,
			align: "right",
		},

		link: link
	};



	Plotly.newPlot(plotDivName, [data], layout);
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

