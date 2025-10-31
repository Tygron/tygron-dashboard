import { NumberUtils } from "./NumberUtils.js";

export class ArrayUtils {

	/** 
	 * 	Rescale a value to desired range. 
	 * 		E.g. Turn fraction into neat percentage: scaleValue(fraction, [0,1], [0,100], true)
	 * 		Non-numeric value input is ignored and returned as-is.
	 * 		originalRange and targetRange must be an array of exactly 2 different numbers
	*/
	static scaleValue(value, originalRange, targetRange, round = false) {
		if (!NumberUtils.isNumeric(value)) {
			return value;
		}
		if ((!this.isRange(originalRange)) || (!this.isRange(targetRange))) {
			throw 'Both the original and target range must be array of 2 different numeric values';
		}
		value = ((value - originalRange[0]) / (originalRange[1] - originalRange[0]));
		value = (value * (targetRange[1] - targetRange[0])) + targetRange[0];

		return round ? Math.round(value) : value;
	}

	/** 
	 *	Array-wrapper for scaleValue
	*/
	static scaleValues(values, originalRange, targetRange, round = false) {
		if (!(Array.isArray(values)|| this.isMap(values)) ) {
			return this.scaleValue(values, originalRange, targetRange, round);
		}

		let arr = this.isMap(values) ? {} : [];
		for (let i in values) {
			arr[i] = (this.scaleValues(values[i], originalRange, targetRange, round));
		}
		return arr;
	}

	/**
	 *	Convenience function wrapping an array's ForEach, to return the array for in-lining'.
	 *	Operates in-place
	 */
	static forEach(array, func) {
		if ( !Array.isArray(array) ) {
			throw 'Not an array to iterate on';
		}
		if ( typeof func !== 'function' ) {
			throw 'Not a function to apply';
		}
		for( let i in array ) {
			let output = func(array[i],i,array);
			if (typeof output !== 'undefined') {
				array[i] = output;
			}	
		}
		return array;
	}
	
	static isRange(value, allowEqual = false) {
		if (!Array.isArray(value) || value.length != 2) {
			return false;
		}
		if ((!NumberUtils.isNumeric(value[0])) || (!NumberUtils.isNumeric(value[1]))) {
			return false;
		}
		return ((value[0] != value[1]) || allowEqual);
	}

	static coerceToArray(value) {
		return (!Array.isArray(value)) ? [value] : value;
	}
	static unArrayIfSingleElement(value, nullIfEmpty = true) {
		if (!Array.isArray(value)) {
			return value;
		}
		if (value.length === 1) {
			return value[0];
		}
		if (value.length === 0) {
			return nullIfEmpty ? null : value;
		}
		return value
	}
	
	static filterByArray(data, filter, func = null) {
		if ( !Array.isArray(data) ) { 
			throw new TypeError('Data must be an array');
		}
		if ( !Array.isArray(filter) ) {
			throw new TypeError('Filter must be an array');
		}
		
		if (typeof func !== 'function') {
			func = (d,f) => {return !!f};
		}
		
		let values = [];
		for ( let i=0 ; i < Math.min(data.length, filter.length) ; i++ ) {
			if (typeof func === 'function') {
				if ( func( data[i], filter[i] ) ) {
					values.push( data[i] );
				}
			}
		}
		return values;
	}
	
	/* Simple check to see if value is mapping, rather than array or primitive. For simplicity, objects are maps */
	static isMap(obj) 	{
		if (!obj) {
			// Not null or undefined
			return false;
		}
		if ( Array.isArray(obj) ) {
			// Not an array
			return false;
		}
		if ( ({}).constructor == Object(obj).constructor ) {
			// Has a generic object constructor
			return true;
		}
		return false;
	}

	static mapFromKeyValueArray(array) {
		if (this.isMatrix(array)) {
			return this.mapFromKeyValueMatrix(array);
		}

		let map = {};
		for(let i = 0 ; i < array.length ; i+=2) {
			map[array[i]] ??= array[i+1];
		}
		return map;
	}
	
	static mapFromKeyValueMatrix(matrix) {
		if (!this.isMatrix(matrix)) {
			return this.mapFromKeyValueArray(matrix);
		}
		
		let list = [];
		for (let i=0;i<matrix.length;i++) {
			list.push(this.mapFromKeyValueArray(matrix[i]));
		}
		
		return list;
	}
	
	static mergeMaps(concat, ...maps) {
		let newMap = {};
		
		if (maps.length === 0 ) {
			return newMap;
		}
		
		for (let key in maps[0]) {
			newMap[key] = [];
		}
		
		for (let i=0;i<maps.length;i++) {
			for (let key in newMap) {
				if (concat) {
					newMap[key] = newMap[key].concat(maps[i][key] ?? []);
				} else {
					newMap[key] = newMap[key].push(maps[i][key] ?? null);
				}
			}
		}
		return newMap;
	}
	
	static changeMapKeys(map, remapping) {
		let newMap = {};
		for (let oldKey in map) {
			newMap[remapping[oldKey]] = map[oldKey];
		}
		return newMap;
	}
	
	static flipMatrix(matrix) {
		let newMatrix = [];
		let ySize = null;
		for (let i = 0; i < matrix.length; i++) {
			ySize = ySize ?? matrix[i].length;
			if (matrix[i].length != ySize) {
				throw 'Matrix lengths inconsistent, could not flip';
			}
			for (let j = 0; j < matrix[i].length; j++) {
				newMatrix[j] = newMatrix[j] ?? [];
				newMatrix[j][i] = matrix[i][j];
			}
		}
		return newMatrix;
	}

	static clampMatrixSize(matrix, defaultValue, minSizeOuter, maxSizeOuter, minSizeInner, maxSizeInner) {
		let newMatrix = [];
		if (!this.isMatrix(matrix)) {
			throw new TypeError('Not a matrix');
		}
		for (let i = 0; i < Math.min(matrix.length, maxSizeOuter ?? matrix.length); i++) {
			if ((maxSizeInner ?? -1) < 0) {
				newMatrix[i] = matrix[i];
			} else {
				newMatrix[i] = matrix[i].slice(0, maxSizeInner);	
			}
			
			if (minSizeInner) {
				newMatrix[i] = newMatrix[i].concat(Array(Math.max(0,minSizeInner - matrix[i].length)).fill(defaultValue));
			}
		}
		if (minSizeOuter) {
			for (let i = newMatrix.length; i < minSizeOuter; i++) {
				newMatrix[i] = new Array(minSizeInner ?? 0).fill(defaultValue);
			}
		}
		return newMatrix;
	}

	static clampMatrixSizeOuter(matrix, defaultValue, minSize, maxSize) {
		return this.clampMatrixSize(matrix, defaultValue, minSize, maxSize, null, null);
	}

	static clampMatrixSizeInner(matrix, defaultValue, minSize, maxSize) {
		return this.clampMatrixSize(matrix, defaultValue, null, null, minSize, maxSize);
	}


	static isMatrix(matrix) {
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

}