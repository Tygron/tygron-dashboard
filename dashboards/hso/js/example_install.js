import { getGridOverlay, getGridOverlays, getOverlay, getResultType, isOverlayOf } from "../../../src/js/util/OverlayUtils.js";
import { connector } from "../../../src/js/util/Connector.js";

const HSO_OVERLAY_ATTRIBUTE = "HSO_WATER_OVERLAY";
const RAINFALL_OVERLAY_TYPE = "RAINFALL";
const GROUNDWATER_OVERLAY_TYPE = "GROUNDWATER";
const FLOODING_OVERLAY_TYPE = "FLOODING";

const vars = {
	ADDED_OVERLAY_ID: "addedOverlayID",
	ATTRIBUTES: "attributes",
	ADJUSTED_OVERLAY_ID: "adjustedOverlayID",
	SELECTED_OVERLAY_ID: "selectedOverlayID",
	UNSELECTED_OVERLAY_IDS: "unselectedOverlayID",
	WATER_OVERLAY: "waterOverlay",
	WATER_OVERLAYS: "waterOverlays",
	HSO_OVERLAY: "hsoOverlay",
	HSO_OVERLAY_ID: "hsoOverlayID",
	GRID_OVERLAYS: "gridOverlays",
	OVERLAYS: "overlays",
	NON_WATER_HSO_OVERLAYS: "nonWaterHsoOverlays",

};

function attributeMap(attributeName) {
	let map = new Map();
	map.set(attributeName, null);
	return map;
}

const HSO_ATTRIBUTE_MAP = attributeMap(HSO_OVERLAY_ATTRIBUTE);

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

