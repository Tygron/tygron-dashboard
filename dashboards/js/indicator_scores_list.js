import { QueryDataManager } from "../util/QueryDataManager.js";
import { ListingPanelController } from "../util/ListingPanel.js";
import { attachHandler } from "../util/dom.js";
import { ArrayUtils } from "../util/ArrayUtils.js";

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

	/* Create a listing which will show the data of the indicators. A listing is effectively a table. */
	let listing = new ListingPanelController('listing');
	/* Headers will automatically show at the top */
	listing.addHeader(['Indicator', 'Current', 'Maquette', 'Active']);
	/* Content Render Types determe how values are rendered. Labels are 'as is'. Buttons show a fixed list of options, with a selected one based on the value in that cell*/
	listing.setDefaultContentRenderTypes(['label', 'label', 'label', { 'type': 'buttons', 'options': ['Include', 'Ignore'] }]);
	
	
	/* Retrieve the data from the query manager, preprocess, and add to a single data matrix. */
	let data = [];
	data.push(queryDataManager.getData('indicatorNames'));
	
	/* The scores are unbounded fractions (0-1). Remap them to 0-100, round them, and add a percentage sign. This makes them human-readable. */
	data.push(ArrayUtils.forEach(
			queryDataManager.getData('indicatorCurrent'),
			(value) => {return ArrayUtils.scaleValue(value, ...scoreScale, true)+'%';}
		));
	data.push(ArrayUtils.forEach(
			queryDataManager.getData('indicatorMaquette'),
			(value) => {return ArrayUtils.scaleValue(value, ...scoreScale, true)+'%';}
		));
		
	/* The active state is transformed into the valid values of the buttons in the listing, so the correct button defaults to being selected. */
	data.push(ArrayUtils.forEach(
			queryDataManager.getData('indicatorActive'),
			(value) => {return (value > 0) ? 'Include':'Ignore' }
		));
		
		
	/* As is, each indicator would become its own column. Flip it, so each indicator is a row */
	data = ArrayUtils.flipMatrix(data);

	/* Add the indicator data to the listing, and render it */
	for ( let row of data ) {
		listing.addContent(row);
	}
	listing.render();


	
	/* Create a smaller listing for Current and Maquette averages, based on which indicators were active/inactive */
	let resultContent = []; /* Separate variable, so can be accessed/filled in by a recalculation function */
	let result = new ListingPanelController('result', { 'flipXY': true });
	result.addHeader(['Current', 'Maquette']);
	result.addContent(resultContent);

	/* Based on a list of which indexes to consider "active", recalculate the averages and place those results in the resultContent array */
	let recalculateResult = function(actives) {
		let indicatorScoresCurrent = queryDataManager.getData('indicatorCurrent');
		let indicatorScoresMaquette = queryDataManager.getData('indicatorMaquette');
		
		let count = 0;
		let current = 0;
		let maquette = 0;
		for (let i = 0; i < actives.length; i++) {
			if (actives[i]) {
				current += indicatorScoresCurrent[i];
				maquette += indicatorScoresMaquette[i];
				count++;
			}
		}
		
		resultContent[0] = count === 0 ? '' : ArrayUtils.scaleValue(current  / count, ...scoreScale, true)+'%';
		resultContent[1] = count === 0 ? '' : ArrayUtils.scaleValue(maquette / count, ...scoreScale, true)+'%';
	}
	
	/* Initial calculation of the averaged results based on which indicators are Active in the session now */
	recalculateResult( queryDataManager.getData('indicatorActive') );
	result.render();
	

	
	/* Use the toggles in the listing to change how the totals are calculated */
	attachHandler(listing.domElement, 'change', null, function(event) {
		/* Because the listing features input elements for one column, values from the listing can be retrieved automatically */
		let values = listing.getValues();
		/* Iterate through the matrix of retrieved values. Each row is the values from input elements on one listing row */
		for (let i=0;i<values.length;i++) {
			/* If the row has any values, het the first (and only) value */
			values[i] = (Array.isArray(values[i]) && values[i].length>0) ? values[i][0] : null;
			/* Transform from the human-readable value to a 0 or 1, which is how the Platform and code denotes the Active state. (normalizing the value) */
			values[i] = (values[i] == 'Include') ? 1 : 0;
		}
		/* Recalculation of the averaged results based on which Indicators were Includes or Ignored through buttons in the listing */
		recalculateResult(values);
		result.render();
	});
	
});