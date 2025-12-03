import { addStructureInfoLabel, addStructureInfoValue, addStructureTimeframeSlider } from "./structurePanel.js";

function addWeirInfoElements(parent) {

	addStructureInfoLabel(parent, "Name:");
	addStructureInfoValue(parent, "weirInfoName");

	addStructureInfoLabel(parent, "Height:");
	addStructureInfoValue(parent, "weirInfoHeight");

	addStructureInfoLabel(parent, "Width:");
	addStructureInfoValue(parent, "weirInfoWidth");

	addStructureInfoLabel(parent, "Angle:");
	addStructureInfoValue(parent, "weirInfoAngle");

	addStructureInfoLabel(parent, "Coefficient:");
	addStructureInfoValue(parent, "weirInfoCoefficient");

	addStructureInfoLabel(parent, "N:");
	addStructureInfoValue(parent, "weirInfoN");

	addStructureInfoLabel(parent, "Flow:");
	addStructureInfoValue(parent, "weirInfoFlow");

	addStructureInfoLabel(parent, "Datum A:");
	addStructureInfoValue(parent, "weirInfoDatumA");

	addStructureInfoLabel(parent, "Datum B:");
	addStructureInfoValue(parent, "weirInfoDatumB");

	addStructureInfoLabel(parent, "Dam Height:");
	addStructureInfoValue(parent, "weirInfoDamHeight");

	addStructureInfoLabel(parent, "Dam Width:");
	addStructureInfoValue(parent, "weirInfoDamWidth");

	addStructureInfoLabel(parent, "Area id A:");
	addStructureInfoValue(parent, "weirInfoAreaA");


	addStructureInfoLabel(parent, "Area id B:");
	addStructureInfoValue(parent, "weirInfoAreaB");

}

export function createWeirDetailPanel(parent) {

	let weirDetailContainer = document.createElement("div");
	parent.appendChild(weirDetailContainer);

	let weirInfoRow = document.createElement("div");
	weirInfoRow.className = "water-structure-info-row-spread";

	weirDetailContainer.appendChild(weirInfoRow);

	let weirInfoDiv = document.createElement("div");
	weirInfoRow.appendChild(weirInfoDiv);

	let weirInfoTitle = document.createElement("h2");
	weirInfoTitle.id = "weirInfoTitle";
	weirDetailContainer.appendChild(weirInfoTitle);

	let weirInfoColumn = document.createElement("div");
	weirInfoColumn.id = "weirInfo";
	weirInfoColumn.className = "water-structure-info-grid";
	
	weirInfoDiv.appendChild(weirInfoColumn);

	addWeirInfoElements(weirInfoColumn);

	let weirCanvasColumn = document.createElement("div");
	weirCanvasColumn.className = "water-structure-info-column";
	weirInfoRow.appendChild(weirCanvasColumn);

	let weirFrontCanvasDiv = document.createElement("div");
	weirFrontCanvasDiv.id = "weirFrontCanvasDiv";
	weirCanvasColumn.appendChild(weirFrontCanvasDiv);

	let weirSideCanvasDiv = document.createElement("div");
	weirSideCanvasDiv.id = "weirSideCanvasDiv";
	weirCanvasColumn.appendChild(weirSideCanvasDiv);

	let weirFrontCanvasTitle = document.createElement("h2");
	weirFrontCanvasTitle.innerHTML = "Front View:";
	weirFrontCanvasDiv.appendChild(weirFrontCanvasTitle);

	let weirSideCanvasTitle = document.createElement("h2");
	weirSideCanvasTitle.innerHTML = "Side View:";
	weirSideCanvasDiv.appendChild(weirSideCanvasTitle);

	let weirFrontCanvas = document.createElement("canvas");
	weirFrontCanvas.id = "weirFrontCanvas";
	weirFrontCanvas.width = 300;
	weirFrontCanvas.height = 100;
	weirFrontCanvasDiv.appendChild(weirFrontCanvas);

	let weirSideCanvas = document.createElement("canvas");
	weirSideCanvas.id = "weirSideCanvas";
	weirSideCanvas.width = 300;
	weirSideCanvas.height = 150;
	weirSideCanvasDiv.appendChild(weirSideCanvas);

	let weirSliderContainer = document.createElement("div");
	parent.appendChild(weirSliderContainer);

	addStructureTimeframeSlider(weirSliderContainer, "weirSlider");

	let weirPlotsContainer = document.createElement("div");
	let weirPlotRow = document.createElement("div");
	weirPlotRow.className = "water-structure-info-row";

	weirPlotsContainer.appendChild(weirPlotRow);

	let weirFlowPlot = document.createElement("div");
	weirFlowPlot.id = "weirFlowPlot";
	weirPlotRow.appendChild(weirFlowPlot);

	let weirHeightPlot = document.createElement("div");
	weirHeightPlot.id = "weirHeightPlot";
	weirPlotRow.appendChild(weirHeightPlot);

}

export function getDummyWeir() {
	return {
		name: "-",
		height: [-10000.0],
		width: 0,
		flow: [0.0],
		datumA: [-10000.0],
		datumB: [-10000.0],
		damWidth: 0,
		damHeight: -1,
		areaOutputA: -1,
		areaOutputB: -1,
		angle: -10000,
		coefficient: 1.1,
		weirN: 3 / 2,
	};
}

export function updateWeirDetailInfoPanel(weir, weirTimeframe) {

	if (weir == null) {
		weir = getDummyWeir();
	}

	document.getElementById("weirInfoName").innerHTML = weir.name;

	document.getElementById("weirInfoHeight").innerHTML = weir.heights[weirTimeframe] + " m";

	document.getElementById("weirInfoWidth").innerHTML = weir.width + " m";

	document.getElementById("weirInfoFlow").innerHTML = weir.flows[weirTimeframe] + " m³/s";

	document.getElementById("weirInfoDatumA").innerHTML = weir.datumsA[weirTimeframe] + " m";

	document.getElementById("weirInfoDatumB").innerHTML = weir.datumsB[weirTimeframe] + " m";

	document.getElementById("weirInfoDamHeight").innerHTML = weir.damHeight + " m";
	document.getElementById("weirInfoDamWidth").innerHTML = weir.damWidth + " m";
	document.getElementById("weirInfoAreaA").innerHTML = weir.areaOutputA;
	document.getElementById("weirInfoAreaB").innerHTML = weir.areaOutputB;
	document.getElementById("weirInfoAngle").innerHTML = weir.angle > -10000 ? weir.angle + " &deg;" : "-";

	document.getElementById("weirInfoCoefficient").innerHTML = weir.coefficient;
	document.getElementById("weirInfoN").innerHTML = weir.weirN;

}