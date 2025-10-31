export class PiePlot extends Plot {

	plotType = 'pie';
	
	/* Overwrite for specific plots */
	createPlotSpecificData(labels, values, properties) {
		properties = super.createPlotSpecificData(labels, values, properties);
		properties['sort'] ??= false;
		return properties;
	}
}