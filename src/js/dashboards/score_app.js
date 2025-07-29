import { createRadarPlotLayout, createRadarPlot } from "../util/plot.js"

$(window).on("load", function() {

	let indicatorNames = '$SELECT_NAME_WHERE_INDICATOR_IS_X'.replaceAll('"', '').split(', ');
	let indicatorActive = [$SELECT_ACTIVE_WHERE_INDICATOR_IS_X];
	let indicatorScores = {};
	indicatorScores['Current'] = [$SELECT_SCORE_WHERE_INDICATOR_IS_X_AND_MAP_IS_CURRENT];
	indicatorScores['Maquette'] = [$SELECT_SCORE_WHERE_INDICATOR_IS_X_AND_MAP_IS_MAQUETTE];
	if (JSON.stringify(indicatorScores['Current']) == JSON.stringify(indicatorScores['Maquette'])) {
		indicatorScores = { 'Score': indicatorScores['Maquette'] };
	}

	let options = [0, 100];

	let labels = [];
	let values = {};
	for (let i = 0; i < indicatorActive.length; i++) {
		if (indicatorActive[i] > 0) {
			labels.push(indicatorNames[i]);
			for (let key in indicatorScores) {
				values[key] = values[key] ?? [];
				let newValue = indicatorScores[key][i] * 100;
				values[key].push(newValue);
			}
		}
	}
	let layout = createRadarPlotLayout();
	createRadarPlot('chart', labels, values, options, layout);
});