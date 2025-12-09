export function ensureDomElement(domElementId) {
	
	let domElement = domElementId;
	if (!(domElement instanceof HTMLElement)) {
		domElement = document.getElementById(domElementId);
	}
	
	if (!(domElement instanceof HTMLElement)) {
		throw 'No element found matching ' + domElementId;
	}
	
	return domElement;
}

export function attachHandler(parentElement, eventType, selector, handler, referenceClass) {
	
	let checkHandler = function(event) {
		event = event || window.event;
		event.target = event.target || event.srcElement;

		let foundElement = selector ? event.target.closest(selector) : parentElement;
		if (foundElement) {
			handler.call(foundElement, event);
		}
	};

	if (parentElement.addEventListener) {
		parentElement.addEventListener(eventType, checkHandler, false);
	}
	
	if (referenceClass) {
		parentElement.classList.add(referenceClass);
	}
}

export function popupPanel(parent, panelID, webPath) {

	let popupPanel = document.createElement('div');
	popupPanel.classList.add('popup');

	let panelCloser = document.createElement('div');
	panelCloser.classList.add('closer');
	attachHandler(panelCloser, 'click', null, function() { clearPopupPanel(parent); });

	let panelFrame = document.createElement('iframe');
	panelFrame.classList.add('popupFrame');

	popupPanel.appendChild(panelCloser);
	popupPanel.appendChild(panelFrame);

	webPath = webPath ?? '/web/panel.html';
	let queryString = 'token=$TOKEN&id=' + panelID;
	let webTarget = webPath + (webPath.indexOf('?') < 0 ? '?' : '&') + queryString;
	panelFrame.src = webTarget;

	clearPopupPanel(parent);
	parent.appendChild(popupPanel);
}

export function clearPopupPanel(element) {
	let popups = element.getElementsByClassName('popup');
	for (let i = 0; i < popups.length; i++) {
		popups[i].remove();
	}
	return element;
}