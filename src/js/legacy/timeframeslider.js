

export function setupTimeframeSlider(timeframeSlider, timeframe, timeframes, onInput){
	timeframeSlider.max = timeframes - 1;
	timeframeSlider.value = timeframe;
	if (timeframeSlider.parentElement != null) {
		timeframeSlider.parentElement.style.setProperty('--max', timeframeSlider.max);
		timeframeSlider.parentElement.style.setProperty('--min', 0);
		timeframeSlider.parentElement.style.setProperty('--step', 1); /*Compute*/
		timeframeSlider.parentElement.style.setProperty('--tickEvery', 1);
		timeframeSlider.parentElement.style.setProperty('--value',timeframeSlider.value); 
		timeframeSlider.parentElement.style.setProperty('--text-value', JSON.stringify(timeframeSlider.value))	
		

	}
	timeframeSlider.oninput = function() {
		onInput();
		timeframeSlider.parentElement.style.setProperty('--value',timeframeSlider.value); 
		timeframeSlider.parentElement.style.setProperty('--text-value', JSON.stringify(timeframeSlider.value))	
	};
}