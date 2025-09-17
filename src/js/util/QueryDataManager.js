import { ArrayUtils } from "./../../js/util/ArrayUtils.js";

export class QueryDataManager {

	constructor(args = {}) {
		args = Object.assign({
			allowFallbackData: true,
			sizedKeys: {}
		}, args);

		this.setAllowFallbackData(args['allowFallbackData']);
		for (let key in args['sizedKeys']) {
			this.setSizedKey(key, args['sizedKeys'][key]);
		}
	}

	allowFallbackData = true;

	sizedKeys = {};
	queryDataObjects = {};

	addQueryData(key, args = {}) {
		args = Object.assign({
			query: null,
			fallbackData: null,
			x: null,
			y: null,
		}, args);

		let queryData = new this.constructor.QueryDataObject(args);
		this.queryDataObjects[key] = queryData;

		return queryData;
	}

	addQuery(key, query) {
		return this.addQueryData(key, { query: query });
	}

	addQueryDatas(queries = {}) {
		for (let queryKey in queries) {
			this.addQueryData(queryKey, queries[queryKey]);
		}
	}

	getData(key, forceToArray = true) {
		let queryDataObject = this.getQueryDataObject(key);
		let data = queryDataObject.getData(this.allowFallbackData);
		return forceToArray ? ArrayUtils.coerceToArray(data) : data;
	}

	getDataMatrix(key, outerArrayKey = null, innerArrayKey = null) {
		let data = this._getDataMatrixUnbounded(key, outerArrayKey, innerArrayKey);

		let innerSize = this.sizedKeys[innerArrayKey];
		let outerSize = this.sizedKeys[outerArrayKey];

		if (((innerSize ?? null) != null) || ((outerSize ?? null) != null)) {
			data = ArrayUtils.clampMatrixSize(data, 0, outerSize, outerSize, innerSize, innerSize);
		}

		return data;
	}

	getDataKeyValues(key, kvIndex) {
		let queryDataObject = this.getQueryDataObject(key);

		if (queryDataObject.hasNoDimensions()) {
			throw new RangeError('Cannot request key-value mapping from dimensionless data registered by key ' + key);
		}

		let data = this.getDataMatrix(key, null, kvIndex);
		data = ArrayUtils.mapFromKeyValueMatrix(data);
		if (queryDataObject.getDimensionCount() == 1) {
			return ArrayUtils.unArrayIfSingleElement(data);
		}
		return data;
	}

	getDataKeyIndexed(key, kvIndex, indexKeys) {
		let data = this.getDataMatrix(key, kvIndex);

		if (ArrayUtils.isMatrix(indexKeys)) {
			throw new TypeError('Cannot index data by matrix');
		}

		if (Array.isArray(indexKeys) && !Array.isArray(data)) {
			throw new TypeError('Cannot index singular data by array');
		}
		if (!Array.isArray(indexKeys)) {
			let result = {};
			result[indexKeys] = data;
			return result;
		}

		let map = {};
		for (let i = 0; i < Math.min(data.length, indexKeys.length); i++) {
			map[indexKeys[i]] = data[i];
		}
		return map;
	}

	_getDataMatrixUnbounded(key, outerArrayKey = null, innerArrayKey = null) {
		//x in query is inner , y in query is outer
		let queryDataObject = this.getQueryDataObject(key);

		//Dimensionless		
		if (!outerArrayKey && !innerArrayKey) {
			if (queryDataObject.hasNoDimensions()) {
				return queryDataObject.getData(this.allowFallbackData);
			}
			throw new RangeError('No dimension(s) defined while requesting data by key ' + key);
		}

		//Undefined dimensions
		if (outerArrayKey == innerArrayKey) {
			throw new RangeError('Cannot request duplicate dimension ' + outerArrayKey + ' for data registered by key ' + key)
		}
		if (outerArrayKey && (!queryDataObject.hasDimension(outerArrayKey))) {
			throw new RangeError('Dimension ' + outerArrayKey + ' not known for data registered by key ' + key);
		}
		if (innerArrayKey && (!queryDataObject.hasDimension(innerArrayKey))) {
			throw new RangeError('Dimension ' + innerArrayKey + ' not known for data registered by key ' + key);
		}

		// 2 Dimensions
		if (queryDataObject.hasDimensionX() && queryDataObject.hasDimensionY()) {
			if (innerArrayKey == queryDataObject.getDimensionX() || outerArrayKey == queryDataObject.getDimensionY()) {
				return queryDataObject.getData(this.allowFallbackData);
			} else {
				return ArrayUtils.flipMatrix(queryDataObject.getData(this.allowFallbackData));
			}
		}

		// X dimension
		else if (queryDataObject.hasDimensionX()) {
			if (innerArrayKey == queryDataObject.getDimensionX()) {
				return [queryDataObject.getData(this.allowFallbackData)];
			} else if (outerArrayKey == queryDataObject.getDimensionX()) {
				return queryDataObject.getData(this.allowFallbackData);
			}

		}

		//Y dimension
		else if (queryDataObject.hasDimensionY()) {
			if (innerArrayKey == queryDataObject.getDimensionY()) {
				return ArrayUtils.flipMatrix(queryDataObject.getData(this.allowFallbackData));
			} else if (outerArrayKey == queryDataObject.getDimensionY()) {
				let data = ArrayUtils.coerceToArray(queryDataObject.getData(this.allowFallbackData))
				return [].concat(...data);
			}

		}

		//Undefined
		throw new RangeError('Unknown state occured while requesting data of key ' + key + ' with dimension(s) ' + outerArrayKey + ', ' + innerArrayKey);
	}

