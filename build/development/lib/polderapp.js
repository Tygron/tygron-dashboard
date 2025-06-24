
function initCollapsibles() {

	var coll = document.getElementsByClassName("collapsible");
	var i;

	for (i = 0; i < coll.length; i++) {
		coll[i].addEventListener("click", function() {

			this.classList.toggle("active");
			var content = this.nextElementSibling;
							
			if (content.classList.contains("delayed")) {
				if (content.style.maxHeight) {
					content.style.maxHeight = null;
				} else {
					content.style.maxHeight = content.scrollHeight + "px";
				}
			} else {
				if (content.style.display === "block") {
					content.style.display = "none";
				} else {
					content.style.display = "block";
				}
			}


		});
	}
}

function openCollapsibles() {
	var coll = document.getElementsByClassName("collapsible");
	for (i = 0; i < coll.length; i++) {
		const collapsible = coll[i];
		setTimeout(function() {
			collapsible.click();
		}, i * 100);
	}
}


function createLinks(properties) {
	return { properties: properties };
}

function getLink(links, timeframe) {
	if (links.timeframeLinks == undefined) {
		links.timeframeLinks = [];
	}
	while (links.timeframeLinks.length - 1 < timeframe) {
		links.timeframeLinks.push({
			source: [],
			target: [],
			value: [],
		});
	}
	return links.timeframeLinks[timeframe];
}

function addLink(links, timeframe, from, to, amount) {
	let link = getLink(links, timeframe)
	if (link.source == undefined) {
		link.source = [];
	}
	if (link.target == undefined) {
		link.target = [];
	}
	if (link.value == undefined) {
		link.value = [];
	}
	link.source.push(properties.indexOf(from));
	link.target.push(properties.indexOf(to));
	link.value.push(amount);
}


function createTimeframeData(timeframes, itemID, properties) {
	let data = {
		itemID: itemID,
		timeframes: timeframes
	};
	for(let i = 0; i < properties.length; i++){
		data[properties[i]]= [];
		for(let j = 0; j < timeframes; j++){
			data[properties[i]].push(0);
		}
	}
	return data;
}

function setTimeframeValues(data, property, values, relative = false) {

	for (let i = 0; i < data[property].length && i < values.length; i++) {
		data[property][i] = values[i];
	}

	if (relative) {

		for (let i = 0; i < data[property].length && i < values.length; i++) {
			let previous = i == 0 ? 0 : data[property][i - 1];
			data[property][i] -= previous;
		}
	}
}

function setTimeframeValue(data, property, value) {

	for (let i = 0; i < data.dataframes.length; i++) {
		data[property][i] = value;
	}
}

function addFlowValues(data,timeframe, propertyFrom, propertyTo, areaIDFrom, areaIDTo, values, condition=undefined) {
	if (data[propertyFrom][timeframe] == undefined) {
		data[propertyFrom][timeframe] = 0;
	}
	if (data[propertyTo][timeframe] == undefined) {
		data[propertyTo][timeframe] = 0;
	}

	for (let i = 0; i < values.length && i < areaIDFrom.length && i < areaIDTo.length; i++) {
		if (areaIDFrom[i] == data.itemID && values[i] != 0 && (condition==undefined || condition[i])) {			
			if (values[i] > 0) {
				data[propertyFrom][timeframe] -= values[i];
			} else {
				data[propertyFrom][timeframe] += values[i];
			}
		}
		if (areaIDTo[i] == data.itemID && values[i] != 0 && (condition==undefined || condition[i])) {
			if (values[i] > 0) {
				data[propertyTo][timeframe] += values[i];
			} else {
				data[propertyTo][timeframe] -= values[i];
			}
		}
	}
}

function addValuesForTimeframeAndID(data, timeframe, property, idValues, values) {

	if (idValues[i] == data.itemID) {
		if (data[property][timeframe] == undefined) {
			data[property][timeframe] = 0;
		}
		data[property][timeframe] += values[i];
	}

}

function barPlot(plotDivName, data, timeframe, properties, colors, titles, layout) {

	var trace1 = {
		x: [],
		y: [],
		marker: {
			color: []
		}
		, type: 'bar'
	}

	for (let i = 1; i < properties.length; i++) {
		let property = properties[i];
		trace1.x.push(titles[property]);
		trace1.y.push(data[property][timeframe]);
		trace1.marker.color.push("rgba(" + colors[property].join(",") + ")");
	}

	var data = [trace1];

	Plotly.newPlot(plotDivName, data, layout);
}

