import createLinks from "../src/js/util/data.js"

describe('data ', () => {
  it('has properties', () => {
    const properties = ["PROP_A", "PROP_B];
                        
    const data =createLinksadd(properties);
    expect(data.properties).toBeNotNull();
  });
});
