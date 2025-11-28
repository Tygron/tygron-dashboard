import { getGridOverlay, getGridOverlays } from "../../src/js/util/OverlayUtils.js";

let RAINFALL_OVERLAY_ATTRIBUTE = "HSO_RAINFALL_OVERLAY";
let RAINFALL_OVERLAY_TYPE = "RAINFALL";

let installStatus = {};


async function addOverlay(type, resultType, attributes) {
	let content = await fetch(app.api() + 'session/event/editoroverlay/add/?token=' + app.token(), {
		method: 'POST',
		body: JSON.stringify([type])

	}).then(response => response.json());

	if (content == null || !Number.isInteger(content)) {
		throw new Error("Failed to add Overlay with type " + type);
	}

	let overlayID = content;

	if (attributes != null) {
		let keys = [];
		let values = [];
		let ids = [];

		for (let key in attributes) {
			keys.push(key);
			let value = attributes[key];
			values.push(Number.isFinite(value) ? value : 1.0);
			ids.push(overlayID);
		}


		await fetch(app.api() + 'session/event/editoroverlay/set_attributes/?token=' + app.token(), {
			method: 'POST',
			body: JSON.stringify([ids, keys, values])
		});
	}

	if (resultType != null) {
		await fetch(app.api() + 'session/event/editoroverlay/set_result_type/?token=' + app.token(), {
			method: 'POST',
			body: JSON.stringify([overlayID, resultType])
		});
	}

}

async function addResultChildOverlay(parentOverlay, resultType) {
	let content = await fetch(app.api() + 'session/event/editoroverlay/add_result_child/?token=' + app.token(), {
		method: 'POST',
		body: JSON.stringify([parentOverlay.id, resultType])

	}).then(response => response.json());

	if (content == null || !Number.isInteger(content)) {
		throw new Error("Failed to add Overlay with type " + type);
	}

	return content;
}

function attributeMap(attributeName) {
	let map = new Map();
	map[attributeName] = null;
	return map;
}

function getRainfallOverlay(overlays) {
	return getGridOverlay(overlays, RAINFALL_OVERLAY_TYPE, null, null, attributeMap(RAINFALL_OVERLAY_ATTRIBUTE));
}

function addRainfallOverlay() {
	addOverlay(RAINFALL_OVERLAY_TYPE, null, attributeMap(RAINFALL_OVERLAY_ATTRIBUTE));

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

async function validateOverlays(overlays) {

	if (!Array.isArray(overlays)) {
		throw new Error("Requested Overlays object is not an array!");
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

async function getOverlays() {
	const request = new Request(app.api() + "session/items/overlays?" + new URLSearchParams({
		token: app.token(),
		f: "JSON"
	}));

	return await fetch(request).then(response => response.json());
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

async function validateInstall() {

	setFeedback("Validate Overlays...");

	getOverlays()
		.then(data => validateOverlays(data))
		.catch(error => setFeedback("Failed installing! Error: " + error));

}

//TODO: (Frank) Enable for browser api testing
if (typeof app === "undefined") {
	app = {};
	app.token = () => { return "6c3554a1xZV06osxHTioKfhVzKuUQ9fy" };
	app.api = () => { return "https://development.tygron.com/api/" };
}

$(window).on("load", function() {

	setFeedback("Validating panel...");
	if (typeof app === "undefined") {
		setFeedback("JSBridge App not found");

	} else {
		validateInstall();
	}

});