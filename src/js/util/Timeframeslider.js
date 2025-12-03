

export function setupTimeframeSlider(timeframeSlider, timeframe, timeframes, onInput) {

	let sliderInput = timeframeSlider.getElementsByTagName('input')[0];
	if (sliderInput != null) {
		sliderInput.max = timeframes - 1;
		sliderInput.value = timeframe;

		sliderInput.oninput = function() {
			onInput();

			timeframeSlider.style.setProperty('--value', sliderInput.value);
			timeframeSlider.style.setProperty('--text-value', JSON.stringify(sliderInput.value))

		};
	}

	timeframeSlider.style.setProperty('--max', sliderInput.max);
	timeframeSlider.style.setProperty('--min', 0);
	timeframeSlider.style.setProperty('--step', 1);
	timeframeSlider.style.setProperty('--tickEvery', 1);
	timeframeSlider.style.setProperty('--value', sliderInput.value);
	timeframeSlider.style.setProperty('--text-value', JSON.stringify(sliderInput.value));

}
	
	
