

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

export function addStructureTimeframeSlider(parent, id) {
	let sliderDiv = document.createElement("div");
	sliderDiv.className = "timeframe-slider range--ticks slider-background";
	sliderDiv.style = '--step: 1; --min: 0; --max: 1; --value: 1; --text-value: "1"; --primaryColor: red; --fill-color: unset; --value-background: unset; --value-active-color: unset;';

	let sliderInput = document.createElement("input");

	sliderDiv.appendChild(sliderInput);
	sliderInput.id = id;
	sliderInput.className = "timeframe-slider";
	sliderInput.type = "range";
	sliderInput.min = "0";
	sliderInput.max = "1";
	sliderInput.step = "1";
	sliderInput.value = "1";
	sliderInput.oninput = "this.parentNode.style.setProperty('--value',this.value); this.parentNode.style.setProperty('--text-value', JSON.stringify(this.value))";

	let sliderOutput = document.createElement("output");
	sliderDiv.appendChild(sliderOutput);

	if (parent != null) {
		parent.appendChild(sliderDiv);
	}
	return sliderDiv;
}