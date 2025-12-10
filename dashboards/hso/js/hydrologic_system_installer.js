import { getGridOverlay, getGridOverlays, getOverlay, getResultType, isOverlayOf } from "../../../src/js/item/OverlayUtils.js";
import { connector } from "../../../src/js/io/Connector.js";
import { attachHandler } from "../../../src/js/util/Dom.js";
import { createRectangleMP } from "../../../src/js/util/GeometryUtils.js";
import { getTemplateTextPanels, getTemplateTextPanel } from "../../../src/js/item/PanelUtils.js";

const DASHBOARD_URL = "https://raw.githubusercontent.com/Tygron/tygron-dashboard/refs/heads/main/build/development/hso/hydrologic_system_overview.txt";

const HSO_OVERLAY_ATTRIBUTE = "HSO_WATER_OVERLAY";
const HSO_PANEL_ATTRIBUTE = "HSO_PANEL";
const RAINFALL_OVERLAY_TYPE = "RAINFALL";
const GROUNDWATER_OVERLAY_TYPE = "GROUNDWATER";
const FLOODING_OVERLAY_TYPE = "FLOODING";
const WATER_LEVEL_KEY = "WATER_LEVEL";
let PANEL_WIDTH = 800;
let PANEL_HEIGHT = 800;

const vars = {
	ADDED_OVERLAY_ID: "addedOverlayID",
	ATTRIBUTES: "attributes",
	ADJUSTED_OVERLAY_ID: "adjustedOverlayID",
	SELECTED_OVERLAY_ID: "selectedOverlayID",
	UNSELECTED_OVERLAY_IDS: "unselectedOverlayID",
	WATER_OVERLAY: "waterOverlay",
	WATER_OVERLAYS: "waterOverlays",
	HSO_OVERLAY_REQUEST_SELECT: "hsoOverlayRequestSelect",
	HSO_OVERLAY: "hsoOverlay",
	HSO_OVERLAY_ID: "hsoOverlayID",
	GRID_OVERLAYS: "gridOverlays",
	OVERLAYS: "overlays",
	NON_WATER_HSO_OVERLAYS: "nonWaterHsoOverlays",
	AREA_KEYS: "areaKeys",

	DEFAULT_WATERAREA_MP: "waterLevelAreaMP",
	DEFAULT_WATERAREA_ID: "waterLevelAreaID",

	PANELS: "panels",
	TEMPLATE_TEXT_PANELS: "templateTextPanels",
	HSO_TEMPLATE_PANELS: "hsoTemplatePanels",
	HSO_TEMPLATE_PANEL: "hsoTemplatePanel",
	DASHBOARD_PANEL_ID: "dashboardPanelID",
	DASHBOARD_CONTENT: "dashboardTextContent",
};

const installer = {

};

function appendChains(...functions) {

	let next = installer.chain;

	for (func of functions) {
		if (typeof func === 'function') {
			next = next.then(installer.connector.chain(func));
		}
	}

	installer.chain = next;
}

function appendFeedbackLine(element) {
	element.classList.add("feedback-line");
	document.getElementById("feedback").appendChild(element);
}

function appendFeedback(feedback) {
	let feedbackLine = document.createElement("div");
	feedbackLine.innerHTML = feedback;
	appendFeedbackLine(feedbackLine);
}

function addNewComboOverlay(parentID, requirements) {

	const idVar = 'COMBO_' + requirements.attribute;
	addOverlay('COMBO', null, requirements.attribute, idVar);

	appendChains(
		installer.connector.post("event/editoroverlay/set_prequel", null, [], (_d, _u, _qp, params) => {
			params.push(installer[idVar]);
			params.push(requirements.prequelAId)
			params.push('A');
		}),
		installer.connector.post("event/editoroverlay/set_prequel", null, [], (_d, _u, _qp, params) => {
			params.push(installer[idVar]);
			params.push(requirements.prequelBId)
			params.push('B');
		}),
		installer.connector.post("event/editoroverlay/set_combo_formula", null, [], (_d, _u, _qp, params) => {
			params.push(installer[idVar]);
			params.push(requirements.formula);
		}),
		installer.connector.post("event/editoroverlay/set_name", null, [], (_d, _u, _qp, params) => {
			params.push(installer[idVar]);
			params.push(requirements.name);
		}),
		installer.connector.post("event/editoroverlay/set_parent", null, [], (_d, _u, _qp, params) => {
			params.push(installer[idVar]);
			params.push(parentID);
		}),
	);
}

function addNewOverlay(type, idVar) {

	appendChains(
		installer.connector.post("event/editoroverlay/add", null, [type]),

		overlayID => {
			if (overlayID == null || !Number.isInteger(overlayID)) {
				throw new Error("Failed to add Overlay with type " + type);
			}
			installer[idVar] = overlayID;
		}
	);
}

