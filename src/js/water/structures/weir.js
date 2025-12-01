

function equalsCoefficient(coefficient, value) {
	return Math.abs(coefficient - value) < 0.001;
}


function drawWeirSharp(ctx, x, width, height) {

	const halfWidth = width / 2;


	ctx.beginPath();
	ctx.moveTo(x - halfWidth, ctx.canvas.height);
	ctx.lineTo(x + halfWidth, ctx.canvas.height);
	ctx.lineTo(x + halfWidth, ctx.canvas.height - height + width);
	ctx.lineTo(x - halfWidth, ctx.canvas.height - height);
	ctx.closePath();

	ctx.fill();
	ctx.stroke();
}

function drawWeirBroadRounded(ctx, x, width, height) {

	let radius = width / 4;
	const halfWidth = width / 2;


	ctx.beginPath();
	ctx.moveTo(x - halfWidth, ctx.canvas.height);
	ctx.lineTo(x + halfWidth, ctx.canvas.height);
	ctx.lineTo(x + halfWidth, ctx.canvas.height - height + radius);

	ctx.arc(x + halfWidth - radius, ctx.canvas.height - height + radius, radius, 0, 1.5 * Math.PI, true);
	ctx.lineTo(x - halfWidth + radius, ctx.canvas.height - height);

	ctx.arc(x - halfWidth + radius, ctx.canvas.height - height + radius, radius, 1.5 * Math.PI, Math.PI, true);
	ctx.lineTo(x - halfWidth, ctx.canvas.height);

	ctx.closePath();

	ctx.fill();
	ctx.stroke();

}

function drawWeirBroadPerpendicular(ctx, x, width, height) {

	const halfWidth = width / 2;

	ctx.beginPath();
	ctx.moveTo(x - halfWidth, ctx.canvas.height);
	ctx.lineTo(x + halfWidth, ctx.canvas.height);
	ctx.lineTo(x + halfWidth, ctx.canvas.height - height);
	ctx.lineTo(x - halfWidth, ctx.canvas.height - height);
	ctx.closePath();


	ctx.fill();
	ctx.stroke();
}

function drawWeirRounded(ctx, x, width, height) {

	let radius = width / 4;
	const halfWidth = width / 2;


	ctx.beginPath();

	ctx.moveTo(x + halfWidth, ctx.canvas.height);
	ctx.lineTo(x - halfWidth, ctx.canvas.height);
	ctx.lineTo(x - halfWidth, ctx.canvas.height - height + radius);
	ctx.arc(x - halfWidth + radius, ctx.canvas.height - height + radius, radius, Math.PI, 1.65 * Math.PI, false);

	ctx.lineTo(x + halfWidth, ctx.canvas.height - height + radius);
	ctx.closePath();

	ctx.fill();
	ctx.stroke();
}

function drawWeirRoundedRoof(ctx, x, width, height) {

	const halfWidth = width / 2;

	let xOffset = width / 4;
	let yOffset = width / 3;
	let controlLeft = x - halfWidth + xOffset;
	let controlRight = x + halfWidth - xOffset;

	ctx.beginPath();

	ctx.moveTo(x - halfWidth, ctx.canvas.height - height + yOffset);
	ctx.quadraticCurveTo(controlLeft, ctx.canvas.height - height, x, ctx.canvas.height - height);
	ctx.quadraticCurveTo(controlRight, ctx.canvas.height - height, x + halfWidth, ctx.canvas.height - height + yOffset);

	ctx.lineTo(x + halfWidth, ctx.canvas.height);
	ctx.lineTo(x - halfWidth, ctx.canvas.height);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
}

function drawWeirCustom(ctx, x, width, height) {

	let radius = width / 4;
	const halfWidth = width / 2;

	ctx.beginPath();
	ctx.moveTo(x - halfWidth, ctx.canvas.height);
	ctx.lineTo(x + halfWidth, ctx.canvas.height);
	ctx.lineTo(x + halfWidth, ctx.canvas.height - height + radius);

	ctx.arc(x + halfWidth - radius, ctx.canvas.height - height + radius, radius, 0, 1.5 * Math.PI, true);
	ctx.lineTo(x - halfWidth + radius, ctx.canvas.height - height);

	ctx.arc(x - halfWidth + radius, ctx.canvas.height - height + radius, radius, 1.5 * Math.PI, Math.PI, true);
	ctx.lineTo(x - halfWidth, ctx.canvas.height);

	ctx.closePath();

	ctx.fill();
	ctx.stroke();

	ctx.font = "48px serif";
	ctx.fillStyle = "black";
	ctx.fillText("?", x - halfWidth / 2, ctx.canvas.height - height + halfWidth);
}


