import { getGridOverlay, getGridOverlays, getOverlay, getResultType, isOverlayOf } from "../../../src/js/util/OverlayUtils.js";
import { connector } from "../../../src/js/util/Connector.js";
import { attachHandler } from "../../../src/js/util/Dom.js";

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
	HSO_OVERLAY_REQUEST_SELECT: "hsoOverlayRequestSelect",
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

function setOverlayTypeAndAttributes(overlay, resultType, attributes, resultIDVar) {

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

function isWaterOverlayType(type) {
	return type == RAINFALL_OVERLAY_TYPE || type == FLOODING_OVERLAY_TYPE || type == GROUNDWATER_OVERLAY_TYPE;
}

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
			addOverlay(typeOption.value, "SURFACE_LAST_VALUE", HSO_ATTRIBUTE_MAP, vars.HSO_OVERLAY_ID);
			setupHsoResultChildren();
		} else {
			setHsoOverlay(overlays, typeOption.value);
		}
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

	setupHsoResultChildren();
}

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

		addOverlay(typeOption.value, "SURFACE_LAST_VALUE", HSO_ATTRIBUTE_MAP, vars.HSO_OVERLAY_ID);

		setupHsoResultChildren();
	});

}

function requestUseCurrentHsoOverlay(hsoOverlay) {

	appendFeedback("Do you want to install the dashboard on the current HSO Overlay " + hsoOverlay.name);

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

function addNewComboOverlay(parentID, requirements) {

	const idVar = 'COMBO_' + requirements.attribute;
	addOverlay('COMBO', null, attributeMap(requirements.attribute), idVar);

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

function setupHsoComboOverlays() {
	let requiredCombos = [
		{
			name: 'HSO M3 in water',
			attribute: 'M3WATER',
			resultChildTypeA: 'BASE_TYPES',
			resultChildTypeB: 'SURFACE_LAST_VALUE',
			formula: 'SWITCH(AT, 0, 0, 0, 1, 0, 2, BT, 3, BT, 4, 0, 5, BT, 6, BT, 7, BT, 8, 0, 9, BT, 10, 0, 11, BT, 12, BT, 13, 0, 14, 0, 15, BT, 16, BT, 17, 0, 18, 0)'
		},
		{
			name: 'HSO Rain on water',
			attribute: 'RAIN_WATER',
			resultChildTypeA: 'BASE_TYPES',
			resultChildTypeB: 'RAIN',
			formula: 'SWITCH(AT, 0, 0, 0, 1, 0, 2, BT, 3, BT, 4, 0, 5, BT, 6, BT, 7, BT, 8, 0, 9, BT, 10, 0, 11, BT, 12, BT, 13, 0, 14, 0, 15, BT, 16, BT, 17, 0, 18, 0)'
		},
		{
			name: 'HSO Rain on land',
			attribute: 'RAIN_LAND',
			resultChildTypeA: 'BASE_TYPES',
			resultChildTypeB: 'RAIN',
			formula: 'SWITCH(AT, 0, 0, BT, 1, BT, 2, 0, 3, 0, 4, BT, 5, 0, 6, 0, 7, 0, 8, BT, 9, 0, 10, BT, 11, 0, 12, 0, 13, BT, 14, BT, 15, 0, 16, 0, 17, BT, 18, BT)'
		},

		{

			name: 'HSO Evapotranspiration on water',
			attribute: 'EVAPOTRANSPIRATIONWATER',
			resultChildTypeA: 'BASE_TYPES',
			resultChildTypeB: 'EVAPOTRANSPIRATION',
			formula: 'SWITCH(AT, 0, 0, 0, 1, 0, 2, BT, 3, BT, 4, 0, 5, BT, 6, BT, 7, BT, 8, 0, 9, BT, 10, 0, 11, BT, 12, BT, 13, 0, 14, 0, 15, BT, 16, BT, 17, 0, 18, 0)'

		},
		{

			name: 'HSO Evapotranspiration on land',
			attribute: 'EVAPOTRANSPIRATIONLAND',
			resultChildTypeA: 'BASE_TYPES',
			resultChildTypeB: 'EVAPOTRANSPIRATION',
			formula: 'SWITCH(AT, 0, 0, BT, 1, BT, 2, 0, 3, 0, 4, BT, 5, 0, 6, 0, 7, 0, 8, BT, 9, 0, 10, BT, 11, 0, 12, 0, 13, BT, 14, BT, 15, 0, 16, 0, 17, BT, 18, BT)',

		}

	];


	updateOverlays(

		() => {

			let overlayID = installer[vars.HSO_OVERLAY_ID];
			let overlays = installer[vars.OVERLAYS];
			let overlay = getOverlay(overlays, overlayID);
			let allPresent = true;
			for (let requiredCombo of requiredCombos) {
				let attributes = attributeMap(requiredCombo.attribute);

				let combo = getGridOverlay(overlays, null, null, null, attributes);
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

function setupHsoWaterLevelAreas() {
	appendFeedback("Water level configuration is not yet implemented!");
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

		() => setupMainHsoOverlay()
	);
}

function runInstallation() {

	appendFeedback("Validating project setup");

	installer.connector = connector(app.token());
	installer.chain = installer.connector.start();

	updateOverlays();

	removeHSOAttributeFromNonWaterOverlays();



	installer.chain = installer.chain.catch(error => appendFeedback("Failed installing! Error: " + error));

}

/*
let app = {
	token: function() { return "" },
	info: function(info) { console.log(info) },
};
*/


$(window).on("load", function() {

	appendFeedback("Welcome to the installer for the HSO Dasboard.");
	if (typeof app === "undefined") {
		appendFeedback("This installer can only be run within the Tygron Client Application!");
		return;
	}
	requestInstallation();
});