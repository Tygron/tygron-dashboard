import { createTable } from "../util/table.js";
import { barPlot, createBarPlotLayout, } from "../util/plot.js";
import { setupTimeframeSlider } from "../util/timeframeslider.js";
import { addFlowValues, createLinks } from "../util/data.js";
import { toCSVContent, addDownloadHandler } from "../util/file.js";

$( window ).on( "load", function() {
	if ('$SELECT_ID_WHERE_AREA_IS_ID'.indexOf('$')!=-1) {
		let message = '<p>Error: Queries not loaded</p>';
		message += '<p>Please ensure:</p><ul>';
		message += '<li>This content is added to a Template Text Panel, applied to Areas.</li>';
		message += '<li>The Session has fully recalculated.</li>';
		message += '</ul>';
		let messageEl = document.createElement('div');
		messageEl.innerHTML = message;
		document.body.prepend(messageEl);
	}
});

const M3TOTAL = 'm3Total';
const M3LAND = 'm3Land';
const M3WATER = 'm3Water';
const M3SEWER = 'm3Sewer';
const M3STORAGE = 'm3Storage';
const M3GROUND = 'm3Ground';
const TIMEFRAMES = 'timeframes';
const TIMEFRAMETIMES = 'timeframetimes';

const timeframes = $SELECT_ATTRIBUTE_WHERE_GRIDTYPE_IS_RAINFALL_AND_NAME_IS_TIMEFRAMES;
var timeframe = timeframes - 1;

const data = {};
data[TIMEFRAMETIMES] = [$SELECT_NAME_WHERE_TIMEFRAME_IS_X_AND_GRIDTYPE_IS_RAINFALL];
data[M3TOTAL] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_SURFACE_LAST_VALUE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3WATER] = [$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_M3WATER_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3GROUND] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_GROUND_LAST_STORAGE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3STORAGE] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_BUILDING_LAST_STORAGE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3SEWER] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_SEWER_LAST_VALUE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3LAND] = [];
data[TIMEFRAMES] = [];

for (var i = 0; i < data[M3TOTAL].length && i < data[M3WATER].length; i++)
	data[M3LAND].push(data[M3TOTAL][i] - data[M3WATER][i]);

for (var i = 0; i < timeframes; i++)
	data[TIMEFRAMES].push(i);

let timeLabels = data[TIMEFRAMETIMES];
const properties = [TIMEFRAMES, TIMEFRAMETIMES, M3LAND, M3WATER, M3GROUND, M3SEWER, M3STORAGE];
const plotProperties = [TIMEFRAMES, M3LAND, M3WATER, M3GROUND, M3SEWER, M3STORAGE];


const titles = {};
titles[TIMEFRAMES] = "Timeframes";
titles[TIMEFRAMETIMES] = "Tijdstap";
titles[M3LAND] = "Water op land [m3]";
titles[M3WATER] = "Oppervlaktewater [m3]";
titles[M3GROUND] = "Grondwater [m3]";
titles[M3STORAGE] = "Waterbergende voorzieningen [m3]";
titles[M3SEWER] = "Rioolwater [m3]";

const colors = {};
colors[M3WATER] = [10, 10, 218, 0.5];
colors[M3LAND] = [10, 218, 10, 0.5];
colors[M3GROUND] = [165, 42, 42, 0.5];
colors[M3STORAGE] = [218, 10, 10, 0.5];
colors[M3SEWER] = [128, 128, 128, 0.5];

createTable("waterBalanceTable", data, properties, colors, titles, timeLabels);

const barPlotLayout = createBarPlotLayout();
barPlotLayout.title.text = "Berging per component";
barPlotLayout.yaxis.title.text = "Volume [m3]";
barPlotLayout.xaxis.title.text = "Component";

const barSlider = document.getElementById("barSlider");
barPlot("balancePlot", data, barSlider.value, plotProperties, colors, titles, barPlotLayout);
setupTimeframeSlider(barSlider, timeframe, timeframes, function() {
	barPlot("balancePlot", data, barSlider.value, plotProperties, colors, titles, barPlotLayout);
});

const MODEL_IN = 'MODEL_IN';
const MODEL_OUT = 'MODEL_OUT';
const RAINM3 = 'RAINM3';
const RAINM3LAND = 'RAINM3LAND';
const RAINM3WATER = 'RAINM3WATER';
const RAINM3STORAGE = 'RAINM3STORAGE';