function addOverlay(type, resultType, attributes, resultIDVar) {

	addNewOverlay(type, vars.ADDED_OVERLAY_ID);

	if (attributes != null) {
		setRequiredOverlayAttribute(attributes, vars.ADDED_OVERLAY_ID);
	}

	if (resultType != null) {
		setResultType(resultType, vars.ADDED_OVERLAY_ID);
	}

	appendChains(_data => installer[resultIDVar] = installer[vars.ADDED_OVERLAY_ID]);
}

function addResultChildOverlay(overlay, resultType) {

	appendChains(

		(_data) => appendFeedback("Adding result child overlay of " + resultType + " to Overlay " + overlay.name),


		installer.connector.post("event/editoroverlay/add_result_child", null, [], (_d, _u, _gp, params) => {
			params.push(overlay.id);
			params.push(resultType);
		})
	);
}

function addNewWaterLevelArea() {
	appendFeedback("Adding new default Water Level Area!");

	appendChains(
		installer.connector.get("items/settings/MAP_SIZE_M?", {
			token: app.token(),
			f: "JSON"
		}),

		(data) => {
			let size = data.value.split(" ");
			let width = Array.isArray(size) && size.length > 0 ? size[0] : 500;
			let height = Array.isArray(size) && size.length > 1 ? size[1] : 500;

			let mp = createRectangleMP(0, 0, width, height);
			installer[vars.DEFAULT_WATERAREA_MP] = mp;
		},

		installer.connector.post("event/editorarea/add", null, [1]),

		(data) => {
			installer[vars.DEFAULT_WATERAREA_ID] = Array.isArray(data) ? data[0] : data;
		},

		installer.connector.post("event/editorarea/add_polygons", { crs: "LOCAL" }, [], (_d, _u, _qp, params) => {
			params.push(installer[vars.DEFAULT_WATERAREA_ID]);
			params.push(installer[vars.DEFAULT_WATERAREA_MP]);
		}),

		installer.connector.post("event/editorarea/set_attribute", null, [], (_d, _u, _qp, params) => {
			let hsoOverlay = installer[vars.HSO_OVERLAY];
			let attribute = hsoOverlay.keys[WATER_LEVEL_KEY] == null ? WATER_LEVEL_KEY : hsoOverlay.keys[WATER_LEVEL_KEY];
			params.push(installer[vars.DEFAULT_WATERAREA_ID]);
			params.push(attribute);
			params.push(1.0);
		}),
	);

}

function setOverlayKey(overlay, key, value) {
	appendChains(
		(_data) => appendFeedback("Setting HSO Overlay key " + key + " to " + value),

		installer.connector.post("event/editoroverlay/set_key_value", null, [], (_d, _u, _qp, params) => {
			params.push(overlay.id);
			params.push(key);
			params.push(value);
		})
	);
	updateOverlays();
}


function comboPrequelEquals(combo, prequelName, prequelOverlay, iteration, timeframe) {
	if (combo.prequels == null) {
		return false;
	}
	let prequelProperty = combo.prequels[prequelName];
	if (prequelProperty == null) {
		return false;
	}

	if (prequelProperty.overlayID != prequelOverlay.id) {
		return false;
	}

	if (iteration != null && prequelProperty.iteration != iteration) {
		return false;
	}

	return prequelProperty.timeframe == timeframe;
}

function setResultType(resultType, idVar) {

	appendChains(
		(_data) => appendFeedback("Setting HSO Overlay resultType to " + resultType),

		installer.connector.post("event/editoroverlay/set_result_type", null, [], (_d, _u, _qp, params) => {
			params.push(installer[idVar]);
			params.push(resultType);
		})
	);
}

function isWaterOverlayType(type) {
	return type == RAINFALL_OVERLAY_TYPE || type == FLOODING_OVERLAY_TYPE || type == GROUNDWATER_OVERLAY_TYPE;
}

function setHsoOverlay(overlays, selectedOverlayID) {

	installer[vars.SELECTED_OVERLAY_ID] = selectedOverlayID;

	setRequiredOverlayAttribute(HSO_OVERLAY_ATTRIBUTE, vars.SELECTED_OVERLAY_ID);

	const overlayIDs = []
	for (let i = overlays.length - 1; i >= 0; i--) {
		if (overlays[i].id != selectedOverlayID) {
			overlayIDs.push(overlays[i].id);
			appendFeedback("Removing " + HSO_OVERLAY_ATTRIBUTE + " from " + overlays[i].name);
		}
	}
	installer[vars.UNSELECTED_OVERLAY_IDS] = overlayIDs;

	appendChains(

		installer.connector.post("event/editoroverlay/remove_attribute", null, [], (_d, _u, _qp, params) => {
			params.push(installer[vars.UNSELECTED_OVERLAY_IDS]);
			params.push([HSO_OVERLAY_ATTRIBUTE]);
		})
	);

	setupHsoResultChildren();
}

