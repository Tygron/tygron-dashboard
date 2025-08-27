import { createTable } from "../util/table.js";
import { barPlot, createBarPlotLayout, } from "../util/plot.js";
import { setupTimeframeSlider } from "../util/timeframeslider.js";
import { addFlowValues, createLinks } from "../util/data.js";
import { toCSVContent, addDownloadHandler } from "../util/file.js";
import { attachHandler } from "../util/dom.js";

let windowValidation = true;

if(windowValidation){

	$(window).on("load", function() {
		
		if ('$SELECT_ID_WHERE_AREA_IS_ID'.indexOf('$')!=-1) {
			let message = '<p>Error: Queries not loaded</p>';
			message += '<p>Please ensure:</p><ul>';
			message += '<li>This content is added to a Template Text Panel, applied to Areas.</li>';
			message += '<li>The Session has fully recalculated.</li>';
			message += '</ul>';
			let messageEl = document.createElement('div');
			messageEl.innerHTML = message;
			document.body.prepend(messageEl);
		} else {
			if( (+'$SELECT_ATTRIBUTE_WHERE_PANEL_IS_ID_AND_NAME_IS_INSTALLED') != 1 ) {
				let message = '<p>Install app.</p>';
				message += '<p>Note: run from web browser, or ensure REFRESH of the panel is off.</p>';
				let messageEl = document.createElement('div');
				messageEl.innerHTML = message;
				
				let optionsEl = document.createElement('div');
				let buttonEl = document.createElement('input');
				buttonEl.id = 'installType';
				buttonEl.type = 'button';
				buttonEl.value = 'Install';
				buttonEl.disabled = true;
				
				let selectEl = document.createElement('select');
				selectEl.id = 'installType';
				selectEl.innerHTML += '<option selected value="">Select Water Overlay Type</option>';
				selectEl.innerHTML += '<option value="RAINFALL">RAINFALL</option>';
				selectEl.innerHTML += '<option value="GROUNDWATER">GROUNDWATER</option>';
				selectEl.innerHTML += '<option value="FLOODING">FLOODING</option>'; 
				selectEl.innerHTML += '<option value="NONE">Continue without install</option>';
				
				optionsEl.appendChild(selectEl); 
				optionsEl.appendChild(buttonEl);
				
				attachHandler(optionsEl, 'change', 'select', function(){
						console.log(document.getElementById('installType').value);
						buttonEl.disabled = (selectEl.value == '');
						buttonEl.value = (selectEl.value == 'NONE') ? 'Continue' : 'Install';
					});
				
				attachHandler(optionsEl, 'click', 'input[type="button"]', function(){
					
					let waterOverlayType = document.getElementById('installType').value;
					
					window.c = connector('$SELECT_TOKEN_WHERE_'.replaceAll('"',''));
					
					if (waterOverlayType == 'NONE') {
						let chain = c.start();
						chain = chain
							.then( c.post('event/editorpanel/set_attribute', null, ['$SELECT_ID_WHERE_PANEL_IS_ID','INSTALLED',1]) )
							.then( c.recalculate(false) )
							.then( function(){
									window.location.reload();
								} );
						return;
					}
					
					let requiredResultChildren = [
							'BUILDING_LAST_STORAGE',
							'RAIN',
							'GROUND_LAST_STORAGE',
							'GROUND_BOTTOM_FLOW',
							'GROUND_TRANSPIRATION',
							'SEWER_LAST_VALUE',
							'EVAPOTRANSPIRATION',
							'BASE_TYPES',
							'GROUND_LAST_UNSATURATED_STORAGE'
						];
						
					let requiredCombos = [
						['M3WATER', 'BASE_TYPES', 'SURFACE_LAST_VALUE', 
							'SWITCH(AT, 0, 0, 0, 1, 0, 2, BT, 3, BT, 4, 0, 5, BT, 6, BT, 7, BT, 8, 0, 9, BT, 10, 0, 11, BT, 12, BT, 13, 0, 14, 0, 15, BT, 16, BT, 17, 0, 18, 0)'],
						['RAIN_WATER', 'BASE_TYPES', 'RAIN', 
							'SWITCH(AT, 0, 0, 0, 1, 0, 2, BT, 3, BT, 4, 0, 5, BT, 6, BT, 7, BT, 8, 0, 9, BT, 10, 0, 11, BT, 12, BT, 13, 0, 14, 0, 15, BT, 16, BT, 17, 0, 18, 0)'],
						['RAIN_LAND', 'BASE_TYPES', 'RAIN', 
							'SWITCH(AT, 0, 0, BT, 1, BT, 2, 0, 3, 0, 4, BT, 5, 0, 6, 0, 7, 0, 8, BT, 9, 0, 10, BT, 11, 0, 12, 0, 13, BT, 14, BT, 15, 0, 16, 0, 17, BT, 18, BT)'],
						['EVAPOTRANSPIRATIONWATER', 'BASE_TYPES', 'EVAPOTRANSPIRATION', 
							'SWITCH(AT, 0, 0, 0, 1, 0, 2, BT, 3, BT, 4, 0, 5, BT, 6, BT, 7, BT, 8, 0, 9, BT, 10, 0, 11, BT, 12, BT, 13, 0, 14, 0, 15, BT, 16, BT, 17, 0, 18, 0)'],
						['EVAPOTRANSPIRATIONLAND', 'BASE_TYPES', 'EVAPOTRANSPIRATION', 
							'SWITCH(AT, 0, 0, BT, 1, BT, 2, 0, 3, 0, 4, BT, 5, 0, 6, 0, 7, 0, 8, BT, 9, 0, 10, BT, 11, 0, 12, 0, 13, BT, 14, BT, 15, 0, 16, 0, 17, BT, 18, BT)'],
					]
					
					
					c = window.c;
					
					let chain = c.start();
					let scriptVars = {};
					chain = chain
						.then( c.post('event/editoroverlay/add', null, [waterOverlayType]) )
						.then( c.chain(function(data){
								scriptVars['mainOverlayId'] = data;
								scriptVars['SURFACE_LAST_VALUE_ID'] = data;
							}))
						.then( c.post('event/editoroverlay/set_result_type', null, [-1, 'SURFACE_LAST_VALUE'], function(d, u, qp, params) {
								params[0] = scriptVars['SURFACE_LAST_VALUE_ID'];
							}))
					;
					for (let type of requiredResultChildren) {
						chain = chain.then(
								c.post('event/editoroverlay/add_result_child', null, [-1, type], function(d, u, qp, params) {
								params[0] = scriptVars['mainOverlayId'];
							}));
						chain = chain.then(
								c.chain(function(data, type){
										scriptVars[type+'_ID'] = data;
									}, type)
							);
					}
					
					for (let settings of requiredCombos) {
						chain = chain
							.then( c.post('event/editoroverlay/add', null, ['COMBO']) )
							.then( c.chain(function(data){
									scriptVars['comboId'] = data;
								}))
							.then( c.post('event/editoroverlay/set_name', null, [-1, 'Unnamed Combo'], function(d, u, qp, params) {
									params[0] = scriptVars['comboId'];
									params[1] = settings[0];
							}))
							.then( c.post('event/editoroverlay/set_prequel', null, [-1, -1,'A'], function(d, u, qp, params) {
									params[0] = scriptVars['comboId'];
									params[1] = scriptVars[settings[1]+'_ID'];
								}))
							.then( c.post('event/editoroverlay/set_prequel', null, [-1, -1,'B'], function(d, u, qp, params) {
									params[0] = scriptVars['comboId'];
									params[1] = scriptVars[settings[2]+'_ID'];
								}))
							.then( c.post('event/editoroverlay/set_combo_formula', null, [-1, 'ADD(1,2)'], function(d, u, qp, params) {
									params[0] = scriptVars['comboId'];
									params[1] = settings[3];
								}))
							.then( c.post('event/editoroverlay/set_attribute', null, [-1, 'M3WATER', 1], function(d, u, qp, params) {
									params[0] = scriptVars['comboId'];
									params[1] = settings[0];
							}))
					}
	
					chain = chain	
						.then( c.recalculate(true) )
						.then( c.post('event/editorpanel/set_attribute', null, ['$SELECT_ID_WHERE_PANEL_IS_ID','INSTALLED',1]) )
						.then( c.recalculate(false) )
						.then( function(){
								window.location.reload();
							} )
					;				
				});
				document.body.innerHTML = '';
				document.body.appendChild(messageEl);
				document.body.appendChild(optionsEl);
			}
			
		}
	});
}

