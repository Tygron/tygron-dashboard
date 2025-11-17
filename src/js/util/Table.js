
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

function initHeaderRow(table, properties, titles) {
	var header = table.createTHead();
	let headerRow = header.insertRow(-1);

	for (let i = 0; i < properties.length; i++) {

		let cell = headerRow.insertCell(-1);
		cell.innerHTML = titles[properties[i]];
	}
}

export function createTable(divName, data, properties, colors, titles, timeLabels) {

	let table = document.getElementById(divName);
	if (table == undefined) {
		console.log("Element with id: " + divName + " does not exist.");
		return;
	}

	initHeaderRow(table, properties, titles);

	var tableBody = table.createTBody();

	for (let r = 0; r < timeframes; r++) {

		var row = tableBody.insertRow(-1);

		for (let n = 0; n < properties.length; n++) {

			let cell = row.insertCell(-1);

			let labelDiv = document.createElement('div');
			let label = document.createElement('label');

			if (n === 1 && timeLabels) {
				label.innerHTML = timeLabels[r];

			} else {

				let value = data[properties[n]][r];
				let min = Math.min.apply(Math, data[properties[n]]);
				let max = Math.max.apply(Math, data[properties[n]]);
				let color = colors[properties[n]];

				if (typeof value == 'undefined') {
					label.innerHTML = '-';
				} else if (n === 0) {
					label.innerHTML = value.toFixed();
				} else {
					label.innerHTML = value.toFixed(2);
				}

				if (min === max || color === undefined) {
					labelDiv.style.backgroundColor = 'transparent';
				} else {
					labelDiv.style.backgroundColor = getRGBAInterpolated(value, min, max, color);
				}
			}

			labelDiv.appendChild(label);
			cell.appendChild(labelDiv);
		}
	}
}
