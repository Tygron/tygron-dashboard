import {createLinks} from "./../../src/js/util/data.js"

describe('data ', () => {
  it('has properties', () => {
    const properties = ["PROP_A", "PROP_B"];
                        
    const data =createLinks(properties);
    expect(data.properties).not().toBeNull();
  });

   it('has empty array of properties', () => {
    const properties = [];
                        
    const data =createLinks(properties);
    expect(data.properties).not().toBeNull();
  });
});
