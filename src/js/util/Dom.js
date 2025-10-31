export class Dom {

	static ensureDomElement(domElementId) {
		let domElement = domElementId;
		if (!(domElement instanceof HTMLElement)) {
			domElement = document.getElementById(domElementId);
		}
		if (!(domElement instanceof HTMLElement)) {
			throw 'No element found matching ' + domElementId;
		}
		return domElement;
	}

	static attachHandler(parentElement, eventType, selector, handler, referenceClass) {
		let checkHandler = function(event) {

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

	static popupPanel(element, id, webPath) {

		let popupPanel = document.createElement('div');
		popupPanel.classList.add('popup');

		let panelCloser = document.createElement('div');
		panelCloser.classList.add('closer');
		attachHandler(panelCloser, 'click', null, function() { clearPopupPanel(element); });

		let panelFrame = document.createElement('iframe');
		panelFrame.classList.add('popupFrame');

		popupPanel.appendChild(panelCloser);
		popupPanel.appendChild(panelFrame);

		webPath = webPath ?? '/web/panel.html';
		let queryString = 'token=$TOKEN&id=' + id;
		let webTarget = webPath + (webPath.indexOf('?') < 0 ? '?' : '&') + queryString;
		panelFrame.src = webTarget;

		clearPopupPanel(element);
		element.appendChild(popupPanel);
	}
	static clearPopupPanel(element) {
		let popups = element.getElementsByClassName('popup');
		for (let i = 0; i < popups.length; i++) {
			popups[i].remove();
		}
		return element;
	}
}