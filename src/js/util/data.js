

export function createLinks(properties) {
	return { properties: properties };
}

export function getLink(links, timeframe) {
	if (links.timeframeLinks == undefined) {
		links.timeframeLinks = [];
	}
	while (links.timeframeLinks.length - 1 < timeframe) {
		links.timeframeLinks.push({
			source: [],
			target: [],
			value: [],
		});
	}
	return links.timeframeLinks[timeframe];
}

export function addLink(links, timeframe, from, to, amount) {
	let link = getLink(links, timeframe)
	if (link.source == undefined) {
		link.source = [];
	}
	if (link.target == undefined) {
		link.target = [];
	}
	if (link.value == undefined) {
		link.value = [];
	}
	link.source.push(links.properties.indexOf(from));
	link.target.push(links.properties.indexOf(to));
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

export function setTimeframeValues(data, property, values, relative = false, negative = undefined) {

	for (let i = 0; i < data[property].length && i < values.length; i++) {
		data[property][i] = values[i];
	}

	if (relative) {

		for (let i = 0; i < data[property].length && i < values.length; i++) {
			let previous = i == 0 ? 0 : data[property][i - 1];
			data[property][i] -= previous;
		}
	}
	if (negative != undefined) {
		if (negative) {
			for (let i = 0; i < data[property].length && i < values.length; i++) {
				data[property][i] = Math.min(0, values[i]);
			}
		} else {
			for (let i = 0; i < data[property].length && i < values.length; i++) {
				data[property][i] = Math.max(0, values[i]);
			}
		}
	}
}

export function setTimeframeValue(data, property, value) {

	for (let i = 0; i < data.dataframes.length; i++) {
		data[property][i] = value;
	}
}

export function addFlowValues(data, timeframe, propertyFrom, propertyTo, areaIDFrom, areaIDTo, values, condition = undefined) {
	if (data[propertyFrom][timeframe] == undefined) {
		data[propertyFrom][timeframe] = 0;
	}
	if (data[propertyTo][timeframe] == undefined) {
		data[propertyTo][timeframe] = 0;
	}

	for (let i = 0; i < values.length && i < areaIDFrom.length && i < areaIDTo.length; i++) {
		if (areaIDFrom[i] == data.itemID && (condition == undefined || condition[i])) {
			if (values[i] > 0) {
				data[propertyFrom][timeframe] += values[i];
			} else {
				data[propertyTo][timeframe] -= values[i];
			}
		}
		if (areaIDTo[i] == data.itemID  && (condition == undefined || condition[i])) {
			if (values[i] > 0) {
				data[propertyTo][timeframe] += values[i];
			} else {
				data[propertyFrom][timeframe] -= values[i];
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