const LANDSEWER = 'LANDSEWER';


const EVAPOTRANSPIRATION = 'EVAPOTRANSPIRATION';
const GROUND_TRANSPIRATION = 'GROUND_TRANSPIRATION';
const SURFACE_EVAPORATIONLAND = 'SURFACE_EVAPORATIONLAND';
const SURFACE_EVAPORATIONWATER = 'SURFACE_EVAPORATIONWATER';

const SEWER_POC = 'sewer_POC';
const SEWER_OVERFLOW_OUT = 'SEWER_OVERFLOW_OUT';

const INLET_SURFACE = 'INLET_SURFACE';
const INLET_GROUND = 'INLET_GROUND';
const OUTLET_SURFACE = "OUTLET_SURFACE";
const OUTLET_GROUND = "OUTLET_GROUND";
const BOTTOM_FLOW_IN = "BOTTOM_FLOW_IN";
const BOTTOM_FLOW_OUT = "BOTTOM_FLOW_OUT";
const CULVERT = "CULVERT";
const CULVERT_IN = "CULVERT_IN";
const CULVERT_OUT = "CULVERT_OUT";
const CULVERT_INNER = "CULVERT_INNER";
const PUMP = "PUMP";
const PUMP_IN = "PUMP_IN";
const PUMP_OUT = "PUMP_OUT";
const PUMP_INNER = "PUMP_INNER";
const WEIR = "WEIR";
const WEIR_IN = "WEIR_IN";
const WEIR_OUT = "WEIR_OUT";
const WEIR_INNER = "WEIR_INNER";
const BREACH_IN = "BREACH_IN";
const BREACH_OUT = "BREACH_OUT";

const flowTitles = {};
flowTitles[TIMEFRAMES] = "Timeframes";

flowTitles[RAINM3] = 'Neerslag [m³/tijdstap]';
flowTitles[RAINM3LAND] = 'Neerslag op land [m³/tijdstap]';
flowTitles[RAINM3WATER] = 'Neerslag op water [m³/tijdstap]';
flowTitles[RAINM3STORAGE] = 'Neerslag op bergende voorzieningen [m³/tijdstap]';
flowTitles[LANDSEWER] = 'Toestroom naar riool [m³/tijdstap]';

flowTitles[EVAPOTRANSPIRATION] = 'Verdamping [m³/tijdstap]';
flowTitles[GROUND_TRANSPIRATION] = 'Plant transpiratie [m³/tijdstap]';
flowTitles[SURFACE_EVAPORATIONLAND] = 'Verdamping Land [m³/tijdstap]';
flowTitles[SURFACE_EVAPORATIONWATER] = 'Verdamping Water [m³/tijdstap]';


flowTitles[SEWER_POC] = 'POCRiool [m³/tijdstap]';

flowTitles[SEWER_OVERFLOW_OUT] = 'Riooloverstort [m³/tijdstap]';

flowTitles[INLET_SURFACE] = 'Inlaat op land [m³/tijdstap]';
flowTitles[INLET_GROUND] = 'Inlaat in grondwater [m³/tijdstap]';
flowTitles[OUTLET_SURFACE] = "Uitlaat op land [m³/tijdstap]";
flowTitles[OUTLET_GROUND] = "Uitlaat uit grondwater [m³/tijdstap]";
flowTitles[BOTTOM_FLOW_IN] = "Kwel [m³/tijdstap]";
flowTitles[BOTTOM_FLOW_OUT] = "Uitzijging [m³/tijdstap]";
flowTitles[CULVERT] = "Duiker [m³/tijdstap]";
flowTitles[CULVERT_IN] = "Duiker in interessegebied [m³/tijdstap]";
flowTitles[CULVERT_OUT] = "Duiker uit interessegebied [m³/tijdstap]";
flowTitles[CULVERT_INNER] = "Duiker binnen interessegebied [m³/tijdstap]";
flowTitles[PUMP] = "Pomp";
flowTitles[PUMP_IN] = "Pomp in interessegebied [m³/tijdstap]";
flowTitles[PUMP_OUT] = "Pomp uit interessegebied [m³/tijdstap]";
flowTitles[PUMP_INNER] = "Pomp binnen interessegebied [m³/tijdstap]";
flowTitles[WEIR] = "Stuw";
flowTitles[WEIR_IN] = "Stuw in [m³/tijdstap]";
flowTitles[WEIR_OUT] = "Stuw uit [m³/tijdstap]";
flowTitles[WEIR_INNER] = "Stuw binnen interessegebied [m³/tijdstap]";
flowTitles[MODEL_IN] = "Interessegebied in [m³/tijdstap]";
flowTitles[MODEL_OUT] = "Interessegebied uit [m³/tijdstap]";
flowTitles[M3GROUND] = "Grondwater [m³]";
flowTitles[M3LAND] = "Land [m³]";
flowTitles[M3WATER] = "Oppervlaktewater [m³]";
flowTitles[M3STORAGE] = "Berging voorzieningen [m³]";
flowTitles[M3TOTAL] = "Surface [m³]";
flowTitles[M3SEWER] = "Riolering [m³]";


