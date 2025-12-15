import { getWaterGradient } from "./WeirPlot.js";

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

function leftWaterBody(ctx, waterWidth, baseHeight, multiplier, datumLeft, minDatum) {


	let leftX = 0;
	let topY = ctx.canvas.height - (baseHeight + multiplier * (datumLeft - minDatum));

	ctx.fillStyle = getWaterGradient(ctx, topY);
	ctx.fillRect(leftX, topY, waterWidth, ctx.canvas.height);
}

function rightWaterBody(ctx, waterWidth, baseHeight, multiplier, datumRight, minDatum) {


	let leftX = ctx.canvas.width - waterWidth;
	let topY = ctx.canvas.height - (baseHeight + multiplier * (datumRight - minDatum));

	ctx.fillStyle = getWaterGradient(ctx, topY);
	ctx.fillRect(leftX, topY, waterWidth, ctx.canvas.height);
}

function drawCulvert(ctx, baseHeight, multiplier, culvertHeight) {

	let length = ctx.canvas.width * 4 / 6;
	let leftX = ctx.canvas.width / 6;
	let height = multiplier * culvertHeight;

	let topY = ctx.canvas.height - baseHeight - height;

	let culvertGradient = ctx.createLinearGradient(0, topY, 0, topY + 40);
	culvertGradient.addColorStop(0, "#dedede");
	culvertGradient.addColorStop(1, "#4a4a4a");

	ctx.beginPath();
	ctx.rect(leftX, topY, length, height);
	ctx.closePath();

	ctx.fillStyle = culvertGradient;
	ctx.fill();
	ctx.lineWidth = 1;
	ctx.strokeStyle = "black";
	ctx.stroke();
}


function drawBreakSectionDashed(ctx, midX, topY, terrainGradient) {

	let stepX = 10;
	let marginY = 10;	
	ctx.fillStyle = terrainGradient;
	for(let x = midX-stepX; x <= midX+stepX; x++){
		if(x%4==0){
			ctx.fillRect(x, topY-marginY, 2, ctx.canvas.height-marginY);
		}
	}
	
}

function drawBreakSection(ctx, midX, topY, terrainGradient) {

	let stepX = 10;
	let stepY = 10;
	topY-=stepY;
	let leftX = midX - stepX;
	let rightX = leftX + 2 * stepX;
	for (let fill of [true, false]) {
		let x = leftX;
		let y = topY-10/2;
		ctx.beginPath();
		ctx.moveTo(x, y);

		while (y < ctx.canvas.height - stepY) {
			x = x == leftX ? x + stepX : x - stepX;
			y += stepY;
			ctx.lineTo(x, y);
		}


		x = x == leftX ? rightX : rightX + stepX;
		if (fill) {
			ctx.lineTo(x, y);
		} else {
			ctx.moveTo(x, y);
		}

		while (y > topY) {
			x = x == rightX ? x + stepX : x - stepX;
			y -= stepY;
			ctx.lineTo(x, y);
		}
		if (fill) {
			ctx.closePath();
			ctx.fillStyle = terrainGradient;
			ctx.fill();
		} else {
			ctx.lineWidth = 1;
			ctx.strokeStyle = "black";
			ctx.stroke();
		}
	}
}

function getTerrainGradient(ctx, y) {
	let envelopeGradient = ctx.createLinearGradient(0, y, 0, y + 150);
	envelopeGradient.addColorStop(0, "#b3aba1");
	envelopeGradient.addColorStop(1, "#59493c");
	return envelopeGradient;
}

function drawTerrainBox(ctx, x, y, width, height) {

	ctx.fillStyle = getTerrainGradient(ctx, y);
	ctx.fillRect(x, y, width, height);
	ctx.lineWidth = 1;
	ctx.strokeRect(x, y, width, height);
}

function drawCulvertCircle(ctx, CentrePointX, CentrePointY, Radius, Circle) {
	ctx.beginPath();
	ctx.arc(CentrePointX, CentrePointY, Radius, 0, Circle);
	ctx.fillStyle = "grey";
	ctx.fill();
	ctx.lineWidth = 6;
	ctx.stroke();
}

function drawHighWaterLevel(ctx, y, width, height) {
	ctx.rect(0, y, width, height);
	ctx.fillStyle = getWaterGradient(ctx, height);
	ctx.fill();
}

