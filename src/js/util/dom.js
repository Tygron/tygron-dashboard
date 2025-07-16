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