const flowColors = {};
// Model In/Out
flowColors[MODEL_IN] = [44, 160, 44, 0.5];           // Groen
flowColors[MODEL_OUT] = [214, 39, 40, 0.5];          // Rood

//Natuurlijlke processen
flowColors[RAINM3] = [31, 119, 180, 0.5];          // Donkerblauw - Neerslag
flowColors[RAINM3LAND] = [31, 119, 180, 0.5];          // Donkerblauw - Neerslag
flowColors[RAINM3WATER] = [31, 119, 180, 0.5];
flowColors[RAINM3STORAGE] = [31, 119, 180, 0.5];

flowColors[LANDSEWER] = [31, 119, 180, 0.5];



flowColors[EVAPOTRANSPIRATION] = [31, 119, 180, 0.5];
flowColors[GROUND_TRANSPIRATION] = [31, 119, 180, 0.5];
flowColors[SURFACE_EVAPORATIONLAND] = [31, 119, 180, 0.5];
flowColors[SURFACE_EVAPORATIONWATER] = [31, 119, 180, 0.5];


flowColors[BOTTOM_FLOW_IN] = [31, 119, 180, 0.5];
flowColors[BOTTOM_FLOW_OUT] = [31, 119, 180, 0.5];

// Berging - Lichtblauw
flowColors[M3LAND] = [196, 196, 220, 0.5];         // Berging land
flowColors[M3WATER] = [196, 196, 220, 0.5];        // Oppervlaktewater
flowColors[M3GROUND] = [196, 196, 220, 0.5];       // Bodem
flowColors[M3STORAGE] = [196, 196, 220, 0.5];      // Gebouwen
flowColors[M3TOTAL] = [196, 196, 220, 0.5];        // Totale berging (optioneel)

// Kunstwerken - Oranje
flowColors[INLET_SURFACE] = [255, 127, 14, 0.5];
flowColors[INLET_GROUND] = [255, 127, 14, 0.5];
flowColors[OUTLET_SURFACE] = [255, 127, 14, 0.5];
flowColors[OUTLET_GROUND] = [255, 127, 14, 0.5];
flowColors[PUMP] = [255, 127, 14, 0.5];
flowColors[PUMP_IN] = [255, 127, 14, 0.5];
flowColors[PUMP_OUT] = [255, 127, 14, 0.5];
flowColors[PUMP_INNER] = [255, 127, 14, 0.5];
flowColors[SEWER_OVERFLOW_OUT] = [255, 127, 14, 0.5]; // Overstort
flowColors[SEWER_POC] = [255, 127, 14, 0.5];           // POC
flowColors[CULVERT] = [255, 127, 14, 0.5];
flowColors[CULVERT_IN] = [255, 127, 14, 0.5];
flowColors[CULVERT_OUT] = [255, 127, 14, 0.5];
flowColors[CULVERT_INNER] = [255, 127, 14, 0.5];
flowColors[WEIR] = [255, 127, 14, 0.5];
flowColors[WEIR_IN] = [255, 127, 14, 0.5];
flowColors[WEIR_OUT] = [255, 127, 14, 0.5];
flowColors[WEIR_INNER] = [255, 127, 14, 0.5];




