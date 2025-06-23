
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


function createTable(divName, data, properties, colors) {

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

const timeframes = 15;
const timeframeTimes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

//const timeframes = $SELECT_ATTRIBUTE_WHERE_GRIDTYPE_IS_RAINFALL_AND_NAME_IS_TIMEFRAMES;
//const timeframeTimes = $SELECT_ATTRIBUTE_WHERE_GRIDTYPE_IS_RAINFALL_AND_INDEX_IS_0_AND_NAME_IS_TIMEFRAME_TIMES;
var timeframe = timeframes - 1;

const data = {};
/*
data[M3TOTAL] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_SURFACE_LAST_VALUE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3WATER] = [$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_M3WATER_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3GROUND] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_GROUND_LAST_VALUE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3STORAGE] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_BUILDING_LAST_STORAGE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3SEWER] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_SEWER_LAST_VALUE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
*/

data[M3TOTAL] = [172479, 178205, 184075, 189937, 195813, 201688, 207574, 213439, 213691, 213944, 214196, 214456, 214716, 214981, 215241];
data[M3WATER] = [112746, 144310, 147322, 149971, 152520, 155013, 157511, 160028, 161397, 162461, 163426, 164269, 165078, 165827, 166532];
data[M3GROUND] = [2316283, 2316850, 2317271, 2317700, 2318122, 2318543, 2318954, 2319384, 2319805, 2320226, 2320647, 2321062, 2321476, 2321886, 2322301];
data[M3STORAGE] = [3.60, 71.44, 143, 212, 278, 342, 404, 465, 466, 466, 467, 467, 467, 467, 467];
data[M3SEWER] = [0, 0.01, 0.01, 0.04, 0.01, 0.01, 0.07, 0.02, 0, 0, 0, 0, 0, 0, 0];
data[M3EVAPORATED] = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140];

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

createTable("waterBalanceTable", data, properties, colors);

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
flowTitles[BREACH_IN] = "Dambruik in";
flowTitles[BREACH_OUT] = "Dambruik uit";

const flowproperties = [TIMEFRAMES, RAINM3, INFILTRATIONM3, EVAPORATIONM3, SEWER_IN, SEWER_OVERFLOW, INLET_SURFACE, INLET_GROUND, OUTLET_SURFACE, OUTLET_GROUND, BOTTOM_FLOW_IN, BOTTOM_FLOW_OUT];
const flowData = {};


let links = createLinks(properties);
addLink(links, 0, MODEL_IN, RAINM3, 40) /* Use your calculated values here */
addLink(links, 0, MODEL_IN, BOTTOM_FLOW_IN, 88) /* Use your calculated values here */
addLink(links, 0, MODEL_IN, INLET_SURFACE, 200) /* Use your calculated values here */
addLink(links, 0, MODEL_IN, INLET_GROUND, 24) /* Use your calculated values here */
addLink(links, 0, M3WATER, M3EVAPORATED, 50) /* Use your calculated values here */

addLink(links, 1, M3WATER, M3EVAPORATED, 77) /* Use your calculated values here */
addLink(links, 1, M3WATER, M3GROUND, 98) /* Use your calculated values here */
addLink(links, 1, M3LAND, M3GROUND, 22) /* Use your calculated values here */
addLink(links, 1, M3LAND, M3SEWER, 84) /* Use your calculated values here */
addLink(links, 1, M3WATER, M3EVAPORATED, 70) /* Use your calculated values here */

addLink(links, 2, M3WATER, M3EVAPORATED, 77) /* Use your calculated values here */
addLink(links, 2, M3WATER, M3GROUND, 14) /* Use your calculated values here */
addLink(links, 2, M3LAND, M3GROUND, 44) /* Use your calculated values here */
addLink(links, 2, M3LAND, M3SEWER, 23) /* Use your calculated values here */
addLink(links, 2, M3WATER, M3EVAPORATED, 58) /* Use your calculated values here */

addLink(links, 3, M3WATER, M3EVAPORATED, 74) /* Use your calculated values here */
addLink(links, 3, M3WATER, M3GROUND, 56) /* Use your calculated values here */
addLink(links, 3, M3LAND, M3GROUND, 44) /* Use your calculated values here */
addLink(links, 3, M3LAND, M3SEWER, 25) /* Use your calculated values here */
addLink(links, 3, M3WATER, M3EVAPORATED, 11) /* Use your calculated values here */

addLink(links, 4, M3WATER, M3EVAPORATED, 47) /* Use your calculated values here */
addLink(links, 4, M3WATER, M3GROUND, 45) /* Use your calculated values here */
addLink(links, 4, M3LAND, M3GROUND, 45) /* Use your calculated values here */
addLink(links, 4, M3LAND, M3SEWER, 65) /* Use your calculated values here */
addLink(links, 4, M3WATER, M3EVAPORATED, 68) /* Use your calculated values here */

