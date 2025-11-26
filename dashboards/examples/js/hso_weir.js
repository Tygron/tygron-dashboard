import { visualizeWeir } from "../../src/js/water/structures/weir.js";

let weirHeight = 1.5;
let weirDatumLeft = 2.6;
let weirDatumRight = 0.4;
let flow = 1.0;
let coefficientIndex = 0;
let coefficients = [1.1, 0.865, 0.91, 1.3, 1.37, 1.23];
let names = ["sharp", "broad perpendicular", "broad rounded", "rounded", "rounded roof", "custom"];
let canvas = document.getElementById("weirCanvas");
let timeframe = 0;

for (let i = 0; i < coefficients.length; i++) {

	let button = document.createElement("button");
	const index = i;
	button.onclick = () => {
		coefficientIndex = index;
		updateWeir();
	};

	button.innerHTML = names[i];

	document.body.appendChild(button);
}

function updateWeir() {
	visualizeWeir(canvas, timeframe, weirHeight, weirDatumLeft, weirDatumRight, flow, coefficients[coefficientIndex]);
}

let leftField = document.createElement("input");
leftField.value = weirDatumLeft;

leftField.onchange = () => {
	weirDatumLeft = Number(leftField.value);
	updateWeir();

}
document.body.appendChild(leftField);

let rightField = document.createElement("input");
rightField.value = weirDatumRight;
rightField.onchange = () => {
	weirDatumRight = Number(rightField.value);
	updateWeir();

}
document.body.appendChild(rightField);
updateWeir();