

export function setupTimeframeSlider(timeframeSlider, timeframe, timeframes, onInput) {
	
	timeframeSlider.max = timeframes - 1;
	timeframeSlider.value = timeframe;

	if (timeframeSlider.parentElement != null) {

		let style = timeframeSlider.parentElement.style;
		
		style.setProperty('--max', timeframeSlider.max);
		style.setProperty('--min', 0);
		style.setProperty('--step', 1);
		style.setProperty('--tickEvery', 1);
		style.setProperty('--value', timeframeSlider.value);
		style.setProperty('--text-value', JSON.stringify(timeframeSlider.value))


	}
	
	timeframeSlider.oninput = function() {
		onInput();

		if (timeframeSlider.parentElement != null) {
			
			let style = timeframeSlider.parentElement.style;

			style.setProperty('--value', timeframeSlider.value);
			style.setProperty('--text-value', JSON.stringify(timeframeSlider.value))
		}
	};
}