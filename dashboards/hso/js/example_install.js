import { getGridOverlay, getGridOverlays } from "../../../src/js/util/OverlayUtils.js";
import { connector } from "../../../src/js/util/Connector.js";

let RAINFALL_OVERLAY_ATTRIBUTE = "HSO_RAINFALL_OVERLAY";
let RAINFALL_OVERLAY_TYPE = "RAINFALL";

let installer = { vars: {} };
let installStatus = {};


function addOverlay(type, resultType, attributes) {

	installer.chain = installer.chain

		.then(installer.connector.post("event/editoroverlay/add", null, [type]))
		.then(installer.connector.chain(overlayID => {
			if (overlayID == null || !Number.isInteger(overlayID)) {
				throw new Error("Failed to add Overlay with type " + type);
			}
			appendStatus("Added Overlay of type " + type + " with ID: " + overlayID);
			installer.vars["addedOverlayID"] = overlayID;
		}));


	if (attributes != null) {
		installer.chain = installer.chain
			.then(installer.connector.chain(_data => {
				let overlayID = installer.vars["addedOverlayID"];
				let keys = [];
				let values = [];
				let ids = [];

				for (let key in attributes) {
					keys.push(key);
					let value = attributes[key];
					values.push(Number.isFinite(value) ? value : 1.0);
					ids.push(overlayID);
				}
				appendStatus("Setting " + keys.length + " RainOverlay attribute(s)");
				installer.vars["attributes"] = [ids, keys, values];

			}))
			.then(installer.connector.post("event/editoroverlay/set_attributes", null, [],
				(_d, _u, _qp, params) => {
					let newParams = installer.vars["attributes"];
					for (let n = 0; n < newParams.length; n++) {
						params.push(newParams[n]);
					}
				}
			)
			);
	}

	if (resultType != null) {
		installer.chain = installer.chain
			.then(installer.connector.chain((_data) =>
				appendStatus("Setting RainOverlay resultType to " + resultType)))

			.then(installer.connector.post("event/editoroverlay/set_result_type", null, [], (_d, _u, _qp, params) => {
				params.push(installer.vars["addedOverlayID"]);
				params.push(resultType);
			}));
	}
}

function addResultChildOverlay(parentOverlayID, resultType) {
	installer.chain = installer.chain
		.then(installer.connector.chain((_data) =>
			appendStatus("Adding result child overlay of " + resultType + " to Overlay with id " + parentOverlayID)))

		.then(installer.connector.post("event/editoroverlay/add_result_child", null, [], (_d, _u, _gp, params) => {
			params.push(parentOverlayID);
			params.push(resultType);
		}));

}

function attributeMap(attributeName) {
	let map = new Map();
	map[attributeName] = null;
	return map;
}

function getRainfallOverlay() {
	return getGridOverlay(installer.vars["gridOverlays"], RAINFALL_OVERLAY_TYPE, null, null, attributeMap(RAINFALL_OVERLAY_ATTRIBUTE));
}

function addRainfallOverlay() {
	installer.chain = installer.chain
		.then(installer.connector.chain(() => {
			if (installer.vars["rainfallOverlay"] == null) {
				addOverlay(RAINFALL_OVERLAY_TYPE, "SURFACE_LAST_VALUE", attributeMap(RAINFALL_OVERLAY_ATTRIBUTE));
				
				installer.chain = installer.chain
					.then(installer.connector.chain(() => {
						appendFeedback("Added overlay with id: " + installer.vars["addedOverlayID"]);
						addRainfallChildren(installer.vars["addedOverlayID"]);
					}));

			} else {
				appendFeedback("HSO Rainfall Overlay present in project.");
				addRainfallChildren(installer.vars["rainfallOverlay"].id);

			}
		}));

}

function addRainfallChildren(overlayID) {
	let resultTypes = [
		'BUILDING_LAST_STORAGE',
		'RAIN',
		'GROUND_LAST_STORAGE',
		'GROUND_BOTTOM_FLOW',
		'GROUND_TRANSPIRATION',
		'SEWER_LAST_VALUE',
		'EVAPOTRANSPIRATION',
		'BASE_TYPES',
		'GROUND_LAST_UNSATURATED_STORAGE'];
	installer.chain = installer.chain.then(installer.connector.chain(() => {


		let overlays = installer.vars["overlays"];
		for (let resultType of resultTypes) {
			let resultOverlay = getGridOverlay(overlays, "RESULT_CHILD", resultType, overlayID, null);
			if (resultOverlay == null) {
				addResultChildOverlay(overlayID, resultType);
			} else {
				appendFeedback("Result child found: " + resultType);
			}
		}
	}));
}

function getOverlays() {
	installer.chain = installer.chain.then(installer.connector.get("items/overlays?", {
		token: app.token(),
		f: "JSON"
	})).then(overlays => {
		app.info("Receive overlays:" + overlays);
		if (!Array.isArray(overlays)) {
			throw new Error("Requested Overlays object is not an array! " + overlays);
		}

		installer.vars["overlays"] = overlays;
		installer.vars["gridOverlays"] = getGridOverlays(overlays);
	});
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

	installer.chain = installer.chain.then(() => {
		app.info("GridOverlays: " + installer.vars["gridOverlays"]);

		installer.vars["rainfallOverlay"] = getRainfallOverlay();

		app.info("RainfallOverlay: " + installer.vars["rainfallOverlay"]);
		if (installer.vars["rainfallOverlay"] == null) {
			setFeedback("Adding new Rainfall Overlay.");
		}
	});

	addRainfallOverlay();

	installer.chain = installer.chain.catch(error => setFeedback("Failed installing! Error: " + error));

}

let app = {
	token: function() { return "5facca7c3rBCIES2ChYBux6fwSIckn0X" },
	info: function(info) { console.log(info) },
};


$(window).on("load", function() {

	setFeedback("Validating panel...");
	if (typeof app === "undefined") {
		setFeedback("JSBridge App not found");

	} else {
		validateInstall();
	}

});