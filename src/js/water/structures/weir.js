

function equalsCoefficient(coefficient, value) {
	return Math.abs(coefficient - value) < 0.001;
}


function drawWeirSharp(canvas, x, width, height) {

	const ctx = canvas.getContext("2d");
	const halfWidth = width / 2;


	ctx.beginPath();
	ctx.moveTo(x - halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height - height + width);
	ctx.lineTo(x - halfWidth, canvas.height - height);
	ctx.closePath();

	ctx.fill();
	ctx.stroke();
}

function drawWeirBroadRounded(canvas, x, width, height) {

	const ctx = canvas.getContext("2d");
	let radius = width / 4;
	const halfWidth = width / 2;


	ctx.beginPath();
	ctx.moveTo(x - halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height - height + radius);

	ctx.arc(x + halfWidth - radius, canvas.height - height + radius, radius, 0, 1.5 * Math.PI, true);
	ctx.lineTo(x - halfWidth + radius, canvas.height - height);

	ctx.arc(x - halfWidth + radius, canvas.height - height + radius, radius, 1.5 * Math.PI, Math.PI, true);
	ctx.lineTo(x - halfWidth, canvas.height);

	ctx.closePath();

	ctx.fill();
	ctx.stroke();

}

function drawWeirBroadPerpendicular(canvas, x, width, height) {
	const ctx = canvas.getContext("2d");
	const halfWidth = width / 2;

	ctx.beginPath();
	ctx.moveTo(x - halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height - height);
	ctx.lineTo(x - halfWidth, canvas.height - height);
	ctx.closePath();


	ctx.fill();
	ctx.stroke();
}

function drawWeirRounded(canvas, x, width, height) {
	const ctx = canvas.getContext("2d");
	let radius = width / 4;
	const halfWidth = width / 2;


	ctx.beginPath();

	ctx.moveTo(x + halfWidth, canvas.height);
	ctx.lineTo(x - halfWidth, canvas.height);
	ctx.lineTo(x - halfWidth, canvas.height - height + radius);
	ctx.arc(x - halfWidth + radius, canvas.height - height + radius, radius, Math.PI, 1.65 * Math.PI, false);

	ctx.lineTo(x + halfWidth, canvas.height - height + radius);
	ctx.closePath();

	ctx.fill();
	ctx.stroke();
}

function drawWeirRoundedRoof(canvas, x, width, height) {

	const ctx = canvas.getContext("2d");
	const halfWidth = width / 2;

	let xOffset = width / 4;
	let yOffset = width / 3;
	let controlLeft = x - halfWidth + xOffset;
	let controlRight = x + halfWidth - xOffset;

	ctx.beginPath();

	ctx.moveTo(x - halfWidth, canvas.height - height + yOffset);
	ctx.quadraticCurveTo(controlLeft, canvas.height - height, x, canvas.height - height);
	ctx.quadraticCurveTo(controlRight, canvas.height - height, x + halfWidth, canvas.height - height + yOffset);

	ctx.lineTo(x + halfWidth, canvas.height);
	ctx.lineTo(x - halfWidth, canvas.height);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
}

function drawWeirCustom(canvas, x, width, height) {

	const ctx = canvas.getContext("2d");

	let radius = width / 4;
	const halfWidth = width / 2;

	ctx.beginPath();
	ctx.moveTo(x - halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height - height + radius);

	ctx.arc(x + halfWidth - radius, canvas.height - height + radius, radius, 0, 1.5 * Math.PI, true);
	ctx.lineTo(x - halfWidth + radius, canvas.height - height);

	ctx.arc(x - halfWidth + radius, canvas.height - height + radius, radius, 1.5 * Math.PI, Math.PI, true);
	ctx.lineTo(x - halfWidth, canvas.height);

	ctx.closePath();

	ctx.fill();
	ctx.stroke();

	ctx.font = "48px serif";
	ctx.fillStyle = "black";
	ctx.fillText("?", x - halfWidth / 2, canvas.height - height + halfWidth);
}

function drawWeir(canvas, x, weirThickness, height, coefficient) {

	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "#cdb59f";
	ctx.strokeStyle = "black";

	if (equalsCoefficient(coefficient, 0.865)) {
		drawWeirBroadPerpendicular(canvas, x, weirThickness, height);

	} else if (equalsCoefficient(coefficient, 0.91)) {
		drawWeirBroadRounded(canvas, x, weirThickness, height);

	} else if (equalsCoefficient(coefficient, 1.1)) {
		drawWeirSharp(canvas, x, weirThickness, height);

	} else if (equalsCoefficient(coefficient, 1.3)) {
		drawWeirRounded(canvas, x, weirThickness, height);

	} else if (equalsCoefficient(coefficient, 1.37)) {
		drawWeirRoundedRoof(canvas, x, weirThickness, height);

	} else {
		drawWeirCustom(canvas, x, weirThickness, height);
	}
}

export function drawSideWeir(canvas, index, weirHeights, datumsLeft, datumsRight, flows, coefficient) {

	if (!canvas || canvas.nodeName != "CANVAS") {
		return;
	}

	const ctx = canvas.getContext("2d");
	
	let minDatumLeft = Array.isArray(datumsLeft)? Math.min.apply(Math, datumsLeft) : datumsLeft;
	let minDatumRight = Array.isArray(datumsRight)? Math.min.apply(Math, datumsRight) : datumsRight;
	let minWeirHeights = Array.isArray(weirHeights)? Math.min.apply(Math, weirHeights) : weirHeights;
	
	let maxDatumLeft = Array.isArray(datumsLeft)? Math.max.apply(Math, datumsLeft) : datumsLeft;
	let maxDatumRight = Array.isArray(datumsRight)? Math.max.apply(Math, datumsRight) : datumsRight;
	let maxWeirHeights = Array.isArray(weirHeights)? Math.max.apply(Math, weirHeights) : weirHeights;
		

	let minDatum = Math.min(minDatumLeft, minDatumRight, minWeirHeights);
	let maxDatum = Math.max(maxDatumLeft, maxDatumRight, maxWeirHeights);

	let range = maxDatum - minDatum;
	let canvasWidth = ctx.canvas.width;
	let canvasHeight = ctx.canvas.height;
	
	let datumLeft = Array.isArray(datumsLeft) ?datumsLeft[index]: datumsLeft;
	let datumRight = Array.isArray(datumsRight) ?datumsRight[index]: datumsRight;
	let weirHeight = Array.isArray(weirHeights) ?weirHeights[index]: weirHeights;

	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	if (range <= 0) {
		return;
	}

	console.log(canvasWidth + "x" + canvasHeight);
	let baseHeight = canvasHeight/8;
	let weirThickness = canvasWidth/8;
	let multiplier = (canvasHeight - baseHeight) / range;


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

	let heightInCanvas = (baseHeight + multiplier * (weirHeight - minDatum));
	drawWeir(canvas, canvasWidth / 2, weirThickness, heightInCanvas, coefficient);

}
