
/**
 * @param {Array.<string>} properties Array of Property names to set into data
 * @returns {Object} Data Object containing the properties.
 */
export function createLinks(properties) {

	return { properties: properties };
}

/**
 * @param {Object} data object with String properties, initialized using createLinks method 
 * @param {int} timeframe timeframe index at which the link should be 
 * @return {Object} containing a source, target and value array properties.
 */
export function getLink(data, timeframe) {

	if (!Array.isArray(data.timeframeLinks)) {
		data.timeframeLinks = [];
	}

	while (data.timeframeLinks.length - 1 < timeframe) {
		data.timeframeLinks.push({
			source: [],
			target: [],
			value: [],
		});
	}

	return data.timeframeLinks[timeframe];
}

/**
 * @param {Object} data object with String properties, initialized using createLinks method 
 * @param {int} timeframe timeframe index at which the link should be set
 * @param {String} from the property from which an ammount is removed.
 * @param {String} to the property to which an amount is added.
 * @param {Number} amount that is moved between the two properties
 */
export function addLink(data, timeframe, from, to, amount) {

	let link = getLink(data, timeframe)
	if (!Array.isArray(link.source)) {
		link.source = [];
	}
	if (!Array.isArray(link.target)) {
		link.target = [];
	}
	if (!Array.isArray(link.value)) {
		link.value = [];
	}

	link.source.push(data.properties.indexOf(from));
	link.target.push(data.properties.indexOf(to));
	link.value.push(amount);
}


export function createTimeframeData(timeframes, itemID, properties) {

	let data = {
		itemID: itemID,
		timeframes: timeframes
	};

	for (let i = 0; i < properties.length; i++) {
		data[properties[i]] = [];
		for (let j = 0; j < timeframes; j++) {
			data[properties[i]].push(0);
		}
	}

	return data;
}

/**
 * Unused function, soon te be removed!!!
 */
export function setTimeframeValue(data, property, value) {

	for (let i = 0; i < data.dataframes.length; i++) {

		data[property][i] = value;
	}
}

export function addFlowValues(data, timeframe, propertyFrom, propertyTo, propertyAreaIDFrom, propertAreaIDTo, values, condition = undefined) {
	addFlowValuesWithInner(data, timeframe, propertyFrom, propertyTo, undefined, propertyAreaIDFrom, propertAreaIDTo, values, condition);
}

export function addFlowValuesWithInner(data, timeframe, propertyFrom, propertyTo, propertyInner, propertyAreaIDFrom, propertAreaIDTo, values, condition = undefined) {

	if (data[propertyFrom][timeframe] == undefined) {
		data[propertyFrom][timeframe] = 0;
	}

	if (data[propertyTo][timeframe] == undefined) {
		data[propertyTo][timeframe] = 0;
	}

	if (propertyInner != undefined) {
		if (data[propertyInner][timeframe] == undefined) {
			data[propertyInner][timeframe] = 0;
		}
	}

	for (let i = 0; i < values.length && i < data[propertyAreaIDFrom].length && i < data[propertAreaIDTo].length; i++) {

		if (propertyInner != undefined && (data[propertAreaIDTo][i] == data.itemID) && (data[propertyAreaIDFrom][i] == data.itemID) && (condition == undefined || condition[i])) {
			data[propertyInner][timeframe] += Math.abs(values[i]);
		}

		else {
			if (data[propertAreaIDTo][i] == data.itemID && (condition == undefined || condition[i])) {

				if (values[i] > 0) {
					data[propertyFrom][timeframe] += values[i];

				} else {
					data[propertyTo][timeframe] -= values[i];
				}

				if (data[propertyAreaIDFrom][i] == data.itemID && (condition == undefined || condition[i])) {

					if (values[i] > 0) {
						data[propertyTo][timeframe] += values[i];

					} else {
						data[propertyFrom][timeframe] -= values[i];
					}
				}
			}
		}
	}
}

export function addValuesForTimeframeAndID(data, timeframe, property, idValues, values) {

	if (idValues[i] == data.itemID) {
		if (data[property][timeframe] == undefined) {
			data[property][timeframe] = 0;
		}
		data[property][timeframe] += values[i];
	}

}
