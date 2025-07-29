export function attachHandler(parentElement, eventType, selector, handler) {
	let checkHandler = function(event) {
		event = event || window.event;
		event.target = event.target || event.srcElement;
		
		let foundElement = selector ? event.target.closest(selector) : parentElement;
		if (foundElement) {
			return handler(foundElement, event);
		}
	};

	if (parentElement.addEventListener) {
		parentElement.addEventListener(eventType, checkHandler, false);
	}
}

export function popupPanel(element, id, webPath) {

	let popupPanel = document.createElement('div');
	popupPanel.classList.add('popup');
	
	let panelCloser = document.createElement('div');
	panelCloser.classList.add('closer');
	attachHandler(panelCloser, 'click', null, function(){clearPopupPanel(element);});
	
	let panelFrame = document.createElement('iframe');
	panelFrame.classList.add('popupFrame');
	
	popupPanel.appendChild( panelCloser );
	popupPanel.appendChild( panelFrame );
	
	webPath = webPath ?? '/web/panel.html'
	let queryString = 'token=$TOKEN&id='+id;
	let webTarget = webPath + ( webPath.indexOf('?')<0 ? '?' : '&' ) + queryString;
	panelFrame.src = webTarget;
	
	clearPopupPanel(element);
	element.appendChild(popupPanel);
}
export function clearPopupPanel(element) {
	let popups = element.getElementsByClassName('popup');
	for ( let i = 0 ; i < popups.length ; i++ ) {
		popups[i].remove();
	}
	return element;
}