function drawLowWaterLevel(ctx, y, width, height) {
	ctx.fillStyle = getWaterGradient(ctx, height);
	ctx.fillRect(0, y, width, height);
}

export function drawCulvertFront(canvas, index, culvertDatums, datumsLeft, datumsRight, culvertWidth, culvertHeight, culvertLength, culvertN) {
	if (!canvas || canvas.nodeName != "CANVAS") {
		return;
	}

	const ctx = canvas.getContext("2d");
	clearWeirContext(ctx);

	let minDatum = getMinDatumCulvert(culvertDatums, datumsLeft, datumsRight);
	let maxDatum = getMaxDatumCulvert(culvertDatums, datumsLeft, datumsRight, culvertHeight);

	let range = maxDatum - minDatum;

	let datumLeft = Array.isArray(datumsLeft) ? datumsLeft[index] : datumsLeft;
	let datumRight = Array.isArray(datumsRight) ? datumsRight[index] : datumsRight;
	let culvertDatum = Array.isArray(culvertDatums) ? culvertDatums[index] : culvertDatums;

	let baseHeight = canvas.height / 8;
	let heightMultiplier = (canvas.height - baseHeight) / range;

	//TODO: @Artist Please add draw functions
	let culvertFrontCentrePointX = ctx.canvas.width / 2;
	let culvertFrontCentrePointY = 120;
	let culvertFrontCircle = 2 * Math.PI;
	let culvertFrontRadius = 20;
	let terrainHeight = 40;
	let terrainWidth = canvas.width / 3;
	let waterWidth = canvas.width;
	let highWaterHeight = canvas.height / 2;
	let waterLevelLow = canvas.height / 1.2;
	let waterLevelHigh = canvas.height - 90

	drawHighWaterLevel(ctx, highWaterHeight, waterWidth, highWaterHeight);

	drawTerrainBox(ctx, terrainWidth, terrainHeight, terrainWidth, ctx.canvas.height);

	drawCulvertCircle(ctx, culvertFrontCentrePointX, culvertFrontCentrePointY, culvertFrontRadius, culvertFrontCircle);

	drawLowWaterLevel(ctx, waterLevelLow, waterWidth, waterLevelLow);

}

export function drawCulvertSide(canvas, index, culvertDatums, datumsLeft, datumsRight, culvertDiameter, culvertRectangleHeight, elevationLeft, elevationRight) {
	if (!canvas || canvas.nodeName != "CANVAS") {
		return;
	}

	const ctx = canvas.getContext("2d");
	clearWeirContext(ctx);

	let culvertHeight = culvertRectangleHeight > 0 ? culvertRectangleHeight : culvertDiameter;


	let datumLeft = Array.isArray(datumsLeft) ? datumsLeft[index] : datumsLeft;
	let datumRight = Array.isArray(datumsRight) ? datumsRight[index] : datumsRight;
	let culvertDatum = Array.isArray(culvertDatums) ? culvertDatums[index] : culvertDatums;


	let minDatum = getMinDatumCulvert(culvertDatums, datumsLeft, datumsRight);
	let maxDatum = getMaxDatumCulvert(culvertDatums, datumsLeft, datumsRight, culvertDatum + culvertHeight);

	let range = maxDatum - minDatum;
	
	
	let baseHeight = canvas.height / 8;
	let heightMultiplier = (canvas.height - baseHeight) / range;

	let waterWidth = canvas.width / 4;
	let terrainWidth = canvas.width - 2 * waterWidth;
	let terrainTopY = baseHeight;

	leftWaterBody(ctx, waterWidth, baseHeight, heightMultiplier, datumLeft, minDatum);

	rightWaterBody(ctx, waterWidth, baseHeight, heightMultiplier, datumRight, minDatum);

	drawTerrainBox(ctx, waterWidth, terrainTopY, terrainWidth, canvas.height);

	drawCulvert(ctx, baseHeight, heightMultiplier, culvertHeight);

	let culvertTopY = ctx.canvas.height - baseHeight - heightMultiplier * culvertHeight;
	
	drawBreakSection(ctx, ctx.canvas.width / 2, culvertTopY, getTerrainGradient(ctx, terrainTopY));


}