function volumeStackedPlot(plotDivName, data, properties, colors, titles, layout, percentual = false) {

	var traces = [];
	for (let i = 1; i < properties.length; i++) {
		series = {};

		series.x = [];
		series.y = [];

		if (titles != null && titles[properties[i]] != null) {
			series.name = titles[properties[i]];
		}
		series.stackgroup = 'one';
		if (percentual) {
			series.groupnorm = 'percent';
		}
		series.fillcolor = "rgba(" + colors[properties[i]].join(",") + ")";

		for (let t = 0; t < data[properties[i]].length; t++) {
			series.x.push(data[properties[0]][t]);
			series.y.push(data[properties[i]][t]);
		}

		traces.push(series);
	}

	if (layout == undefined) {
		layout = {};
	}
	if (layout.title == undefined) {
		layout.title = {
			text: percentual ? 'Percentual Volume Stack' : 'Volume Stack'
		}
	}

	Plotly.newPlot(plotDivName, traces, layout)
}





function sankeyPlot(plotDivName, links, timeframe, properties, colors, titles, layout) {

	let link = getLink(links, timeframe);
	labels = [];
	for (var i = 0; i < properties.length; i++) {
		labels.push(titles[properties[i]]);
	}
	let data = {

		type: "sankey",
		orientation: "h",

		node: {
			label: labels,
			align: "right",
		},

		link: link
	};



	Plotly.newPlot(plotDivName, [data], layout);
}

function createLayout() {
	/**
	 * See https://plotly.com/javascript/reference/layout/
	 */

	const layout = {
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

function createVolumePlotLayout() {
	const layout = createLayout();
	/**
	 * Override specific settings
	 */
	return layout;
}

function createBarPlotLayout(title) {
	const layout = createLayout();
	/**
	 * Override specific settings
	 */
	layout.title.text = title;
	return layout;
}

function createSankeyPlotLayout() {
	const layout = createLayout();
	/**
	 * Override specific settings
	 */
	return layout;
}


function getRGBAInterpolated(value, min, max, maxColor, baseColor) {

	if (baseColor == undefined) {
		baseColor = [255, 255, 255, 0.0]
	}

	let fraction = (value - min) / (max - min);
	let red = Math.round(maxColor[0] * fraction + (1 - fraction) * baseColor[0]);
	let green = Math.round(maxColor[1] * fraction + (1 - fraction) * baseColor[1]);
	let blue = Math.round(maxColor[2] * fraction + (1 - fraction) * baseColor[2]);
	let alpha = maxColor[3] * fraction;

	return "rgba(" + [red, green, blue, alpha].join(",") + ")";
}


function createTable(divName, data, properties, colors, titles) {

	let table = document.getElementById(divName);
	if(table== undefined){
		console.log("Element with id: "+divName+ " does not exist.");
		return
	}

	var header = table.createTHead();
	let trow = header.insertRow(-1);
	for (let n = 0; n < properties.length; n++) {
		let cell = trow.insertCell(-1);
		cell.innerHTML = titles[properties[n]];
	}

	var tableBody = table.createTBody();
	for (let r = 0; r < timeframes; r++) {
		var row = tableBody.insertRow(-1);
		for (let n = 0; n < properties.length; n++) {
			let cell = row.insertCell(-1);

			let value = data[properties[n]][r];
			let min = Math.min.apply(Math, data[properties[n]]);
			let max = Math.max.apply(Math, data[properties[n]]);
			let color = colors[properties[n]];

			let labelDiv = document.createElement('div');
			let label = document.createElement('label');
			label.innerHTML = value;
			labelDiv.appendChild(label);
			cell.appendChild(labelDiv);


			if (min == max || color == undefined) {
				labelDiv.style.backgroundColor = 'transparent';

			} else {

				labelDiv.style.backgroundColor = getRGBAInterpolated(value, min, max, color);
			}
		}
	}
}


function setupTimeframeSlider(timeframeSlider, timeframe, timeframes, onInput){
	timeframeSlider.max = timeframes - 1;
	timeframeSlider.value = timeframe;
	if (timeframeSlider.parentElement != null) {
		timeframeSlider.parentElement.style.setProperty('--max', timeframeSlider.max);
		timeframeSlider.parentElement.style.setProperty('--min', 0);
		timeframeSlider.parentElement.style.setProperty('--step', 1); /*Compute*/
		timeframeSlider.parentElement.style.setProperty('--tickEvery', 1);
		timeframeSlider.parentElement.style.setProperty('--value',timeframeSlider.value); 
		timeframeSlider.parentElement.style.setProperty('--text-value', JSON.stringify(timeframeSlider.value))	
		

	}
	timeframeSlider.oninput = function() {
		onInput();
		timeframeSlider.parentElement.style.setProperty('--value',timeframeSlider.value); 
		timeframeSlider.parentElement.style.setProperty('--text-value', JSON.stringify(timeframeSlider.value))	
	};
}





const M3TOTAL = 'm3Total';
const M3LAND = 'm3Land';
const M3WATER = 'm3Water';
const M3SEWER = 'm3Sewer';
const M3STORAGE = 'm3Storage';
const M3GROUND = 'm3Ground';
const M3EVAPORATED = "m3Evaporated"
const TIMEFRAMES = 'timeframes';

const timeframes = $SELECT_ATTRIBUTE_WHERE_GRIDTYPE_IS_RAINFALL_AND_NAME_IS_TIMEFRAMES;
const timeframeTimes = [$SELECT_ATTRIBUTE_WHERE_GRIDTYPE_IS_RAINFALL_AND_INDEX_IS_0_AND_NAME_IS_TIMEFRAME_TIMES];
var timeframe = timeframes - 1;

const data = {};
data[M3TOTAL] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_SURFACE_LAST_VALUE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3WATER] = [$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_M3WATER_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3GROUND] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_GROUND_LAST_VALUE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3STORAGE] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_BUILDING_LAST_STORAGE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3SEWER] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_SEWER_LAST_VALUE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3EVAPORATED] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_EVAPORATED_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3LAND] = [];
data[TIMEFRAMES] = [];