const M3TOTAL = 'm3Total';
const M3LAND = 'm3Land';
const M3WATER = 'm3Water';
const M3SEWER = 'm3Sewer';
const M3UNSATURATED = 'm3Unsaturated';
const M3STORAGE = 'm3Storage';
const M3GROUND = 'm3Ground';
const TIMEFRAMES = 'timeframes';
const TIMEFRAMETIMES = 'timeframetimes';

const data = {};
data[TIMEFRAMETIMES] = [$SELECT_NAME_WHERE_TIMEFRAME_IS_X_AND_RESULTTYPE_IS_SURFACE_LAST_VALUE];
data[M3TOTAL] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_SURFACE_LAST_VALUE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3WATER] = [$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_M3WATER_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3GROUND] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_GROUND_LAST_STORAGE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3STORAGE] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_BUILDING_LAST_STORAGE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3SEWER] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_SEWER_LAST_VALUE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3UNSATURATED] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_GROUND_LAST_SATURATED_STORAGE_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID];
data[M3LAND] = [];
data[TIMEFRAMES] = [];

const timeframes = data[TIMEFRAMETIMES].length;
var timeframe = timeframes - 1;

for (var i = 0; i < data[M3TOTAL].length && i < data[M3WATER].length; i++)
	data[M3LAND].push(data[M3TOTAL][i] - data[M3WATER][i]);

