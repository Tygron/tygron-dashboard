

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

function drawWeirFrontShape(ctx, weirWidth, weirHeight, weirDamWidth, weirDamHeight, weirN) {

	ctx.fillStyle = "#cdb59f";
	ctx.strokeStyle = "black";

	if (equalsCoefficient(weirN, 5 / 3)) {
		drawWeirFrontVShape(ctx, weirWidth, weirHeight, weirDamWidth, weirDamHeight);

	} else {
		drawWeirFrontUShape(ctx, weirWidth, weirHeight, weirDamWidth, weirDamHeight);
	}
}

function drawWeirSideShape(ctx, x, weirThickness, height, coefficient) {

	ctx.fillStyle = "#cdb59f";
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

	let canvasWidth = ctx.canvas.width;
	let canvasHeight = ctx.canvas.height;

	ctx.fillStyle = 'cyan';
	ctx.beginPath();
	ctx.moveTo(0 * canvasWidth / 2, canvasHeight);
	ctx.lineTo(1 * canvasWidth / 2 - weirThickness / 2, canvasHeight);
	ctx.lineTo(1 * canvasWidth / 2 - weirThickness / 2, canvasHeight - (baseHeight + multiplier * (datumLeft - minDatum)));
	ctx.lineTo(0 * canvasWidth / 2, canvasHeight - (baseHeight + multiplier * (datumLeft - minDatum)));
	ctx.closePath();
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(1 * canvasWidth / 2 + weirThickness / 2, canvasHeight);
	ctx.lineTo(2 * canvasWidth / 2, canvasHeight);
	ctx.lineTo(2 * canvasWidth / 2, canvasHeight - (baseHeight + multiplier * (datumRight - minDatum)));
	ctx.lineTo(1 * canvasWidth / 2 + weirThickness / 2, canvasHeight - (baseHeight + multiplier * (datumRight - minDatum)));
	ctx.closePath();
	ctx.fill();
}

function getMinDatumWeir(weirHeights, datumsLeft, datumsRight) {
	let minWeirHeights = Array.isArray(weirHeights) ? Math.min.apply(Math, weirHeights) : weirHeights;
	let minDatumLeft = Array.isArray(datumsLeft) ? Math.min.apply(Math, datumsLeft) : datumsLeft;
	let minDatumRight = Array.isArray(datumsRight) ? Math.min.apply(Math, datumsRight) : datumsRight;

	let minDatum = Math.min(minDatumLeft, minDatumRight, minWeirHeights);
	return minDatum;
}


function getMaxDatumWeir(weirHeights, datumsLeft, datumsRight) {

	let maxWeirHeights = Array.isArray(weirHeights) ? Math.max.apply(Math, weirHeights) : weirHeights;
	let maxDatumLeft = Array.isArray(datumsLeft) ? Math.max.apply(Math, datumsLeft) : datumsLeft;
	let maxDatumRight = Array.isArray(datumsRight) ? Math.max.apply(Math, datumsRight) : datumsRight;

	let maxDatum = Math.max(maxDatumLeft, maxDatumRight, maxWeirHeights);
	return maxDatum;
}