function getAttributeValuesArrays(attributes) {

	let keys = [];
	let values = [];

	if (attributes instanceof Map) {
		for (let key of attributes.keys()) {
			keys.push(key);
			let value = attributes[key];
			values.push(Number.isFinite(value) ? value : 1.0);
		}

	} else if (Array.isArray(attributes)) {
		for (let i = 0; i < attributes.length; i++) {
			keys.push(attributes[i]);
			values.push(1.0);
		}

	} else if (typeof attributes == "string") {
		keys.push(attributes);
		values.push(1.0);
	}

	return [keys, values];
}

function setRequiredOverlayAttribute(attributes, idVar) {

	appendChains(
		_data => {
			let overlayID = installer[idVar];
			let ids = [];

			let [keys, values] = getAttributeValuesArrays(attributes);
			for (let i = 0; i < keys.length; i++) {
				ids.push(overlayID);
			}

			//appendFeedback("Setting attribute(s): " + keys);
			installer[vars.ATTRIBUTES] = [ids, keys, values];

		},

		installer.connector.post("event/editoroverlay/set_attributes", null, [],
			(_d, _u, _qp, params) => {
				let newParams = installer[vars.ATTRIBUTES];
				for (let n = 0; n < newParams.length; n++) {
					params.push(newParams[n]);
				}
			}

		)
	);
}

function updateOverlays(actionAfterRefresh) {

	appendChains(

		installer.connector.get("items/overlays?", {
			token: app.token(),
			f: "JSON"
		}),

		overlays => {

			app.info("Receive overlays:" + overlays);

			if (!Array.isArray(overlays)) {
				throw new Error("Requested Overlays object is not an array! " + overlays);
			}

			installer[vars.OVERLAYS] = overlays;
			installer[vars.GRID_OVERLAYS] = getGridOverlays(overlays);

			let hsoWaterOverlays = getWaterOverlays(true);
			if (hsoWaterOverlays.length == 0) {
				installer[vars.HSO_OVERLAY] = null;
				installer[vars.HSO_OVERLAY_ID] = null;

			} else
				if (hsoWaterOverlays.length == 1) {
					installer[vars.HSO_OVERLAY] = hsoWaterOverlays[0];
					installer[vars.HSO_OVERLAY_ID] = hsoWaterOverlays[0].id;
					if (installer[vars.HSO_OVERLAY_REQUEST_SELECT] == null) {
						installer[vars.HSO_OVERLAY_REQUEST_SELECT] = true;
					}
				}
			let waterOverlays = getWaterOverlays(false);
			installer[vars.WATER_OVERLAYS] = waterOverlays;
			if (waterOverlays.length == 1) {
				installer[vars.WATER_OVERLAY] = waterOverlays[0];
			}
		},

		actionAfterRefresh

	);
}

function isWaterOverlay(overlay, attributes) {
	return isOverlayOf(overlay, GROUNDWATER_OVERLAY_TYPE, null, null, attributes) ||
		isOverlayOf(overlay, RAINFALL_OVERLAY_TYPE, null, null, attributes) ||
		isOverlayOf(overlay, FLOODING_OVERLAY_TYPE, null, null, attributes);
}

function getWaterOverlays(hsoAttribute) {

	let waterOverlays = [];
	let gridOverlays = installer[vars.GRID_OVERLAYS];
	let attributes = hsoAttribute ? HSO_OVERLAY_ATTRIBUTE : null;

	for (let i = 0; i < gridOverlays.length; i++) {
		let overlay = gridOverlays[i];
		if (isWaterOverlay(overlay, attributes)) {
			waterOverlays.push(overlay);
		}
	}
	return waterOverlays;
}

/**
 * Start: Request Installation
 */
function requestInstallation() {
	appendFeedback("Are you sure you want to run the installation?");

	const selectParent = document.createElement("div");
	const yesButton = document.createElement("input");
	yesButton.type = 'button';
	yesButton.value = 'Yes';
	const noButton = document.createElement("input");
	noButton.type = 'button';
	noButton.value = 'No';

	yesButton.onclick = () => {
		yesButton.disabled = true;
		noButton.disabled = true;
		noButton.style.display = 'none';
		runInstallation();
	};
	noButton.onclick = () => {
		yesButton.disabled = true;
		noButton.disabled = true;
		yesButton.style.display = 'none';
		appendFeedback("Installation cancelled!");
	};

	selectParent.appendChild(yesButton);
	selectParent.appendChild(noButton);
	appendFeedbackLine(selectParent);
}


/**
 * Step 0: Run Installation
 */
