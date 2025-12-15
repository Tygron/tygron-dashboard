
export function getRGBAInterpolated(value, min, max, maxColor, baseColor) {

	if (baseColor == undefined) {
		baseColor = [255, 255, 255, 0.0]
	}

	let fraction = (value - min) / (max - min);
	let red = Math.round(maxColor[0] * fraction + (1 - fraction) * baseColor[0]);
	let green = Math.round(maxColor[1] * fraction + (1 - fraction) * baseColor[1]);
	let blue = Math.round(maxColor[2] * fraction + (1 - fraction) * baseColor[2]);
	let alpha = maxColor[3] * fraction;

	return "rgba(" + [red, green, blue, alpha].join(",") + ")";
}

function addHeaderRow(table, properties, titles) {
	var header = table.createTHead();
	let headerRow = header.insertRow(-1);

	for (let i = 0; i < properties.length; i++) {

		let cell = headerRow.insertCell(-1);
		cell.innerHTML = titles[properties[i]];
	}
}

function addTimeframeRow(tableBody, timeframe, data, properties, colors) {

	let row = tableBody.insertRow(-1);

	for (let n = 0; n < properties.length; n++) {

		let cell = row.insertCell(-1);

		let labelDiv = document.createElement('div');
		let label = document.createElement('label');

		let propData = data[properties[n]];

		let value = Array.isArray(propData) ?
			timeframe < propData.length ?
				propData[timeframe] :
				propData[propData.length - 1]
			: propData == null ? null : propData;

		if (typeof value == "string") {
			label.innerHTML = value;
		} else if (value instanceof Number || typeof value == "number") {

			let min = 0;
			let max = 0;
			let color = colors[properties[n]];

			if (Array.isArray(propData)) {
				min = Math.min.apply(Math, data[properties[n]]);
				max = Math.max.apply(Math, data[properties[n]]);
				
			}

			if (n === 0) {
				label.innerHTML = value.toFixed();
			} else {
				label.innerHTML = value.toFixed(2);
			}


			if (min === max || color === undefined) {
				labelDiv.style.backgroundColor = 'transparent';
			} else {
				labelDiv.style.backgroundColor = getRGBAInterpolated(value, min, max, color);
			}
		} else {
			label.innerHTML = "-";
		}

		labelDiv.appendChild(label);
		cell.appendChild(labelDiv);

	}
}

export function clearTable(table) {
	while (table.children.length > 0) {
		table.removeChild(table.children[table.children.length - 1]);
	}
}

export function createTable(divName, data, properties, colors, titles) {

	let table = document.getElementById(divName);
	if (table == undefined) {
		console.log("Element with id: " + divName + " does not exist.");
		return;
	}

	addHeaderRow(table, properties, titles);

	let tableBody = table.createTBody();

	for (let t = 0; t < timeframes; t++) {

		addTimeframeRow(tableBody, t, data, properties, colors);
	}
}
