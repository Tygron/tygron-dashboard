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
	WATER_OVERLAY: "rainfallOverlay",
	HSO_OVERLAY: "hsoOverlay",
	HSO_OVERLAY_ID: "hsoOverlayID",
	GRID_OVERLAYS: "gridOverlays",
	OVERLAYS: "overlays",
	NON_WATER_HSO_OVERLAYS: "nonWaterHsoOverlays",

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

function attributeMap(attributeName) {
	let map = new Map();
	map.set(attributeName, null);
	return map;
}

function createHsoOverlay(type) {
	addOverlay(type, "SURFACE_LAST_VALUE", attributeMap(HSO_OVERLAY_ATTRIBUTE), vars.HSO_OVERLAY_ID);

	addRainfallChildren();
}

function requestHsoOverlayType() {

	appendFeedback("Select which type of Water Overlay to add:");

	const selectionParent = document.createElement("div");

	const typeOption = document.createElement('select');
	typeOption.id = 'hsoOverlayType';
	typeOption.innerHTML += '<option selected value="">Select Water Overlay Type</option>';
	typeOption.innerHTML += '<option value="RAINFALL">' + RAINFALL_OVERLAY_TYPE + '</option>';
	typeOption.innerHTML += '<option value="GROUNDWATER">' + GROUNDWATER_OVERLAY_TYPE + '</option>';
	typeOption.innerHTML += '<option value="FLOODING">' + FLOODING_OVERLAY_TYPE + '</option>';

	const addButton = document.createElement('input');
	addButton.id = 'addHsoOverlayButton';
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

function selectWaterOverlay() {

	appendFeedback("Select which Water Overlay should be setup for the dashboard:");

	adjustOverlay(installer[vars.WATER_OVERLAY], null, attributeMap(HSO_OVERLAY_ATTRIBUTE), vars.HSO_OVERLAY_ID);

	addRainfallChildren();
}

function setupHsoOverlay() {

	if (installer[vars.WATER_OVERLAY] == null) {

		requestHsoOverlayType();

	} else if (installer[vars.HSO_OVERLAY] == null) {

		selectWaterOverlay();

	} else {

		appendFeedback("HSO Rainfall Overlay present in project.");
		addRainfallChildren();
	}
}

function addRainfallOverlay() {
	appendChains(() => {
		setupHsoOverlay();
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

	getOverlays();

	appendChains(() => {

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
	});

}

function getOverlays() {

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
		}
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
	let attributes = hsoAttribute ? attributeMap(HSO_OVERLAY_ATTRIBUTE) : null;
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
			let hsoAttributeMap = attributeMap(HSO_OVERLAY_ATTRIBUTE);
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

		getOverlays()
	);
}

function refreshOverlayVars() {
	
	let hsoWaterOverlays = getWaterOverlays(true);
	if (hsoWaterOverlays.length == 1) {
		installer[vars.HSO_OVERLAY] = hsoWaterOverlays[0];
		installer[vars.HSO_OVERLAY_ID] =  hsoWaterOverlays[0].id;
	}
	let waterOverlays = getWaterOverlays(false);
	if (waterOverlays.length == 1) {
		installer[vars.WATER_OVERLAY] = waterOverlays[0];
	}
}


function validateInstall() {

	appendFeedback("Validating project setup");

	installer.connector = connector(app.token());
	installer.chain = installer.connector.start();
	app.info("Started chain");

	getOverlays();
	removeHSOAttributeFromNonWaterOverlays();

	appendChains(() => refreshOverlayVars());

	addRainfallOverlay();

	installer.chain = installer.chain.catch(error => appendFeedback("Failed installing! Error: " + error));

}

/*
let app = {
	token: function() { return "" },
	info: function(info) { console.log(info) },
};
*/

$(window).on("load", function() {

	appendFeedback("Validating panel...");
	if (typeof app === "undefined") {
		appendFeedback("JSBridge App not found");

	} else {
		validateInstall();
	}

});