function runInstallation() {

	appendFeedback("Validating project setup");

	installer.connector = connector(app.token());
	installer.chain = installer.connector.start();


	updateOverlays();

	removeHSOAttributeFromNonWaterOverlays();

	installer.chain = installer.chain.catch(error => appendFeedback("Failed installing! Error: " + error));

}

/**
 * Step 1: Remove HSO Attribute from Non Water Overlays
 */
function removeHSOAttributeFromNonWaterOverlays() {

	appendChains(
		() => {
			let gridOverlays = installer[vars.GRID_OVERLAYS];
			let eventOverlayIDs = [];
			for (let i = 0; i < gridOverlays.length; i++) {
				let overlay = gridOverlays[i];
				if (!isWaterOverlay(overlay) && isOverlayOf(overlay, null, null, null, HSO_OVERLAY_ATTRIBUTE)) {
					eventOverlayIDs.push(overlay.id);
					appendFeedback("Removing HSO Attribute from Overlay: " + overlay.name);
				}
			}
			installer[vars.NON_WATER_HSO_OVERLAYS] = eventOverlayIDs;
		},

		installer.connector.post("event/editoroverlay/remove_attribute", null, [], (_d, _u, _qp, params) => {
			params.push(installer[vars.NON_WATER_HSO_OVERLAYS]);
			params.push([HSO_OVERLAY_ATTRIBUTE]);
		}),

		() => setupMainHsoOverlay()
	);
}


/**
 * Step 2: setupMainHsoOverlay
 */
function setupMainHsoOverlay() {

	updateOverlays(() => {

		if (installer[vars.HSO_OVERLAY] != null) {
			if (installer[vars.HSO_OVERLAY_REQUEST_SELECT] != null && installer[vars.HSO_OVERLAY_REQUEST_SELECT]) {
				requestUseCurrentHsoOverlay(installer[vars.HSO_OVERLAY]);
				return;
			}
			appendFeedback("HSO Overlay: " + installer[vars.HSO_OVERLAY].name + ".");
			return setupHsoResultChildren();
		}

		if (installer[vars.WATER_OVERLAYS].length > 0) {
			return requestSelectOrAddHsoOverlay(installer[vars.WATER_OVERLAYS]);


		} else {
			return requestNewHsoOverlayType();

		}
	});

}

/**
 * Step 2 A Request Use Current HSO Overlay
 */
function requestUseCurrentHsoOverlay(hsoOverlay) {

	appendFeedback("Do you want to install the Hydrologic System Overview on the currently configured Overlay " + hsoOverlay.name);

	const selectParent = document.createElement("div");
	const yesButton = document.createElement("input");
	yesButton.type = 'button';
	yesButton.value = 'Yes';
	const noButton = document.createElement("input");
	noButton.type = 'button';
	noButton.value = 'No';

	yesButton.onclick = () => {
		installer[vars.HSO_OVERLAY_REQUEST_SELECT] = false;
		yesButton.disabled = true;
		noButton.disabled = true;
		noButton.style.display = 'none';

		appendChains(() => setupMainHsoOverlay());
	};
	noButton.onclick = () => {
		installer[vars.HSO_OVERLAY_REQUEST_SELECT] = false;
		yesButton.disabled = true;
		noButton.disabled = true;
		yesButton.style.display = 'none';
		appendFeedback("Removing Attribute " + HSO_OVERLAY_ATTRIBUTE + " from " + hsoOverlay.name);

		appendChains(
			installer.connector.post("event/editoroverlay/remove_attribute", null, [], (_d, _u, _qp, params) => {
				params.push(installer[vars.HSO_OVERLAY_ID]);
				params.push([HSO_OVERLAY_ATTRIBUTE]);
			}),

			() => setupMainHsoOverlay()

		);

	};

	selectParent.appendChild(yesButton);
	selectParent.appendChild(noButton);
	appendFeedbackLine(selectParent);
}

/**
 * Step 2 B Request or Select HSO Overlay
 */
