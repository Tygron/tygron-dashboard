import { addStructureInfoLabel, addStructureInfoValue } from "./StructurePanel.js";
import { addTimeframeSlider } from "../../ui/Timeframeslider.js";

export class CulvertPanel {

	static getDummyCulvert(timeframes) {
		timeframes = timeframes == null || Number.isNan(timeframes) ? 1 : Math.round(timeframes);
		
		return {
			name: "-",

			datumHeight: -10000.0,
			diameter: 0,
			rectangularHeight: -10000.0,

			heights: [timeframes].fill(-10000),
			flows: [timeframes].fill(0.0),
			datumsA: [timeframes].fill(-10000.0),
			datumsB: [timeframes].fill(-10000.0),
			areaIDA: -1,
			areaIDB: -1,
			datumHeightOutputA: -10000,
			datumHeightOutputB: -10000,
			culvertN: 3 / 2,
			elevationA: -10000,
			elevationB: -10000,
		};
	}


	_addCulvertInfoElements(parent) {

		addStructureInfoLabel(parent, "Name:");
		this.culvertInfoName = addStructureInfoValue(parent, "culvertInfoName");

		addStructureInfoLabel(parent, "Threshold:");
		this.culvertInfoDatumHeight = addStructureInfoValue(parent, "culvertInfoDatumHeight");

		addStructureInfoLabel(parent, "Height:");
		this.culvertInfoRectangularHeight = addStructureInfoValue(parent, "culvertInfoRectangularHeight");

		addStructureInfoLabel(parent, "Diameter:");
		this.culvertInfoWidth = addStructureInfoValue(parent, "culvertInfoDiameter");

		addStructureInfoLabel(parent, "N:");
		this.culvertInfoN = addStructureInfoValue(parent, "culvertInfoN");

		addStructureInfoLabel(parent, "Flow:");
		this.culvertInfoFlow = addStructureInfoValue(parent, "culvertInfoFlow");

		addStructureInfoLabel(parent, "Datum A:");
		this.culvertInfoDatumA = addStructureInfoValue(parent, "culvertInfoDatumA");

		addStructureInfoLabel(parent, "Datum B:");
		this.culvertInfoDatumB = addStructureInfoValue(parent, "culvertInfoDatumB");
	
		addStructureInfoLabel(parent, "Elevation A:");
		this.culvertInfoElevationA = addStructureInfoValue(parent, "culvertInfoElevationA");

		addStructureInfoLabel(parent, "Elevation B:");
		this.culvertInfoElevationB = addStructureInfoValue(parent, "culvertInfoElevationB");

	}

	constructor(parent) {

		this.culvertDetailContainer = document.createElement("div");
		parent.appendChild(this.culvertDetailContainer);

		this.culvertInfoTitle = document.createElement("h2");
		this.culvertDetailContainer.appendChild(this.culvertInfoTitle);

		this.culvertInfoRow = document.createElement("div");
		this.culvertInfoRow.className = "water-structure-info-row-spread";

		this.culvertDetailContainer.appendChild(this.culvertInfoRow);

		this.culvertInfoDiv = document.createElement("div");
		this.culvertInfoRow.appendChild(this.culvertInfoDiv);


		this.culvertInfoColumn = document.createElement("div");
		this.culvertInfoColumn.className = "water-structure-info-grid";

		this.culvertInfoDiv.appendChild(this.culvertInfoColumn);

		this._addCulvertInfoElements(this.culvertInfoColumn);

		this.culvertCanvasColumn = document.createElement("div");
		this.culvertCanvasColumn.className = "water-structure-info-column";
		this.culvertInfoRow.appendChild(this.culvertCanvasColumn);

		this.culvertFrontCanvasDiv = document.createElement("div");
		this.culvertCanvasColumn.appendChild(this.culvertFrontCanvasDiv);

		this.culvertSideCanvasDiv = document.createElement("div");
		this.culvertCanvasColumn.appendChild(this.culvertSideCanvasDiv);

		this.culvertFrontCanvasTitle = document.createElement("h2");
		this.culvertFrontCanvasTitle.innerHTML = "Front View:";
		this.culvertFrontCanvasDiv.appendChild(this.culvertFrontCanvasTitle);

		this.culvertSideCanvasTitle = document.createElement("h2");
		this.culvertSideCanvasTitle.innerHTML = "Side View:";
		this.culvertSideCanvasDiv.appendChild(this.culvertSideCanvasTitle);

		this.culvertFrontCanvas = document.createElement("canvas");
		this.culvertFrontCanvas.width = 300;
		this.culvertFrontCanvas.height = 100;
		this.culvertFrontCanvasDiv.appendChild(this.culvertFrontCanvas);

		this.culvertSideCanvas = document.createElement("canvas");
		this.culvertSideCanvas.width = 300;
		this.culvertSideCanvas.height = 150;
		this.culvertSideCanvasDiv.appendChild(this.culvertSideCanvas);

		this.culvertSliderContainer = document.createElement("div");
		parent.appendChild(this.culvertSliderContainer);

		this.timeframeSlider = addTimeframeSlider(this.culvertSliderContainer);

		this.culvertPlotsContainer = document.createElement("div");
		this.culvertPlotRow = document.createElement("div");
		this.culvertPlotRow.className = "water-structure-info-row";

		this.culvertPlotsContainer.appendChild(this.culvertPlotRow);

		this.culvertFlowPlot = document.createElement("div");
		this.culvertFlowPlot.id = "culvertFlowPlot";
		this.culvertFlowPlot.className = "water-structure-plot";
		this.culvertPlotRow.appendChild(this.culvertFlowPlot);

		this.culvertHeightPlot = document.createElement("div");
		this.culvertHeightPlot.id = "culvertHeightPlot";
		this.culvertHeightPlot.className = "water-structure-plot";
		this.culvertPlotRow.appendChild(this.culvertHeightPlot);


		this.culvertDetailContainer.appendChild(this.culvertPlotsContainer);

	}

	updateCulvertDetailInfoPanel(culvert, culvertTimeframe) {

		if (culvert == null) {
			culvert = CulvertPanel.getDummyCulvert(culvertTimeframe);
		}

		this.culvertInfoName.innerHTML = culvert.name;

		this.culvertInfoDatumHeight.innerHTML = culvert.datumHeight + " m";

		this.culvertInfoWidth.innerHTML = culvert.diameter + " m";

		this.culvertInfoRectangularHeight.innerHTML = culvert.rectangularHeight + " m";

		this.culvertInfoFlow.innerHTML = culvert.flows[culvertTimeframe] + " m³/s";

		this.culvertInfoDatumA.innerHTML = culvert.datumsA[culvertTimeframe] + " m";
		this.culvertInfoDatumB.innerHTML = culvert.datumsB[culvertTimeframe] + " m";

		this.culvertInfoElevationA.innerHTML = culvert.elevationA + " m";
		this.culvertInfoElevationB.innerHTML = culvert.elevationB + " m";

		this.culvertInfoN.innerHTML = culvert.culvertN;

	}
}