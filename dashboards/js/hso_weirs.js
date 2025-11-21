let numWeirs = 0;
let weirs = [];

function loadWeir(index) {
	let main = document.getElementById("mainTitle");
	let info = document.getElementById("weirInfo");
	let image = document.getElementById("weirImage");

	let weir = index >= 0 && index < weirs.length ? weirs[index] : null;

	if (weir == null) {
		main.innerHTML = "-";
		info.innerHTML = "-";
		image.innerHTML = "";
		return;
	}


	main.innerHTML = weir.weirName;
	info.innerHTML = "Weir width: " + weir.weirWidth + "<br>Weir height: " + weir.weirHeight;
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

function addWeir(index) {
	let weirList = document.getElementById("weirList");


	let listItem = document.createElement("a");
	listItem.onclick = () => loadWeir(index);
	listItem.innerHTML = weirs[index].weirName;
	listItem.myIndex = index;

	weirList.appendChild(listItem);

};

for (let i = 0; i < numWeirs; i++) {
	let weir = {
		weirName: "Weir " + (i + 1),
		weirHeight: 1 + Math.random() * 2,
		weirWidth: 1 + Math.random() * 2,
		datumHeightLeft: 0.5 + Math.random * 2,
		datumHeightRight: 0.5 + Math.random * 2,
	};
	weirs.push(weir);

	addWeir(i);

}

let queryDataManager = new QueryDataManager();

queryDataManager.addQuery('weir_name'  , '$SELECT_NAME_WHERE_BUILDING_IS_X_A_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY');
queryDataManager.addQuery('weir_height'  , '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_X_A_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_WEIR_HEIGHT');
queryDataManager.addQuery('weir_width'  , '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_X_A_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_WEIR_WIDTH');
queryDataManager.addQuery('flow_output'  , '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_X_A_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_FLOW_OUTPUT');
queryDataManager.addQuery('datum_output_b'  , '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_X_A_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_DATUM_OUTPUT_B');
queryDataManager.addQuery('datum_output_a'  , '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_X_A_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_DATUM_OUTPUT_A');
queryDataManager.addQuery('weir_dam_output'  , '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_X_A_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_WEIR_DAM_OUTPUT');
queryDataManager.addQuery('water_area_output'  , '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_X_A_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT');
