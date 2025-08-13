import { isMatrix, flipMatrix } from "../util/arrayUtils.js";
import { ensureDomElement, attachHandler } from "../util/dom.js";

/**
 * Listing Panel
 * 
 * To display a matrix of information with flexible rendering rules.
 * headers/content/footers : 
 * 		A matrix of values ( 0...n rows/arrays with 0...n values ) to display
 * headersTypes/contentTypes/footerTypes : 
 * 		A matching matrix of rendering types. Either predefined of functions. Either one array for all rows, or a matrix. Missing rows in a matrix use defaultTypes instead
 * defaultHeadersTypes/defaultContentTypes/defaultFootersTypes : 
 * 		A single renderer definition (or array of multiple matching one row) to render with if no list of renderers is provided
 * tableMode : 
 * 		Whether to render as an HTML table. If not, will use divs instead, per cell, per row, and one for the full container 
 * flipXY : 
 * 		If true, the rows in the data will be layed out as columns, and vice versa.
 */

export class ListingPanelController {
	
	constructor(domTarget, args = {}) {
		this.args = Object.assign( {
				'content' : [],
				'contentTypes' : [],
				'defaultContentTypes' : 'label',
				
				'headers': [],
				'headersTypes' : [],
				'defaultHeaderTypes' : 'label',
				
				'footers':[],
				'footersTypes': [],
				'defaultFootersTypes': 'label',
				
				'tableMode': true,
				'flipXY' : false,
			}, args );
		
		this.parent = null;
		this.domElement = null;
		
		try {
			this.parent = ensureDomElement(domTarget);
		} catch( err ) {
		}
	}
	
	addContent(content, renderTypes = null) {
		this.args['content'].push(content);
		if (renderTypes) {
			let index = this.args[content].length -1;
			this.args['contentTypes'][index] = renderTypes;
		}
	}
	addHeader(content, renderTypes = null) {
		this.args['headers'].push(content);
		if (renderTypes) {
			let index = this.args[content].length -1;
			this.args['footersTypes'][index] = renderTypes;
		}
	}
	addFooter(content, renderTypes = null) {
		this.args['footers'].push(content);
		if (renderTypes) {
			let index = this.args[content].length -1;
			this.args['headersTypes'][index] = renderTypes;
		}
	}
	
	setDefaultContentRenderTypes(renderTypes) {
			this.args['defaultContentTypes'] = renderTypes;
	}
	setDefaultHeaderRenderTypes(renderTypes) {
			this.args['defaultHeadersTypes'] = renderTypes;
	}
	setDefaultFootersRenderTypes(renderTypes) {
			this.args['defaultFootersTypes'] = renderTypes;
	}
	
	/* Based on the configuration and content, create the actual dom elements. */
	render( rerender = true ) {
		if (this.domElement && ! rerender) {
			return this.domElement;
		}
		
		let renderRules = this._createRenderRules(this.args)
		if (this.args['flipXY']) {
			renderRules = flipMatrix(renderRules);
		}
		let domElement = this._createDomElement(renderRules, this.args['tableMode']);
		
		if (this.parent) {
			if (this.domElement) {
				this.parent.removeChild(this.domElement);
			}
			this.parent.appendChild(domElement);
		}
		
		this.domElement = domElement;
	}
	
	getValues(section='content') {
		let selector = 'entry'+  (section ? ' '+section : '');
		let entries = this.domElement.getElementsByClassName(selector);
		
		let values = [];
		for (let entry of entries) {
			let entryValues = [];
			let inputs = entry.getElementsByClassName('input');
			for (let input of inputs) {
				entryValues.push(this._getValueFromInput(input));
			}
			values.push(entryValues);
		}
		return values;
	}
	
	getRenderer(type, args) {
		type = type ?? 'label';
		if (typeof type === 'function') {
			return type;
		}
		
		let renderer = null;
		try {
			renderer = ListingPanelController.getRenderer(type, args);
		} catch (err) {
			console.error('Failed to get renderer type '+type+', reason: '+err);
			renderer = ListingPanelController.getRenderer('label');
		}
		return renderer;
	}
	
	
	
	/* Turn the content and provided render types into prepared render rules for each individual cell of the listing */
	_createRenderRules( args = {} ) {
		
		let renderRules = [];
		for ( let i=0 ; i<args['headers'].length ; i++ ) {
			let types = this._getRenderTypesFromMatrix( args['headersTypes'], i, args['defaultHeaderTypes']);
			let prepared = this._createCellRenderRules(args['headers'][i], types, {'special':'header'});
			if (prepared) {
				renderRules.push(prepared);
			}
		}
		for ( let i=0 ; i<args['content'].length ; i++ ) {
			let types = this._getRenderTypesFromMatrix( args['contentTypes'], i, args['defaultContentTypes']);
			let prepared = this._createCellRenderRules(args['content'][i], types, {'special':'content'});
			if (prepared) {
				renderRules.push(prepared);
			}
		}
		for ( let i=0 ; i<args['footers'].length ; i++ ) {
			let types = this._getRenderTypesFromMatrix( args['footersTypes'], i, args['defaultFootersTypes']);
			let prepared = this._createCellRenderRules(args['footers'][i], types, {'special':'footer'});
			if (prepared) {
				renderRules.push(prepared);
			}
		}
		return renderRules;
	}
	
	/* From a matrix of renderttpes, get the appropriate row if possible. Otherwise, use the default Types. */
	_getRenderTypesFromMatrix(matrix, index, defaultTypes = []) {
		if ( Array.isArray(matrix) ) {
			if ( matrix.length == 0 ) {
				return defaultTypes;
			}
			if ( !isMatrix(matrix) ) {
				return matrix;
			}
			return matrix[index] ?? defaultTypes;
		}
		return matrix ?? defaultTypes;
	}
	