function requestSelectOrAddHsoOverlay(overlays) {
	appendFeedback("Select which Water Overlay should be the HSO Overlay:");

	const selectionParent = document.createElement("div");

	const typeOption = document.createElement('select');
	typeOption.innerHTML += '<option selected value="">Select or Add Water Overlay</option>';
	for (let i = 0; i < overlays.length; i++) {
		typeOption.innerHTML += '<option value=' + overlays[i].id + '>' + overlays[i].name + '</option>';
	}

	typeOption.innerHTML += '<option value=' + RAINFALL_OVERLAY_TYPE + '>New ' + RAINFALL_OVERLAY_TYPE + ' Overlay</option>';
	typeOption.innerHTML += '<option value=' + FLOODING_OVERLAY_TYPE + '>New ' + FLOODING_OVERLAY_TYPE + ' Overlay</option>';
	typeOption.innerHTML += '<option value=' + GROUNDWATER_OVERLAY_TYPE + '>New ' + GROUNDWATER_OVERLAY_TYPE + ' Overlay</option>';

	const selectButton = document.createElement('input');
	selectButton.type = 'button';
	selectButton.value = 'Select';
	selectButton.disabled = true;

	selectionParent.appendChild(typeOption);
	selectionParent.appendChild(selectButton);

	appendFeedbackLine(selectionParent);

	attachHandler(selectionParent, 'change', 'select', () => {
		selectButton.disabled = (typeOption.value == '');
		selectButton.value = isWaterOverlayType(typeOption.value) ? "Add" : "Select";
	});
	attachHandler(selectionParent, 'click', 'input[type="button"]', () => {
		selectButton.disabled = true;
		typeOption.disabled = true;

		if (isWaterOverlayType(typeOption.value)) {
			addOverlay(typeOption.value, "SURFACE_LAST_VALUE", HSO_OVERLAY_ATTRIBUTE, vars.HSO_OVERLAY_ID);
			setupHsoResultChildren();
		} else {
			setHsoOverlay(overlays, typeOption.value);
		}
	});
}

/**
 * Step 2C Request New HSO Overlay
 */
function requestNewHsoOverlayType() {

	appendFeedback("Select which type of Water Overlay to add:");

	const selectionParent = document.createElement("div");

	const typeOption = document.createElement('select');
	typeOption.innerHTML += '<option selected value="">Select Water Overlay Type</option>';
	typeOption.innerHTML += '<option value="RAINFALL">' + RAINFALL_OVERLAY_TYPE + '</option>';
	typeOption.innerHTML += '<option value="GROUNDWATER">' + GROUNDWATER_OVERLAY_TYPE + '</option>';
	typeOption.innerHTML += '<option value="FLOODING">' + FLOODING_OVERLAY_TYPE + '</option>';

	const addButton = document.createElement('input');
	addButton.type = 'button';
	addButton.value = 'Add';
	addButton.disabled = true;

	selectionParent.appendChild(typeOption);
	selectionParent.appendChild(addButton);

	appendFeedbackLine(selectionParent);

	attachHandler(selectionParent, 'change', 'select', () => addButton.disabled = (typeOption.value == ''));
	attachHandler(selectionParent, 'click', 'input[type="button"]', () => {
		addButton.disabled = true;
		typeOption.disabled = true;

		addOverlay(typeOption.value, "SURFACE_LAST_VALUE", HSO_OVERLAY_ATTRIBUTE, vars.HSO_OVERLAY_ID);

		setupHsoResultChildren();
	});

}

/**
 * Step 3 Setup HSO Result Children
 */
function setupHsoResultChildren() {
	let resultTypes = [
		'SURFACE_LAST_VALUE',
		'BUILDING_LAST_STORAGE',
		'RAIN',
		'GROUND_LAST_STORAGE',
		'GROUND_BOTTOM_FLOW',
		'GROUND_TRANSPIRATION',
		'SEWER_LAST_VALUE',
		'EVAPOTRANSPIRATION',
		'BASE_TYPES',
		'GROUND_LAST_UNSATURATED_STORAGE'];

	updateOverlays(

		() => {

			let overlayID = installer[vars.HSO_OVERLAY_ID];
			let overlays = installer[vars.OVERLAYS];
			let overlay = getOverlay(overlays, overlayID);
			let allPresent = true;
			for (let resultType of resultTypes) {

				let resultOverlay = getGridOverlay(overlays, "RESULT_CHILD", resultType, overlayID, null);

				if (resultOverlay == null && getResultType(overlay) != resultType) {
					addResultChildOverlay(overlay, resultType);
					allPresent = false;
				}
			}
			if (allPresent) {
				appendFeedback("HSO Overlay Result children: All setup");
			}
			setupHsoComboOverlays();
		}
	);

}

/**
 * Step 4: Setup HSO Combo Overlays
 */