const flowProperties = [TIMEFRAMES, MODEL_IN, MODEL_OUT, M3LAND, M3WATER, M3GROUND, M3STORAGE, M3SEWER, RAINM3, RAINM3LAND, RAINM3WATER, RAINM3STORAGE, GROUND_TRANSPIRATION, EVAPOTRANSPIRATION, SURFACE_EVAPORATIONLAND, SURFACE_EVAPORATIONWATER, BOTTOM_FLOW_IN, BOTTOM_FLOW_OUT, LANDSEWER, SEWER_POC, SEWER_OVERFLOW_OUT, CULVERT_IN, CULVERT_OUT, CULVERT_INNER, INLET_SURFACE, OUTLET_SURFACE, INLET_GROUND, OUTLET_GROUND, PUMP_IN, PUMP_OUT, PUMP_INNER, WEIR_IN, WEIR_OUT, WEIR_INNER];
const flowData = createTimeframeData(timeframes, $ID, flowProperties);

const culvertAreaFrom = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_0];
const culvertAreaTo = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_1];
const pumpAreaFrom = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_0];
const pumpAreaTo = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_1];
const inletAreaFrom = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_0];
const inletAreaTo = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_1];
const weirAreaFrom = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_0];
const weirAreaTo = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_1];
const inletUnderground = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_UNDERGROUND_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_0];
const inletSurface = [];

for (let i = 0; i < inletUnderground.length; i++) {
	inletSurface.push(inletUnderground[i] <= 0);
	inletUnderground[i] = inletUnderground[i] > 0;

}

for (var i = 0; i < timeframes; i++)
	flowData[TIMEFRAMES][i] = i;

setTimeframeValues(flowData, RAINM3, [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_RAIN_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID], { relative: true });



const cumulativeValuesRain = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_RAIN_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
const stepwiseValuesRain = cumulativeValuesRain.map((val, index, arr) => {
	if (index === 0) return val;
	return val - arr[index - 1];
});
setTimeframeValues(flowData, RAINM3, stepwiseValuesRain);

const cumulativeValuesEvaporated = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_EVAPOTRANSPIRATION_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
const stepwiseValuesEvaporated = cumulativeValuesEvaporated.map((val, index, arr) => {
	if (index === 0) return val;
	return val - arr[index - 1];
});
setTimeframeValues(flowData, EVAPOTRANSPIRATION, stepwiseValuesEvaporated);

const rawValuesBottomFlowIn = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_GROUND_BOTTOM_FLOW_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
const cumulativeValuesBottomFlowIn = rawValuesBottomFlowIn.map(val => Math.max(0, val));

const stepwiseValuesBottomFlowIn = cumulativeValuesBottomFlowIn.map((val, index, arr) => {
	if (index === 0) return val;
	return val - arr[index - 1];
});

setTimeframeValues(flowData, BOTTOM_FLOW_IN, stepwiseValuesBottomFlowIn);

const rawValuesBottomFlowOut = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_GROUND_BOTTOM_FLOW_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
const cumulativeValuesBottomFlowOut = rawValuesBottomFlowOut.map(val => Math.abs(val));

const stepwiseValuesBottomFlowOut = cumulativeValuesBottomFlowOut.map((val, index, arr) => {
	if (index === 0) return val;
	return val - arr[index - 1];
});

setTimeframeValues(flowData, BOTTOM_FLOW_OUT, stepwiseValuesBottomFlowOut);

flowData[M3TOTAL] = data[M3TOTAL];
flowData[M3WATER] = data[M3WATER];
flowData[M3LAND] = data[M3LAND];
flowData[M3STORAGE] = data[M3STORAGE];
flowData[M3GROUND] = data[M3GROUND];
flowData[M3SEWER] = data[M3SEWER]

flowData[MODEL_IN] = flowData[RAINM3].map((_, i) =>
	flowData[RAINM3][i] +
	flowData[INLET_GROUND][i] +
	flowData[INLET_SURFACE][i] +
	flowData[BOTTOM_FLOW_IN][i]
);

flowData[MODEL_OUT] = flowData[EVAPOTRANSPIRATION].map((_, i) =>
	flowData[EVAPOTRANSPIRATION][i] +
	flowData[OUTLET_GROUND][i] +
	flowData[OUTLET_SURFACE][i] +
	flowData[BOTTOM_FLOW_OUT][i]
);

// Voeg duikerbijdrage toe
flowData[CULVERT_IN].forEach((_, i) => {
	const verschil = flowData[CULVERT_IN][i] - flowData[CULVERT_OUT][i];
	if (verschil > 0) {
		flowData[MODEL_IN][i] += verschil;
	} else {
		flowData[MODEL_OUT][i] += Math.abs(verschil);
	}
});