for (var i = 0; i < data[M3TOTAL].length && i < data[M3WATER].length; i++)
	data[M3LAND].push(data[M3TOTAL][i] - data[M3WATER][i]);

for (var i = 0; i < timeframes; i++)
	data[TIMEFRAMES].push(i);

const properties = [TIMEFRAMES, M3LAND, M3WATER, M3GROUND, M3SEWER, M3STORAGE, M3EVAPORATED];

const titles = {};
titles[TIMEFRAMES] = "Timeframes";
titles[M3LAND] = "Maaiveld [m3]";
titles[M3WATER] = "Oppervlaktewater [m3]";
titles[M3GROUND] = "Groundwater [m3]";
titles[M3STORAGE] = "Waterbergende voorzieningen [m3]";
titles[M3SEWER] = "Riool [m3]";
titles[M3EVAPORATED] = "Evaporated [m3]";

const colors = {};
colors[M3WATER] = [10, 10, 218, 0.5];
colors[M3LAND] = [10, 218, 10, 0.5];
colors[M3GROUND] = [165, 42, 42, 0.5];
colors[M3STORAGE] = [218, 10, 10, 0.5];
colors[M3SEWER] = [128, 128, 128, 0.5];
colors[M3EVAPORATED] = [0, 128, 128, 0.5];

createTable("waterBalanceTable", data, properties, colors, titles);

const barPlotLayout = createBarPlotLayout();
barPlotLayout.title.text = "Berging per component";
barPlotLayout.yaxis.title.text = "Volume [m3]";
barPlotLayout.xaxis.title.text = "Component";

const barSlider = document.getElementById("barSlider");
barPlot("balancePlot", data, barSlider.value, properties, colors, titles, barPlotLayout);
setupTimeframeSlider(barSlider, timeframe, timeframes, function() {
	barPlot("balancePlot", data, barSlider.value, properties, colors, titles, barPlotLayout);
});

const MODEL_IN = 'MODEL_IN';
const MODEL_OUT = 'MODEL_OUT';
const RAINM3 = 'RAINM3';
const INFILTRATIONM3 = 'INFILTRATIONM3';
const EVAPORATIONM3 = 'EVAPORATIONM3';
const SEWER_IN = 'SEWER_IN';
const SEWER_OVERFLOW = 'SEWER_OVERFLOW';
const INLET_SURFACE = 'INLET_SURFACE';
const INLET_GROUND = 'INLET_GROUND';
const OUTLET_SURFACE = "OUTLET_SURFACE";
const OUTLET_GROUND = "OUTLET_GROUND";
const BOTTOM_FLOW_IN = "BOTTOM_FLOW_IN";
const BOTTOM_FLOW_OUT = "BOTTOM_FLOW_OUT";
const CULVERT_IN = "CULVERT_IN";
const CULVERT_OUT = "CULVERT_OUT";
const PUMP_IN = "PUMP_IN";
const PUMP_OUT = "PUMP_OUT";
const BREACH_IN = "BREACH_IN";
const BREACH_OUT = "BREACH_OUT";

