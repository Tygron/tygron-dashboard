import {getWaterGradient} from "./weir.js";

function getMinDatumCulvert(culvertDatums, datumsLeft, datumsRight) {
	let minCulvertDatum = Array.isArray(culvertDatums) ? Math.min.apply(Math, culvertDatums) : culvertDatums;
	let minDatumLeft = Array.isArray(datumsLeft) ? Math.min.apply(Math, datumsLeft) : datumsLeft;
	let minDatumRight = Array.isArray(datumsRight) ? Math.min.apply(Math, datumsRight) : datumsRight;

	let minDatum = Math.min(minDatumLeft, minDatumRight, minCulvertDatum);
	return minDatum;
}


function getMaxDatumCulvert(culvertDatums, datumsLeft, datumsRight, culvertHeight) {

	let maxCulvertDatum = Array.isArray(culvertDatums) ? Math.max.apply(Math, culvertDatums) : culvertDatums;
	let maxDatumLeft = Array.isArray(datumsLeft) ? Math.max.apply(Math, datumsLeft) : datumsLeft;
	let maxDatumRight = Array.isArray(datumsRight) ? Math.max.apply(Math, datumsRight) : datumsRight;

	let maxDatum = Math.max(maxDatumLeft, maxDatumRight, maxCulvertDatum + culvertHeight);
	return maxDatum;
}



export function drawCulvertFront(canvas, index, culvertDatums, datumsLeft, datumsRight, culvertWidth, culvertHeight, culvertLength, culvertN) {
	if (!canvas || canvas.nodeName != "CANVAS") {
		return;
	}

	const ctx = canvas.getContext("2d");
	clearWeirContext(ctx);

	let minDatum = getMinDatumCulvert(culvertDatums, datumsLeft, datumsRight);
	let maxDatum = getMaxDatumCulvert(culvertDatums, datumsLeft, datumsRight,culvertHeight);

	let range = maxDatum - minDatum;

	let datumLeft = Array.isArray(datumsLeft) ? datumsLeft[index] : datumsLeft;
	let datumRight = Array.isArray(datumsRight) ? datumsRight[index] : datumsRight;
	let culvertDatum = Array.isArray(culvertDatums) ? culvertDatums[index] : culvertDatums;

	let baseHeight = canvas.height / 8;
	let heightMultiplier = (canvas.height - baseHeight) / range;
	
	//TODO: @Artist Please add draw functions
}

export function drawCulvertSide(canvas, index, culvertDatums, datumsLeft, datumsRight, culvertWidth, culvertHeight, culvertLength, culvertN) {
	if (!canvas || canvas.nodeName != "CANVAS") {
		return;
	}
	
	const ctx = canvas.getContext("2d");
	clearWeirContext(ctx);
	
	
	let minDatum = getMinDatumCulvert(culvertDatums, datumsLeft, datumsRight);
	let maxDatum = getMaxDatumCulvert(culvertDatums, datumsLeft, datumsRight,culvertHeight);

	let range = maxDatum - minDatum;

	let datumLeft = Array.isArray(datumsLeft) ? datumsLeft[index] : datumsLeft;
	let datumRight = Array.isArray(datumsRight) ? datumsRight[index] : datumsRight;
	let culvertDatum = Array.isArray(culvertDatums) ? culvertDatums[index] : culvertDatums;

	let baseHeight = canvas.height / 8;
	let heightMultiplier = (canvas.height - baseHeight) / range;
	

	//TODO: @Artist Please add draw functions
	let waterHeight = 50;
	let waterWidth = canvas.width / 8;
	ctx.fillStyle = getWaterGradient(ctx, waterHeight);
	ctx.fillRect(0, waterHeight, waterWidth, canvas.height);
	
}