for (var i = 0; i < timeframes; i++)
	data[TIMEFRAMES].push(i);

let timeLabels = data[TIMEFRAMETIMES];
const properties = [TIMEFRAMES, TIMEFRAMETIMES, M3LAND, M3WATER, M3GROUND, M3SEWER, M3UNSATURATED, M3STORAGE];
const plotProperties = [TIMEFRAMES, M3LAND, M3WATER, M3GROUND, M3SEWER, M3UNSATURATED, M3STORAGE];


const titles = {};
titles[TIMEFRAMES] = "Timeframes";
titles[TIMEFRAMETIMES] = "Tijdstap";
titles[M3LAND] = "Water op land [m³]";
titles[M3WATER] = "Oppervlaktewater [m³]";
titles[M3GROUND] = "Grondwater [m³]";
titles[M3STORAGE] = "Waterbergende voorzieningen [m³]";
titles[M3SEWER] = "Rioolwater [m³]";
titles[M3UNSATURATED] = "Berging onverzadidge zone [m³]"

const colors = {};
colors[M3WATER] = [10, 10, 218, 0.5];
colors[M3LAND] = [10, 218, 10, 0.5];
colors[M3GROUND] = [165, 42, 42, 0.5];
colors[M3STORAGE] = [218, 10, 10, 0.5];
colors[M3SEWER] = [128, 128, 128, 0.5];
colors[M3UNSATURATED] = [218, 165, 10, 0.5];

createTable("waterBalanceTable", data, properties, colors, titles, timeLabels);

const barPlotLayout = createBarPlotLayout();
barPlotLayout.title.text = "Berging per component";
barPlotLayout.yaxis.title.text = "Volume [m³]";
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
const BREACH = "BREACH";
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
flowTitles[M3UNSATURATED] = "Onverzadigde zone [m³]";
flowTitles[M3LAND] = "Land [m³]";
flowTitles[M3WATER] = "Oppervlaktewater [m³]";
flowTitles[M3STORAGE] = "Berging voorzieningen [m³]";
flowTitles[M3TOTAL] = "Surface [m³]";
flowTitles[M3SEWER] = "Riolering [m³]";
flowTitles[BREACH] = "Bres";
flowTitles[BREACH_IN] = "Bres in [m³/tijdstap]";
flowTitles[BREACH_OUT] = "Bres uit [m³/tijdstap]";


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
flowColors[M3UNSATURATED] = [196, 196, 220, 0.5];      // Onverzadidge zone
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
flowColors[BREACH] = [255, 127, 14, 0.5];
flowColors[BREACH_IN] = [255, 127, 14, 0.5];
flowColors[BREACH_OUT] = [255, 127, 14, 0.5];



