import { visualizeWeir } from "../../src/js/water/structures/weir.js";

let weirHeight = 1.5;
let weirDatumLeft = 2.6;
let weirDatumRight = 0.4;
let flow = 1.0;
let coefficient = 1.1;//sharp


//coefficient = 0.865; //broad perpendicular
//coefficient = 0.91; // board rounded
//coefficient = 1.3; // rounded
//coefficient = 1.37; //rounded roof
//coefficient = 1.23; // custom

let coefficients = [1.1, 0.865, 0.91, 1.3, 1.37, 1.23];
let names = ["sharp", "broad perpendicular","broad rounded", "rounded", "rounded roof", "custom"];


for (let i = 0; i < coefficients.length; i++) {
	let button = document.createElement("button");
	const index = i;
	button.onclick = () =>
		visualizeWeir(canvas, weirHeight, weirDatumLeft, weirDatumRight, flow, coefficients[index]);
	
	button.innerHTML = names[i];
	
	document.body.appendChild(button);

}

let canvas = document.getElementById("weirCanvas");
visualizeWeir(canvas, weirHeight, weirDatumLeft, weirDatumRight, flow, coefficient);