function clearWeirContext(ctx) {
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function drawWeirSide(canvas, index, weirHeights, datumsLeft, datumsRight, flows, coefficient) {

	if (!canvas || canvas.nodeName != "CANVAS") {
		return;
	}

	const ctx = canvas.getContext("2d");
	clearWeirContext(ctx);

	let minDatum = getMinDatumWeir(weirHeights, datumsLeft, datumsRight);
	let maxDatum = getMaxDatumWeir(weirHeights, datumsLeft, datumsRight);

	let range = maxDatum - minDatum;
	let canvasWidth = ctx.canvas.width;
	let canvasHeight = ctx.canvas.height;

	let datumLeft = Array.isArray(datumsLeft) ? datumsLeft[index] : datumsLeft;
	let datumRight = Array.isArray(datumsRight) ? datumsRight[index] : datumsRight;
	let weirHeight = Array.isArray(weirHeights) ? weirHeights[index] : weirHeights;



	if (range <= 0) {
		return;
	}

	let weirThickness = canvasWidth / 8;
	let baseHeight = canvasHeight / 8;
	let multiplier = (canvasHeight - baseHeight) / range;


	drawWeirSideWaterLevels(ctx, weirThickness, baseHeight, multiplier, datumLeft, datumRight, minDatum);

	let heightInCanvas = (baseHeight + multiplier * (weirHeight - minDatum));
	drawWeirSideShape(ctx, canvasWidth / 2, weirThickness, heightInCanvas, coefficient);

}

export function drawWeirFront(canvas, index, weirHeights, datumsLeft, datumsRight, weirWidth, weirDamWidth, weirDamHeight, flows, weirN) {
	if (!canvas || canvas.nodeName != "CANVAS") {
		return;
	}

	const ctx = canvas.getContext("2d");

	let minDatum = getMinDatumWeir(weirHeights, datumsLeft, datumsRight);
	let maxDatum = getMaxDatumWeir(weirHeights, datumsLeft, datumsRight);

	let range = maxDatum - minDatum;

	let datumLeft = Array.isArray(datumsLeft) ? datumsLeft[index] : datumsLeft;
	let datumRight = Array.isArray(datumsRight) ? datumsRight[index] : datumsRight;
	let weirHeight = Array.isArray(weirHeights) ? weirHeights[index] : weirHeights;

	//TODO: (@ArtistTygron) Implement front view 

	let damHeightLeftX = canvas.width / 3;
	let damHeightLeftY = canvas.height / 3;
	let weirHeightLeftX = canvas.width / 3;
	let weirHeightLeftY = canvas.height /1.5;
	let weirHeightRightX = canvas.width / 1.5;
	let weirHeightRightY = canvas.height /1.5;
	let damHeightRightX = canvas.width / 1.5;
	let damHeightRightY = canvas.height / 3;
	let waterLevel1 = 85;
	let waterLevel2 = canvas.height - 40;
	
	const gradWater=ctx.createLinearGradient(0,0, 0,300);
	gradWater.addColorStop(0, "lightblue");
	gradWater.addColorStop(1, "darkblue"); 
	
	const gradWeir=ctx.createLinearGradient(0,0, 0,300);
	gradWeir.addColorStop(0, "#c7cdd8");
	gradWeir.addColorStop(1, "#9faab7"); 
	
	ctx.fillStyle = gradWater;
	ctx.fillRect(0,waterLevel1, canvas.width,canvas.height);
	
	
	
	ctx.beginPath();
	//Set start-point
	ctx.moveTo(0, damHeightLeftY);
	// Set sub-points
	ctx.lineTo(damHeightLeftX, damHeightLeftY);
	ctx.lineTo(weirHeightLeftX, weirHeightLeftY);
	ctx.lineTo(weirHeightRightX, weirHeightRightY);
	ctx.lineTo(damHeightRightX, damHeightRightY);
	ctx.lineTo(300, damHeightLeftY);
	ctx.lineTo(300, 150);
	ctx.lineTo(0, 150);
	// Set end-point
	ctx.lineTo(0, 70);
	ctx.closePath();
	ctx.fillStyle = gradWeir;
	ctx.fill();
	ctx.stroke();

	ctx.fillStyle = gradWater;
	ctx.fillRect(0,waterLevel2, canvas.width,canvas.height);


	let baseHeight = canvas.height / 8;
	let heightMultiplier = (canvas.height - baseHeight) / range;

	let datumMin = Math.min(datumLeft, datumRight);
	let datumMax = Math.max(datumLeft, datumRight);

	// drawWeirFrontMaxLevel : solid, using datumMax

	drawWeirFrontShape(ctx, weirWidth, weirHeight, weirDamWidth, weirDamHeight, weirN);

	// drawWeirFrontMinLevel : dashed, using datumMin
}