function drawWeirFrontVShape(ctx, weirWidth, weirHeight, weirDamWidth, weirDamHeight) {

}

function drawWeirFrontUShape(ctx, weirWidth, weirHeight, weirDamWidth, weirDamHeight) {

}

function drawWeirSideShape(ctx, x, weirThickness, height, coefficient) {

	ctx.fillStyle = getWeirGradient(ctx);
	ctx.strokeStyle = "black";

	if (equalsCoefficient(coefficient, 0.865)) {
		drawWeirBroadPerpendicular(ctx, x, weirThickness, height);

	} else if (equalsCoefficient(coefficient, 0.91)) {
		drawWeirBroadRounded(ctx, x, weirThickness, height);

	} else if (equalsCoefficient(coefficient, 1.1)) {
		drawWeirSharp(ctx, x, weirThickness, height);

	} else if (equalsCoefficient(coefficient, 1.3)) {
		drawWeirRounded(ctx, x, weirThickness, height);

	} else if (equalsCoefficient(coefficient, 1.37)) {
		drawWeirRoundedRoof(ctx, x, weirThickness, height);

	} else {
		drawWeirCustom(ctx, x, weirThickness, height);
	}
}

function drawWeirSideWaterLevels(ctx, weirThickness, baseHeight, multiplier, datumLeft, datumRight, minDatum) {

	let startX = 0;
	let startY = ctx.canvas.height - (baseHeight + multiplier * (datumLeft - minDatum));
	let drawWidth = ctx.canvas.width / 2 - weirThickness / 2;

	ctx.fillStyle = getWaterGradient(ctx, startY);
	ctx.fillRect(startX, startY, drawWidth, ctx.canvas.height);

	startX = ctx.canvas.width / 2 - weirThickness / 2
	startY = ctx.canvas.height - (baseHeight + multiplier * (datumRight - minDatum));

	ctx.fillStyle = getWaterGradient(ctx, startY);
	ctx.fillRect(startX, startY, drawWidth, ctx.canvas.height);
}

function getMinDatumWeir(weirHeights, datumsLeft, datumsRight) {
	let minWeirHeights = Array.isArray(weirHeights) ? Math.min.apply(Math, weirHeights) : weirHeights;
	let minDatumLeft = Array.isArray(datumsLeft) ? Math.min.apply(Math, datumsLeft) : datumsLeft;
	let minDatumRight = Array.isArray(datumsRight) ? Math.min.apply(Math, datumsRight) : datumsRight;

	let minDatum = Math.min(minDatumLeft, minDatumRight, minWeirHeights);
	return minDatum;
}


function getMaxDatumWeir(weirHeights, datumsLeft, datumsRight, weirDamHeight) {

	let maxWeirHeight = Array.isArray(weirHeights) ? Math.max.apply(Math, weirHeights) : weirHeights;
	let maxDatumLeft = Array.isArray(datumsLeft) ? Math.max.apply(Math, datumsLeft) : datumsLeft;
	let maxDatumRight = Array.isArray(datumsRight) ? Math.max.apply(Math, datumsRight) : datumsRight;

	let maxDatum = Math.max(maxDatumLeft, maxDatumRight, maxWeirHeight, weirDamHeight);
	return maxDatum;
}

