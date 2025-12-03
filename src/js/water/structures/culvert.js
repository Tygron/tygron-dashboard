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
	let waterWidth = canvas.width / 4;
	let envelopeHeight = 40;
	let culvertGradient = ctx.createLinearGradient(0,100, 0,140);
		culvertGradient.addColorStop(0, "#dedede");
		culvertGradient.addColorStop(1, "#4a4a4a");
	let envelopeGradient = ctx.createLinearGradient(0,envelopeHeight, 0,150);
		envelopeGradient.addColorStop(0, "#b3aba1");
		envelopeGradient.addColorStop(1, "#59493c");
	//left water body
	ctx.fillStyle = getWaterGradient(ctx, waterHeight);
	ctx.fillRect(0, waterHeight, waterWidth, canvas.height);
	//right water body
	ctx.fillStyle = getWaterGradient(ctx, waterHeight);
	ctx.fillRect(200, waterHeight, waterWidth, canvas.height);
	//Draw culvert envelope
	ctx.fillStyle = envelopeGradient;
	ctx.fillRect(waterWidth, envelopeHeight, canvas.width / 2.4, canvas.height);
	ctx.strokeRect(waterWidth, envelopeHeight, canvas.width / 2.4, canvas.height);
	ctx.stroke();
	//draw left culvert shape
	ctx.beginPath();
	ctx.moveTo(40,100);
	ctx.lineTo(140,100);
	ctx.lineTo(130,110);
	ctx.lineTo(140,120);
	ctx.lineTo(130,130);
	ctx.lineTo(140,140);
	ctx.lineTo(40,140);
	ctx.lineTo(40,100);
	ctx.fillStyle = culvertGradient;
	ctx.fill();
	//draw right culvert shape
	ctx.beginPath();
	ctx.moveTo(150,100);
	ctx.lineTo(240,100);
	ctx.lineTo(240,140);
	ctx.lineTo(150,140);
	ctx.lineTo(140,130);
	ctx.lineTo(150,120);
	ctx.lineTo(140,110);
	ctx.lineTo(150,100);
	ctx.fillStyle = culvertGradient;
	ctx.fill();
	//draw left break line
	ctx.beginPath();
	ctx.moveTo(130,90);
	ctx.lineTo(140,100);
	ctx.lineTo(130,110);
	ctx.lineTo(140,120);
	ctx.lineTo(130,130);
	ctx.lineTo(140,140);
	ctx.lineTo(130,150);
	ctx.stroke();
	//draw left break line
	ctx.beginPath();
	ctx.moveTo(140,90);
	ctx.lineTo(150,100);
	ctx.lineTo(140,110);
	ctx.lineTo(150,120);
	ctx.lineTo(140,130);
	ctx.lineTo(150,140);
	ctx.lineTo(140,150);
	ctx.stroke();
	
	
}