const flowProperties = [TIMEFRAMES, MODEL_IN, MODEL_OUT, M3LAND, M3WATER, M3GROUND, M3UNSATURATED, M3STORAGE, M3SEWER, RAINM3, RAINM3LAND, RAINM3WATER, RAINM3STORAGE, GROUND_TRANSPIRATION, EVAPOTRANSPIRATION, SURFACE_EVAPORATIONLAND, SURFACE_EVAPORATIONWATER, BOTTOM_FLOW_IN, BOTTOM_FLOW_OUT, LANDSEWER, SEWER_POC, SEWER_OVERFLOW_OUT, CULVERT_IN, CULVERT_OUT, CULVERT_INNER, INLET_SURFACE, OUTLET_SURFACE, INLET_GROUND, OUTLET_GROUND, PUMP_IN, PUMP_OUT, PUMP_INNER, WEIR_IN, WEIR_OUT, WEIR_INNER, BREACH_IN, BREACH_OUT];
const flowData = createTimeframeData(timeframes, $ID, flowProperties);

const culvertAreaFrom = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_0];
const culvertAreaTo = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_INDEX_IS_1];
const pumpAreaFrom = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_0];
const pumpAreaTo = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_INDEX_IS_1];
const inletAreaFrom = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_0];
const inletAreaTo = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_INDEX_IS_1];
const weirAreaFrom = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_0];
const weirAreaTo = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_INDEX_IS_1];
const breachAreaFrom = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_AREA_IS_XA_BREACH_HEIGHT_AND_INDEX_IS_0];
const breachAreaTo = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_WATER_AREA_OUTPUT_AND_AREA_IS_XA_BREACH_HEIGHT_AND_INDEX_IS_1];
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
flowData[M3SEWER] = data[M3SEWER];
flowData[M3UNSATURATED] = data[M3UNSATURATED];

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
const landInlet = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_TIMEFRAME_IS_Y];

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

//Berging Water - bres
const waterBreach = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_AREA_IS_XA_BREACH_HEIGHT_AND_TIMEFRAME_IS_Y];

for (let timeframeKey = 0; timeframeKey < waterBreach.length; timeframeKey++) {
	let timeframeValues = waterBreach[timeframeKey];
	addFlowValuesWithInner(
		flowData,
		timeframeKey,
		BREACH_IN,
		BREACH_OUT,
		null,
		breachAreaFrom,
		breachAreaTo,
		timeframeValues,
		condition = undefined
	);
}

//Berging Water - stuw
const waterWeir = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_WEIR_HEIGHT_AND_TIMEFRAME_IS_Y];

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
const waterCulvert = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_CULVERT_DIAMETER_AND_TIMEFRAME_IS_Y];

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
const waterPump = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_PUMP_Q_AND_TIMEFRAME_IS_Y];


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
const inletGround = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_INLET_Q_AND_TIMEFRAME_IS_Y];


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
const sewerPOC = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_AREA_IS_XA_SEWER_STORAGE_AND_TIMEFRAME_IS_Y];

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
const sewerOverflow = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XA_SEWER_OVERFLOW_AND_TIMEFRAME_IS_Y];

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


const sankeyproperties = [TIMEFRAMES, MODEL_IN, MODEL_OUT, M3LAND, M3WATER, M3GROUND, M3UNSATURATED, M3STORAGE, M3SEWER, RAINM3, RAINM3LAND, RAINM3WATER, RAINM3STORAGE, GROUND_TRANSPIRATION, EVAPOTRANSPIRATION, SURFACE_EVAPORATIONLAND, SURFACE_EVAPORATIONWATER, BOTTOM_FLOW_IN, BOTTOM_FLOW_OUT, LANDSEWER, SEWER_POC, SEWER_OVERFLOW_OUT, CULVERT, CULVERT_IN, CULVERT_OUT, CULVERT_INNER, INLET_SURFACE, OUTLET_SURFACE, INLET_GROUND, OUTLET_GROUND, PUMP, PUMP_IN, PUMP_OUT, PUMP_INNER, WEIR, WEIR_IN, WEIR_OUT, WEIR_INNER, BREACH, BREACH_IN, BREACH_OUT];

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
	addLink(links, i, MODEL_IN, BREACH, flowData[BREACH_IN][i]);

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

	//Bres
	addLink(links, i, BREACH, M3LAND, flowData[BREACH_IN][i]);
	addLink(links, i, M3LAND, BREACH, flowData[BREACH_OUT][i]);
	addLink(links, i, BREACH, MODEL_OUT, flowData[BREACH_OUT][i]);

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
	M3UNSATURATED: "#6699cc",
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
	WEIR_INNER: "#ff7f0e",
	BREACH: "#ff7f0e",
	BREACH_IN: "#ff7f0e",
	BREACH_OUT: "#ff7f0e"
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
