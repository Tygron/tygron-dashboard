
export function barPlot(plotDivName, data, timeframe, properties, colors, titles, layout) {


	
	var bardata = [];

	for (let i = 1; i < properties.length; i++) {
		let trace = 		{
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
		bardata.push(trace);
	}

	
	
	var layout = {
			  showlegend: true,	 
			  }; 

	Plotly.newPlot(plotDivName, bardata, layout);
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
	
	//labels bepalen
	labels = [];
	for (var i = 0; i < properties.length; i++) {
		labels.push(titles[properties[i]]);
	}
	
	let node = {
			pad: 15,
			thickness: 20,
			line: { color: "black", width: 0.5 },
			label: labels,
			align: "right"
		};
		
	// Voeg optionele kleuren toe
	if (colors !== null) {
		node.color = properties.map(p => colors[p]);
			}
			
			// Voeg optionele posities toe
			  if (positionsX !== null && positionsY !== null) {
			    node.x = properties.map(p => positionsX[p]);
			    node.y = properties.map(p => positionsY[p]);
			  }
	
			// Maak het Sankey data object
				let data = {
					type: "sankey",
					orientation: "h",
					node: node,
					link: link
				};
				


	Plotly.newPlot(plotDivName, [data], layout);
}

export function createRadarPlot(plotDivName, labels, values, range) {
	if (Array.isArray(values)) {
		values = { 'Values' : values };
	}
	let plotLabels = labels.slice(0, labels.length);
	plotLabels.push(labels[0]);
	
	let plotData = [];
	for ( let i in values ) {
		let plotValues = [];
		for (let l=0;l<labels.length;l++) {
				plotValues[l] = values[i][l] ?? 0;
		}
		plotValues.push(plotValues[0]);
		plotData.push({
			type: 'scatterpolar',
			r: plotValues,
			theta: plotLabels,
			fill: 'toself',
			name: i,
		});
	}
	
	let data = plotData;

	layout = {
	  legend: {
		yanchor:'top',
		xanchor:'left',
		y:-20,
		x:-1,
	  },
	  margin: {
		t:150,
		b:150,
		l:150,
		r:150,
		pad:100,
		autoexpand:true,
	  },
	  autosize: true,
	  polar: {
		radialaxis: {
		  visible: true,
		  direction: 'clockwise',
		  range: [Math.min.apply(null,range),Math.max.apply(null,range)]
		},
		angularaxis: {
		  direction: 'clockwise'
		},
	  },
	  showlegend: true
	}

	Plotly.newPlot(plotDivName, data, layout);
	
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
	/**
	 * Override specific settings
	 */
	return layout;
}

