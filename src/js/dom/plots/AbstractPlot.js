import { Plot } from "Plot.js";

export class Plot {

	plotType = 'None';
	
	constructor(args = {}) {
		args = Object.assign({
			layout: null,
			data: null,
		}, args);
		this.setLayout( args['layout'] ?? this.createLayout() );
		this.setData( args['data'] ?? this.createLayout() );	
	}
		
	_layout = {};
	_data = [];

	/* Overwrite for specific plots */
	createPlotSpecificData(labels, values, properties) {
		properties['type'] ??= this.getPlotType();
		return properties;
	}
	
	create(plotDivName, plotData, plotLayout) {
		this._create(plotDivName, plotData, plotLayout);
	}
	
	createLayout() {
		return this._createLayout();
	}
	
	
	
	/* Generic plot code */
	
	getPlotType() {
		return this.plotType;
	}
	getLayout() {
		return this._layout;
	}
	
	getData() {
		
		return this._data;
	}
	
	setData(labels, values, properties) {
		let newData = this._normalizePlotData(labels, values, properties);
		newData = ArrayUtils.coerceToArray(newData);
		
		let newDataObject = [];
		for (let i = 0; i < newData.length; i++) {
			newDataObject.push(this.createPlotSpecificData(newData[i]['labels'] ?? null, newData[i]['values'] ?? null , newData[i]));
		}
		
		this._data = newDataObject;
	}
	
	addData(labels, values, properties) {
		let newData = this._normalizePlotData(labels, values, properties);
		this._data.push(this.createPlotSpecificData(newData['labels'] ?? null, newData['values'] ?? null , newData));
	}
	
	setNamedData( data ) {
		let newData = [];
		for ( let i in data ) {
			if ( !(typeof data[i] === 'object') ) {
				throw new Error('Data under key '+i+' not object');
			}
			newData.push( Object.assign( { 'name':i }, data[i]) );
		}
		return this.setData(newData);
	}
	
	addNamedData( data ) {
		let newData = [];
		for ( let i in data ) {
			if ( !(typeof data[i] === 'object') ) {
				throw new Error('Data under key '+i+' not object');
			}
			newData.push( Object.assign( { 'name':i }, data[i]) );
		}
		return this.addData(newData);
	}
	
	clearData() {
		this.data = [];
	}

	setLayout(layout) {
		this._layout = layout;
	}
	
	_normalizePlotData(labels, values, properties) {
		if ( Array.isArray(labels) && !values && !properties ) {
			let func = this._normalizePlotData;
			return ArrayUtils.forEach(labels, (v,i,a) => {return func(v)});
		}
		if ( (typeof labels === 'object') && !values && !properties) {
			return Object.assign({}, labels);
		} else if (labels && values) {
			properties = Object.assign({}, properties);
			properties['labels'] = labels;
			properties['values'] = values;
			return properties;
		}
		throw new Error('Could not normalize plot data');
	}

	_create(plotDivName, plotData, plotLayout) {
		plotData = plotData ?? this.getData();
		plotLayout = plotLayout ?? (this.getLayout() ?? this.createLayout());
		return Plotly.newPlot(plotDivName, plotData, plotLayout);		
	}
		
	_createLayout() {
		/**
		 * See https://plotly.com/javascript/reference/layout/
		 */

		let layout = {
			title: {
				automargin: undefined,
				font: undefined, /*{color, family, lineposition,shadow, size style, textcase, variant, weight}*/
				pad: undefined,  /*b, l ,r ,t*/
				subtitle: undefined, /*{
							font: undefined, 
							text: undefined		
							x: undefined,
							xanchor: undefined,
							xref: undefined,
							y: undefined, 
							yanchor: undefined, 
							yref: undefined,}*/

				text: undefined,
				x: undefined,
				xanchor: undefined,
				xref: undefined,
				y: undefined,
				yanchor: undefined,
				yref: undefined,
			},
			showLegend: undefined,

			legend: {
				bgcolor: undefined,
				bordercolor: undefined,
				borderwidth: undefined,
				entrywidth: undefined,
				entrywidthmode: undefined,
				font: undefined,
				groupclick: undefined,
				grouptitlefont: undefined,
				indentation: undefined,
				itemclick: undefined,
				itemdoubleclick: undefined,
				itemsizing: undefined,
			}, //etc

			xaxis: {

				title: {

					text: '',

					font: {

					}

				},

			},

			yaxis: {

				title: {

					text: '',

					font: {

					}

				}

			}
		};
		return layout;		
	}
	
}