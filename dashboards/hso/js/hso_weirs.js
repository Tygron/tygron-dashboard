import { QueryDataManager } from "../../../src/js/util/QueryDataManager.js";
import { drawWeirSide, drawWeirFront} from "../../../src/js/water/structures/weir.js";
import { setupTimeframeSlider } from "../../../src/js/util/Timeframeslider.js";
import { createLayout, xyPlot } from "../../../src/js/util/Plot.js";

let weirs = [];

function getDummyWeir() {
	return {
		name: "-",
		height: -10000,
		width: 0,
		flow: 0,
		datumA: -10000,
		datumB: -10000,
		damWidth: 0,
		damHeight: -1,
		areaOutputA: -1,
		areaOutputB: -1,
		angle: -10000,
		coefficient: 1.1,
		weirN: 3/2,
	};
}

function updateWeirDetails(weir) {

	if (weir == null) {
		weir = getDummyWeir();
	}

	document.getElementById("weirInfoName").innerHTML = weir.name;

	document.getElementById("weirInfoHeight").innerHTML = weir.heights[weirTimeframe] + " m";

	document.getElementById("weirInfoWidth").innerHTML = weir.width + " m";

	document.getElementById("weirInfoFlow").innerHTML = weir.flows[weirTimeframe] + " m³/s";

	document.getElementById("weirInfoDatumA").innerHTML = weir.datumsA[weirTimeframe] + " m";

	document.getElementById("weirInfoDatumB").innerHTML = weir.datumsB[weirTimeframe] + " m";

	document.getElementById("weirInfoDamHeight").innerHTML = weir.damHeight + " m";
	document.getElementById("weirInfoDamWidth").innerHTML = weir.damWidth + " m";
	document.getElementById("weirInfoAreaA").innerHTML = weir.areaOutputA;
	document.getElementById("weirInfoAreaB").innerHTML = weir.areaOutputB;
	document.getElementById("weirInfoAngle").innerHTML = weir.angle > -10000 ? weir.angle + " &deg;" : "-";

	document.getElementById("weirInfoCoefficient").innerHTML = weir.coefficient;
	document.getElementById("weirInfoN").innerHTML = weir.weirN;


	let sideCanvas = document.getElementById("weirSideCanvas");
	let frontCanvas = document.getElementById("weirFrontCanvas");
	
	drawWeirSide(sideCanvas, weirTimeframe, weir.heights, weir.datumsA, weir.datumsB,weir.damHeight, weir.flows, weir.coefficient);
	drawWeirFront(frontCanvas, weirTimeframe, weir.heights, weir.datumsA, weir.datumsB, weir.width, weir.damWidth, weir.damHeight, weir.flows, weir.n);

	updateFlowPlot(weir);

	updateHeightPlot(weir);

}

function updateFlowPlot(weir) {

	let properties = [HSO_OVERLAY_TIMEFRAMES, WEIR_FLOW_OUTPUT];
	let colors = {};
	colors[WEIR_FLOW_OUTPUT] = [218, 10, 10, 0.5];

	let titles = {};
	titles[WEIR_FLOW_OUTPUT] = "Flow";

	let data = {};
	let dataTimeframes = [];
	for (let t = 0; t < timeframes; t++) {
		dataTimeframes.push(t);
	}
	data[HSO_OVERLAY_TIMEFRAMES] = dataTimeframes;
	data[WEIR_FLOW_OUTPUT] = weir.flows;

	let layout = createWeirPlotLayout();
	layout.title= {
	    text: "Flow (m³/s)"
	  };
	xyPlot("weirFlowPlot", "scatter", data, properties, colors, titles, layout);
}

function createWeirPlotLayout(){

	layout = createLayout();
	layout.showLegend = true;
	layout.width = 300;
	layout.height = 200;
	layout.margin= {l:40, r:40, t:40, b:40};
	return layout;
}

