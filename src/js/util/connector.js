export function connector(token, baseUrl, basePath,) {
	
	return {
		token : token ?? null,
		basePath : basePath ?? '/api/session/',
		baseUrl : baseUrl ?? null,
		protocol: 'https',
		
		start(funcToRun) {
			return (typeof funcToRun === 'function') ? Promise.resolve(funcToRun()) : Promise.resolve(funcToRun ?? null);
		},
		
		get(url, queryParams, preparationFunction) {
			let self = this;
			return function(data) {
				return self._call( 'GET', url, queryParams, null, preparationFunction )();
			}
		},
		post(url, queryParams, params, preparationFunction) {
			let self = this;
			return function(data) {
				return self._call( 'POST', url, queryParams, params, preparationFunction )();
			}
		},
		
		recalculate( xqueries ) {
			let self = this;
			return function(data) {
				return self.post('/api/session/event/editorindicator/reset_indicators/',null,[!!xqueries])(data);
			}
		},

		consoleLog: function(message) {
			let innerMessage = message;
			return function(data) {
				if (message) {
					console.log(message);
				}
				console.log(data);
				return data;
			}
		},
		
		_prepareQueryString: function(queryParams, url) {
			queryParams = queryParams ?? {};
			let queryString = new URLSearchParams(queryParams).toString();
			if ( queryString.length > 0 ) {
				if ( url.indexOf('?')===-1 ) {
					queryString = '?'+ queryString;
				} else {
					queryString = '&'+ queryString;
				}
			}
			return queryString;
		},
		
		_prepareQueryParams: function(queryParams) {
			queryParams = queryParams ?? {};
			if ( !(typeof queryParams === 'object') ) {
				queryParams = {};
			}
			return queryParams;
		},
		
		_prepareParams: function(params) {
			params = params ?? [];
			if (!Array.isArray(params)) {
				params = [params];
			}
			return params;
		},
		
		_call: function (method, url, queryParams, params, preparationFunction) {
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
				if ( self.basePath && !(url.indexOf('/')==0) ) {
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
		},

		//To use a single argument which is an array itself, wrap the arguments in an array.
		_chain: function(func, args) {
			if ( typeof args === 'undefined' ) {
				return function() {
					return func();
				}
			}
			if ( Array.isArray(args) ) {
				return function() {
					return func.apply(this, args);
				}
			}
			return function() {
				return func.apply(this, [args]);
			}
		},
	};
}