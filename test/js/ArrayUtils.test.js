import { ArrayUtils } from "../../src/js/util/ArrayUtils.js";

describe('ArrayUtils', () => {

	let testCompare = function(expected, result) {
		expect(JSON.stringify(expected)).toBe(JSON.stringify(result));
	}



	it('can scale values', () => {
		testCompare(
			ArrayUtils.scaleValues([0.1, 0.5, 0.9], [0, 1], [0, 100]),
			[10, 50, 90]
		);
	});

	

	it('can increase a matrix\' outer size', () => {
		let matrix = [ [1,2,3], [4,5] ];
		let expected = [ [1,2,3], [4,5], [] ];
		let result = ArrayUtils.clampMatrixSizeOuter(matrix, 0, 3, 5);
		testCompare(result, expected);
	});

	it('can increase a matrix\' inner size', () => {
		let matrix = [ [1,2,3], [4,5] ];
		let expected = [ [1,2,3], [4,5,0] ];
		let result = ArrayUtils.clampMatrixSizeInner(matrix, 0, 3, 5);
		testCompare(result, expected);
	});

	it('can decrease a matrix\' outer size', () => {
		let matrix = [ [1,2,3], [4,5], [6,7,8] ];
		let expected = [ [1,2,3], [4,5] ];
		let result = ArrayUtils.clampMatrixSizeOuter(matrix, 0, 1, 2);
		testCompare(result, expected);
	});

	it('can decrease a matrix\' inner size', () => {
		let matrix = [ [1,2,3], [4,5], [6,7,8] ];
		let expected = [ [1,2], [4,5], [6,7] ];
		let result = ArrayUtils.clampMatrixSizeInner(matrix, 0, 1, 2);
		testCompare(result, expected);
	});

});
