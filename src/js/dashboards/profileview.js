//Berging Riool - Berging Land
const inletGround = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_YA_SEWER_OVERFLOW_AND_TIMEFRAME_IS_X_AND_GRIDTYPE_IS_RAINFALL];

let inletGroundSums = [];

for (let buildingKey = 0; buildingKey < inletGround.length; buildingKey++) {
	let buildingValues = inletGround[buildingKey];
	for (let timeframeKey = 0; timeframeKey < buildingValues.length; timeframeKey++) {
		inletGroundSums[timeframeKey] = inletGroundSums[timeframeKey] ? 0 : null;
		inletGroundSums[timeframeKey] = inletGroundSums[timeframeKey] + buildingValues[timeframeKey];
	}
}

console.log(inletGroundSums);


for (let timeframeKey = 0; timeframeKey < inletGroundSums.length; timeframeKey++) {
	addFlowValues(
		timeframeKey,
		OUTLET_GROUND,
		INLET_GROUND,
		inletAreaFrom,
		inletAreaTo,
		inletGroundSums,
		condition = inletUnderground
	);
}

console.log(addFlowValues);