function setupHsoComboOverlays() {
	let requiredCombos = [
		{
			name: 'HSO M3 in water',
			attribute: 'HSO_M3WATER',
			resultChildTypeA: 'SURFACE_LAST_VALUE',
			resultChildTypeB: 'BASE_TYPES',
			formula: 'SWITCH(BT, 0, 0, 0, 1, 0, 2, AT, 3, AT, 4, 0, 5, AT, 6, AT, 7, AT, 8, 0, 9, AT, 10, 0, 11, AT, 12, AT, 13, 0, 14, 0, 15, AT, 16, AT, 17, 0, 18, 0)'
		},
		{
			name: 'HSO Rain on water',
			attribute: 'HSO_RAIN_WATER',
			resultChildTypeA: 'RAIN',
			resultChildTypeB: 'BASE_TYPES',
			formula: 'SWITCH(BT, 0, 0, 0, 1, 0, 2, AT, 3, AT, 4, 0, 5, AT, 6, AT, 7, AT, 8, 0, 9, AT, 10, 0, 11, AT, 12, AT, 13, 0, 14, 0, 15, AT, 16, AT, 17, 0, 18, 0)'
		},
		{
			name: 'HSO Rain on land',
			attribute: 'HSO_RAIN_LAND',
			resultChildTypeA: 'RAIN',
			resultChildTypeB: 'BASE_TYPES',
			formula: 'SWITCH(BT, 0, 0, AT, 1, AT, 2, 0, 3, 0, 4, AT, 5, 0, 6, 0, 7, 0, 8, AT, 9, 0, 10, AT, 11, 0, 12, 0, 13, AT, 14, AT, 15, 0, 16, 0, 17, AT, 18, AT)'
		},

		{

			name: 'HSO Evapotranspiration on water',
			attribute: 'HSO_EVAPOTRANSPIRATIONWATER',
			resultChildTypeA: 'EVAPOTRANSPIRATION',
			resultChildTypeB: 'BASE_TYPES',
			formula: 'SWITCH(BT, 0, 0, 0, 1, 0, 2, AT, 3, AT, 4, 0, 5, AT, 6, AT, 7, AT, 8, 0, 9, AT, 10, 0, 11, AT, 12, AT, 13, 0, 14, 0, 15, AT, 16, AT, 17, 0, 18, 0)'

		},
		{

			name: 'HSO Evapotranspiration on land',
			attribute: 'HSO_EVAPOTRANSPIRATIONLAND',
			resultChildTypeA: 'EVAPOTRANSPIRATION',
			resultChildTypeB: 'BASE_TYPES',
			formula: 'SWITCH(BT, 0, 0, AT, 1, AT, 2, 0, 3, 0, 4, AT, 5, 0, 6, 0, 7, 0, 8, AT, 9, 0, 10, AT, 11, 0, 12, 0, 13, AT, 14, AT, 15, 0, 16, 0, 17, AT, 18, AT)',

		}

	];


	updateOverlays(

		() => {

			let overlayID = installer[vars.HSO_OVERLAY_ID];
			let overlays = installer[vars.OVERLAYS];

			let allPresent = true;
			for (let requiredCombo of requiredCombos) {

				let combo = getGridOverlay(overlays, null, null, null, requiredCombo.attribute);
				let resultOverlayA = getGridOverlay(overlays, null, requiredCombo.resultChildTypeA, overlayID, null);
				let resultOverlayB = getGridOverlay(overlays, null, requiredCombo.resultChildTypeB, overlayID, null);

				if (combo != null && combo.type == 'COMBO' && comboPrequelEquals(combo, 'A', resultOverlayA) && comboPrequelEquals(combo, 'B', resultOverlayB)
					&& combo.formula == requiredCombo.formula) {
					continue;
				}

				if (combo != null) {
					const params = [combo.id, requiredCombo.attribute];
					appendChains(
						installer.connector.post("event/editoroverlay/remove_attribute", null, params));

				}

				allPresent = false;
				requiredCombo.prequelAId = resultOverlayA.id;
				requiredCombo.prequelBId = resultOverlayB.id;
				addNewComboOverlay(overlayID, requiredCombo);
			}
			if (allPresent) {
				appendFeedback("HSO Overlay Combo overlays: All setup");
			}
			setupHsoWaterLevelAreas();
		});


}

/**
 * Step 5 Setup Water Level Areas
 */
function setupHsoWaterLevelAreas() {

	let hsoOverlay = installer[vars.HSO_OVERLAY];
	let key = hsoOverlay == null || hsoOverlay.keys["WATER_LEVEL"] == null ? "WATER_LEVEL" : hsoOverlay.keys["WATER_LEVEL"];

	appendChains(

		installer.connector.get("items/areas-" + key + "?", {
			token: app.token(),
			f: "JSON"
		}),

		areas => {

			if (!Array.isArray(areas)) {
				throw new Error("Requested Areas object is not an array!");
			}

			if (areas.length > 0) {
				appendFeedback("Water Level Areas: All setup");
				setupDashboardTemplatePanel();
			} else {
				requestAreaSetup();
			}
		}

	);
}

/**
 * Step 5B Setup Water Level Areas
 */