function updateHeightPlot(weir) {

	let properties = [HSO_OVERLAY_TIMEFRAMES, WEIR_HEIGHT_OUTPUT, WEIR_DATUM_OUTPUT_A, WEIR_DATUM_OUTPUT_B];
	let colors = {};
	colors[WEIR_HEIGHT_OUTPUT] = [218, 10, 10, 0.5];
	colors[WEIR_DATUM_OUTPUT_A] = [10, 218, 10, 0.5];
	colors[WEIR_DATUM_OUTPUT_B] = [10, 10, 218, 0.5];

	let titles = {};
	titles[WEIR_HEIGHT_OUTPUT] = "Height";
	titles[WEIR_DATUM_OUTPUT_A] = "Datum A"; // replace A with water level area name
	titles[WEIR_DATUM_OUTPUT_B] = "Datum B"; // replace B with water level area name

	let data = {};
	let dataTimeframes = [];
	for (let t = 0; t < timeframes; t++) {
		dataTimeframes.push(t);
	}
	data[HSO_OVERLAY_TIMEFRAMES] = dataTimeframes;
	data[WEIR_HEIGHT_OUTPUT] = weir.heights;
	data[WEIR_DATUM_OUTPUT_A] = weir.datumsA;
	data[WEIR_DATUM_OUTPUT_B] = weir.datumsB;
	
	let layout = createWeirPlotLayout();
	layout.title= {
	    text: "Height and Datum (m)"
	  };
	xyPlot("weirHeightPlot", "scatter", data, properties, colors, titles, layout);
}

function selectWeir(index) {
	let main = document.getElementById("mainTitle");

	let weir = index >= 0 && index < weirs.length ? weirs[index] : null;

	if (weir == null) {
		main.innerHTML = "-";
		updateWeirDetails(weir);
		return;
	}


	main.innerHTML = weir.name;
	updateWeirDetails(weir);

	let weirList = document.getElementById("weirList");
	for (item of weirList.children) {
		if (item.myIndex == index) {
			item.classList.add('selected');
		} else {
			item.classList.remove('selected');
		}
	}
}

function getSelectedWeirIndex() {
	for (item of document.getElementById("weirList").children) {
		if (item.classList.contains('selected')) {
			return item.myIndex;
		}
	}
	return 0;
}

function addWeirListItem(index) {
	let weirList = document.getElementById("weirList");


	let listItem = document.createElement("a");
	listItem.onclick = () => selectWeir(index);
	listItem.innerHTML = weirs[index].name;
	listItem.myIndex = index;

	weirList.appendChild(listItem);

};

const HSO_OVERLAY_TIMEFRAMES = "hso_overlay_timeframes";
const WEIR_NAMES = 'weir_name';
const WEIR_HEIGHTS = 'weir_height';
const WEIR_WIDTH = 'weir_width';
const WEIR_FLOW_OUTPUT = 'flow_output';
const WEIR_HEIGHT_OUTPUT = 'height_output';
const WEIR_DATUM_OUTPUT_A = 'datum_output_a';
const WEIR_DATUM_OUTPUT_B = 'datum_output_b';
const WEIR_DAM_WIDTH = 'weir_dam_width';
const WEIR_DAM_HEIGHT = 'weir_dam_height';
const WEIR_AREA_OUTPUT_A = 'water_area_output_a';
const WEIR_AREA_OUTPUT_B = 'water_area_output_b';
const WEIR_ANGLE = 'weir_angle';
const WEIR_COEFFICIENT = 'weir_coefficient';
const WEIR_N = 'weir_n';

let queryDataManager = new QueryDataManager();

queryDataManager.addQuery(HSO_OVERLAY_TIMEFRAMES, '$SELECT_ATTRIBUTE_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_NAME_IS_TIMEFRAMES');


