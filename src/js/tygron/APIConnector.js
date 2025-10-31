export class APIConnector {

	constructor(token, baseUrl, basePath, args) {
		if (typeof token === 'object') {
			args = token;
			token = null;
		}
		
		args = Object.assign({
			'token' : null,
			'basePath' : '/api/session/',
			'baseUrl' : null,
			'protocol' : 'https',
		}, args);
		
		this.token = token ?? args['token'];
		this.basePath = basePath ?? args['basePath'];
		this.baseUrl = baseUrl ?? args['baseUrl'];
		this.protocol = args['protocol'];
	}

	start(funcToRun) {
		return (typeof funcToRun === 'function') ? Promise.resolve(funcToRun()) : Promise.resolve(funcToRun ?? null);
	}

	get(url, queryParams, preparationFunction) {
		let self = this;
		return function(data) {
			return self._call('GET', url, queryParams, null, preparationFunction)();
		}
	}
	post(url, queryParams, params, preparationFunction) {
		let self = this;
		return function(data) {
			return self._call('POST', url, queryParams, params, preparationFunction)();
		}
	}

	recalculate(xqueries) {
		let self = this;
		return function(data) {
			return self.post('/api/session/event/editorindicator/reset_indicators/', null, [!!xqueries])(data);
		}
	}

	consoleLog(message) {
		return function(data) {
			if (message) {
				console.log(message);
			}
			console.log(data);
			return data;
		}
	}

	_prepareQueryString(queryParams, url) {
		queryParams = queryParams ?? {};
		let queryString = new URLSearchParams(queryParams).toString();
		if (queryString.length > 0) {
			if (url.indexOf('?') === -1) {
				queryString = '?' + queryString;
			} else {
				queryString = '&' + queryString;
			}
		}
		return queryString;
	}

	_prepareQueryParams(queryParams) {
		queryParams = queryParams ?? {};
		if (!(typeof queryParams === 'object')) {
			queryParams = {};
		}
		return queryParams;
	}

	_prepareParams(params) {
		params = params ?? [];
		if (!Array.isArray(params)) {
			params = [params];
		}
		return params;
	}

	_call(method, url, queryParams, params, preparationFunction) {
		let self = this;
		return function(data) {
			params = method.toUpperCase() == 'GET' ? null : self._prepareParams(params);
			queryParams = self._prepareQueryParams(queryParams);
			queryParams['token'] = queryParams['token'] ?? self.token;
			queryParams['f'] = queryParams['f'] ?? 'JSON';

			if (typeof preparationFunction == 'function') {
				url = preparationFunction(data, url, queryParams, params) ?? url;
			}

			let queryString = self._prepareQueryString(queryParams, url);
			if (self.basePath && !(url.indexOf('/') == 0)) {
				url = self.basePath + url;
			}
			if (self.baseUrl) {
				url = self.protocol + self.baseUrl + url;
			}
			url = url + queryString;

			let promise = Promise.resolve(
				$.ajax({
					url: url,
					method: method.toUpperCase(),
					contentType: 'application/json',
					dataType: 'json',
					data: JSON.stringify(params),
				})
			);
			return promise;
		};
	}

	//To use a single argument which is an array itself, wrap the arguments in an array.
	chain(func, args) {
		if (typeof args === 'undefined') {
			return function(data) {
				return func(data);
			}
		}
		if (Array.isArray(args)) {
			return function(data) {
				return func.apply(this, args.slice().unshift(data));
			}
		}
		return function(data) {
			return func.apply(this, [data, args]);
		}
	}
}