import { QueryDataManager } from "../../../src/js/util/QueryDataManager.js";
import { createRadarPlotLayout, createRadarPlot } from "../../../src/js/util/Plot.js";
import { ArrayUtils } from "../../../src/js/util/ArrayUtils.js";

$(window).on("load", function() {
	let scoreScale = [[0,1],[0,100]];

	/* Get all the data from indicators */
	let queryDataManager = new QueryDataManager();
	queryDataManager.addQuery('indicatorIds', '$SELECT_ID_WHERE_INDICATOR_IS_X');
	queryDataManager.addQuery('indicatorNames', '$SELECT_NAME_WHERE_INDICATOR_IS_X');
	queryDataManager.addQuery('indicatorActive', '$SELECT_ACTIVE_WHERE_INDICATOR_IS_X');
	queryDataManager.addQuery('indicatorCurrent', '$SELECT_SCORE_WHERE_INDICATOR_IS_X_AND_MAP_IS_CURRENT');
	queryDataManager.addQuery('indicatorMaquette', '$SELECT_SCORE_WHERE_INDICATOR_IS_X_AND_MAP_IS_MAQUETTE');
	
	/* If the data has not loaded yet, warn the user */
	if (!queryDataManager.allQueriesResolved()) {
		document.body.innerHTML = '<p>Recalculation required before data can be shown.</p>';
		return;
	}
	
	
	
	/* Get all indicator names , filtered to only obtain the names of indicators which are active */
	let indicatorNames = ArrayUtils.filterByArray( queryDataManager.getData('indicatorNames'), queryDataManager.getData('indicatorActive') );
	
	/* Get all indicator scores, filtered to only obtain the scores of indicators which are active */
	let indicatorScores = {
	 	'Current': 	ArrayUtils.filterByArray( queryDataManager.getData('indicatorCurrent'), queryDataManager.getData('indicatorActive') ),
		'Maquette':	ArrayUtils.filterByArray( queryDataManager.getData('indicatorMaquette'), queryDataManager.getData('indicatorActive') ),
	};
		
	/* Scale all the scores to human-readable percentage values */
	indicatorScores = ArrayUtils.scaleValues(indicatorScores, ...scoreScale, true);
		
	/* If Current and Maquette are the same, show only a single set of values */
	if ( JSON.stringify(indicatorScores['Current']) == JSON.stringify(indicatorScores['Maquette']) ) {
		indicatorScores = { 'Values' : indicatorScores['Current'] };
	}
	
	
	/* Establish the values for the radar plot */
	let radarIndicatorLabels = indicatorNames;
	let radarIndicatorScoresPerMapType = indicatorScores;
	let radarRange = scoreScale[1];
	
	/* Render the radar plot */
	let layout = createRadarPlotLayout();
	createRadarPlot('chart', radarIndicatorLabels, radarIndicatorScoresPerMapType, radarRange, layout);
	

});