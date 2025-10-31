export class RadarPlot extends Plot {

	plotType = 'scatterpolar';

	_range = null;

	setRange(value1, value2) {
		if ( Array.isArray(value1) && value1.length == 2 ) {
			value1=value1[0];
			value2=value1[1];
		}
		this._range = [Math.min(value1, value2),Math.max(value1, value2)];
	}

	/* Overwrite for specific plots */
	createPlotSpecificData(labels, values, properties) {
		properties = super.createPlotSpecificData(labels, values, properties);
		properties['fill'] ??= 'toself';
		properties['showLegend'] ??= true;
		return properties;
	}
	
	create(plotDivName, data, layout) {
		data = data ?? this.getData();
		let plotData = [];
		
		let plotDataRange = [];
		for (let i in data) {
			let newPlotData = Object.assign({},data[i]);
			length = (newPlotData['labels'] ?? []).length;
			newPlotData['theta'] = this._makeArrayForRadarPlot(newPlotData['labels'], length);
			newPlotData['r'] = this._makeArrayForRadarPlot(newPlotData['values'], length);
			newPlotData['name'] ??= i; 
			plotDataRange.concat(newPlotData['r']);
			
			plotData.push(newPlotData);
		}
		plotDataRange = [Math.min.apply(null,plotDataRange),Math.max.apply(null,plotDataRange)];
		
		let plotLayout = layout ?? this.createLayout();
		plotLayout['polar']['radialaxis']['range'] = plotDataRange;
		
		super.create(plotDivName, plotData, plotLayout);
	}
		
	createLayout() {
		let layout = super.createLayout();
		layout['polar'] ??= {
			radialaxis: {
				visible: true,
			},
			angularaxis: {
				direction: 'clockwise'
			},
		}
		
		layout['legend'] ??= {};
		layout['margin'] ??= {};

		Object.assign(layout['margin'], {
			t:32,
			b:32,
			l:48,
			r:48,
			pad:0,
			autoexpand:true,
		});
		layout['showlegend'] ??= true;
		layout['autosize'] ??= true;

		return layout;
	}

	_makeArrayForRadarPlot(arr, length) {
		if ( !Array.isArray(arr) || arr.length === 0 ) {
			arr = [];
		}
		
		let defaultValue = null;
		let plotArr = arr.slice(0, length ?? arr.length);
		let currentLength = plotArr.length;
		plotArr.length = length;
		plotArr.fill(defaultValue, currentLength, length);
		
		plotArr.push(arr[0]);
		return plotArr;
	}
}