import { QueryDataManager } from "../../src/js/util/QueryDataManager.js";
import { ListingPanelController } from "../../src/js/util/ListingPanel.js";
import { ArrayUtils } from "../../src/js/util/ArrayUtils.js";

$(window).on("load", function() {
	
	/* Get all the data from Measures */
	let queryDataManager = new QueryDataManager();
	queryDataManager.addQuery('measureIds', '$SELECT_ID_WHERE_MEASURE_IS_X');
	queryDataManager.addQuery('measureNames', '$SELECT_NAME_WHERE_MEASURE_IS_X');
	queryDataManager.addQuery('measureState', '$SELECT_STATE_WHERE_MEASURE_IS_X');
	
	/* If the data has not loaded yet, warn the user */
	if (!queryDataManager.allQueriesResolved()) {
		document.body.innerHTML = '<p>Recalculation required before data can be shown.</p>';
		return;
	}

	/* Create a listing which will show the list of Measures. A listing is effectively a table. */
	let listing = new ListingPanelController('listing');
	/* Headers will automatically show at the top */
	listing.addHeader(['Measure', 'State']);
	/* Content Render Types determe how values are rendered. Labels are 'as is'.*/
	listing.setDefaultContentRenderTypes(['label', 'label']);
	
	
	/* Retrieve the data from the query manager.*/
	let data = [];
	data.push(queryDataManager.getData('measureNames'));
	data.push(queryDataManager.getData('measureState'));
	
	/* As is, each Measure would become its own column. Flip it, so each Measure is a row */
	data = ArrayUtils.flipMatrix(data);
	
	/* Filter out any data which is not active/relevant */
	data = (ArrayUtils.filterByArray( 
			data, 
			queryDataManager.getData('measureState'), 
			(dataValue, filterValue) => {return filterValue === 'NOTHING' ? false : true;}
		));	

	/* Add the Measure data to the listing, and render it */
	for ( let row of data ) {
		listing.addContent(row);
	}
	listing.render();


	
});