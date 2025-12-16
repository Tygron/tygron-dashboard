
/**
* Create a rectangular MultiPolygon object
*/
export function createRectangleMP(x, y, width, height) {
	return { type: "MultiPolygon", 
		coordinates: [[[
			[x, y],
			[x, y + height],
			[x + width, y + height],
			[x + width, y],
			[x, y]
		]]]
	};

}