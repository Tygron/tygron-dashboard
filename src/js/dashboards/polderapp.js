import { createTable } from "../util/table.js";
import { barPlot, createBarPlotLayout, } from "../util/plot.js";
import { setupTimeframeSlider } from "../util/timeframeslider.js";
import { createLinks } from "../util/data.js";
import { toCSVContent,addDownloadHandler} from "../util/file.js";
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
data[M3GROUND] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_GROUND_LAST_STORAGE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
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
const WEIR_IN = "WEIR_IN";
const WEIR_OUT = "WEIR_OUT";
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
flowTitles[WEIR_IN] = "Stuw in";
flowTitles[WEIR_OUT] = "Stuw uit";
flowTitles[MODEL_IN] = "Model in";
flowTitles[MODEL_OUT] = "Model uit";
flowTitles[M3GROUND] = "Ground";
flowTitles[M3LAND] = "Land";
flowTitles[M3WATER] = "Water";

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
flowColors[WEIR_IN] = [128, 128, 128, 0.5];
flowColors[WEIR_OUT] = [128, 128, 128, 0.5];
flowColors[MODEL_IN] =  [128, 128, 128, 0.5];
flowColors[MODEL_OUT] =  [0, 128, 128, 0.5];
flowColors[M3GROUND] =  [128, 128, 0, 0.5];
flowColors[M3LAND] =  [0, 128, 0, 0.5];
flowColors[M3WATER] =  [0, 0, 128, 0.5];

const flowProperties = [TIMEFRAMES, RAINM3, INFILTRATIONM3, EVAPORATIONM3, SEWER_IN, SEWER_OVERFLOW, INLET_SURFACE, INLET_GROUND, OUTLET_SURFACE, OUTLET_GROUND, BOTTOM_FLOW_IN, BOTTOM_FLOW_OUT, CULVERT_IN, CULVERT_OUT, INLET_SURFACE, OUTLET_SURFACE, INLET_GROUND, OUTLET_GROUND, PUMP_IN, PUMP_OUT, WEIR_IN, WEIR_OUT];
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
	flowData[TIMEFRAMES][i]=i;

setTimeframeValues(flowData, RAINM3, [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_RAIN_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID], {relative:true});
setTimeframeValues(flowData, EVAPORATIONM3, [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_EVAPORATED_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID], {relative: true});
setTimeframeValues(flowData, BOTTOM_FLOW_IN, [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_GROUND_BOTTOM_FLOW_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID], {negative: false});
setTimeframeValues(flowData, BOTTOM_FLOW_OUT, [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_GROUND_BOTTOM_FLOW_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID], {negative: true});
setTimeframeValues(flowData, SEWER_IN, [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_SEWER_LAST_VALUE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID], {relative: true, negative:false});
setTimeframeValues(flowData, SEWER_OVERFLOW, [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_SEWER_LAST_VALUE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID], {relative: true, negative:true});

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

addFlowValues(flowData, 0, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_0]);
addFlowValues(flowData, 1, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_1]);
addFlowValues(flowData, 2, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_2]);
addFlowValues(flowData, 3, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_3]);
addFlowValues(flowData, 4, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_4]);
addFlowValues(flowData, 5, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_5]);
addFlowValues(flowData, 6, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_6]);
addFlowValues(flowData, 7, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_7]);
addFlowValues(flowData, 8, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_8]);
addFlowValues(flowData, 9, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_9]);
addFlowValues(flowData, 10, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_10]);
addFlowValues(flowData, 11, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_11]);
addFlowValues(flowData, 12, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_12]);
addFlowValues(flowData, 13, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_13]);
addFlowValues(flowData, 14, WEIR_IN, WEIR_OUT, weirAreaFrom, weirAreaTo, [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_14]);


createTable("waterFlowTable", flowData, flowProperties, flowColors, flowTitles);

const sankeyproperties = [MODEL_IN, MODEL_OUT, M3LAND, M3GROUND, M3WATER, RAINM3, INFILTRATIONM3, EVAPORATIONM3, SEWER_IN, SEWER_OVERFLOW, INLET_SURFACE, INLET_GROUND, OUTLET_SURFACE, OUTLET_GROUND, BOTTOM_FLOW_IN, BOTTOM_FLOW_OUT, CULVERT_IN, CULVERT_OUT, INLET_SURFACE, OUTLET_SURFACE, INLET_GROUND, OUTLET_GROUND, PUMP_IN, PUMP_OUT, WEIR_IN, WEIR_OUT];
let links = createLinks(sankeyproperties);
for(let i = 0 ; i < timeframes; i++){
	addLink(links, i, MODEL_IN, RAINM3, flowData[RAINM3][i]);	
	addLink(links, i, MODEL_IN, BOTTOM_FLOW_IN, flowData[BOTTOM_FLOW_IN][i]);
	addLink(links, i, EVAPORATIONM3, MODEL_OUT, flowData[EVAPORATIONM3][i]);
	addLink(links, i, BOTTOM_FLOW_OUT, MODEL_OUT, flowData[BOTTOM_FLOW_OUT][i]);
	addLink(links, i, MODEL_IN, INLET_SURFACE, flowData[INLET_SURFACE][i]);
	addLink(links, i, OUTLET_SURFACE, MODEL_OUT, flowData[OUTLET_SURFACE][i]);
	addLink(links, i, MODEL_IN, INLET_GROUND, flowData[INLET_GROUND][i]);
	addLink(links, i, OUTLET_GROUND, MODEL_OUT, flowData[OUTLET_GROUND][i]);
	
	addLink(links, i,  M3LAND, EVAPORATIONM3, flowData[EVAPORATIONM3][i]);
	addLink(links, i,  M3LAND, OUTLET_SURFACE, flowData[OUTLET_SURFACE][i]);
	addLink(links, i, RAINM3, M3LAND, flowData[RAINM3][i]);
	addLink(links, i, INLET_SURFACE, M3LAND, flowData[INLET_SURFACE][i]);
	
	addLink(links, i, BOTTOM_FLOW_IN, M3GROUND, flowData[BOTTOM_FLOW_IN][i]);
	addLink(links, i, INLET_GROUND, M3GROUND, flowData[INLET_GROUND][i]);
	
	addLink(links, i,  M3GROUND,BOTTOM_FLOW_OUT, flowData[BOTTOM_FLOW_OUT][i]);
	addLink(links, i,  M3GROUND,OUTLET_GROUND, flowData[OUTLET_GROUND][i]);
}

const sankeyLayout = createSankeyPlotLayout();

const sankeySlider = document.getElementById("sankeySlider");
sankeyPlot("sankeyPlot", links, sankeySlider.value, sankeyproperties, flowColors, flowTitles, sankeyLayout);

setupTimeframeSlider(sankeySlider, timeframe, timeframes, function() {
	sankeyPlot("sankeyPlot", links, sankeySlider.value, sankeyproperties, flowColors, flowTitles, sankeyLayout);
});

let balanceCSVButton = document.getElementById("balanceCSVButton");
let flowCSVButton = document.getElementById("flowCSVButton");

addDownloadHandler(balanceCSVButton, "waterbalance.csv", ()=> toCSVContent(data, properties, titles, timeframes));
addDownloadHandler(flowCSVButton, "waterflow.csv", ()=> toCSVContent(flowData, flowProperties, flowTitles, timeframes));
