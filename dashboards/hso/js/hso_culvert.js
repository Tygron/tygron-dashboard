import { drawCulvertFront, drawCulvertSide } from "../../../src/js/water/structures/culvert.js";

let culvertDatum = 1.5;
let datumLeft = 2.6;
let datumRight = 0.4;
let flow = 1.0;
let culvertHeight = 1.2;
let culvertWidth = 1.5;
let culvertLength = 6.6; 
let culvertN = 3/2;

let sideCanvas = document.getElementById("culvertSideCanvas");
let frontCanvas = document.getElementById("culvertFrontCanvas");
let timeframe = 0;

function updateCulvert() {
	drawCulvertSide(sideCanvas, timeframe, culvertDatum, datumLeft, datumRight,culvertWidth, culvertHeight, culvertLength, culvertN);
	drawCulvertFront(frontCanvas, timeframe, culvertDatum, datumLeft, datumRight,culvertWidth, culvertHeight, culvertLength, culvertN);
}

let leftDatumTitle = document.createElement("label");
leftDatumTitle.value = "Datum left:";
let leftField = document.createElement("input");
leftField.value = datumLeft;

leftField.onchange = () => {
	datumLeft = Number(leftField.value);
	updateCulvert();

}

document.body.appendChild(leftDatumTitle);
document.body.appendChild(leftField);

let rightDatumTitle = document.createElement("label");
rightDatumTitle.value = "Datum left:";

let rightField = document.createElement("input");
rightField.value = datumRight;
rightField.onchange = () => {
	datumRight = Number(rightField.value);
	updateCulvert();

}

document.body.appendChild(rightDatumTitle);
document.body.appendChild(rightField);

updateCulvert();