import { ListingPanelController } from "../util/listingPanel.js";
import { attachHandler } from "../util/dom.js";

$(window).on("load", function() {

	let indicatorNames = '$SELECT_NAME_WHERE_INDICATOR_IS_X'.replaceAll('"', '').split(', ');
	let indicatorActive = '$SELECT_ACTIVE_WHERE_INDICATOR_IS_X'.replaceAll('"', '').split(', ');
	let indicatorScoresCurrent = scaleValues([$SELECT_SCORE_WHERE_INDICATOR_IS_X_AND_MAP_IS_CURRENT], [0, 1], [0, 100], true);
	let indicatorScoresMaquette = scaleValues([$SELECT_SCORE_WHERE_INDICATOR_IS_X_AND_MAP_IS_MAQUETTE], [0, 1], [0, 100], true);


	/* Listing of all indicators */
	let listing = new ListingPanelController('listing');
	listing.addHeader(['Indicator', 'Current', 'Maquette', 'Active']);
	listing.setDefaultContentRenderTypes(['label', 'label', 'label', { 'type': 'buttons', 'options': ['Include', 'Ignore'] }]);

	for (let i = 0; i < indicatorNames.length; i++) {
		let activeLabel = (indicatorActive[i] > 0) ? 'Include' : 'Ignore';
		listing.addContent([indicatorNames[i], indicatorScoresCurrent[i] + '%', indicatorScoresMaquette[i] + '%', activeLabel]);
	}
	listing.render();


	/* Current and Maquette averages, based on which indicators were active/inactive */
	let resultContent = []
	let result = new ListingPanelController('result', { 'flipXY': true });
	result.addHeader(['Current', 'Maquette']);
	result.addContent(resultContent);

	let recalculateResult = function(actives) {
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
		resultContent[0] = count > 0 ? Math.round(current / count) + '%' : '';
		resultContent[1] = count > 0 ? Math.round(maquette / count) + '%' : '';
	}
	recalculateResult(indicatorActive);
	result.render();
	

	/* Use the toggles in the listing to change how the totals are calculated */
	attachHandler(listing.domElement, 'change', null, function(event) {
		let values = listing.getValues();
		for (let i=0;i<values.length;i++) {
			values[i] = (Array.isArray(values[i]) && values[i].length>0) ? values[i][0] : null;
			values[i] = (values[i] == 'Include') ? 1 : 0;
		}
		recalculateResult(values);
		result.render();
	});
	
});