import { getGridOverlay, getGridOverlays, getOverlay, getResultType } from "../../../src/js/util/OverlayUtils.js";
import { connector } from "../../../src/js/util/Connector.js";

let RAINFALL_OVERLAY_ATTRIBUTE = "HSO_RAINFALL_OVERLAY";
let RAINFALL_OVERLAY_TYPE = "RAINFALL";

const vars = {
	ADDED_OVERLAY_ID: "addedOverlayID",
	ATTRIBUTES: "attributes",
	ADJUSTED_OVERLAY_ID: "adjustedOverlayID",
	RAINFALL_OVERLAY: "rainfallOverlay",
	HSO_OVERLAY: "hsoOverlay",
	HSO_OVERLAY_ID: "hsoOverlayID",
	GRID_OVERLAYS: "gridOverlays",
	OVERLAYS: "overlays",

};
const installer = {

};
let installStatus = {};

function appendChains(functions) {
	if (Array.isArray(functions)) {
		let next = installer.chain;
		for (let i = 0; i < functions.length; i++) {
			if (typeof functions[i] === 'function') {
				next = next.then(installer.connector.chain(functions[i]));
			}
		}
		installer.chain = next;
	} else if (typeof functions === 'function') {
		installer.chain = installer.chain.then((installer.connector.chain(functions)));
	}
}

function addNewOverlay(type, idVar) {

	appendChains([
		installer.connector.post("event/editoroverlay/add", null, [type]),

		overlayID => {
			if (overlayID == null || !Number.isInteger(overlayID)) {
				throw new Error("Failed to add Overlay with type " + type);
			}
			installer[idVar] = overlayID;
		}
	]);
}

function setRequiredOverlayAttribute(attributes, idVar) {
	appendChains([
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
			appendStatus("Setting attribute(s): " + keys);
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
	]);
}

function setResultType(resultType, idVar) {

	appendChains([
		(_data) => appendStatus("Setting RainOverlay resultType to " + resultType),

		installer.connector.post("event/editoroverlay/set_result_type", null, [], (_d, _u, _qp, params) => {
			params.push(installer[idVar]);
			params.push(resultType);
		})
	]);
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

	appendChains([

		(_data) => appendStatus("Adding result child overlay of " + resultType + " to Overlay " + overlay.name),
		

		installer.connector.post("event/editoroverlay/add_result_child", null, [], (_d, _u, _gp, params) => {
			params.push(overlay.id);
			params.push(resultType);
		})
	]);
}

function attributeMap(attributeName) {
	let map = new Map();
	map.set(attributeName, null);
	return map;
}

function setupHsoOverlay() {

	if (installer[vars.RAINFALL_OVERLAY] == null) {

		addOverlay(RAINFALL_OVERLAY_TYPE, "SURFACE_LAST_VALUE", attributeMap(RAINFALL_OVERLAY_ATTRIBUTE), vars.HSO_OVERLAY_ID);

	} else if (installer[vars.HSO_OVERLAY == null]) {

		adjustOverlay(installer[vars.RAINFALL_OVERLAY], null, attributeMap(RAINFALL_OVERLAY_ATTRIBUTE), vars.HSO_OVERLAY_ID);

	} else {

		appendFeedback("HSO Rainfall Overlay present in project.");

	}
}

function addRainfallOverlay() {
	appendChains(() => {
		setupHsoOverlay();
		addRainfallChildren();
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

	appendChains([

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
	]);
}

function appendStatus(text) {
	document.getElementById("status").innerHTML += "<br>" + text;
}

function setStatus(text) {
	document.getElementById("status").innerHTML = text;
}

function appendFeedback(feedback) {
	document.getElementById("feedback").innerHTML += "<br>" + feedback;
}

function setFeedback(feedback) {
	document.getElementById("feedback").innerHTML = feedback;
}

function validateInstall() {

	setFeedback("Validate Overlays...");

	installer.connector = connector(app.token());
	installer.chain = installer.connector.start();
	app.info("Started chain");

	getOverlays();

	appendChains(() => {

		let gridOverlays = installer[vars.GRID_OVERLAYS];
		app.info("GridOverlays: " + gridOverlays);

		installer[vars.HSO_OVERLAY] = getGridOverlay(gridOverlays, RAINFALL_OVERLAY_TYPE, null, null, attributeMap(RAINFALL_OVERLAY_ATTRIBUTE));
		installer[vars.RAINFALL_OVERLAY] = getGridOverlay(gridOverlays, RAINFALL_OVERLAY_TYPE, null, null);

		if (installer[vars.HSO_OVERLAY] != null) {

			app.info("HSO Overlay: " + installer[vars.HSO_OVERLAY]);
			installer[vars.HSO_OVERLAY_ID] = installer[vars.HSO_OVERLAY].id;

		} else if (installer[vars.RAINFALL_OVERLAY] != null) {

			app.info("RainfallOverlay: " + installer[vars.RAINFALL_OVERLAY]);

		} else {

			app.info("No Rainfall Overlay present in project.");
			setFeedback("Adding new Rainfall Overlay.");
		}
	});

	addRainfallOverlay();

	installer.chain = installer.chain.catch(error => setFeedback("Failed installing! Error: " + error));

}

/*
let app = {
	token: function() { return "" },
	info: function(info) { console.log(info) },
};
*/

$(window).on("load", function() {

	setFeedback("Validating panel...");
	if (typeof app === "undefined") {
		setFeedback("JSBridge App not found");

	} else {
		validateInstall();
	}

});