//Neerslag - Berging Land
const cumulativeValuesRainLand = [$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_RAIN_LAND_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
const stepwiseValuesRainLand = cumulativeValuesRainLand.map((val, index, arr) => {
	if (index === 0) return val;
	return val - arr[index - 1];
});
setTimeframeValues(flowData, RAINM3LAND, stepwiseValuesRainLand);

//Neerslag - Berging Oppervlaktewater
const cumulativeValuesRainWater = [$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_RAIN_WATER_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
const stepwiseValuesRainWater = cumulativeValuesRainWater.map((val, index, arr) => {
	if (index === 0) return val;
	return val - arr[index - 1];
});
setTimeframeValues(flowData, RAINM3WATER, stepwiseValuesRainWater);

//Neerslag - Berging Gebouwen
const cumulativeValuesRainStorage = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_BUILDING_LAST_STORAGE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
const stepwiseValuesRainStorage = cumulativeValuesRainStorage.map((val, index, arr) => {
	if (index === 0) return val;
	return val - arr[index - 1];
});
setTimeframeValues(flowData, RAINM3STORAGE, stepwiseValuesRainStorage);

//Berging Land - Berging riool
const cumulativeValuesSewer = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_SEWER_LAST_VALUE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
const stepwiseValuesSewer = cumulativeValuesSewer.map((val, index, arr) => {
	if (index === 0) return val;
	return val - arr[index - 1];
});
setTimeframeValues(flowData, LANDSEWER, stepwiseValuesSewer);

//Verdamping totaal
const cumulativeValuesEvapotranspiration = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_EVAPOTRANSPIRATION_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
const stepwiseValuesEvapotranspiration = cumulativeValuesEvapotranspiration.map((val, index, arr) => {
	if (index === 0) return val;
	return val - arr[index - 1];
});
setTimeframeValues(flowData, EVAPOTRANSPIRATION, stepwiseValuesEvapotranspiration);

//Berging Bodem - Verdamping
const cumulativeValuesTranspiration = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_GROUND_TRANSPIRATION_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
const stepwiseValuesTranspiration = cumulativeValuesTranspiration.map((val, index, arr) => {
	if (index === 0) return val;
	return val - arr[index - 1];
});
setTimeframeValues(flowData, GROUND_TRANSPIRATION, stepwiseValuesTranspiration);

//Verdamping Land
const cumulativeValuesEVAPORATIONLAND = [$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_EVAPORATIONLAND_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
const stepwiseValuesEVAPORATIONLAND = cumulativeValuesEVAPORATIONLAND.map((val, index, arr) => {
	if (index === 0) return val;
	return val - arr[index - 1];
});
setTimeframeValues(flowData, SURFACE_EVAPORATIONLAND, stepwiseValuesEVAPORATIONLAND);


//Verdamping Water
const cumulativeValuesEVAPORATIONWATER = [$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_EVAPORATIONWATER_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
const stepwiseValuesEVAPORATIONWATER = cumulativeValuesEVAPORATIONWATER.map((val, index, arr) => {
	if (index === 0) return val;
	return val - arr[index - 1];
});
setTimeframeValues(flowData, SURFACE_EVAPORATIONWATER, stepwiseValuesEVAPORATIONWATER);

//Berging Land - Uitlaat/Inlaat
const landInlet = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_TIMEFRAME_IS_Y_AND_GRIDTYPE_IS_RAINFALL];

for (let timeframeKey = 0; timeframeKey < landInlet.length; timeframeKey++) {
	let timeframeValues = landInlet[timeframeKey];
	addFlowValues(
		flowData,
		timeframeKey,
		INLET_SURFACE,
		OUTLET_SURFACE,
		inletAreaFrom,
		inletAreaTo,
		timeframeValues,
		condition = inletSurface
	);
}

//Berging Water - stuw
const waterWeir = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_TIMEFRAME_IS_Y_AND_GRIDTYPE_IS_RAINFALL];

for (let timeframeKey = 0; timeframeKey < waterWeir.length; timeframeKey++) {
	let timeframeValues = waterWeir[timeframeKey];
	addFlowValuesWithInner(
		flowData,
		timeframeKey,
		WEIR_IN,
		WEIR_OUT,
		WEIR_INNER,
		weirAreaFrom,
		weirAreaTo,
		timeframeValues,
		condition = undefined
	);
}

//Berging Water - Duiker
const waterCulvert = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_TIMEFRAME_IS_Y_AND_GRIDTYPE_IS_RAINFALL];

for (let timeframeKey = 0; timeframeKey < waterCulvert.length; timeframeKey++) {
	let timeframeValues = waterCulvert[timeframeKey];
	addFlowValuesWithInner(
		flowData,
		timeframeKey,
		CULVERT_IN,
		CULVERT_OUT,
		CULVERT_INNER,
		culvertAreaFrom,
		culvertAreaTo,
		timeframeValues,
		condition = undefined
	);
}

//Berging Water - Pomp
const waterPump = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_TIMEFRAME_IS_Y_AND_GRIDTYPE_IS_RAINFALL];