addLink(links, 5, M3WATER, M3EVAPORATED, 65) /* Use your calculated values here */
addLink(links, 5, M3WATER, M3GROUND, 55) /* Use your calculated values here */
addLink(links, 5, M3LAND, M3GROUND, 2) /* Use your calculated values here */
addLink(links, 5, M3LAND, M3SEWER, 1) /* Use your calculated values here */
addLink(links, 5, M3WATER, M3EVAPORATED, 170) /* Use your calculated values here */

addLink(links, 6, M3WATER, M3EVAPORATED, 277) /* Use your calculated values here */
addLink(links, 6, M3WATER, M3GROUND, 398) /* Use your calculated values here */
addLink(links, 6, M3LAND, M3GROUND, 422) /* Use your calculated values here */
addLink(links, 6, M3LAND, M3SEWER, 284) /* Use your calculated values here */
addLink(links, 6, M3WATER, M3EVAPORATED, 170) /* Use your calculated values here */

addLink(links, 7, M3WATER, M3EVAPORATED, 77) /* Use your calculated values here */
addLink(links, 7, M3WATER, M3GROUND, 98) /* Use your calculated values here */
addLink(links, 7, M3LAND, M3GROUND, 22) /* Use your calculated values here */
addLink(links, 7, M3LAND, M3SEWER, 84) /* Use your calculated values here */
addLink(links, 7, M3WATER, M3EVAPORATED, 70) /* Use your calculated values here */

addLink(links, 8, M3WATER, M3EVAPORATED, 77) /* Use your calculated values here */
addLink(links, 8, M3WATER, M3GROUND, 98) /* Use your calculated values here */
addLink(links, 8, M3LAND, M3GROUND, 22) /* Use your calculated values here */
addLink(links, 8, M3LAND, M3SEWER, 84) /* Use your calculated values here */
addLink(links, 8, M3WATER, M3EVAPORATED, 70) /* Use your calculated values here */

addLink(links, 9, M3WATER, M3EVAPORATED, 77) /* Use your calculated values here */
addLink(links, 9, M3WATER, M3GROUND, 98) /* Use your calculated values here */
addLink(links, 9, M3LAND, M3GROUND, 22) /* Use your calculated values here */
addLink(links, 9, M3LAND, M3SEWER, 84) /* Use your calculated values here */
addLink(links, 9, M3WATER, M3EVAPORATED, 70) /* Use your calculated values here */

addLink(links, 10, M3WATER, M3EVAPORATED, 77) /* Use your calculated values here */
addLink(links, 10, M3WATER, M3GROUND, 98) /* Use your calculated values here */
addLink(links, 10, M3LAND, M3GROUND, 22) /* Use your calculated values here */
addLink(links, 10, M3LAND, M3SEWER, 84) /* Use your calculated values here */
addLink(links, 10, M3WATER, M3EVAPORATED, 70) /* Use your calculated values here */

addLink(links, 11, M3WATER, M3EVAPORATED, 77) /* Use your calculated values here */
addLink(links, 11, M3WATER, M3GROUND, 98) /* Use your calculated values here */
addLink(links, 11, M3LAND, M3GROUND, 22) /* Use your calculated values here */
addLink(links, 11, M3LAND, M3SEWER, 84) /* Use your calculated values here */
addLink(links, 11, M3WATER, M3EVAPORATED, 70) /* Use your calculated values here */

addLink(links, 12, M3WATER, M3EVAPORATED, 77) /* Use your calculated values here */
addLink(links, 12, M3WATER, M3GROUND, 98) /* Use your calculated values here */
addLink(links, 12, M3LAND, M3GROUND, 22) /* Use your calculated values here */
addLink(links, 12, M3LAND, M3SEWER, 84) /* Use your calculated values here */
addLink(links, 12, M3WATER, M3EVAPORATED, 70) /* Use your calculated values here */

addLink(links, 13, M3WATER, M3EVAPORATED, 77) /* Use your calculated values here */
addLink(links, 13, M3WATER, M3GROUND, 98) /* Use your calculated values here */
addLink(links, 13, M3LAND, M3GROUND, 22) /* Use your calculated values here */
addLink(links, 13, M3LAND, M3SEWER, 84) /* Use your calculated values here */
addLink(links, 13, M3WATER, M3EVAPORATED, 70) /* Use your calculated values here */

addLink(links, 14, M3WATER, M3EVAPORATED, 77) /* Use your calculated values here */
addLink(links, 14, M3WATER, M3GROUND, 98) /* Use your calculated values here */
addLink(links, 14, M3LAND, M3GROUND, 22) /* Use your calculated values here */
addLink(links, 14, M3LAND, M3SEWER, 84) /* Use your calculated values here */
addLink(links, 14, M3WATER, M3EVAPORATED, 70) /* Use your calculated values here */


const sankeyLayout = createSankeyPlotLayout();

const sankeySlider = document.getElementById("sankeySlider");
sankeyPlot("sankeyPlot", links, sankeySlider.value, properties, colors, titles, sankeyLayout);

setupTimeframeSlider(sankeySlider, timeframe, timeframes, function() {
	sankeyPlot("sankeyPlot", links, sankeySlider.value, properties, colors, titles, sankeyLayout);
});
