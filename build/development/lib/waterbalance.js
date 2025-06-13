
function initCollapsibles() {
	
	var coll = document.getElementsByClassName("collapsible");
	var i;

	for (i = 0; i < coll.length; i++) {
	  coll[i].addEventListener("click", function() {
	    this.classList.toggle("active");
	    var content = this.nextElementSibling;
	    if (content.style.maxHeight){
	      content.style.maxHeight = null;
	    } else {
	      content.style.maxHeight = content.scrollHeight + "px";
	    }
	  });
	}
}

function openCollapsibles() {
	var coll = document.getElementsByClassName("collapsible");
	for (i = 0; i < coll.length; i++) {
	  coll[i].click();
	}
}

function getRGBAInterpolated(value, min, max, maxColor, baseColor) {

	if (baseColor == undefined) {
		baseColor = [255, 255, 255, 0.0]
	}

	let fraction = (value - min) / (max - min);
	let red = Math.round(maxColor[0] * fraction + (1 - fraction) * baseColor[0]);
	let green = Math.round(maxColor[1] * fraction + (1 - fraction) * baseColor[1]);
	let blue = Math.round(maxColor[2] * fraction + (1 - fraction) * baseColor[2]);
	let alpha = maxColor[3] * fraction;

	return "rgba(" + [red, green, blue, alpha].join(",") + ")";
}


function createTable(divName, data, properties, colors) {

	let table = document.getElementById(divName);
	if(table== undefined){
		console.log("Element with id: "+divName+ " does not exist.");
		return
	}

	var header = table.createTHead();
	let trow = header.insertRow(-1);
	for (let n = 0; n < properties.length; n++) {
		let cell = trow.insertCell(-1);
		cell.innerHTML = titles[properties[n]];
	}

	var tableBody = table.createTBody();
	for (let r = 0; r < timeframes; r++) {
		var row = tableBody.insertRow(-1);
		for (let n = 0; n < properties.length; n++) {
			let cell = row.insertCell(-1);

			let value = data[properties[n]][r];
			let min = Math.min.apply(Math, data[properties[n]]);
			let max = Math.max.apply(Math, data[properties[n]]);
			let color = colors[properties[n]];

			let labelDiv = document.createElement('div');
			let label = document.createElement('label');
			label.innerHTML = value;
			labelDiv.appendChild(label);
			cell.appendChild(labelDiv);


			if (min == max || color == undefined) {
				labelDiv.style.backgroundColor = 'transparent';

			} else {

				labelDiv.style.backgroundColor = getRGBAInterpolated(value, min, max, color);
			}
		}
	}
}



const M3TOTAL = 'm3Total';
const M3LAND = 'm3Land';
const M3WATER = 'm3Water';
const M3SEWER = 'm3Sewer';
const M3STORAGE = 'm3Storage';
const M3GROUND = 'm3Ground';
const TIMEFRAMES = 'timeframes';

const timeframes = 15;
const timeframeTimes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

//const timeframes = $SELECT_ATTRIBUTE_WHERE_GRIDTYPE_IS_RAINFALL_AND_NAME_IS_TIMEFRAMES;
//const timeframeTimes = $SELECT_ATTRIBUTE_WHERE_GRIDTYPE_IS_RAINFALL_AND_INDEX_IS_0_AND_NAME_IS_TIMEFRAME_TIMES;

const data = {};
/*
data[M3TOTAL] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_SURFACE_LAST_VALUE_AND_TIMEFRAME_IS_X];
data[M3WATER] = [$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_M3WATER_AND_TIMEFRAME_IS_X];
data[M3GROUND] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_GROUND_LAST_VALUE_AND_TIMEFRAME_IS_X];
data[M3STORAGE] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_BUILDING_LAST_STORAGE_AND_TIMEFRAME_IS_X];
data[M3SEWER] = [$SELECT_GRIDVOLUME_WHERE_RESULTTYPE_IS_SEWER_LAST_VALUE_AND_TIMEFRAME_IS_X];
*/

data[M3TOTAL] = [172479, 178205, 184075, 189937, 195813, 201688, 207574, 213439, 213691, 213944, 214196, 214456, 214716, 214981, 215241];
data[M3WATER] = [112746, 144310, 147322, 149971, 152520, 155013, 157511, 160028, 161397, 162461, 163426, 164269, 165078, 165827, 166532];
data[M3GROUND] = [2316283, 2316850, 2317271, 2317700, 2318122, 2318543, 2318954, 2319384, 2319805, 2320226, 2320647, 2321062, 2321476, 2321886, 2322301];
data[M3STORAGE] = [3.60, 71.44, 143, 212, 278, 342, 404, 465, 466, 466, 467, 467, 467, 467, 467];
data[M3SEWER] = [0, 0.01, 0.01, 0.04, 0.01, 0.01, 0.07, 0.02, 0, 0, 0, 0, 0, 0, 0];


data[M3LAND] = [];
data[TIMEFRAMES] = [];


for (var i = 0; i < data[M3TOTAL].length && i < data[M3WATER].length; i++)
	data[M3LAND].push(data[M3TOTAL][i] - data[M3WATER][i]);

for (var i = 0; i < timeframes; i++)
	data[TIMEFRAMES].push(i);

const titles = {};
titles[TIMEFRAMES] = "Timeframes";
titles[M3LAND] = "Maaiveld [m3]";
titles[M3WATER] = "Oppervlaktewater [m3]";
titles[M3GROUND] = "Groundwater [m3]";
titles[M3STORAGE] = "Waterbergende voorzieningen";
titles[M3SEWER] = "Riool";

const properties = [TIMEFRAMES, M3LAND, M3WATER, M3GROUND, M3SEWER, M3STORAGE];
const colors = {};
colors[M3WATER] = [10, 10, 218, 0.5];
colors[M3LAND] = [10, 218, 10, 0.5];
colors[M3GROUND] = [165, 42, 42, 0.5];
colors[M3STORAGE] = [218, 10, 10, 0.5];
colors[M3SEWER] = [128, 128, 128, 0.5];

initCollapsibles();

createTable("waterBalanceTable", data, properties, colors);

openCollapsibles();
