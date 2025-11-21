
export function visualizeWeir(canvas, weirHeight, datumLeft, datumRight, flow) {

	if (!canvas || canvas.nodeName != "CANVAS") {
		return;
	}

	const ctx = canvas.getContext("2d");

	let minDatum = Math.min(datumLeft, Math.min(datumRight, weirHeight));
	let maxDatum = Math.max(datumLeft, Math.max(datumRight, weirHeight));

	let range = maxDatum - minDatum;
	if (range <= 0) {
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, 300, 300);
		return;
	}
	

	let baseHeight = 50;
	let weirThickness = 4;
	let width =   ctx.canvas.width;
	let height = ctx.canvas.height;
	let multiplier = (height-baseHeight) / range;
		
	
	ctx.fillStyle = 'cyan';
	ctx.beginPath();
	ctx.moveTo(0*width/2, height);
	ctx.lineTo(1*width/2, height);
	ctx.lineTo(1*width/2, height - (baseHeight + multiplier * (datumLeft - minDatum)));
	ctx.lineTo(0*width/2, height - (baseHeight + multiplier * (datumLeft - minDatum)));
	ctx.closePath();
	ctx.fill();

	ctx.fillStyle = 'cyan';
	ctx.beginPath();
	ctx.moveTo(1*width/2, height);
	ctx.lineTo(2*width/2, height);
	ctx.lineTo(2*width/2, height - (baseHeight + multiplier * (datumRight - minDatum)));
	ctx.lineTo(1*width/2, height - (baseHeight + multiplier * (datumRight - minDatum)));
	ctx.closePath();
	ctx.fill();

	ctx.fillStyle = 'brown';
	ctx.beginPath();
	ctx.moveTo((width-weirThickness)/2, height);
	ctx.lineTo((width+weirThickness)/2, height);
	ctx.lineTo((width+weirThickness)/2, height - (baseHeight + multiplier * (weirHeight - minDatum)));
	ctx.lineTo((width-weirThickness)/2, height - (baseHeight + multiplier * (weirHeight - minDatum)));
	ctx.closePath();
	ctx.fill();
	
	

}