queryDataManager.addQuery(WEIR_NAMES, '$SELECT_NAME_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY');
queryDataManager.addQuery(WEIR_HEIGHTS, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_WEIR_HEIGHT_AND_TIMEFRAME_IS_X');
queryDataManager.addQuery(WEIR_WIDTH, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_WEIR_WIDTH');
queryDataManager.addQuery(WEIR_HEIGHT_OUTPUT, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_HEIGHT_OUTPUT_AND_TIMEFRAME_IS_X');
queryDataManager.addQuery(WEIR_FLOW_OUTPUT, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_FLOW_OUTPUT_AND_TIMEFRAME_IS_X');
queryDataManager.addQuery(WEIR_DATUM_OUTPUT_A, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_DATUM_OUTPUT_B_AND_TIMEFRAME_IS_X');
queryDataManager.addQuery(WEIR_DATUM_OUTPUT_B, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_DATUM_OUTPUT_A_AND_TIMEFRAME_IS_X');
queryDataManager.addQuery(WEIR_DAM_WIDTH, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_WEIR_DAM_OUTPUT_AND_INDEX_IS_0');
queryDataManager.addQuery(WEIR_DAM_HEIGHT, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_WEIR_DAM_OUTPUT_AND_INDEX_IS_1');
queryDataManager.addQuery(WEIR_AREA_OUTPUT_A, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_0');
queryDataManager.addQuery(WEIR_AREA_OUTPUT_B, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_1');
queryDataManager.addQuery(WEIR_ANGLE, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_WEIR_ANGLE');
queryDataManager.addQuery(WEIR_COEFFICIENT, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_WEIR_COEFFICIENT');
queryDataManager.addQuery(WEIR_N, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_WEIR_N');

let timeframes = Math.round(queryDataManager.getData(HSO_OVERLAY_TIMEFRAMES));
let weirTimeframe = 0;

function fillWeirs() {

	let names = queryDataManager.getData(WEIR_NAMES, true);
	let width = queryDataManager.getData(WEIR_WIDTH, true);
	let heights = queryDataManager.getData(WEIR_HEIGHT_OUTPUT, true);
	let flow = queryDataManager.getData(WEIR_FLOW_OUTPUT, true);
	let datumA = queryDataManager.getData(WEIR_DATUM_OUTPUT_A, true);
	let datumB = queryDataManager.getData(WEIR_DATUM_OUTPUT_B, true);
	let damWidth = queryDataManager.getData(WEIR_DAM_WIDTH, true);
	let damHeight = queryDataManager.getData(WEIR_DAM_HEIGHT, true);
	let areaOutputA = queryDataManager.getData(WEIR_AREA_OUTPUT_A, true);
	let areaOutputB = queryDataManager.getData(WEIR_AREA_OUTPUT_B, true);
	let angle = queryDataManager.getData(WEIR_ANGLE, true);
	let coefficient = queryDataManager.getData(WEIR_COEFFICIENT, true);
	let weirN = queryDataManager.getData(WEIR_N, true);

	for (let i = 0; i < names.length; i++) {

		let weir = {
			name: i < names.length ? names[i] : "Weir " + i,

			// array values
			heights: i < heights.length ? heights[i] : Array(timeframes).fill(-10000),
			flows: i < flow.length ? flow[i] : Array(timeframes).fill(0),
			datumsA: i < datumA.length ? datumA[i] : Array(timeframes).fill(-10000),
			datumsB: i < datumB.length ? datumB[i] : Array(timeframes).fill(-10000),

			// single value
			width: i < width.length ? width[i] : Array(timeframes).fill(0),
			damWidth: i < damWidth.length ? damWidth[i] : 0,
			damHeight: i < damHeight.length ? damHeight[i] : -1,
			areaOutputA: i < areaOutputA.length ? areaOutputA[i] : -1,
			areaOutputB: i < areaOutputB.length ? areaOutputB[i] : -1,
			angle: i < angle.length ? angle[i] : -10000,
			coefficient: i < coefficient.length && coefficient[i] > 0 ? coefficient[i] : 1.1,
			weirN: i < weirN.length  && weirN[i] > 0 ? weirN[i] : 3/2,
		};
		weirs.push(weir);

	}
}


function updateWeirList() {
	for (let i = 0; i < weirs.length; i++) {
		addWeirListItem(i);
	}

	if (weirs.length > 0) {
		selectWeir(0, weirTimeframe);
	}
}

setupTimeframeSlider(weirSlider, weirTimeframe, timeframes, function() {
	weirTimeframe = weirSlider.value;
	selectWeir(getSelectedWeirIndex());
});


fillWeirs();
updateWeirList();