	/* Create the render rule for an array of individual cells. */
	_createCellRenderRules(contents = null, renderers = [], defaultRules = {}) {
		defaultRules = Object.assign( {
				'content' 	: null, // Default data, overwritten by the actual data
				'rendering' : null, // Default type to use if "types" does not extend as far as datas
				'special' 	: null, // Whether the rules are for headers, footers, or other special contents
			}, defaultRules );
		if ( contents===null ) {
			return [];
		}
		if ( !Array.isArray(contents) ) {
			contents = [contents];
		}
		if ( !Array.isArray(renderers) ) {
			renderers = Array(contents.length).fill(renderers);
		}
		let cellRenderRules = [];
		for (let i=0;i<contents.length;i++) {
			let renderType = renderers[i];
			let renderOptions = null;
			if (renderType['type']) {
				renderOptions = renderType['options'] ?? null;
				renderType = renderType['type'];
			}
			cellRenderRules.push( Object.assign( {}, defaultRules, {
				'content'	: contents[i],
				'rendering'	: renderType ?? defaultRules['rendering'],
				'options'	: renderOptions,
			} ) );
		}
		return cellRenderRules;
	}
	
	_createDomElement(renderRules, tableMode) {
		
		let domElement;
		let domInnerElement;
		
		if (tableMode) {
			domElement = document.createElement('table');
			domInnerElement = document.createElement('tbody');
			domElement.appendChild(domInnerElement);
		} else {
			domElement = document.createElement('div');
			domInnerElement = domElement;
		}
		
		for ( let i = 0 ; i < renderRules.length ; i++ ) {
			let rowElement = this._createDomElementsRow(renderRules[i], tableMode);
			domInnerElement.appendChild(rowElement);
		}
		domElement.classList.add(ListingPanelController.DEFAULT_CLASS);
		
		return domElement;	
	}
	
	/* Generate */
	_createDomElementsRow(rowRenderRules, tablemode) {
		
		let rowElementType = tablemode ? 'tr' : 'div';
		let rowElement = document.createElement(rowElementType);
		rowElement.classList.add('entry');
		
		let specialRow = null;
		
		for ( let i = 0 ; i < rowRenderRules.length ; i++ ) {
			let cellRule = rowRenderRules[i];
			let contentRenderer = this.getRenderer(cellRule['rendering'], cellRule['options']);
			
			let cellElement = contentRenderer(cellRule['content']);
			if (cellRule['special']) {
				cellElement.classList.add(cellRule['special']);
			}
			
			if (tablemode) {
				let wrappingCell = null;
				if (cellRule['special'] === 'header') {
					wrappingCell = document.createElement('th');
				} else {
					wrappingCell = document.createElement('td');
				}
				wrappingCell.appendChild(cellElement);
				cellElement = wrappingCell;
			}
			
			rowElement.appendChild(cellElement);
			
			specialRow = specialRow ?? cellRule['special'];
			if (specialRow !== cellRule['special']) {
				specialRow = false;	
			}
		}
		
		if (specialRow) {
			rowElement.classList.add(specialRow);
		}
		
		return rowElement;
	}
	
	_getValueFromInput(input) {
		if (typeof input.getValue === 'function') {
			return input.getValue();
		}
		let selecteds = input.getElementsByClassName('selected');
		if (selecteds.length>0) {
			return selecteds[0].value;
		}
	}
}

ListingPanelController.DEFAULT_CLASS = 'listingPanel';

//Cache to prevent recreating renderers when many values are displayed the same
ListingPanelController.cachedRenderers = {};
ListingPanelController.getRenderer = function(type, args) {
	if ( typeof type === 'function') {
		return type;
	}
	
	let cacheKey = JSON.stringify([type,args]);
	let renderer = this.cachedRenderers[cacheKey] ?? null;
	if ( renderer ) {
		return renderer;
	}

	switch(type) {
		case 'label':
			renderer = this._getRendererLabel(args);
			break;
		case 'buttons':
			renderer = this._getRendererButtons(args);
			break;
		default:
			throw 'Could not find renderer type '+type;
	}
	
	if (renderer === false) {
		throw 'Rendering type '+type+' requires arguments. Use getRenderer(type, args) to prepare this renderer instance.';
	}
	
	this.cachedRenderers[cacheKey] = renderer;
	return renderer;
}

ListingPanelController._getRendererLabel = function() {
	return function(content) {
		let element = document.createElement('div');
		element.classList.add('label');
		let labelElement = document.createElement('span');
		labelElement.innerHTML = content;
		element.appendChild(labelElement);
		return element;
	}
}

ListingPanelController._getRendererButtons = function(options) {
	if ( !Array.isArray(options)) {
		throw 'Options required for buttons renderer';
	}
	return function(content) {
		let element = document.createElement('div');
		element.classList.add('input');
		element.classList.add('buttons')
		
		for (let i = 0; i < options.length ; i++) {
			let inputElement = document.createElement('input');
			inputElement.type = 'button';
			inputElement.value = options[i];
			if (inputElement.value == content) {
				inputElement.classList.add('selected');
			}
			element.appendChild(inputElement);
		}
		attachHandler(element, 'click', 'input[type="button"]', function(event){
			let oldElement = this.closest('.buttons').getElementsByClassName('selected');
			if (oldElement.length>0) {
				for( let el of oldElement) {
					el.classList.remove('selected');
				}
				oldElement = oldElement[0] ?? null;
			}
			this.classList.add('selected');
			if (this != oldElement) {
				this.closest('.'+ListingPanelController.DEFAULT_CLASS).dispatchEvent(new Event('change'));
			}
		});
		return element;
	}
}