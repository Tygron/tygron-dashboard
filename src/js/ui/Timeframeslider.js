/**
 * @param {Element} parent 
 */
export function addTimeframeSlider(parent) {
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

	sliderDiv.getValue = () => {return sliderDiv.style.getPropertyValue("--value")};

	return sliderDiv;
}

export function setupTimeframeSlider(timeframeSlider, timeframe, timeframes, onInput) {

	let sliderInput = timeframeSlider.getElementsByTagName('input')[0];
	if (sliderInput != null) {
		sliderInput.max = timeframes - 1;
		sliderInput.value = timeframe;

		sliderInput.oninput = function() {
			timeframeSlider.style.setProperty('--value', sliderInput.value);
			timeframeSlider.style.setProperty('--text-value', JSON.stringify(sliderInput.value))
			onInput();
		};
	}

	timeframeSlider.style.setProperty('--max', sliderInput.max);
	timeframeSlider.style.setProperty('--min', 0);
	timeframeSlider.style.setProperty('--step', 1);
	timeframeSlider.style.setProperty('--tickEvery', 1);
	timeframeSlider.style.setProperty('--value', sliderInput.value);
	timeframeSlider.style.setProperty('--text-value', JSON.stringify(sliderInput.value));

}