function clearWeirContext(ctx) {
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawWeirSideDam(ctx, x, width, height) {

	ctx.fillStyle = getWeirDamGradient(ctx);
	ctx.strokeStyle = "black";
	drawWeirBroadPerpendicular(ctx, x, width, height);
}

export function drawWeirSide(canvas, index, weirHeights, datumsLeft, datumsRight, damHeight, flows, coefficient) {

	if (!canvas || canvas.nodeName != "CANVAS") {
		return;
	}

	const ctx = canvas.getContext("2d");
	clearWeirContext(ctx);

	let minDatum = getMinDatumWeir(weirHeights, datumsLeft, datumsRight, damHeight);
	let maxDatum = getMaxDatumWeir(weirHeights, datumsLeft, datumsRight, damHeight);

	let range = maxDatum - minDatum;

	let datumLeft = Array.isArray(datumsLeft) ? datumsLeft[index] : datumsLeft;
	let datumRight = Array.isArray(datumsRight) ? datumsRight[index] : datumsRight;
	let weirHeight = Array.isArray(weirHeights) ? weirHeights[index] : weirHeights;

	if (range <= 0) {
		return;
	}

	let weirThickness = canvas.width / 8;
	let baseHeight = canvas.height / 8;
	let multiplier = (canvas.height - baseHeight) / range;


	let damHeightInCanvas = (baseHeight + multiplier * (damHeight - minDatum));
	drawWeirSideDam(ctx, canvas.width / 2, weirThickness, damHeightInCanvas)

	drawWeirSideWaterLevels(ctx, weirThickness, baseHeight, multiplier, datumLeft, datumRight, minDatum);

	let heightInCanvas = (baseHeight + multiplier * (weirHeight - minDatum));
	drawWeirSideShape(ctx, canvas.width / 2, weirThickness, heightInCanvas, coefficient);

}

function getWaterGradient(ctx, startY) {

	let rangeY = 100;
	let waterGradient = ctx.createLinearGradient(0, startY, 0, startY + rangeY);

	waterGradient.addColorStop(0, "rgb(0 255 255");
	waterGradient.addColorStop(1, "rgb(0 0 255");
	return waterGradient;
}

function drawFrontWaterLevel(ctx, waterLevel, minDatum, baseHeight, multiplier) {

	let startY = ctx.canvas.height - (baseHeight + multiplier * (waterLevel - minDatum));

	ctx.fillStyle = getWaterGradient(ctx, startY);
	ctx.fillRect(0, startY, ctx.canvas.width, ctx.canvas.height);
}

function getWeirGradient(ctx) {
	const weirGradient = ctx.createLinearGradient(0, 0, 0, 10);
	weirGradient.addColorStop(0, "#c7cdd8");
	weirGradient.addColorStop(1, "#cdb59f");
	return weirGradient;
}

function getWeirDamGradient(ctx) {
	const weirGradient = ctx.createLinearGradient(0, 0, 0, 10);
	weirGradient.addColorStop(0, "#e7ede8");
	weirGradient.addColorStop(1, "#ede5ef");
	return weirGradient;
}


function drawFrontWeirDam(ctx, weirWidth, weirDamWidth, weirHeight, weirDamHeight, baseHeight, minDatum, heightMultiplier, weirN) {


	let canvas = ctx.canvas;

	let widthMultiplier = canvas.width / weirDamWidth;

	let weirLeftX = canvas.width / 2 - weirWidth / 2 * widthMultiplier;
	let weirRightX = canvas.width / 2 + weirWidth / 2 * widthMultiplier;

	let weirTopY = canvas.height - (baseHeight + heightMultiplier * (weirDamHeight - minDatum));
	let weirBottomY = canvas.height - (baseHeight + heightMultiplier * (weirHeight - minDatum));

	ctx.beginPath();
	//Set start-point
	ctx.moveTo(0, canvas.height);
	// Set sub-points
	ctx.lineTo(0, weirTopY);
	ctx.lineTo(weirLeftX, weirTopY);

	if (equalsCoefficient(weirN, 5 / 3)) {

	} else {
		ctx.lineTo(weirLeftX, weirBottomY);
		ctx.lineTo(weirRightX, weirBottomY);
	}


	ctx.lineTo(weirRightX, weirTopY);
	ctx.lineTo(canvas.width, weirTopY);
	ctx.lineTo(canvas.width, canvas.height);
	ctx.closePath();
	ctx.fillStyle = getWeirGradient(ctx);
	ctx.fill();
	ctx.stroke();
}

export function drawWeirFront(canvas, index, weirHeights, datumsLeft, datumsRight, weirWidth, weirDamWidth, weirDamHeight, flows, weirN) {
	if (!canvas || canvas.nodeName != "CANVAS") {
		return;
	}

	const ctx = canvas.getContext("2d");
	clearWeirContext(ctx);

	let minDatum = getMinDatumWeir(weirHeights, datumsLeft, datumsRight, weirDamHeight);
	let maxDatum = getMaxDatumWeir(weirHeights, datumsLeft, datumsRight, weirDamHeight);

	let range = maxDatum - minDatum;

	let datumLeft = Array.isArray(datumsLeft) ? datumsLeft[index] : datumsLeft;
	let datumRight = Array.isArray(datumsRight) ? datumsRight[index] : datumsRight;
	let weirHeight = Array.isArray(weirHeights) ? weirHeights[index] : weirHeights;

	let baseHeight = canvas.height / 8;
	let multiplier = (canvas.height - baseHeight) / range;

	let largestWaterLevel = datumLeft < datumRight ? datumRight : datumLeft;
	let smallestWaterLevel = datumLeft < datumRight ? datumLeft : datumRight;

	drawFrontWaterLevel(ctx, largestWaterLevel, minDatum, baseHeight, multiplier);

	drawFrontWeirDam(ctx, weirWidth, weirDamWidth, weirHeight, weirDamHeight, baseHeight, minDatum, multiplier, weirN);

	drawFrontWaterLevel(ctx, smallestWaterLevel, minDatum, baseHeight, multiplier);

}
