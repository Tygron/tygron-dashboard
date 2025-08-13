export function scaleValues(values, originalRange, targetRange, round = false) {
	if ( Array.isArray(values) ) {
		let arr = [];
		for (let i in values) {
			arr.push(scaleValues(values[i], originalRange, targetRange, round));
		}
		return arr;
	}
	let value = ( (values - originalRange[0]) / (originalRange[1]- originalRange[0]) );
	value = ( value * (targetRange[1]-targetRange[0]) ) + targetRange[0];
	if (round) {
		value = Math.round(value);
	}
	return value;
}

export function flipMatrix(matrix) {
	let newMatrix = [];
	let ySize = null;
	for (let i = 0; i<matrix.length; i++) {
		ySize = ySize ?? matrix[i].length;
		if (matrix[i].length != ySize) {
			throw 'Matrix lengths inconsistent, could not flip';
		}
		for (let j = 0; j<matrix[i].length; j++) {
			newMatrix[j] = newMatrix[j] ?? [];
			newMatrix[j][i] = matrix[i][j];
		}
	}
	return newMatrix;
}

export function isMatrix(matrix) {
	if (!Array.isArray(matrix)) {
		return false;
	}
	for (let inner of matrix) {
		if (!Array.isArray(inner)) {
			return false;
		}
	}
	return true;
}