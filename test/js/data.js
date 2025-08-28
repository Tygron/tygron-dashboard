import { TimeframeLinks } from './../../src/js/util/data.js';

describe(()=>{
	
	it('test timeframe constructor', ()=>{
		let timeframeProp = "Timeframes";
		let value1Prop = "Value1";
		let properties = [timeframeProp, value1Prop];
		let timeframes = 2;
		const tfLinks = new TimeframeLinks(properties, timeframes);	
		
		let links = tfLinks.getLink(timeframeProp);
		expect(links).not.toBe(null);
	});
});