for (let timeframeKey = 0; timeframeKey < waterPump.length; timeframeKey++) {
	let timeframeValues = waterPump[timeframeKey];
	addFlowValuesWithInner(
		flowData,
		timeframeKey,
		PUMP_IN,
		PUMP_OUT,
		PUMP_INNER,
		pumpAreaFrom,
		pumpAreaTo,
		timeframeValues,
		condition = undefined
	);
}

//Berging Bodem - Uitlaat/Inlaat
const inletGround = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_TIMEFRAME_IS_Y_AND_GRIDTYPE_IS_RAINFALL];


for (let timeframeKey = 0; timeframeKey < inletGround.length; timeframeKey++) {
	let timeframeValues = inletGround[timeframeKey];
	addFlowValues(
		flowData,
		timeframeKey,
		INLET_GROUND,
		OUTLET_GROUND,
		inletAreaFrom,
		inletAreaTo,
		timeframeValues,
		condition = inletUnderground
	);
}


//Berging Riool - POC
const sewerPOC = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_AREA_IS_YA_SEWER_STORAGE_AND_TIMEFRAME_IS_X_AND_GRIDTYPE_IS_RAINFALL];

let sewerPOCSums = [];

for (let areaKey = 0; areaKey < sewerPOC.length; areaKey++) {
	let areaValues = sewerPOC[areaKey];
	for (let timeframeKey = 0; timeframeKey < areaValues.length; timeframeKey++) {
		sewerPOCSums[timeframeKey] = sewerPOCSums[timeframeKey] ?? 0;
		sewerPOCSums[timeframeKey] = sewerPOCSums[timeframeKey] + areaValues[timeframeKey];
	}
}

flowData[SEWER_POC] = sewerPOCSums;


//Berging Riool - Berging Land
const sewerOverflow = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_YA_SEWER_OVERFLOW_AND_TIMEFRAME_IS_X_AND_GRIDTYPE_IS_RAINFALL];

let sewerOverflowSums = [];

for (let buildingKey = 0; buildingKey < sewerOverflow.length; buildingKey++) {
	let buildingValues = sewerOverflow[buildingKey];
	for (let timeframeKey = 0; timeframeKey < buildingValues.length; timeframeKey++) {
		sewerOverflowSums[timeframeKey] = sewerOverflowSums[timeframeKey] ?? 0;
		sewerOverflowSums[timeframeKey] = sewerOverflowSums[timeframeKey] + buildingValues[timeframeKey];
	}
}

flowData[SEWER_OVERFLOW_OUT] = sewerOverflowSums;


createTable("waterFlowTable", flowData, flowProperties, flowColors, flowTitles);


const sankeyproperties = [TIMEFRAMES, MODEL_IN, MODEL_OUT, M3LAND, M3WATER, M3GROUND, M3STORAGE, M3SEWER, RAINM3, RAINM3LAND, RAINM3WATER, RAINM3STORAGE, GROUND_TRANSPIRATION, EVAPOTRANSPIRATION, SURFACE_EVAPORATIONLAND, SURFACE_EVAPORATIONWATER, BOTTOM_FLOW_IN, BOTTOM_FLOW_OUT, LANDSEWER, SEWER_POC, SEWER_OVERFLOW_OUT, CULVERT, CULVERT_IN, CULVERT_OUT, CULVERT_INNER, INLET_SURFACE, OUTLET_SURFACE, INLET_GROUND, OUTLET_GROUND, PUMP, PUMP_IN, PUMP_OUT, PUMP_INNER, WEIR, WEIR_IN, WEIR_OUT, WEIR_INNER];