function adjustOverlay(overlay, resultType, attributes, resultIDVar) {

	installer[vars.ADJUSTED_OVERLAY_ID] = overlay.id;

	if (attributes != null) {
		setRequiredOverlayAttribute(attributes, vars.ADJUSTED_OVERLAY_ID);
	}

	if (resultType != null) {
		setResultType(resultType, vars.ADJUSTED_OVERLAY_ID);
	}

	appendChains(_data => installer[resultIDVar] = installer[vars.ADJUSTED_OVERLAY_ID]);
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

function setRequiredOverlayAttribute(attributes, idVar) {
	appendChains(
		_data => {
			let overlayID = installer[idVar];
			let keys = [];
			let values = [];
			let ids = [];

			for (let key of attributes.keys()) {
				keys.push(key);
				let value = attributes[key];
				values.push(Number.isFinite(value) ? value : 1.0);
				ids.push(overlayID);
			}
			appendFeedback("Setting attribute(s): " + keys);
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

function setResultType(resultType, idVar) {

	appendChains(
		(_data) => appendFeedback("Setting RainOverlay resultType to " + resultType),

		installer.connector.post("event/editoroverlay/set_result_type", null, [], (_d, _u, _qp, params) => {
			params.push(installer[idVar]);
			params.push(resultType);
		})
	);
}

function createHsoOverlay(type) {
	addOverlay(type, "SURFACE_LAST_VALUE", HSO_ATTRIBUTE_MAP, vars.HSO_OVERLAY_ID);

	resolveHsoOverlay();
}

function selectHsoOverlay(overlays) {
	appendFeedback("Select which Water Overlay should be the HSO Overlay:");

	const selectionParent = document.createElement("div");

	const typeOption = document.createElement('select');
	typeOption.innerHTML += '<option selected value="">Select Water Overlay</option>';
	for (let i = 0; i < overlays.length; i++) {
		typeOption.innerHTML += '<option value=' + overlays[i].id + '>' + overlays[i].name + '</option>';
	}

	const selectButton = document.createElement('input');
	selectButton.type = 'button';
	selectButton.value = 'Select';
	selectButton.disabled = true;

	selectionParent.appendChild(typeOption);
	selectionParent.appendChild(selectButton);

	appendFeedbackLine(selectionParent);

	attachHandler(selectionParent, 'change', 'select', () => selectButton.disabled = (typeOption.value == ''));
	attachHandler(selectionParent, 'click', 'input[type="button"]', () => {
		selectButton.disabled = true;
		typeOption.disabled = true;

		setHsoOverlay(overlays, typeOption.value);
	});
}

function setHsoOverlay(overlays, selectedOverlayID) {

	installer[vars.SELECTED_OVERLAY_ID] = selectedOverlayID;

	setRequiredOverlayAttribute(HSO_ATTRIBUTE_MAP, vars.SELECTED_OVERLAY_ID);

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

	resolveHsoOverlay();
}

function requestHsoOverlayType() {

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
		createHsoOverlay(typeOption.value);
	});

}

function setWaterOverlayAsHso(overlay) {

	adjustOverlay(overlay, null, HSO_ATTRIBUTE_MAP, vars.HSO_OVERLAY_ID);

	resolveHsoOverlay();
}

function resolveHsoOverlay() {

	refreshOverlays(() => {
		if (installer[vars.HSO_OVERLAY] != null) {
			return addRainfallChildren();
		}

		if (installer[vars.WATER_OVERLAY] != null) {
			return setWaterOverlayAsHso(installer[vars.WATER_OVERLAY]);
		}

		if (installer[vars.WATER_OVERLAYS].length > 0) {
			return selectHsoOverlay(installer[vars.WATER_OVERLAYS]);


		} else {
			return requestHsoOverlayType();

		}
	});

}

function addRainfallChildren() {
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

	refreshOverlays(

		() => {

			let overlayID = installer[vars.HSO_OVERLAY_ID];
			let overlays = installer[vars.OVERLAYS];
			let overlay = getOverlay(overlays, overlayID);
			for (let resultType of resultTypes) {
				let resultOverlay = getGridOverlay(overlays, "RESULT_CHILD", resultType, overlayID, null);
				if (resultOverlay == null && getResultType(overlay) != resultType) {
					addResultChildOverlay(overlay, resultType);
				} else {
					appendFeedback("Result child found: " + resultType);
				}
			}
		}
	);

}

function refreshOverlays(actionAfterRefresh) {

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
			if (hsoWaterOverlays.length == 1) {
				installer[vars.HSO_OVERLAY] = hsoWaterOverlays[0];
				installer[vars.HSO_OVERLAY_ID] = hsoWaterOverlays[0].id;
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

function appendFeedbackLine(element) {
	element.classList.add("feedback-line");
	document.getElementById("feedback").appendChild(element);
}

function appendFeedback(feedback) {
	let feedbackLine = document.createElement("div");
	feedbackLine.innerHTML = feedback;
	appendFeedbackLine(feedbackLine);
}

function isWaterOverlay(overlay, attributeMap) {
	return isOverlayOf(overlay, GROUNDWATER_OVERLAY_TYPE, null, null, attributeMap) ||
		isOverlayOf(overlay, RAINFALL_OVERLAY_TYPE, null, null, attributeMap) ||
		isOverlayOf(overlay, FLOODING_OVERLAY_TYPE, null, null, attributeMap);
}

function getWaterOverlays(hsoAttribute) {
	let waterOverlays = [];
	let gridOverlays = installer[vars.GRID_OVERLAYS];
	let attributes = hsoAttribute ? HSO_ATTRIBUTE_MAP : null;
	for (let i = 0; i < gridOverlays.length; i++) {
		let overlay = gridOverlays[i];
		if (isWaterOverlay(overlay, attributes)) {
			waterOverlays.push(overlay);
		}
	}
	return waterOverlays;
}

function removeHSOAttributeFromNonWaterOverlays() {

	appendChains(
		() => {
			let hsoAttributeMap = HSO_ATTRIBUTE_MAP;
			let gridOverlays = installer[vars.GRID_OVERLAYS];
			let eventOverlayIDs = [];
			for (let i = 0; i < gridOverlays.length; i++) {
				let overlay = gridOverlays[i];
				if (!isWaterOverlay(overlay) && isOverlayOf(overlay, null, null, null, hsoAttributeMap)) {
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


	);
}

function validateInstall() {

	appendFeedback("Validating project setup");

	installer.connector = connector(app.token());
	installer.chain = installer.connector.start();

	refreshOverlays();

	removeHSOAttributeFromNonWaterOverlays();

	resolveHsoOverlay();

	installer.chain = installer.chain.catch(error => appendFeedback("Failed installing! Error: " + error));

}


let app = {
	token: function() { return "5facca7c3rBCIES2ChYBux6fwSIckn0X" },
	info: function(info) { console.log(info) },
};


$(window).on("load", function() {

	appendFeedback("Validating installation for HSO Dasboard.");
	if (typeof app === "undefined") {
		appendFeedback("JSBridge App not found");
		return;
	}

	validateInstall();
});