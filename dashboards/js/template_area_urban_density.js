import { QueryDataManager } from "../util/QueryDataManager.js";
import { createPiePlotLayout, createPiePlot } from "../util/plot.js";

$(window).on("load", function() {
	/* Get all the data */
	let queryDataManager = new QueryDataManager();

	queryDataManager.addQuery('name'  , '$SELECT_NAME_WHERE_AREA_IS_ID');

	queryDataManager.addQuery('landsize_current'  , '$SELECT_LANDSIZE_WHERE_AREA_IS_ID_AND_MAP_IS_CURRENT');
	queryDataManager.addQuery('landsize_maquette'  , '$SELECT_LANDSIZE_WHERE_AREA_IS_ID_AND_MAP_IS_MAQUETTE');

	queryDataManager.addQuery('lotsize_current'  , '$SELECT_LOTSIZE_WHERE_AREA_IS_ID_AND_ATTRIBUTE_MULT_IS_SOLID_AND_MAP_IS_CURRENT');
	queryDataManager.addQuery('lotsize_maquette'  , '$SELECT_LOTSIZE_WHERE_AREA_IS_ID_AND_ATTRIBUTE_MULT_IS_SOLID_AND_MAP_IS_MAQUETTE');
	
	queryDataManager.addQuery('floorsize_current'  , '$SELECT_FLOORSIZE_WHERE_AREA_IS_ID_AND_ATTRIBUTE_MULT_IS_SOLID_AND_MAP_IS_CURRENT');
	queryDataManager.addQuery('floorsize_maquette'  , '$SELECT_FLOORSIZE_WHERE_AREA_IS_ID_AND_ATTRIBUTE_MULT_IS_SOLID_AND_MAP_IS_MAQUETTE');

	queryDataManager.addQuery('units_current'  , '$SELECT_UNITS_WHERE_AREA_IS_ID_AND_ATTRIBUTE_MULT_IS_SOLID_AND_MAP_IS_CURRENT');
	queryDataManager.addQuery('units_maquette'  , '$SELECT_UNITS_WHERE_AREA_IS_ID_AND_ATTRIBUTE_MULT_IS_SOLID_AND_MAP_IS_MAQUETTE');
	
	
	/* If the data has not loaded yet, warn the user */
	if (!queryDataManager.allQueriesResolved()) {
		document.body.innerHTML = '<p>Recalculation required before data can be shown.</p>';
		return;
	}
	
	/* Urban density values of interest */
	let size = [];
	let floorspaceIndex = [];
	let groundspaceIndex = [];
	let openSpaceRatio = [];
	let avgFloors = ['-','-'];
	
	let denominator = 0;

	/* Calculate all of them. 0 is for current, 1 is for maquette */
	size[0] = Math.round(queryDataManager.getData('landsize_current', false)/10000)+'&nbsp;ha';
	size[1] = Math.round(queryDataManager.getData('landsize_maquette', false)/10000)+'&nbsp;ha';
	
	denominator = queryDataManager.getData('landsize_current', false);
	floorspaceIndex[0] = (denominator != 0) ? queryDataManager.getData('floorsize_current', false) / denominator : '-';

	denominator = queryDataManager.getData('landsize_maquette', false);
	floorspaceIndex[1] = (denominator != 0) ? queryDataManager.getData('floorsize_maquette', false) / denominator : '-';

	denominator = queryDataManager.getData('landsize_current', false);
	groundspaceIndex[0] = (denominator != 0) ? queryDataManager.getData('lotsize_current', false) / denominator : '-';

	denominator = queryDataManager.getData('landsize_maquette', false);
	groundspaceIndex[1] = (denominator != 0) ? queryDataManager.getData('lotsize_maquette', false) / denominator : '-';

	if ( (floorspaceIndex[0] != '-') && (groundspaceIndex[0] != 0) )  {
		openSpaceRatio[0] = (1-groundspaceIndex[0]) / floorspaceIndex[0];
	}
	if ( (floorspaceIndex[1] != '-') && (groundspaceIndex[1] != 0) )  {
		openSpaceRatio[1] = (1-groundspaceIndex[1]) / floorspaceIndex[1];
	}
	
	denominator = queryDataManager.getData('lotsize_current', false);
	avgFloors[0] = (denominator != 0) ? queryDataManager.getData('floorsize_current', false) / denominator : '-';

	denominator = queryDataManager.getData('lotsize_maquette', false);
	avgFloors[1] = (denominator != 0) ? queryDataManager.getData('floorsize_maquette', false) / denominator : '-';
	
	let data = [];

	data.push( ['Size'].concat(size) );
	data.push(['FSI'].concat(floorspaceIndex) );
	data.push( ['GSI'].concat(groundspaceIndex) );
	data.push( ['OSR'].concat(openSpaceRatio) );
	data.push( ['Average floors'].concat(avgFloors) );
	
	/* All data values which are still just numbers are ratios or fractions. Round them a bit */
	ArrayUtils.forEach(data, (v,i,a) => {
			v[1] = NumberUtils.isNumeric(v[1]) ? Math.round( v[1]*100 ) / 100 : v[1];
			v[2] = NumberUtils.isNumeric(v[2]) ? Math.round( v[2]*100 ) / 100 : v[2];
			return v;
		});
	
		
	/* Create a listing which will show the data. A listing is effectively a table. */
	let listing = new ListingPanelController('listing');
	/* Headers will automatically show at the top */
	listing.addHeader(['Property', 'Current','Maquette']);
	/* Content Render Types determe how values are rendered. Labels are 'as is'.*/
	listing.setDefaultContentRenderTypes(['label', 'label', 'label']);

	
	/* Add the data to the listing, and render it */
	for ( let row of data ) {
		listing.addContent(row);
	}
	listing.render();
});