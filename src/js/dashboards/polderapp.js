import { initCollapsibles, openCollapsibles } from "../util/collapsible.js";
import { createTable } from "../util/table.js";
import { barPlot, createBarPlotLayout, } from "../util/plot.js";
import { setupTimeframeSlider } from "../util/timeframeslider.js";

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