function requestAreaSetup() {

	appendChains(
		installer.connector.get("items/areas?", {
			token: app.token(),
			f: "JSON"
		}),

		areas => {

			if (!Array.isArray(areas)) {
				throw new Error("Requested Areas object is not an array!");
			}

			let map = new Map();
			for (let area of areas) {
				if (area.attributes == null) {
					continue;
				}
				for (let key of Object.keys(area.attributes)) {
					let amount = map.get(key);
					map.set(key, amount == null ? 1 : amount + 1);
				}
			}

			installer[vars.AREA_KEYS] = map;
		},
		() => {

			let areaMap = installer[vars.AREA_KEYS];

			appendFeedback("No Water Level Areas were detected. Do you want to select a different key or add a default Water Level Area?");

			const selectionParent = document.createElement("div");
			const typeOption = document.createElement('select');

			typeOption.innerHTML += '<option selected value="">Select Water Level Area Type</option>';
			for (let key of areaMap.keys()) {
				typeOption.innerHTML += '<option value=' + key + ' >Select Areas with attribute: ' + key + ' (' + areaMap.get(key) + ' area(s))</option>';

			}

			let newValueChar = "_";

			typeOption.innerHTML += '<option value="' + newValueChar + '">Add new Water Level Area</option>';

			const addButton = document.createElement('input');
			addButton.type = 'button';
			addButton.value = 'Select';
			addButton.disabled = true;

			selectionParent.appendChild(typeOption);
			selectionParent.appendChild(addButton);

			appendFeedbackLine(selectionParent);

			attachHandler(selectionParent, 'change', 'select', () => {
				addButton.disabled = (typeOption.value == '');
				addButton.value = typeOption.value == newValueChar ? 'Add' : 'Select';
			});
			attachHandler(selectionParent, 'click', 'input[type="button"]', () => {
				addButton.disabled = true;
				typeOption.disabled = true;

				if (typeOption.value == newValueChar) {
					addNewWaterLevelArea();
				} else {
					setOverlayKey(installer[vars.HSO_OVERLAY], "WATER_LEVEL", typeOption.value);
				}
				setupDashboardTemplatePanel();
			});

		}
	);
}


function updatePanels(actionAfterRefresh) {

	appendChains(

		installer.connector.get("items/panels?", {
			token: app.token(),
			f: "JSON"
		}),

		panels => {

			app.info("Received Panels:" + panels);

			if (!Array.isArray(panels)) {
				throw new Error("Requested Panels object is not an array! " + panels);
			}

			let hsoOverlay = installer[vars.HSO_OVERLAY];
			let attribute = hsoOverlay.keys[WATER_LEVEL_KEY] == null ? WATER_LEVEL_KEY : hsoOverlay.keys[WATER_LEVEL_KEY];

			installer[vars.PANELS] = panels;
			installer[vars.TEMPLATE_TEXT_PANELS] = getTemplateTextPanels(panels, "AREAS", attribute, null);
			installer[vars.HSO_TEMPLATE_PANELS] = getTemplateTextPanels(panels, "AREAS", attribute, HSO_PANEL_ATTRIBUTE);
			installer[vars.HSO_TEMPLATE_PANEL] = getTemplateTextPanel(panels, "AREAS", attribute, HSO_PANEL_ATTRIBUTE);
		},

		actionAfterRefresh

	);
}

/**
 * Step 6 Setup dashboard template panel
 */
function setupDashboardTemplatePanel() {

	appendChains(updatePanels(() => requestTemplatePanel()));
}

function requestTemplatePanel() {

	let templateTextPanels = installer[vars.TEMPLATE_TEXT_PANELS];
	let hsoTextPanel = installer[vars.HSO_TEMPLATE_PANEL];

	appendFeedback("Select which Template Text Panel should be the HSO Template Panel:");

	const selectionParent = document.createElement("div");

	const typeOption = document.createElement('select');
	if (hsoTextPanel == null) {
		typeOption.innerHTML += '<option selected value="">Select or Add new Template Text Panel</option>';
	} else {
		typeOption.innerHTML += '<option value=' + hsoTextPanel.id + '>' + hsoTextPanel.name + '</option>';
	}
	for (let i = 0; i < templateTextPanels.length; i++) {
		if (hsoTextPanel == null || hsoTextPanel.id != templateTextPanels[i].id) {
			typeOption.innerHTML += '<option value=' + templateTextPanels[i].id + '>' + templateTextPanels[i].name + '</option>';
		}
	}
	let newPanelValue = "NEW_PANEL_VALUE";

	typeOption.innerHTML += '<option value=' + newPanelValue + '>New Template Text Panel</option>';

	const selectButton = document.createElement('input');
	selectButton.type = 'button';
	selectButton.value = 'Select';
	selectButton.disabled = hsoTextPanel == null;

	selectionParent.appendChild(typeOption);
	selectionParent.appendChild(selectButton);

	appendFeedbackLine(selectionParent);

	attachHandler(selectionParent, 'change', 'select', () => {
		selectButton.disabled = (typeOption.value == '');
		selectButton.value = isWaterOverlayType(typeOption.value) ? "Add" : "Select";
	});
	attachHandler(selectionParent, 'click', 'input[type="button"]', () => {
		selectButton.disabled = true;
		typeOption.disabled = true;

		if (newPanelValue == typeOption.value) {
			addAndSetNewTemplateTextPanel();
		} else {
			installer[vars.DASHBOARD_PANEL_ID] = typeOption.value;
			setHsoTemplatePanel();
		}
	});
}

