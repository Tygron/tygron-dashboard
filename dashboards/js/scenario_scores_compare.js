import { QueryDataManager } from "../src/js/tygron/QueryDataManager.js";
import { ListingPanelController } from "../src/js/dom/display/ListingPanel.js";
import { Dom } from "../src/js/util/Dom.js";
import { ArrayUtils } from "../src/js/util/ArrayUtils.js";

$(window).on("load", function() {

	let scoreScale = [[0,1],[0,100]];
	
	/* Get all the data from indicators */
	let queryDataManager = new QueryDataManager();
	queryDataManager.addQuery('indicatorIds', '$SELECT_ID_WHERE_INDICATOR_IS_X');
	queryDataManager.addQuery('indicatorNames', '$SELECT_NAME_WHERE_INDICATOR_IS_X');
	queryDataManager.addQuery('scenarioNames', '$SELECT_NAME_WHERE_SCENARIO_IS_X');

	queryDataManager.addQuery('indicatorScoresCurrent', '$SELECT_SCORE_WHERE_INDICATOR_IS_X_AND_MAP_IS_CURRENT');	
	queryDataManager.addQueryData('scenarioScores', {
		query: '$SELECT_ATTRIBUTE_WHERE_NAME_IS_INDICATORS_AND_SCENARIO_IS_X_AND_INDEX_IS_Y',
		x: 'scenariosDimension',
		y: 'indicatorsDimension',
		
	});
	
	/* If the data has not loaded yet, warn the user */
	if (!queryDataManager.allQueriesResolved()) {
		document.body.innerHTML = '<p>Recalculation required before data can be shown.</p>';
		return;
	}

	/* Create a listing which will show the data of the indicators. A listing is effectively a table. */
	let listing = new ListingPanelController('listing');
	/* Headers will automatically show at the top */
	listing.addHeader(['Indicator', 'Current'].concat(queryDataManager.getData('scenarioNames')));
	/* Content Render Types determe how values are rendered. Labels are 'as is'.*/
	listing.setDefaultContentRenderTypes('label');
	
	/* Create the dataset to show */
	let indicatorNames = queryDataManager.getDataKeyIndexed('indicatorNames', null, 'indicatorIds');
	let indicatorCurrentScores = queryDataManager.getDataKeyIndexed('indicatorScoresCurrent', null, 'indicatorIds');
	let scoreData = queryDataManager.getDataKeyValues('scenarioScores', 'indicatorsDimension');
	let data = ArrayUtils.mergeMaps(true, indicatorNames, indicatorCurrentScores, ...scoreData);
	
	
	
	let getRenderSettings = function(val, baseLine) {
		if ( !NumberUtils.isNumeric( val ) ) {
			return null;
		}
		if ( val > baseLine ) {
			return { 'type':'label','style':{'color':'green'}  };
		}
		if ( val < baseLine ) {
			return { 'type':'label','style':{'color':'crimson'}  };
		}
		return null;
	}
	
	let renderListing = function(valueRewrite) {
		let renderableData = Object.values(data);
		let currentScores = Object.values(indicatorCurrentScores);
		listing.clearContent();
		
		for (let i in renderableData) {
			let renderers = [];
			let compare = currentScores[i];
			
			let values = Object.values(renderableData[i]);
			for (let s in values) {
				let value = values[s];
				renderers.push( getRenderSettings(value, compare) );
				values[s] = valueRewrite(value, compare);
			}
			listing.addContent(values, renderers);
		}
		listing.render();
	}
	
	let actionsDom = document.getElementById('actions');
	
	let renderPercentageAbsolute = function() {
		renderListing( (val, compare) => { return NumberUtils.isNumeric(val) ? ArrayUtils.scaleValue(val, ...scoreScale, true)+'%' : val;});
	}
	Dom.attachHandler(actionsDom, 'click', '.actionButton.percentageAbsolute', renderPercentageAbsolute);
	
	let renderPercentageRelative = function() {
		renderListing( (val, compare) => { return NumberUtils.isNumeric(val) ? ArrayUtils.scaleValue(val-compare, ...scoreScale, true)+'%' : val;});
	}
	Dom.attachHandler(actionsDom, 'click', '.actionButton.percentageRelative', renderPercentageRelative);

});