const flowTitles = {};
flowTitles[TIMEFRAMES] = "Timeframes";
flowTitles[RAINM3] = 'Neerslag';
flowTitles[INFILTRATIONM3] = 'Infiltratie';
flowTitles[EVAPORATIONM3] = 'Verdamping';
flowTitles[SEWER_IN] = 'POCRiool';
flowTitles[SEWER_OVERFLOW] = 'Riooloverstort';
flowTitles[INLET_SURFACE] = 'Inlaat op maaiveld';
flowTitles[INLET_GROUND] = 'Inlaat in de grond';
flowTitles[OUTLET_SURFACE] = "Uitlaat op maaiveld";
flowTitles[OUTLET_GROUND] = "Uitlaat uit de grond";
flowTitles[BOTTOM_FLOW_IN] = "Kwel";
flowTitles[BOTTOM_FLOW_OUT] = "Uitzijging";
flowTitles[CULVERT_IN] = "Duiker in";
flowTitles[CULVERT_OUT] = "Duiker uit";
flowTitles[PUMP_IN] = "Pomp in";
flowTitles[PUMP_OUT] = "Pomp uit";

const flowColors = {};
flowColors[RAINM3] = [10, 10, 218, 0.5];
flowColors[INFILTRATIONM3] = [10, 218, 10, 0.5];
flowColors[EVAPORATIONM3] = [165, 42, 42, 0.5];
flowColors[SEWER_IN] = [218, 10, 10, 0.5];
flowColors[SEWER_OVERFLOW] = [128, 128, 128, 0.5];
flowColors[INLET_SURFACE] = [128, 128, 128, 0.5];
flowColors[INLET_GROUND] = [128, 128, 128, 0.5];
flowColors[OUTLET_SURFACE] = [128, 128, 128, 0.5];
flowColors[OUTLET_GROUND] = [128, 128, 128, 0.5];
flowColors[BOTTOM_FLOW_IN] = [128, 128, 128, 0.5];
flowColors[BOTTOM_FLOW_OUT] = [128, 128, 128, 0.5];
flowColors[CULVERT_IN] = [128, 128, 128, 0.5];
flowColors[CULVERT_OUT] = [128, 128, 128, 0.5];
flowColors[PUMP_IN] = [128, 128, 128, 0.5];
flowColors[PUMP_OUT] = [128, 128, 128, 0.5];

const flowproperties = [TIMEFRAMES, RAINM3, INFILTRATIONM3, EVAPORATIONM3, SEWER_IN, SEWER_OVERFLOW, INLET_SURFACE, INLET_GROUND, OUTLET_SURFACE, OUTLET_GROUND, BOTTOM_FLOW_IN, BOTTOM_FLOW_OUT, CULVERT_IN, CULVERT_OUT, INLET_SURFACE, OUTLET_SURFACE, INLET_GROUND, OUTLET_GROUND, PUMP_IN, PUMP_OUT];
const flowData = createTimeframeData(timeframes, $ID, flowproperties);

const culvertAreaFrom = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_0];
const culvertAreaTo = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_1];
const pumpAreaFrom = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_0];
const pumpAreaTo = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_1];
const inletAreaFrom = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_0];
const inletAreaTo = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_1];
const inletUnderground = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_UNDERGROUND_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_0];
const inletSurface = [];

for (let i = 0; i < inletUnderground.length; i++) {
	inletSurface.push(inletUnderground[i] <= 0);
	inletUnderground[i] = inletUnderground[i] > 0;

}

setTimeframeValues(flowData, RAINM3, [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_LAST_RAIN_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID]);
setTimeframeValues(flowData, EVAPORATIONM3, [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_LAST_RAIN_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID]);
setTimeframeValues(flowData, BOTTOM_FLOW_IN, [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_GROUND_BOTTOM_FLOW_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID]);
setTimeframeValues(flowData, SEWER_IN, [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_SEWER_LAST_VALUE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID], relative = true);

