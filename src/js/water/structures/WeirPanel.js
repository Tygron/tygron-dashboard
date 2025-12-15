import { addStructureInfoLabel, addStructureInfoValue } from "./StructurePanel.js";
import { addTimeframeSlider } from "../../ui/Timeframeslider.js";

export class WeirPanel {

	static getDummyWeir() {
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

	_addWeirInfoElements(parent) {

		addStructureInfoLabel(parent, "Name:");
		this.weirInfoName = addStructureInfoValue(parent, "weirInfoName");

		addStructureInfoLabel(parent, "Height:");
		this.weirInfoHeight = addStructureInfoValue(parent, "weirInfoHeight");

		addStructureInfoLabel(parent, "Width:");
		this.weirInfoWidth = addStructureInfoValue(parent, "weirInfoWidth");

		addStructureInfoLabel(parent, "Angle:");
		this.weirInfoAngle = addStructureInfoValue(parent, "weirInfoAngle");

		addStructureInfoLabel(parent, "Coefficient:");
		this.weirInfoCoefficient = addStructureInfoValue(parent, "weirInfoCoefficient");

		addStructureInfoLabel(parent, "N:");
		this.weirInfoN = addStructureInfoValue(parent, "weirInfoN");

		addStructureInfoLabel(parent, "Flow:");
		this.weirInfoFlow = addStructureInfoValue(parent, "weirInfoFlow");

		addStructureInfoLabel(parent, "Datum A:");
		this.weirInfoDatumA = addStructureInfoValue(parent, "weirInfoDatumA");

		addStructureInfoLabel(parent, "Datum B:");
		this.weirInfoDatumB = addStructureInfoValue(parent, "weirInfoDatumB");

		addStructureInfoLabel(parent, "Dam Height:");
		this.weirInfoDamHeight = addStructureInfoValue(parent, "weirInfoDamHeight");

		addStructureInfoLabel(parent, "Dam Width:");
		this.weirInfoDamWidth = addStructureInfoValue(parent, "weirInfoDamWidth");

		addStructureInfoLabel(parent, "Area id A:");
		this.weirInfoAreaA = addStructureInfoValue(parent, "weirInfoAreaA");

		addStructureInfoLabel(parent, "Area id B:");
		this.weirInfoAreaB = addStructureInfoValue(parent, "weirInfoAreaB");

	}

	constructor(parent) {

		this.weirDetailContainer = document.createElement("div");
		parent.appendChild(this.weirDetailContainer);

		this.weirInfoTitle = document.createElement("h2");
		this.weirDetailContainer.appendChild(this.weirInfoTitle);
		
		this.weirInfoRow = document.createElement("div");
		this.weirInfoRow.className = "water-structure-info-row-spread";

		this.weirDetailContainer.appendChild(this.weirInfoRow);

		this.weirInfoDiv = document.createElement("div");
		this.weirInfoRow.appendChild(this.weirInfoDiv);


		this.weirInfoColumn = document.createElement("div");
		this.weirInfoColumn.className = "water-structure-info-grid";

		this.weirInfoDiv.appendChild(this.weirInfoColumn);

		this._addWeirInfoElements(this.weirInfoColumn);

		this.weirCanvasColumn = document.createElement("div");
		this.weirCanvasColumn.className = "water-structure-info-column";
		this.weirInfoRow.appendChild(this.weirCanvasColumn);

		this.weirFrontCanvasDiv = document.createElement("div");
		this.weirCanvasColumn.appendChild(this.weirFrontCanvasDiv);

		this.weirSideCanvasDiv = document.createElement("div");
		this.weirCanvasColumn.appendChild(this.weirSideCanvasDiv);

		this.weirFrontCanvasTitle = document.createElement("h2");
		this.weirFrontCanvasTitle.innerHTML = "Front View:";
		this.weirFrontCanvasDiv.appendChild(this.weirFrontCanvasTitle);

		this.weirSideCanvasTitle = document.createElement("h2");
		this.weirSideCanvasTitle.innerHTML = "Side View:";
		this.weirSideCanvasDiv.appendChild(this.weirSideCanvasTitle);

		this.weirFrontCanvas = document.createElement("canvas");
		this.weirFrontCanvas.width = 300;
		this.weirFrontCanvas.height = 100;
		this.weirFrontCanvasDiv.appendChild(this.weirFrontCanvas);

		this.weirSideCanvas = document.createElement("canvas");
		this.weirSideCanvas.width = 300;
		this.weirSideCanvas.height = 150;
		this.weirSideCanvasDiv.appendChild(this.weirSideCanvas);

		this.weirSliderContainer = document.createElement("div");
		parent.appendChild(this.weirSliderContainer);

		this.timeframeSlider = addTimeframeSlider(this.weirSliderContainer);

		this.weirPlotsContainer = document.createElement("div");
		this.weirPlotRow = document.createElement("div");
		this.weirPlotRow.className = "water-structure-info-row";

		this.weirPlotsContainer.appendChild(this.weirPlotRow);

		this.weirFlowPlot = document.createElement("div");
		this.weirFlowPlot.id = "weirFlowPlot";
		this.weirFlowPlot.className = "water-structure-plot";
		this.weirPlotRow.appendChild(this.weirFlowPlot);

		this.weirHeightPlot = document.createElement("div");
		this.weirHeightPlot.id = "weirHeightPlot";
		this.weirHeightPlot.className = "water-structure-plot";
		this.weirPlotRow.appendChild(this.weirHeightPlot);

		this.weirDetailContainer.appendChild(this.weirPlotsContainer);
	}

	updateWeirDetailInfoPanel(weir, weirTimeframe) {

		if (weir == null) {
			weir = WeirPanel.getDummyWeir();
		}

		this.weirInfoName.innerHTML = weir.name;

		this.weirInfoHeight.innerHTML = weir.heights[weirTimeframe] + " m";

		this.weirInfoWidth.innerHTML = weir.width + " m";

		this.weirInfoFlow.innerHTML = weir.flows[weirTimeframe] + " m³/s";

		this.weirInfoDatumA.innerHTML = weir.datumsA[weirTimeframe] + " m";

		this.weirInfoDatumB.innerHTML = weir.datumsB[weirTimeframe] + " m";

		this.weirInfoDamHeight.innerHTML = weir.damHeight + " m";
		this.weirInfoDamWidth.innerHTML = weir.damWidth + " m";
		this.weirInfoAreaA.innerHTML = weir.areaOutputA;
		this.weirInfoAreaB.innerHTML = weir.areaOutputB;
		this.weirInfoAngle.innerHTML = weir.angle > -10000 ? weir.angle + " &deg;" : "-";

		this.weirInfoCoefficient.innerHTML = weir.coefficient;
		this.weirInfoN.innerHTML = weir.weirN;

	}
}