
function hasRequiredAttributesAndValues(item, requiredAttributes) {

	for (const key of requiredAttributes.keys()) {

		if (item.attributes == null) {
			return false;
		}

		let value = requiredAttributes[key];

		if (value == null && !(key in item.attributes)) {

			return false;

		} else if (value != null && item.attributes[key] != value) {

			return false;
		}
	}
	return true;
}

function hasRequiredAttribute(item, requiredAttribute) {
	return item.attributes != null && item.attributes[requiredAttribute] != null;
}

export function hasRequiredAttributes(item, requiredAttributes) {

	if (requiredAttributes instanceof Map) {
		return hasRequiredAttributesAndValues(item, requiredAttributes);

	} else if (Array.isArray(requiredAttributes)) {
		
		for (let i = 0; i < requiredAttributes.length; i++) {
			if (!hasRequiredAttribute(item, requiredAttributes[i])) {
				return false;
			}
		}
		return true;

	} else if (typeof requiredAttributes == "string") {
		return hasRequiredAttribute(item,requiredAttributes);

	} else if (requiredAttributes != null) {

		throw new Exception("Unhandled requiredAttribute type: " + requiredAttributes);
	}

	return true;



}