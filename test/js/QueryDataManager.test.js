import { QueryDataManager } from "./../../src/js/util/QueryDataManager.js"
import { ArrayUtils } from "./../../src/js/util/ArrayUtils.js"

describe('QueryDataManager', () => {

	it('can be instantiated', () => {
		let queryDataManager = new QueryDataManager();

		expect(queryDataManager).not.toBeNull();
	});
	let unresolved = '$' + 'SELECT' + '_WHERE_' + 'NEIGHBORHOOD_IS_0';



	//Resolving tests
	it('can detect unresolved queries', () => {
		let queryDataManager = new QueryDataManager();
		queryDataManager.addQuery('queryData', unresolved);

		expect(queryDataManager.allQueriesResolved()).toBe(false);
	});

	it('can fall back on fallback data in case of testing', () => {
		let fallback = [100.0, 150.0, 255.1];
		let queryDataManager = new QueryDataManager({ 'allowFallbackData': true });
		queryDataManager.addQueryData('queryData', {
			query: unresolved,
			fallbackData: fallback
		});
		let outputData = queryDataManager.getData('queryData');

		expect(outputData).toBe(fallback);
	});

	it('can have its testing-fallback turned off and in that case give an error', () => {
		let fallback = [100.0, 150.0, 255.1];
		let queryDataManager = new QueryDataManager({ 'allowFallbackData': false });
		queryDataManager.addQueryData('queryData', {
			query: unresolved,
			fallbackData: fallback
		});
		let error = null;
		try {
			queryDataManager.getData('queryData');
		} catch (err) {
			error = err;
		}

		expect(error).not.toBeNull();
	});



	//Simple data parsing tests
	let simpleTest = (inputData, expectedData) => {
		let queryKeyName = 'queryData';

		let queryDataManager = new QueryDataManager();
		queryDataManager.addQuery(queryKeyName, inputData);

		let outputData = queryDataManager.getData(queryKeyName);

		expect(outputData).toEqual(expectedData);
	}

	it('can contain and offer string-queries such as names, from array-form', () => {
		let expectedData = ['alpha', 'beta', 'gamma'];
		let queryData = expectedData;

		simpleTest(queryData, expectedData);
	});
	it('can contain and offer string-queries such as names, from string-form', () => {
		let expectedData = ['alpha', 'beta', 'gamma'];
		let queryData = '"alpha", "beta","gamma"';

		simpleTest(queryData, expectedData);
	});

	it('can contain and offer value-queries such as indicator scores, from array-form', () => {
		let expectedData = [1.0, 2.0, 3.0, 4.5, 5.1];
		let queryData = expectedData.slice();

		simpleTest(queryData, expectedData);
	});

	it('can contain and offer value-queries such as indicator scores, from string-form', () => {
		let expectedData = [ 1,2 ,3 ,4.5 ,5.1 ];
		let queryData = '1.0, 2.0, 3.0, 4.5, 5.1';

		simpleTest(queryData, expectedData);
	});



	//Dimension tests
	let dimensionTest = (inputData, x, y, outer, inner, expectedData) => {
		let queryKeyName = 'queryData';

		let queryDataManager = new QueryDataManager();
		queryDataManager.addQueryData(queryKeyName, {
			query: inputData,
			x: x,
			y: y,
		});

		let outputData = queryDataManager.getDataMatrix(queryKeyName, outer, inner);

		expect(JSON.stringify(outputData)).toEqual(JSON.stringify(expectedData));
	}



	//1-Dimension tests
	it('can get X queried data explicitly as a normal array', () => {
		let queryData = [1.0, 2.0, 3.0];
		let x = 'x';
		let y = null;
		let outer = 'x';
		let inner = null;

		let expectedData = queryData;

		dimensionTest(queryData, x, y, outer, inner, expectedData);
	});

	it('can get X queried data explicitly as an innered array', () => {
		let queryData = [1.0, 2.0, 3.0];
		let x = 'x';
		let y = null;
		let outer = null;
		let inner = 'x';

		let expectedData = [[1.0, 2.0, 3.0]];

		dimensionTest(queryData, x, y, outer, inner, expectedData);
	});

	it('can get Y queried data explicitly as a normal array', () => {
		let queryData = [[1.0], [2.0], [3.0]];
		let x = null;
		let y = 'y';
		let outer = 'y';
		let inner = null;

		let expectedData = [1.0, 2.0, 3.0];

		dimensionTest(queryData, x, y, outer, inner, expectedData);
	});

	it('can get Y queried data explicitly as an innered array', () => {
		let queryData = [[1.0], [2.0], [3.0]];
		let x = null;
		let y = 'y';
		let outer = null;
		let inner = 'y';

		let expectedData = [[1.0, 2.0, 3.0]];

		dimensionTest(queryData, x, y, outer, inner, expectedData);
	});


	//2-Dimension tests
	it('can get XY queried data as as-is matrix', () => {

		let queryDataManager = new QueryDataManager();
		queryDataManager.addQueryData('queryKey', {
			query: [[1.0, 2.0, 3.0], [10.0, 20.0, 30.0], [100.0, 200.0, 300.0], [1000.0, 2000.0, 3000.0]],
			x: 'area',
			y: 'index',
		});

		let error = null;
		try {
			let outputData = queryDataManager.getDataMatrix('queryKey', null, null);
		} catch (err) {
			error = err;
		}
		expect(error).not.toBeNull();
	});

	it('can get XY queried data as explicit matrix with X as outer dimension', () => {
		let queryData = [[1.0, 2.0, 3.0], [10.0, 20.0, 30.0], [100.0, 200.0, 300.0], [1000.0, 2000.0, 3000.0]];
		let x = 'area'; //3
		let y = 'index'; //4
		let outer = 'area';
		let inner = null;

		let expectedData = [[1.0, 10.0, 100.0, 1000.0], [2.0, 20.0, 200.0, 2000.0], [3.0, 30.0, 300.0, 3000.0]];

		dimensionTest(queryData, x, y, outer, inner, expectedData);
	});

	it('can get XY queried data as explicit matrix with X as inner dimension', () => {
		let queryData = [[1.0, 2.0, 3.0], [10.0, 20.0, 30.0], [100.0, 200.0, 300.0], [1000.0, 2000.0, 3000.0]];
		let x = 'area'; //3
		let y = 'index'; //4
		let outer = null;
		let inner = 'area';

		let expectedData = [[1.0, 2.0, 3.0], [10.0, 20.0, 30.0], [100.0, 200.0, 300.0], [1000.0, 2000.0, 3000.0]];

		dimensionTest(queryData, x, y, outer, inner, expectedData);
	});

	it('can get XY queried data as explicit matrix with Y as outer dimension', () => {
		let queryData = [[1.0, 2.0, 3.0], [10.0, 20.0, 30.0], [100.0, 200.0, 300.0], [1000.0, 2000.0, 3000.0]];
		let x = 'area'; //3
		let y = 'index'; //4
		let outer = 'index';
		let inner = null;

		let expectedData = [[1.0, 2.0, 3.0], [10.0, 20.0, 30.0], [100.0, 200.0, 300.0], [1000.0, 2000.0, 3000.0]];

		dimensionTest(queryData, x, y, outer, inner, expectedData);
	});

	it('can get XY queried data as explicit matrix with Y as inner dimension', () => {
		let queryData = [[1.0, 2.0, 3.0], [10.0, 20.0, 30.0], [100.0, 200.0, 300.0], [1000.0, 2000.0, 3000.0]];
		let x = 'area'; //3
		let y = 'index'; //4
		let outer = null;
		let inner = 'index';

		let expectedData = [[1.0, 10.0, 100.0, 1000.0], [2.0, 20.0, 200.0, 2000.0], [3.0, 30.0, 300.0, 3000.0]];

		dimensionTest(queryData, x, y, outer, inner, expectedData);
	});

	it('can get XY queried data as explicit matrix with XY as outer-inner dimensions respectively', () => {
		let queryData = [[1.0, 2.0, 3.0], [10.0, 20.0, 30.0], [100.0, 200.0, 300.0], [1000.0, 2000.0, 3000.0]];
		let x = 'area'; //3
		let y = 'index'; //4
		let outer = 'area';
		let inner = 'index';

		let expectedData = [[1.0, 10.0, 100.0, 1000.0], [2.0, 20.0, 200.0, 2000.0], [3.0, 30.0, 300.0, 3000.0]];

		dimensionTest(queryData, x, y, outer, inner, expectedData);
	});

	it('can get XY queried data as explicit matrix with YX as inner-outer dimensions respectively', () => {
		let queryData = [[1.0, 2.0, 3.0], [10.0, 20.0, 30.0], [100.0, 200.0, 300.0], [1000.0, 2000.0, 3000.0]];
		let x = 'area'; //3
		let y = 'index'; //4
		let outer = 'index';
		let inner = 'area';
	
		let expectedData = [[1.0, 2.0, 3.0], [10.0, 20.0, 30.0], [100.0, 200.0, 300.0], [1000.0, 2000.0, 3000.0]];
	
		dimensionTest(queryData, x, y, outer, inner, expectedData);
	});
});
