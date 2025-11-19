
export function isGridOverlay(overlay) {
	if (overlay == null || overlay.type == null) {
		return false;
	}

	return isGridType(overlay.type);

}

export function isGridType(type) {
	if (type == null || typeof type !== 'string') {
		return false;
	}

	switch (type) {
		case "AVG":
		case "COMBO":
		case "DISTANCE":
		case "DISTURBANCE_DISTANCE":
		case "FLOODING":
		case "GEO_TIFF":
		case "GROUNDWATER":
		case "HEAT_STRESS":
		case "HEIGHTMAP":
		case "INFERENCE":
		case "ITERATION":
		case "LIVABILITY":
		case "NETWORK_DISTANCE":
		case "OWNERSHIP_GRID":
		case "RAINFALL":
		case "RESULT_CHILD":
		case "SAFETY_DISTANCE":
		case "SATELLITE":
		case "SHADOW":
		case "SIGHT_DISTANCE":
		case "SUBSIDENCE":
		case "TEST":
		case "TRAFFIC_NO2":
		case "TRAFFIC_NOISE":
		case "TRAVEL_DISTANCE":
		case "WATERSHED":
		case "WCS":
		case "WMS":
			return true;
		default:
			return false
	}
}

export function getResultType(gridOverlay, type) {
	if (gridOverlay == null || gridOverlay.type == null) {
		return null;
	}


	if (gridOverlay.resultType != null) {
		return gridOverlay.resultType;
	}

	switch (type) {
		case "AVG":
		case "LIVABILITY":
		case "OWNERSHIP_GRID":
			return "AVG";
		case "COMBO":
		case "ITERATION":
		case "NETWORK_DISTANCE":
		case "SATELLITE":
		case "TEST":
			return "DEFAULT";
		case "DISTANCE":
		case "DISTURBANCE_DISTANCE":
		case "SAFETY_DISTANCE":
			return "ZONE"
		case "FLOODING":
		case "RAINFALL":
		case "GROUNDWATER":
			return "SURFACE_LAST_VALUE";
		case "GEO_TIFF":
			return "NEAREST";
		case "HEAT_STRESS":
			return "PET";
		case "HEIGHTMAP":
			return "DSM";
		case "INFERENCE":
			return "LABELS";
		case "RESULT_CHILD":
			return "";
		case "SHADOW":
			return "SHADE";
		case "SIGHT_DISTANCE":
			return "SIGHT";
		case "SUBSIDENCE":
			return "SUBSIDENCE";
		case "TRAFFIC_NO2":
			return "CONCENTRATION";
		case "TRAFFIC_NOISE":
			return "NOISE_DB";
		case "TRAVEL_DISTANCE":
			return "DESTINATIONS";
		case "WATERSHED":
			return "WATERSHEDS";
		case "WCS":
			return "NEAREST";
		case "WMS":
			return "COLOR";
		default:
			return "";
	}
}

export function getResultParentID(gridOverlay){
	if (gridOverlay == null || gridOverlay.parentID == null) {
			return null;
	}
	return gridOverlay.parentID;
}

export function getGridOverlay(overlays, type, resultType, resultParentID, requiredAttributes) {

	overlayloop: for (let i = 0; i < overlays.length; i++) {
		let overlay = overlays[i];

		if (type != null && type != overlay.type) {
			continue;
		}

		if (resultType != null && resultType != getResultType(overlay)) {
			continue;
		}
		
		if(resultParentID != null && resultParentID != getResultParentID(overlay)){
			continue;
		}

		if (requiredAttributes instanceof Map && overlay.attributes instanceof Map) {

			for (let [key, value] of requiredAttributes) {
				
				if (value == null && overlay.attributes[key] == null) {

					continue overlayloop;

				} else if (overlay.attributes[key] != value) {
					continue overlayloop;
				}
			}

		}
		
		return overlay;
	}
	
	return null;


}

export function getGridOverlays(overlays) {

	let gridOverlays = [];

	if (!Array.isArray(overlays)) {
		return gridOverlays;
	}

	for (let i = 0; i < overlays.length; i++) {
		let overlay = overlays[i];
		if (isGridOverlay(overlay)) {
			gridOverlays.push(overlay);
		}
	}

	return gridOverlays;
}

