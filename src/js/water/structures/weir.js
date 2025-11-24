
function drawWeir(canvas, x, weirThickness, height, coefficient) {
	switch (coefficient) {
		case 1.1: drawWeirSharp(canvas, x, weirThickness, height); break;
		case 0.91: drawWeirBroadRounded(canvas, x, weirThickness, height); break;
		case 0.865: drawWeirBroadPerpendicular(canvas, x, weirThickness, height); break;
		case 1.3: drawWeirRounded(canvas, x, weirThickness, height); break;
		case 1.37: drawWeirRoundedRoof(canvas, x, weirThickness, height); break
		default: drawWeirCustom(canvas, x, weirThickness, height); break;
	}
}


function drawWeirSharp(canvas, x, width, height) {
	const ctx = canvas.getContext("2d");
	const halfWidth = width / 2;


	ctx.fillStyle = 'brown';
	ctx.beginPath();
	ctx.moveTo(x - halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height - height + width);
	ctx.lineTo(x - halfWidth, canvas.height - height);
	ctx.closePath();
	ctx.fill();
}
function drawWeirBroadRounded(canvas, x, width, height) {

	const ctx = canvas.getContext("2d");
	let radius = width / 4;
	const halfWidth = width / 2;

	ctx.fillStyle = 'brown';
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

}
function drawWeirBroadPerpendicular(canvas, x, width, height) {
	const ctx = canvas.getContext("2d");
	const halfWidth = width / 2;
	ctx.fillStyle = 'brown';
	ctx.beginPath();
	ctx.moveTo(x - halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height - height);
	ctx.lineTo(x - halfWidth, canvas.height - height);
	ctx.closePath();
	ctx.fill();
}
function drawWeirRounded(canvas, x, width, height) {
	const ctx = canvas.getContext("2d");
	const halfWidth = width / 2;
	ctx.fillStyle = 'brown';
	ctx.beginPath();
	ctx.moveTo(x - halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height - height + width);
	ctx.lineTo(x - halfWidth, canvas.height - height);
	ctx.closePath();
	ctx.fill();
}
function drawWeirRoundedRoof(canvas, x, width, height) {
	const ctx = canvas.getContext("2d");
	const halfWidth = width / 2;
	ctx.fillStyle = 'brown';
	ctx.beginPath(); ctx.moveTo(x - halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height - height + width);
	ctx.lineTo(x - halfWidth, canvas.height - height);
	ctx.closePath();
	ctx.fill();
}
function drawWeirCustom(canvas, x, width, height) {
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = 'brown';
	ctx.beginPath(); ctx.moveTo(x - halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height);
	ctx.lineTo(x + halfWidth, canvas.height - height + width);
	ctx.lineTo(x - halfWidth, canvas.height - height);
	ctx.closePath();
	ctx.fill();
}

export function visualizeWeir(canvas, weirHeight, datumLeft, datumRight, flow, coefficient) {

	if (!canvas || canvas.nodeName != "CANVAS") {
		return;
	}

	const ctx = canvas.getContext("2d");

	let minDatum = Math.min(datumLeft, Math.min(datumRight, weirHeight));
	let maxDatum = Math.max(datumLeft, Math.max(datumRight, weirHeight));

	let range = maxDatum - minDatum;
	let width = ctx.canvas.width;
	let height = ctx.canvas.height;

	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, width, height);

	if (range <= 0) {
		return;
	}

	console.log(width + "x" + height);
	let baseHeight = 50;
	let weirThickness = 50;
	let multiplier = (height - baseHeight) / range;


	ctx.fillStyle = 'cyan';
	ctx.beginPath();
	ctx.moveTo(0 * width / 2, height);
	ctx.lineTo(1 * width / 2 - weirThickness / 2, height);
	ctx.lineTo(1 * width / 2 - weirThickness / 2, height - (baseHeight + multiplier * (datumLeft - minDatum)));
	ctx.lineTo(0 * width / 2, height - (baseHeight + multiplier * (datumLeft - minDatum)));
	ctx.closePath();
	ctx.fill();

	ctx.fillStyle = 'cyan';
	ctx.beginPath();
	ctx.moveTo(1 * width / 2 + weirThickness / 2, height);
	ctx.lineTo(2 * width / 2, height);
	ctx.lineTo(2 * width / 2, height - (baseHeight + multiplier * (datumRight - minDatum)));
	ctx.lineTo(1 * width / 2 + weirThickness / 2, height - (baseHeight + multiplier * (datumRight - minDatum)));
	ctx.closePath();
	ctx.fill();

	let heightInCanvas = (baseHeight + multiplier * (weirHeight - minDatum));
	drawWeir(canvas, width / 2, weirThickness, heightInCanvas, coefficient);



}
