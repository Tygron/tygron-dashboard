import { createLinks } from "./../../src/js/util/Data.js"

describe('data ', () => {
	
	it('has properties', () => {
		const properties = ["PROP_A", "PROP_B"];

		const data = createLinks(properties);
		expect(data.properties).not.toBeNull();
		expect(data.properties).toEqual(
			expect.arrayOf(expect.any(String)),
		);
		
		for(let i = 0; i < properties.length; i++){
			expect(data.properties).toContain(properties[i]);
		}
	});

	it('has empty array of properties', () => {
		const properties = [];

		const data = createLinks(properties);
		expect(data.properties).not.toBeNull();
		expect(data.properties.length).toEqual(0);
	});
	
});
