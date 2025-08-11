$(window).on("load", function() {

	let indicatorNames = '$SELECT_NAME_WHERE_INDICATOR_IS_X'.replaceAll('"', '').split(', ');
	let indicatorActive = [$SELECT_ACTIVE_WHERE_INDICATOR_IS_X];
	let indicatorScoresCurrent = scaleValues([$SELECT_SCORE_WHERE_INDICATOR_IS_X_AND_MAP_IS_CURRENT], [0,1], [0,100], true);
	let indicatorScoresMaquette = scaleValues([$SELECT_SCORE_WHERE_INDICATOR_IS_X_AND_MAP_IS_MAQUETTE], [0,1], [0,100], true);

	let content = [];
	content.push( [ '<strong>Indicator</strong>', '<strong>Current</strong>', '<strong>Maquette</strong>' ] );
	
	for (let i=0 ; i<indicatorNames.length ; i++) {
		if (indicatorActive[i] == 0) {
			continue;
		}
		content.push( [ indicatorNames[i], indicatorScoresCurrent[i]+'%', indicatorScoresMaquette[i]+'%' ] );
	}
	
	generateListing('listing', content, [
			getGeneratorEntryLabel(),
			getGeneratorEntryLabel(),
			getGeneratorEntryLabel()
		]);
});