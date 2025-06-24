

export function createTimeframeData(timeframes) {
	let data = {
		dataframes: []
	};

	for (let i = 0; i < timeframes; i++) {
		data.dataframes.push({});
	}
	return data;
}

export function setTimeframeValues(data, property, values) {

	for (let i = 0; i < data.dataframes.length && i < values.length; i++) {
		data.dataframes[i].property[property] = values[i];
	}
}

export function setTimeframeValue(data, property, value) {

	for (let i = 0; i < data.dataframes.length; i++) {
		data.dataframes[i].property[property] = value;
	}
}

export function addTimeframeValuesForID(data, property, id, idValues, values) {

	for (let i = 0; i < data.dataframes.length && i < values.length && i < idValues; i++) {
		if (idValues[i] == id) {
			if (data.dataframes[i].property[property] == undefined) {
				data.dataframes[i].property[property] = 0;
			}
			data.dataframes[i].property[property] += values[i];
		}
	}
}
export function addValuesForTimeframeAndID(data, timeframe, property, id, idValues, values) {

	let dataframe = data.dataframes[timeframe];
	if (idValues[i] == id) {
		if (dataframe.property[property] == undefined) {
			dataframe.property[property] = 0;
		}
		dataframe.property[property] += values[i];
	}

}