function setHsoTemplatePanel() {

	appendChains(
		installer.connector.post("event/editorpanel/set_attribute", null, [], (_d, _u, _qp, params) => {
			params.push(installer[vars.DASHBOARD_PANEL_ID]);
			params.push(HSO_PANEL_ATTRIBUTE);
			params.push(1.0);
		}),

		installer.connector.post("event/editorpanel/remove_attribute", null, [], (_d, _u, _qp, params) => {
			let dashboardPanelID = installer[vars.DASHBOARD_PANEL_ID];
			let templatePanels = installer[vars.TEMPLATE_TEXT_PANELS];
			let panelIDs = [];

			for (let i = 0; i < templatePanels.length; i++) {
				if (templatePanels[i].id != dashboardPanelID) {
					panelIDs.push(templatePanels[i].id);
				}
			}
			params.push(panelIDs);
			params.push(HSO_PANEL_ATTRIBUTE);
		}),

		installer.connector.post("event/editorpanel/set_template_panel_maplink", null, [], (_d, _u, _qp, params) => {
			params.push(installer[vars.DASHBOARD_PANEL_ID]);
			params.push("AREAS");
		}),

		installer.connector.post("event/editorpanel/set_template_attribute", null, [], (_d, _u, _qp, params) => {
			let hsoOverlay = installer[vars.HSO_OVERLAY];
			params.push(installer[vars.DASHBOARD_PANEL_ID]);
			let attribute = hsoOverlay.keys[WATER_LEVEL_KEY] == null ? WATER_LEVEL_KEY : hsoOverlay.keys[WATER_LEVEL_KEY];
			params.push(attribute);
		}),

		() => updatePanels(setDashboardContent)
	);
}

function addAndSetNewTemplateTextPanel() {

	appendChains(
		installer.connector.post("event/editorpanel/add", null, ["TEMPLATE_TEXT_PANEL"]),

		(data) => {
			installer[vars.DASHBOARD_PANEL_ID] = Array.isArray(data) ? data[0] : data;
		},

		installer.connector.post("event/editorpanel/set_size", null, [], (_d, _u, _qp, params) => {
			params.push(installer[vars.DASHBOARD_PANEL_ID]);
			params.push(PANEL_WIDTH);
			params.push(PANEL_HEIGHT);
		}),

		installer.connector.post("event/editorpanel/set_name", null, [], (_d, _u, _qp, params) => {
			params.push(installer[vars.DASHBOARD_PANEL_ID]);
			params.push("Hydrological System Overview");
		}),

		() => {
			setHsoTemplatePanel();
		}
	);
}


function setDashboardContent() {
	appendChains(

		getDashboardContent(),

		(data) => {
			installer[vars.DASHBOARD_CONTENT] = data;

		},

		installer.connector.post("event/editorpanel/set_text", null, [], (_d, _u, _qp, params) => {
			params.push(installer[vars.DASHBOARD_PANEL_ID]);
			params.push(installer[vars.DASHBOARD_CONTENT]);
			// remove dashboard data
			installer[vars.DASHBOARD_CONTENT] = "";
		}),

		installer.connector.post("event/editorpanel/apply_template_panels", null, [], (_d, _u, _qp, params) => {
			params.push(installer[vars.DASHBOARD_PANEL_ID]);
		}),

		() => {
			appendFeedback("Updated Template panel " + installer[vars.HSO_TEMPLATE_PANEL].name + "'s content with most recent Hydrologic System Overview from Github.");
			requestUpdateIndicators();
		}
	);
}

function requestUpdateIndicators() {
	appendFeedback("Recalculating project forcefully! (Implement request Overlay recalculation.)");

	appendChains(
		installer.connector.post("event/editor/update", null, [true]),

		() => appendFeedback("Installation of Hydrologic System Overview finished succesfully!")

	);

}

function getDashboardContent() {
	return (_data) => {
		let promise = Promise.resolve(
			$.ajax({
				url: DASHBOARD_URL,
				method: "GET",
				contentType: 'text/plain;charset=utf-8'
			})
		);
		return promise;
	}
}

$(window).on("load", function() {

	appendFeedback("Welcome to the installer for the Hydrologic System Overview.");
	if (typeof app === "undefined") {
		appendFeedback("This installer can only be run within the Tygron Client Application!");
		return;
	}
	requestInstallation();
});