	getQueryDataObject(key) {
		let queryDataObject = this.queryDataObjects[key];
		if (!queryDataObject) {
			throw new RangeError('No QueryData registered with key ' + key);
		}
		return queryDataObject;
	}

	getUnresolvedDataKeys() {
		let unresolved = [];
		for (let key of Object.keys(this.queryDataObjects)) {
			if (!this.getQueryDataObject(key).isAllQueryDataResolved()) {
				unresolved.push(key);
			}

		}
		return unresolved;
	}

	setAllowFallbackData(allow) {
		this.allowFallbackData = (!!allow);
	}

	setSizedKey(key, size) {
		if (size === null) {
			delete this.sizedKeys[key];
		} else {
			this.sizedKeys[key] = size;
		}
	}

	allQueriesResolved() {
		return this.getUnresolvedDataKeys().length === 0;
	}

	static isResolvedQueryData(query) {
		this.QueryDataObject.appearsResolved(query);
	}

	static {
		this.QueryDataObject = class {
			constructor(args) {
				args = Object.assign({
					query: null,
					fallbackData: null,
					x: null,
					y: null,
				}, args);

				this.setQueryData(args['query']);
				this.setFallbackData(args['fallbackData']);

				this.setDimensionX(args['x']);
				this.setDimensionY(args['y']);
			}

			queryData = null;
			fallbackData = null;
			x = null;
			y = null;

			getData(allowFallbackData = true) {
				if (this.hasResolvedQueryData()) {
					return this.getQueryData();
				}
				if (!allowFallbackData) {
					throw 'Query not resolved and no fallback data allowed';
				}

				if (this.hasResolvedFallbackData()) {
					return this.getFallbackData();
				}
				throw 'Query not resolved and no fallback data available';
			}

			getQueryData() {
				if (this.hasNoDimensions()) {
					return ArrayUtils.unArrayIfSingleElement(this.queryData);
				}
				return this.queryData;
			}
			getFallbackData() {
				if (this.hasNoDimensions()) {
					return ArrayUtils.unArrayIfSingleElement(this.fallbackData);
				}
				return this.fallbackData;
			}

			setQueryData(data) {
				this.queryData = data === null ? null : this.constructor.parseToData(data);
			}

			setFallbackData(data) {
				this.fallbackData = data === null ? null : this.constructor.parseToData(data);
			}
			setDimensionX(data) {
				this.x = data ?? null;
			}
			setDimensionY(data) {
				this.y = data ?? null;
			}

			getDimensionX() {
				return this.x;
			}
			getDimensionY() {
				return this.y;
			}
			getDimensionCount() {
				return this.getDimensionX() + this.getDimensionY();
			}

			hasDimensionX() {
				return this.x !== null;
			}

			hasDimensionY() {
				return this.y !== null;
			}
			hasDimension(dimension) {
				if (this.hasDimensionX() && this.getDimensionX() == dimension) {
					return true;
				}
				if (this.hasDimensionY() && this.getDimensionY() == dimension) {
					return true;
				}
				return false
			}
			hasNoDimensions() {
				return this.getDimensionCount() == 0;
			}

			hasQueryData() {
				return this.constructor.exists(this.queryData);
			}
			hasResolvedQueryData() {
				return this.constructor.appearsResolved(this.queryData);
			}
			hasFallbackData() {
				return this.constructor.exists(this.fallbackData);
			}
			hasResolvedFallbackData() {
				return this.constructor.appearsResolved(this.fallbackData);
			}

			isAllQueryDataResolved() {
				if (this.hasFallbackData() && !this.hasResolvedFallbackData()) {
					return false;
				}
				if (this.hasQueryData() && !this.hasResolvedQueryData()) {
					return false;
				}
				return true;
			}

			static parseToData(value) {
				if (Array.isArray(value)) {
					//Arrays can always be considered already-processed and thus fine as-is.
					return value;
				}
				//Simple quick parse
				let parsedValue = null;
				try {
					parsedValue = JSON.parse('[' + value + ']');
				} catch (err) {
					parsedValue = value;
				}
				return parsedValue;
			}

			static exists(value) {
				if (typeof value === 'undefined') {
					return false;
				}
				if (value === null) {
					return false;
				}
				return true;
			}
			static appearsResolved(value) {
				if (!this.exists(value)) {
					return false;
				}
				if (!value.indexOf) {
					//could be a number
					return true;
				}
				//split the query string, otherwise it "resolves" when used in the Tygron Platform
				return !(value.indexOf('$') === 0) && (value.indexOf('SELECT_') !== 1);
			}
		};

	}
}