let links = createLinks(sankeyproperties);
for (let i = 0; i < timeframes; i++) {
	//Model in
	addLink(links, i, MODEL_IN, RAINM3, flowData[RAINM3][i]);
	addLink(links, i, MODEL_IN, INLET_GROUND, flowData[INLET_GROUND][i]);
	addLink(links, i, MODEL_IN, INLET_SURFACE, flowData[INLET_SURFACE][i]);
	addLink(links, i, MODEL_IN, BOTTOM_FLOW_IN, flowData[BOTTOM_FLOW_IN][i]);
	addLink(links, i, MODEL_IN, CULVERT, flowData[CULVERT_IN][i]);
	addLink(links, i, MODEL_IN, PUMP, flowData[PUMP_IN][i]);
	addLink(links, i, MODEL_IN, WEIR, flowData[WEIR_IN][i]);

	//Neerslag	
	addLink(links, i, RAINM3, M3LAND, flowData[RAINM3LAND][i]);
	addLink(links, i, RAINM3, M3WATER, flowData[RAINM3WATER][i]);
	addLink(links, i, RAINM3, M3STORAGE, flowData[RAINM3STORAGE][i]);

	//Berging Land
	addLink(links, i, M3LAND, M3SEWER, flowData[LANDSEWER][i]);
	addLink(links, i, M3LAND, EVAPOTRANSPIRATION, flowData[SURFACE_EVAPORATIONLAND][i]);
	//addLink(links, i, M3LAND, M3GROUND, flowData[][i]);

	//Berging oppervlaktewater
	//addLink(links, i, M3WATER, M3GROUND, flowData[][i]);
	addLink(links, i, M3WATER, WEIR, flowData[WEIR_OUT][i]);
	addLink(links, i, M3WATER, EVAPOTRANSPIRATION, flowData[SURFACE_EVAPORATIONWATER][i]);
	addLink(links, i, M3WATER, CULVERT, flowData[CULVERT_OUT][i]);
	addLink(links, i, M3WATER, OUTLET_SURFACE, flowData[OUTLET_SURFACE][i]);
	addLink(links, i, M3WATER, PUMP, flowData[PUMP_OUT][i]);
	addLink(links, i, M3WATER, PUMP, flowData[PUMP_INNER][i]);
	addLink(links, i, M3WATER, WEIR, flowData[WEIR_INNER][i]);
	addLink(links, i, M3WATER, CULVERT, flowData[CULVERT_INNER][i]);


	//Berging Bodem
	addLink(links, i, M3GROUND, BOTTOM_FLOW_OUT, flowData[BOTTOM_FLOW_OUT][i]);
	addLink(links, i, M3GROUND, GROUND_TRANSPIRATION, flowData[GROUND_TRANSPIRATION][i]);
	addLink(links, i, M3GROUND, OUTLET_GROUND, flowData[OUTLET_GROUND][i]);

	//Berging Riool
	addLink(links, i, M3SEWER, SEWER_OVERFLOW_OUT, flowData[SEWER_OVERFLOW_OUT][i]);
	addLink(links, i, M3SEWER, SEWER_POC, flowData[SEWER_POC][i]);

	//Inlaat Surface
	addLink(links, i, INLET_SURFACE, M3LAND, flowData[INLET_SURFACE][i]); // Eigenlijk zou hier een uitsplitsing moeten zijn tussen een inlaat op land en een inlaat in het water

	//Inlaat Ground
	addLink(links, i, INLET_GROUND, M3GROUND, flowData[INLET_GROUND][i]);

	//Uitlaat Surface
	addLink(links, i, OUTLET_SURFACE, MODEL_OUT, flowData[OUTLET_SURFACE][i]);

	//Uitlaat Land
	addLink(links, i, OUTLET_GROUND, MODEL_OUT, flowData[OUTLET_GROUND][i]);

	//Kwel 
	addLink(links, i, BOTTOM_FLOW_IN, M3GROUND, flowData[BOTTOM_FLOW_IN][i]);

	//Riool overstort
	addLink(links, i, SEWER_OVERFLOW_OUT, M3LAND, flowData[SEWER_OVERFLOW_OUT][i]);

	//POC
	addLink(links, i, SEWER_POC, MODEL_OUT, flowData[SEWER_POC][i]);

	//Wegzijging
	addLink(links, i, BOTTOM_FLOW_OUT, MODEL_OUT, flowData[BOTTOM_FLOW_OUT][i]);

	//Platen transpiratie
	addLink(links, i, GROUND_TRANSPIRATION, MODEL_OUT, flowData[GROUND_TRANSPIRATION][i]);

	//Stuw
	addLink(links, i, WEIR, MODEL_OUT, flowData[WEIR_OUT][i]);
	addLink(links, i, WEIR, M3WATER, flowData[WEIR_INNER][i]);

	//Duiker in
	addLink(links, i, CULVERT, M3WATER, flowData[CULVERT_IN][i]);
	addLink(links, i, CULVERT, M3WATER, flowData[CULVERT_INNER][i]);

	//Duiker uit
	addLink(links, i, CULVERT, MODEL_OUT, flowData[CULVERT_OUT][i]);

	//Pomp
	addLink(links, i, PUMP, M3WATER, flowData[PUMP_IN][i]);
	addLink(links, i, PUMP, M3WATER, flowData[PUMP_INNER][i]);


	//Verdamping
	addLink(links, i, EVAPOTRANSPIRATION, MODEL_OUT, flowData[EVAPOTRANSPIRATION][i]);

	//Transpiratie
	addLink(links, i, GROUND_TRANSPIRATION, MODEL_OUT, flowData[GROUND_TRANSPIRATION][i]);

}



