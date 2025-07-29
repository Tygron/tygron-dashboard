<script>

//Berging Riool - Berging Land
const inletGround = [$SELECT_ATTRIBUTE_WHERE_NAME_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_YA_SEWER_OVERFLOW_AND_TIMEFRAME_IS_X_AND_GRIDTYPE_IS_RAINFALL];

let InletGroundSums = [];

for (let buildingKey = 0; buildingKey < inletGround.length; buildingKey++) {
	let buildingValues = inletGround[buildingKey];
	for (let timeframeKey = 0; timeframeKey < buildingValues.length; timeframeKey++) {
		InletGroundSums[timeframeKey] = InletGroundSums[timeframeKey] ?? 0;
		InletGroundSums[timeframeKey] = InletGroundSums[timeframeKey] + buildingValues[timeframeKey];
	}
}

console.log (InletGroundSums);


for (let timeframeKey = 0; timeframeKey < InletGroundSums.length; timeframeKey++) {
	addFlowValues(
		timeframeKey,
		OUTLET_GROUND,
		INLET_GROUND,
		inletAreaFrom,
		inletAreaTo,
		InletGroundSums,
		condition = inletUnderground
	);
}

console.log (addFlowValues);
</script>