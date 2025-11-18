
async function validateOverlays(overlays) {

	if (!Array.isArray(overlays)) {
		throw new Error("Requested Overlays object is not an array!");
	}


	let hasCombo = false;
	let hasComboWithAttribute = false;

	for (let i = 0; i < overlays.length; i++) {
		let overlay = overlays[i];

		if (overlay.type != null && "combo"==overlay.type.toLowerCase()) {
			hasCombo = true;
			if (overlay.attributes != null) {
				let hogComboAttribute = overlay.attributes["HOG_COMBO"];
				hasComboWithAttribute = hogComboAttribute != null && hogComboAttribute > 0;
			}
		}

	}

	let para = document.getElementById("myParagraph");
	para.innerHTML = hasCombo && hasComboWithAttribute ?
		"Specific Combo Overlay is present!" : hasCombo ?
			"Has Combo Overlay, but not with required attribute " :
			"No Combo Overlay found in project!";


}

async function validateInstall() {

	const request = new Request(app.api() + "session/items/overlays?" + new URLSearchParams({
		token: app.token(),
		f: "JSON"
	}));

	let para = document.getElementById("myParagraph");
	para.innerHTML = "Requesting overlay...";
	fetch(request)
		.then(response => response.json())
		.then(data => validateOverlays(data))
		.catch(error => para.innerHTML = "Failed fetching HOG_COMBO Overlay: " + error);

}

$(window).on("load", function() {

	let para = document.getElementById("myParagraph");
	para.innerHTML = "Validating panel...";
	if (typeof app === "undefined") {
		para.innerHTML = "JSBridge App not found";

	} else {
		validateInstall();
	}

});