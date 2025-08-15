export class QueryDataManager {

	constructor(args = {}) {
		args = Object.assign({
			allowFallbackData: true
		}, args);

		this.setAllowFallbackData(args['allowFallbackData']);
	}

	allowFallbackData = true;

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
		//x in query is inner , y in query is outer
		let queryDataObject = this.getDataObject(key);

		if (x && (x !== queryDataObject['x'] && x !== queryDataObject[y])) {
			throw new RangeError('Dimension ' + x + ' not known for data registered by key ' + key);
		}
		if (y && (y !== queryDataObject['x'] && y !== queryDataObject[y])) {
			throw new RangeError('Dimension ' + y + ' not known for data registered by key ' + key);
		}
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

			hasNoDimensions() {
				return ((this.x === null) && (this.y === null));
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