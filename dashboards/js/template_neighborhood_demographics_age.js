import { QueryDataManager } from "../util/QueryDataManager.js";
import { createPiePlotLayout, createPiePlot } from "../util/plot.js";

$(window).on("load", function() {
	/* Get all the data from indicators */
	let queryDataManager = new QueryDataManager();
	queryDataManager.addQuery('name'  , '$SELECT_NAME_WHERE_NEIGHBORHOOD_IS_ID');
	queryDataManager.addQuery('0-15' , '$SELECT_ATTRIBUTE_WHERE_NEIGHBORHOOD_IS_ID_AND_NAME_IS_PERCENTAGE_PERSONEN_0_TOT_15_JAAR');
	queryDataManager.addQuery('15-25', '$SELECT_ATTRIBUTE_WHERE_NEIGHBORHOOD_IS_ID_AND_NAME_IS_PERCENTAGE_PERSONEN_15_TOT_25_JAAR');
	queryDataManager.addQuery('25-45', '$SELECT_ATTRIBUTE_WHERE_NEIGHBORHOOD_IS_ID_AND_NAME_IS_PERCENTAGE_PERSONEN_25_TOT_45_JAAR');
	queryDataManager.addQuery('45-65', '$SELECT_ATTRIBUTE_WHERE_NEIGHBORHOOD_IS_ID_AND_NAME_IS_PERCENTAGE_PERSONEN_45_TOT_65_JAAR');
	queryDataManager.addQuery('65+'  , '$SELECT_ATTRIBUTE_WHERE_NEIGHBORHOOD_IS_ID_AND_NAME_IS_PERCENTAGE_PERSONEN_65_JAAR_EN_OUDER');
	queryDataManager.addQuery('inhabitants'  , '$SELECT_ATTRIBUTE_WHERE_NEIGHBORHOOD_IS_ID_AND_NAME_IS_AANTAL_INWONERS');
	
	/* If the data has not loaded yet, warn the user */
	if (!queryDataManager.allQueriesResolved()) {
		document.body.innerHTML = '<p>Recalculation required before data can be shown.</p>';
		return;
	}
	
	let labels = ['0-15', '15-25', '25-45', '45-65', '65+'];
	let values = [];
	
	let inhabitants = queryDataManager.getData('inhabitants', false);
	for ( let key of labels ) {
		let amount = (queryDataManager.getData(key, false)/100)*inhabitants;
		values.push( Math.round(amount) );
	}
	
	/* Render the pie plot */
	let layout = createPiePlotLayout();
	layout['title'] = {'text': queryDataManager.getData('name', false) };
	createPiePlot('chart', labels, values, layout);
	
});