addFlowValues(flowData, 0, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_0]);
addFlowValues(flowData, 1, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_1]);
addFlowValues(flowData, 2, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_2]);
addFlowValues(flowData, 3, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_3]);
addFlowValues(flowData, 4, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_4]);
addFlowValues(flowData, 5, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_5]);
addFlowValues(flowData, 6, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_6]);
addFlowValues(flowData, 7, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_7]);
addFlowValues(flowData, 8, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_8]);
addFlowValues(flowData, 9, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_9]);
addFlowValues(flowData, 10, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_10]);
addFlowValues(flowData, 11, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_11]);
addFlowValues(flowData, 12, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_12]);
addFlowValues(flowData, 13, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_13]);
addFlowValues(flowData, 14, CULVERT_IN, CULVERT_OUT, culvertAreaFrom, culvertAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_14]);

addFlowValues(flowData, 0, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_0], condition = inletSurface);
addFlowValues(flowData, 1, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_1], condition = inletSurface);
addFlowValues(flowData, 2, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_2], condition = inletSurface);
addFlowValues(flowData, 3, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_3], condition = inletSurface);
addFlowValues(flowData, 4, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_4], condition = inletSurface);
addFlowValues(flowData, 5, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_5], condition = inletSurface);
addFlowValues(flowData, 6, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_6], condition = inletSurface);
addFlowValues(flowData, 7, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_7], condition = inletSurface);
addFlowValues(flowData, 8, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_8], condition = inletSurface);
addFlowValues(flowData, 9, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_9], condition = inletSurface);
addFlowValues(flowData, 10, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_10], condition = inletSurface);
addFlowValues(flowData, 11, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_11], condition = inletSurface);
addFlowValues(flowData, 12, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_12], condition = inletSurface);
addFlowValues(flowData, 13, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_13], condition = inletSurface);
addFlowValues(flowData, 14, INLET_SURFACE, OUTLET_SURFACE, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_14], condition = inletSurface);

addFlowValues(flowData, 0, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_0], condition = inletUnderground);
addFlowValues(flowData, 1, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_1], condition = inletUnderground);
addFlowValues(flowData, 2, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_2], condition = inletUnderground);
addFlowValues(flowData, 3, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_3], condition = inletUnderground);
addFlowValues(flowData, 4, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_4], condition = inletUnderground);
addFlowValues(flowData, 5, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_5], condition = inletUnderground);
addFlowValues(flowData, 6, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_6], condition = inletUnderground);
addFlowValues(flowData, 7, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_7], condition = inletUnderground);
addFlowValues(flowData, 8, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_8], condition = inletUnderground);
addFlowValues(flowData, 9, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_9], condition = inletUnderground);
addFlowValues(flowData, 10, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_10], condition = inletUnderground);
addFlowValues(flowData, 11, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_11], condition = inletUnderground);
addFlowValues(flowData, 12, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_12], condition = inletUnderground);
addFlowValues(flowData, 13, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_13], condition = inletUnderground);
addFlowValues(flowData, 14, INLET_GROUND, OUTLET_GROUND, inletAreaFrom, inletAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_14], condition = inletUnderground);

addFlowValues(flowData, 0, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_0]);
addFlowValues(flowData, 1, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_1]);
addFlowValues(flowData, 2, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_2]);
addFlowValues(flowData, 3, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_3]);
addFlowValues(flowData, 4, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_4]);
addFlowValues(flowData, 5, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_5]);
addFlowValues(flowData, 6, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_6]);
addFlowValues(flowData, 7, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_7]);
addFlowValues(flowData, 8, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_8]);
addFlowValues(flowData, 9, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_9]);
addFlowValues(flowData, 10, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_10]);
addFlowValues(flowData, 11, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_11]);
addFlowValues(flowData, 12, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_12]);
addFlowValues(flowData, 13, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_13]);
addFlowValues(flowData, 14, PUMP_IN, PUMP_OUT, pumpAreaFrom, pumpAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_14]);


let links = createLinks(flowproperties);

createTable("waterFlowTable", flowData, flowproperties, flowColors, flowTitles);

const sankeyLayout = createSankeyPlotLayout();

const sankeySlider = document.getElementById("sankeySlider");
sankeyPlot("sankeyPlot", links, sankeySlider.value, properties, colors, titles, sankeyLayout);

setupTimeframeSlider(sankeySlider, timeframe, timeframes, function() {
	sankeyPlot("sankeyPlot", links, sankeySlider.value, properties, colors, titles, sankeyLayout);
});
