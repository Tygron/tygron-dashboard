import { QueryDataManager } from "../../src/js/util/QueryDataManager.js";

let numWeirs = 0;
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
	};
}

function fillWeirInfo(weir) {

	if (weir == null) {
		weir = getDummyWeir();
	}

	document.getElementById("weirInfoName").innerHTML = weir.name;
	document.getElementById("weirInfoHeight").innerHTML = weir.height;
	document.getElementById("weirInfoWidth").innerHTML = weir.width;
	document.getElementById("weirInfoFlow").innerHTML = weir.flow;
	document.getElementById("weirInfoDatumA").innerHTML = weir.datumA;
	document.getElementById("weirInfoDatumB").innerHTML = weir.datumB;
	document.getElementById("weirInfoDamHeight").innerHTML = weir.damHeight;
	document.getElementById("weirInfoDamWidth").innerHTML = weir.damWidth;
	document.getElementById("weirInfoAreaA").innerHTML = weir.areaOutputA;
	document.getElementById("weirInfoAreaB").innerHTML = weir.areaOutputB;
}

function loadWeir(index) {
	let main = document.getElementById("mainTitle");
	let image = document.getElementById("weirImage");

	let weir = index >= 0 && index < weirs.length ? weirs[index] : null;

	if (weir == null) {
		main.innerHTML = "-";
		fillWeirInfo(weir);
		image.innerHTML = "";
		return;
	}


	main.innerHTML = weir.name;
	fillWeirInfo(weir);
	image.innerHTML = "";

	let weirList = document.getElementById("weirList");
	for (item of weirList.children) {
		if (item.myIndex == index) {
			item.classList.add('selected');
		} else {
			item.classList.remove('selected');
		}
	}
}

function addWeirListItem(index) {
	let weirList = document.getElementById("weirList");


	let listItem = document.createElement("a");
	listItem.onclick = () => loadWeir(index);
	listItem.innerHTML = weirs[index].name;
	listItem.myIndex = index;

	weirList.appendChild(listItem);

};

const WEIR_NAMES = 'weir_name';
const WEIR_HEIGHTS = 'weir_height';
const WEIR_WIDTH = 'weir_width';
const WEIR_FLOW_OUTPUT = 'flow_output';
const WEIR_DATUM_OUTPUT_A = 'datum_output_a';
const WEIR_DATUM_OUTPUT_B = 'datum_output_b';
const WEIR_DAM_WIDTH = 'weir_dam_width';
const WEIR_DAM_HEIGHT = 'weir_dam_height';
const WEIR_AREA_OUTPUT_A = 'water_area_output_a';
const WEIR_AREA_OUTPUT_B = 'water_area_output_b';

let queryDataManager = new QueryDataManager();

queryDataManager.addQuery(WEIR_NAMES, '$SELECT_NAME_WHERE_BUILDING_IS_XA_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY');
queryDataManager.addQuery(WEIR_HEIGHTS, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XA_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_WEIR_HEIGHT');
queryDataManager.addQuery(WEIR_WIDTH, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XA_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_WEIR_WIDTH');
queryDataManager.addQuery(WEIR_FLOW_OUTPUT, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XA_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_FLOW_OUTPUT');
queryDataManager.addQuery(WEIR_DATUM_OUTPUT_A, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XA_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_DATUM_OUTPUT_B');
queryDataManager.addQuery(WEIR_DATUM_OUTPUT_B, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XA_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_DATUM_OUTPUT_A');
queryDataManager.addQuery(WEIR_DAM_WIDTH, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XA_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_WEIR_DAM_OUTPUT_AND_INDEX_IS_0');
queryDataManager.addQuery(WEIR_DAM_HEIGHT, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XA_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_WEIR_DAM_OUTPUT_AND_INDEX_IS_1');
queryDataManager.addQuery(WEIR_AREA_OUTPUT_A, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XA_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_0');
queryDataManager.addQuery(WEIR_AREA_OUTPUT_B, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XA_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_1');


function fillWeirs() {

	let names = queryDataManager.getData(WEIR_NAMES, true);
	let heights = queryDataManager.getData(WEIR_HEIGHTS, true);
	let widths = queryDataManager.getData(WEIR_WIDTH, true);
	let flow = queryDataManager.getData(WEIR_FLOW_OUTPUT, true);
	let datumA = queryDataManager.getData(WEIR_DATUM_OUTPUT_A, true);
	let datumB = queryDataManager.getData(WEIR_DATUM_OUTPUT_B, true);
	let damWidth = queryDataManager.getData(WEIR_DAM_WIDTH, true);
	let damHeight = queryDataManager.getData(WEIR_DAM_HEIGHT, true);
	let areaOutputA = queryDataManager.getData(WEIR_AREA_OUTPUT_A, true);
	let areaOutputB = queryDataManager.getData(WEIR_AREA_OUTPUT_B, true);

	numWeirs = names.length;

	for (let i = 0; i < numWeirs; i++) {

		let weir = {
			name: i < names.length ? names[i] : "Weir " + i,
			height: i < heights.length ? heights[i] : -10000,
			width: i < widths.length ? widths[i] : 0,
			flow: i < flow.length ? flow[i] : 0,
			datumA: i < datumA.length ? datumA[i] : -10000,
			datumB: i < datumB.length ? datumB[i] : -10000,
			damWidth: i < damWidth.length ? damWidth[i] : 0,
			damHeight: i < damHeight.length ? damHeight[i] : -1,
			areaOutputA: i < areaOutputA.length ? areaOutputA[i] : -1,
			areaOutputB: i < areaOutputB.length ? areaOutputB[i] : -1,
		};
		weirs.push(weir);

	}
}


function updateWeirList() {
	for (let i = 0; i < weirs.length; i++) {
		addWeirListItem(i);
	}
}

fillWeirs();
updateWeirList();
