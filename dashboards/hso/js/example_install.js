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
			.then(installer.connector.chain(data => {
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
				installer.vars["attributes"]= [ids, keys, values];

			}))
			.then(installer.connector.post("event/editoroverlay/set_attributes", null, [[],[],[]],
				(d, u, qp, params)=>{
					let newParams = installer.vars["attributes"];
					for(let i = 0; i < newParams.length; i++ ){
					params[i] = newParams[i];
					}
				}
			)
			);
	}

	if (resultType != null) {
		installer.chain = installer.chain
			.then(
				installer.connector.chain((data) => {
					appendStatus("Setting RainOverlay resultType to " + resultType);
					return installer.connector.post("event/editoroverlay/set_result_type", { token: app.token() }, [installer.vars["addedOverlayID"], resultType]);

				}));

	}
}

function addResultChildOverlay(parentOverlay, resultType) {
	installer.chain
		.then(fetch(app.api() + 'session/event/editoroverlay/add_result_child/?token=' + app.token(), {
			method: 'POST',
			body: JSON.stringify([parentOverlay.id, resultType])
		}))
		.then(response => {
			let content = response.json();
			if (content == null || !Number.isInteger(content)) {
				throw new Error("Failed to add Overlay with type " + type);
			}
		});
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
	addOverlay(RAINFALL_OVERLAY_TYPE, "BASE_TYPES", attributeMap(RAINFALL_OVERLAY_ATTRIBUTE));

	installer.chain = installer.chain
		.then(installer.connector.chain(() => installer.vars["rainfallOverlayID"] = installer.vars["addedOverlayID"]));
}

function addRainfallChildren(overlays, rainfallOverlay) {
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


	for (let resultType of resultTypes) {
		let resultOverlay = getGridOverlay(overlays, "RESULT_CHILD", resultType, rainfallOverlay.id, null);
		if (resultOverlay == null) {
			addResultChildOverlay(rainfallOverlay, resultType);
			appendStatus("Added result child: " + resultType);
		} else {
			appendFeedback("Result child found: " + resultType);
		}
	}
}

function validateOverlays(overlays) {

	if (!Array.isArray(overlays)) {
		throw new Error("Requested Overlays object is not an array! " + overlays);
	}

	let gridOverlays = getGridOverlays(overlays);
	let rainfallOverlay = getRainfallOverlay(gridOverlays);

	if (installStatus["RainOverlayAdd"] == undefined) {
		if (rainfallOverlay == null) {

			addRainfallOverlay();
			//appendStatus("RainOverlay added with attribute " + RAINFALL_OVERLAY_ATTRIBUTE);
			installStatus["RainOverlayAdd"] = true;
			validateInstall();
			return;

		} else {
			appendFeedback("RainOverlay found with attribute " + RAINFALL_OVERLAY_ATTRIBUTE);
		}
	}

	addRainfallChildren(gridOverlays, rainfallOverlay);


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

		installer.vars["gridOverlays"] = getGridOverlays(overlays);
		installer.vars["rainfallOverlay"] = getRainfallOverlay();

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