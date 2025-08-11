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