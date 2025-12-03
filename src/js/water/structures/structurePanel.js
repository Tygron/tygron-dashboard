

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

	let style = sliderDiv.style;
	style.setProperty('--max', 1);
	style.setProperty('--min', 0);
	style.setProperty('--step', 1);
	style.setProperty('--tickEvery', 1);
	style.setProperty('--value', 1);
	style.setProperty('--text-value', "1");	

	style.setProperty('--primaryColor', "red");
	style.setProperty('--fill-color', "unset");
	style.setProperty('--value-background', "unset");
	style.setProperty('--value-active-color', "unset");

	let sliderInput = document.createElement("input");

	sliderInput.id = id;
	sliderInput.className = "timeframe-slider";
	sliderInput.type = "range";
	sliderInput.min = "0";
	sliderInput.max = "1";
	sliderInput.step = "1";
	sliderInput.value = "1";
	sliderInput.oninput = "this.parentNode.style.setProperty('--value',this.value); this.parentNode.style.setProperty('--text-value', JSON.stringify(this.value))";

	let sliderOutput = document.createElement("output");
	sliderDiv.appendChild(sliderInput);
	sliderDiv.appendChild(sliderOutput);

	if (parent != null) {
		parent.appendChild(sliderDiv);
	}
	return sliderDiv;
}