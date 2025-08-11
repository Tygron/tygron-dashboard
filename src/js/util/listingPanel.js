/*Configuration panel*/
export function generateConfigPanel(domTargetId, labels, values, entryGenerationFunction, additionalGenerationFunctions) {
	let domTargetEl = document.getElementById(domTargetId);
	let panelEl = document.createElement('form');
	panelEl.classList.add('configPanel');
	
	for ( let i in labels ) {
		panelEl.appendChild( entryGenerationFunction(labels[i], values[i]) );
	}
	domTargetEl.appendChild(panelEl);
	
	if ( !Array.isArray(additionalGenerationFunctions) ) {
		additionalGenerationFunctions = [additionalGenerationFunctions];
	}
	for ( let func of additionalGenerationFunctions ) {
		if ( typeof func == 'function' ){
			panelEl.appendChild( func() ); 
		}
	}
	
	panelEl.classList.add('valueHandler')
	let getValuesFunction = getValuesForm;
	panelEl.getValues = function(processor){return getValuesFunction(panelEl, null, processor)};
	
	return domTargetEl;
}

export function generateConfigPanelButton(label, clazz) {
	let entryEl = document.createElement('div');
	entryEl.classList.add('entry');
	entryEl.classList.add('controlEntry');
	entryEl.classList.add(clazz);
	
	let inputEl = document.createElement('input');
	inputEl.type = 'button';
	inputEl.value = label;
	entryEl.appendChild(inputEl);
	
	return entryEl;
}

export function generateConfigPanelEntryButtons(label, value, options) {
	let entryEl = document.createElement('div');
	entryEl.classList.add('entry');
	entryEl.classList.add('inputEntry');
	
	let labelEl = document.createElement('div');
	labelEl.classList.add('entryLabel');
	let labelTextEl = document.createElement('span');
	labelTextEl.innerHTML = label;
	labelEl.appendChild(labelTextEl);
	let inputsEl = document.createElement('div');
	inputsEl.classList.add('inputsPart');
	
	for (let i = 0; i < options.length ; i++) {
		let inputEl = document.createElement('input');
		inputEl.type = 'button';
		inputEl.value = options[i];
		if (inputEl.value == value) {
			inputEl.classList.add('selected');
		}
		inputsEl.appendChild(inputEl);
	}
	entryEl.appendChild(labelEl);
	entryEl.appendChild(inputsEl);
	
	entryEl.classList.add('valueHandler')
	let getValuesFunction = getValuesEntryButtons;
	entryEl.getValues = function(processor){return getValuesFunction(entryEl, null, processor)};
	
	return entryEl;
}

export function getValuesEntryButtons(element, event, processor) {
	let selected = element.getElementsByClassName('selected');
	if ( selected.length == 0 ) {
		return [0];
	}
	let values = [];
	for ( let el of selected ) {
		if (typeof processor == 'function' ) {
			values.push(processor(el.value));
		} else {
			values.push(el.value);
		}
	}
	return values;
}

export function getValuesForm(element, event, processor) {
	let valueEntries = element.getElementsByClassName('valueHandler');
	
	let values = [];

	for ( let el of valueEntries ) {
		if (typeof el.getValues == 'function') {
			let val = el.getValues();
			if (typeof processor == 'function' ) {
				val = processor(val);
			}
			values.push(val);
		}
	}
	return values;
}

export function handlerEntryButtons(element, event, forceSubmit) {
	let oldElement = element.closest('.inputsPart').getElementsByClassName('selected');
	if (oldElement.length>0) {
		for( let el of oldElement) {
			el.classList.remove('selected');
		}
		oldElement = oldElement[0];
	}
	element.classList.add('selected');
	if (oldElement == element) {
		return;
	}
	if (forceSubmit) {
		let form = element.closest('form');
		if (form) {
			form.requestSubmit();
		}
	}
}

export function handlerFormBlockSubmit(element, event) {
	if (event) {
		event.preventDefault();
		event.stopPropagation();
	}
	return false;
}