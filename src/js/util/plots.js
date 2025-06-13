
export function volumeStackedPlot(plotDivName, data, properties, colors, layout) {

	var traces = [];
	for (let i = 1; i < properties.length; i++) {
		series = {};

		series.x = [];
		series.y = [];

		series.stackgroup = 'one';
		if (i == 1) {
			series.groupnorm = 'percent';
		}
		series.fillcolor = "rgba(" + colors[properties[i]].join(",") + ")";

		for (let t = 0; t < data[properties[i]].length; t++) {
			series.x.push(data[properties[0]]);
			series.y.push(data[properties[i]]);
		}

		traces.push(series);
	}

	if (layout == undefined) {
		layout = {

			title: {

				text: 'Hover on <i>points</i> or <i>fill</i>'

			}
		};
	}

	Plotly.newPlot(plotDivName, traces, layout)
}