const nodeColors = {
	MODEL_IN: "#2ca02c",
	MODEL_OUT: "#d62728",
	M3LAND: "#6699cc",
	M3WATER: "#6699cc",
	M3GROUND: "#6699cc",
	M3STORAGE: "#6699cc",
	M3SEWER: "#6699cc",
	RAINM3: "#1f77b4",
	RAINM3LAND: "#c5b0d5",
	RAINM3WATER: "#8c564b",
	RAINM3STORAGE: "#c49c94",
	GROUND_TRANSPIRATION: "#1f77b4",
	EVAPOTRANSPIRATION: "#1f77b4",
	SURFACE_EVAPORATIONLAND: "#1f77b4",
	SURFACE_EVAPORATIONWATER: "#1f77b4",
	BOTTOM_FLOW_IN: "#1f77b4",
	BOTTOM_FLOW_OUT: "#1f77b4",
	LANDSEWER: "#17becf",
	SEWER_POC: "#ff7f0e",
	SEWER_OVERFLOW_OUT: "#ff7f0e",
	CULVERT: "#ff7f0e",
	CULVERT_IN: "#ff7f0e",
	CULVERT_OUT: "#ff7f0e",
	CULVERT_INNER: "#ff7f0e",
	INLET_SURFACE: "#ff7f0e",
	OUTLET_SURFACE: "#ff7f0e",
	INLET_GROUND: "#ff7f0e",
	OUTLET_GROUND: "#ff7f0e",
	PUMP: "#ff7f0e",
	PUMP_IN: "#ff7f0e",
	PUMP_OUT: "#ff7f0e",
	PUMP_INNER: "#ff7f0e",
	WEIR: "#ff7f0e",
	WEIR_IN: "#ff7f0e",
	WEIR_OUT: "#ff7f0e",
	WEIR_INNER: "#ff7f0e"
};




const sankeyLayout = createSankeyPlotLayout();

const sankeySlider = document.getElementById("sankeySlider");

sankeyPlot(
	"sankeyPlot",         // plotDivName
	links,                // links
	sankeySlider.value,   // timeframe
	sankeyproperties,     // properties
	flowTitles,           // titles
	sankeyLayout,         // layout
	nodeColors           // kleuren als object

);

setupTimeframeSlider(sankeySlider, timeframe, timeframes, function() {
	sankeyPlot(
		"sankeyPlot",         // plotDivName
		links,                // links
		sankeySlider.value,   // timeframe
		sankeyproperties,     // properties
		flowTitles,           // titles
		sankeyLayout,         // layout
		nodeColors            // kleuren als object

	);
});

let balanceCSVButton = document.getElementById("balanceCSVButton");
let flowCSVButton = document.getElementById("flowCSVButton");

addDownloadHandler(balanceCSVButton, "waterbalance.csv", () => toCSVContent(data, properties, titles, timeframes));
addDownloadHandler(flowCSVButton, "waterflow.csv", () => toCSVContent(flowData, flowProperties, flowTitles, timeframes));
