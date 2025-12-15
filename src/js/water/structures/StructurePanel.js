

export function addStructureInfoLabel(parent, innerHTML) {
	let element = document.createElement("div");
	element.className = "water-structure-info-label";
	element.innerHTML = innerHTML;
	if (parent != null) {
		parent.appendChild(element);
	}
	return element;
}

export function addStructureInfoValue(parent, id, innerHTML) {
	let element = document.createElement("div");
	element.className = "water-structure-info-value";
	element.id = id;
	element.innerHTML = innerHTML == null ? "" : innerHTML;
	if (parent != null) {
		parent.appendChild(element);
	}
	return element;
}

