import { clearTable, createTable } from "../../../src/js/ui/Table.js";
import { removeAllChildren } from "../../../src/js/ui/Dom.js";
import { barPlot, createBarPlotLayout, sankeyPlot, xyTraces, xyPlot } from "../../../src/js/data/Plot.js";
import { addTimeframeSlider, setupTimeframeSlider } from "../../../src/js/ui/Timeframeslider.js";
import { addFlowValues, createLinks, createTimeframeData, addLink } from "../../../src/js/data/Data.js";
import { toCSVContent, addDownloadHandler } from "../../../src/js/io/File.js";
import { QueryDataManager } from "../../../src/js/data/QueryDataManager.js";
import { WeirPanel } from "../../../src/js/water/structures/WeirPanel.js";
import { CulvertPanel } from "../../../src/js/water/structures/CulvertPanel.js";
import { drawWeirFront, drawWeirSide } from "../../../src/js/water/structures/WeirPlot.js";
import { drawCulvertFront, drawCulvertSide } from "../../../src/js/water/structures/CulvertPlot.js";
import { Installer } from "../../../src/js/io/Installer.js";
import { DialogPane } from "../../../src/js/ui/DialogPane.js";
import { WaterLevelCSVReader } from "../../../src/js/water/structures/WaterLevelCsvReader.js";

// Sidebar toggles
document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
        const target = document.getElementById(item.dataset.target);
        if (!target) return;
        target.classList.toggle("open");
        item.classList.toggle("open");
    });
});

// Section switching
const allSections = document.querySelectorAll(".section");
const subItems = document.querySelectorAll(".sub-item");

subItems.forEach(btn => {
    btn.addEventListener("click", () => {
        subItems.forEach(s => s.classList.remove("active"));
        btn.classList.add("active");

        const id = btn.dataset.section;
        allSections.forEach(sec => sec.classList.remove("active"));
        document.getElementById(id).classList.add("active");
    });
});

// Default open
document.querySelectorAll(".nav-item").forEach(item => item.click());

document.querySelector("[data-section='wb-volumetabel']").click();

document.getElementById("waterAreaName").innerHTML = '$NAME';

const dialogPane = new DialogPane(document.body);

const queries = new QueryDataManager();
const stepwise = (value, index, array) => index === 0 ? value : value - array[index - 1];
const countPositive = value => Math.max(0, value);
const countNegative = value => Math.abs(Math.min(0, value));

const data = {};

const TIMEFRAMES = 'timeframes';
const TIMEFRAMETIMES = 'timeframetimes';
const START_DATE_MS = 'startDateMS';

queries.addQuery(TIMEFRAMETIMES,
    '$SELECT_NAME_WHERE_TIMEFRAME_IS_X_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY');
queries.addQuery(START_DATE_MS,
    '$SELECT_ATTRIBUTE_WHERE_NAME_IS_START_DATE_MS_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY');


data[TIMEFRAMETIMES] = queries.getData(TIMEFRAMETIMES);
data[TIMEFRAMES] = data[TIMEFRAMETIMES].map((_value, index) => index);
const timeframes = data[TIMEFRAMES].length;
const startDate = new Date(Math.round(queries.getData(START_DATE_MS)));
var timeframe = timeframes - 1;
var endDate = null;
try {
    if (data[TIMEFRAMETIMES].length > 0) {
        endDate = new Date(data[TIMEFRAMETIMES][data[TIMEFRAMETIMES].length - 1]);
    }
} catch (error) {
    endDate = null;
}

function pruneTimeframeValues(values) {
    if (!Array.isArray(values)) {
        return [];
    }

    if (!values.some(v => v !== 0)) {
        return [];
    }

    let endIndex = values.length;
    for (let i = 2; i < values.length; i += 2) {
        if (values[i] < values[i - 2]) {
            endIndex = i;
            break;
        }
    }
    return endIndex == values.length ? values : values.slice(0, endIndex);

}

/**
 * WEIRS
 */

function updateWeirDetails(weir) {

    if (weir == null) {
        weir = getDummyWeir();
    }

    weirPanel.updateWeirDetailInfoPanel(weir, weirTimeframe);

    drawWeirSide(weirPanel.weirSideCanvas, weirTimeframe, weir.heights, weir.datumsA, weir.datumsB, weir.damWidth, weir.damHeight, weir.flows, weir.coefficient);
    drawWeirFront(weirPanel.weirFrontCanvas, weirTimeframe, weir.heights, weir.datumsA, weir.datumsB, weir.width, weir.damWidth, weir.damHeight, weir.flows, weir.n);

    updateWeirFlowPlot(weir);

    updateWeirHeightPlot(weir);

}

function updateWeirFlowPlot(weir) {

    let properties = [HSO_OVERLAY_TIMEFRAMES, WEIR_FLOW_OUTPUT];
    let colors = {};
    colors[WEIR_FLOW_OUTPUT] = [218, 10, 10, 0.5];
    colors[WEIR_CUSTOM_FLOW] = [10, 218, 10, 0.5];

    let titles = {};
    titles[WEIR_FLOW_OUTPUT] = "Flow (m³/s)";
    titles[WEIR_CUSTOM_FLOW] = "Measurement Flow (m³/s)";

    let plotdata = {};
    plotdata[HSO_OVERLAY_TIMEFRAMES] = createTimeframeTimesData();
    plotdata[WEIR_FLOW_OUTPUT] = weir.flows;

    let traces = xyTraces("scatter", plotdata, properties, colors, titles);

    let customFlow = createCustomDataTrace(weir.customFlow, WEIR_CUSTOM_FLOW, colors, titles);
    if (customFlow.length > 0) {
        traces.push(customFlow[0]);
    }

    let layout = createWeirPlotLayout();
    layout.title = {
        text: "Flow (m³/s)"
    };

    copyAndStorePreviousTraceVisibility(weirPanel.weirFlowPlot.id, traces);

    Plotly.newPlot(weirPanel.weirFlowPlot, traces, layout);
}

function createWeirPlotLayout() {

    layout = createLayout();
    layout.showLegend = true;
    layout.width = 300;
    layout.height = 200;
    layout.margin = { l: 40, r: 40, t: 40, b: 40 };
    return layout;
}

function createTimeframeTimesData() {
    let dataTimeframes = [];
    for (let t = 0;t < timeframes;t++) {
        try {
            if (t < data[TIMEFRAMETIMES].length) {
                dataTimeframes.push(new Date(data[TIMEFRAMETIMES][t]));
            }
        } catch (error) {
            dataTimeframes.push(t);
        }
    }
    return dataTimeframes;
}

function updateWeirHeightPlot(weir) {

    let properties = [HSO_OVERLAY_TIMEFRAMES, WEIR_HEIGHT_OUTPUT, WEIR_DATUM_OUTPUT_A, WEIR_DATUM_OUTPUT_B];


    let colors = {};
    colors[WEIR_HEIGHT_OUTPUT] = [218, 10, 10, 0.5];
    colors[WEIR_DATUM_OUTPUT_A] = [10, 218, 10, 0.5];
    colors[WEIR_DATUM_OUTPUT_B] = [10, 10, 218, 0.5];
    colors[WEIR_CUSTOM_DATUM_A] = [218, 218, 10, 0.5];
    colors[WEIR_CUSTOM_DATUM_B] = [10, 218, 218, 0.5];

    let titles = {};
    titles[WEIR_HEIGHT_OUTPUT] = "Height";
    titles[WEIR_DATUM_OUTPUT_A] = "Datum A"; // replace A with water level area name
    titles[WEIR_DATUM_OUTPUT_B] = "Datum B"; // replace B with water level area name
    titles[WEIR_CUSTOM_DATUM_A] = "Measurement A"; // replace A with water level area name
    titles[WEIR_CUSTOM_DATUM_B] = "Measurement B"; // replace B with water level area name

    let plotdata = {};
    plotdata[HSO_OVERLAY_TIMEFRAMES] = createTimeframeTimesData();
    plotdata[WEIR_HEIGHT_OUTPUT] = weir.heights;
    plotdata[WEIR_DATUM_OUTPUT_A] = weir.datumsA;
    plotdata[WEIR_DATUM_OUTPUT_B] = weir.datumsB;

    let traces = xyTraces("scatter", plotdata, properties, colors, titles);

    let customA = createCustomDataTrace(weir.customDatumA, WEIR_CUSTOM_DATUM_A, colors, titles);
    if (customA.length > 0) {
        traces.push(customA[0]);
    }

    let customB = createCustomDataTrace(weir.customDatumB, WEIR_CUSTOM_DATUM_B, colors, titles);
    if (customB.length > 0) {
        traces.push(customB[0]);
    }

    let layout = createWeirPlotLayout();
    layout.title = {
        text: "Height and Datum (m)"
    };

    copyAndStorePreviousTraceVisibility(weirPanel.weirHeightPlot.id, traces);

    Plotly.newPlot(weirPanel.weirHeightPlot, traces, layout);

}

function createCustomDataTrace(values, propertyName, colors, titles) {
    if (values == null || values.length == 0) {
        return [];
    }

    let properties = [HSO_OVERLAY_TIMEFRAMES, propertyName];

    let timeframeTimes = [];
    let timeValues = [];
    for (let i = 0;i < values.length - 1;i += 2) {
        timeframeTimes.push(new Date(Math.round(values[i])));
        timeValues.push(values[i + 1]);
    }

    let plotdata = {};
    plotdata[HSO_OVERLAY_TIMEFRAMES] = timeframeTimes;
    plotdata[propertyName] = timeValues;

    return xyTraces("scatter", plotdata, properties, colors, titles);
}

function selectWeir(index) {
    let weirInfoTitle = weirPanel.weirInfoTitle;

    let weir = index >= 0 && index < weirs.length ? weirs[index] : null;

    if (weir == null) {
        weirInfoTitle.innerHTML = "-";
        updateWeirDetails(weir);
        return;
    }


    weirInfoTitle.innerHTML = weir.name;
    updateWeirDetails(weir);

    let weirList = document.getElementById("weirList");
    for (item of weirList.children) {
        if (item.myIndex == index) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    }
}

function getSelectedWeirIndex() {
    for (item of document.getElementById("weirList").children) {
        if (item.classList.contains('selected')) {
            return item.myIndex;
        }
    }
    return 0;
}

function addWeirListItem(index) {
    let weirList = document.getElementById("weirList");


    let listItem = document.createElement("a");
    listItem.onclick = () => selectWeir(index);
    listItem.innerHTML = weirs[index].name;
    listItem.myIndex = index;

    weirList.appendChild(listItem);

};

const HSO_OVERLAY_TIMEFRAMES = "hso_overlay_timeframes";
const WEIR_NAMES = 'weir_name';
const WEIR_ITEM_IDS = 'weir_itemIDs';
const WEIR_HEIGHTS = 'weir_heights';
const WEIR_WIDTH = 'weir_width';
const WEIR_FLOW_OUTPUT = 'weir_flow_output';
const WEIR_HEIGHT_OUTPUT = 'weir_height_output';
const WEIR_DATUM_OUTPUT_A = 'weir_datum_output_a';
const WEIR_DATUM_OUTPUT_B = 'weir_datum_output_b';
const WEIR_DAM_WIDTH = 'weir_dam_width';
const WEIR_DAM_HEIGHT = 'weir_dam_height';
const WEIR_AREA_OUTPUT_A = 'weir_water_area_output_a';
const WEIR_AREA_OUTPUT_B = 'weir_water_area_output_b';
const WEIR_ANGLE = 'weir_angle';
const WEIR_COEFFICIENT = 'weir_coefficient';
const WEIR_N = 'weir_n';
const WEIR_CUSTOM_DATUM_A = 'weir_custom_datum_a';
const WEIR_CUSTOM_DATUM_B = 'weir_custom_datum_b';
const WEIR_CUSTOM_FLOW = 'weir_custom_flow';

queries.addQuery(WEIR_NAMES, '$SELECT_NAME_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY');
queries.addQuery(WEIR_ITEM_IDS, '$SELECT_ID_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY');
queries.addQuery(WEIR_HEIGHTS, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_WEIR_HEIGHT_AND_TIMEFRAME_IS_X');
queries.addQuery(WEIR_WIDTH, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_WEIR_WIDTH');
queries.addQuery(WEIR_HEIGHT_OUTPUT, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_HEIGHT_OUTPUT_AND_TIMEFRAME_IS_X');
queries.addQuery(WEIR_FLOW_OUTPUT, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_FLOW_OUTPUT_AND_TIMEFRAME_IS_X');
queries.addQuery(WEIR_DATUM_OUTPUT_A, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_DATUM_OUTPUT_A_AND_TIMEFRAME_IS_X');
queries.addQuery(WEIR_DATUM_OUTPUT_B, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_DATUM_OUTPUT_B_AND_TIMEFRAME_IS_X');
queries.addQuery(WEIR_DAM_WIDTH, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_WEIR_DAM_OUTPUT_AND_INDEX_IS_0');
queries.addQuery(WEIR_DAM_HEIGHT, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_WEIR_DAM_OUTPUT_AND_INDEX_IS_1');
queries.addQuery(WEIR_AREA_OUTPUT_A, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_0');
queries.addQuery(WEIR_AREA_OUTPUT_B, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_1');
queries.addQuery(WEIR_ANGLE, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_WEIR_ANGLE');
queries.addQuery(WEIR_COEFFICIENT, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_WEIR_COEFFICIENT');
queries.addQuery(WEIR_N, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_WEIR_N');

queries.addQuery(WEIR_CUSTOM_DATUM_A, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_NAME_IS_CUSTOM_DATUM_A_AND_INDEX_IS_X');
queries.addQuery(WEIR_CUSTOM_DATUM_B, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_NAME_IS_CUSTOM_DATUM_B_AND_INDEX_IS_X');
queries.addQuery(WEIR_CUSTOM_FLOW, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_NAME_IS_CUSTOM_FLOW_AND_INDEX_IS_X');

const WEIR_PARAM_PROPERTIES = ["name", "coefficient", "weirN", "heights", "width", "angle", "damWidth", "damHeight"];
const WEIR_PARAM_TITLES = {
    "name": "Name",
    "coefficient": "Coefficient",
    "weirN": "Weir N",
    "heights": "Height (m)",
    "width": "Width (m)",
    "angle": "Angle (°)",
    "damWidth": "Dam Width (m)",
    "damHeight": "Dam Height (m)",

}

const WEIR_RESULT_PROPERTIES = ["name", "flows", "heights", "datumsA", "datumsB", "areaOutputA", "areaOutputB"];
const WEIR_RESULT_TITLES = {
    "name": WEIR_PARAM_TITLES["name"],
    "flows": "Flow (m³/s)",
    "heights": "Height (m)",
    "datumsA": "Datum A (m)",
    "datumsB": "Datum B (m)",
    "areaOutputA": "Area ID A",
    "areaOutputB": "Area ID B",
    "customDatumA": "Measurement Datum A (m)",
    "customDatumB": "Measurement Datum B (m)",
    "customFlow": "Measurement Flow (m³/s)",

}
let weirTimeframe = 0;

function createWeirs() {

    let weirs = [];

    let names = queries.getData(WEIR_NAMES, true, true);
    let itemIDs = queries.getData(WEIR_ITEM_IDS, true, true);
    let width = queries.getData(WEIR_WIDTH, true, true);
    let heights = queries.getData(WEIR_HEIGHT_OUTPUT, true, true);
    let flow = queries.getData(WEIR_FLOW_OUTPUT, true, true);
    let datumA = queries.getData(WEIR_DATUM_OUTPUT_A, true, true);
    let datumB = queries.getData(WEIR_DATUM_OUTPUT_B, true, true);
    let damWidth = queries.getData(WEIR_DAM_WIDTH, true, true);
    let damHeight = queries.getData(WEIR_DAM_HEIGHT, true, true);
    let areaOutputA = queries.getData(WEIR_AREA_OUTPUT_A, true, true);
    let areaOutputB = queries.getData(WEIR_AREA_OUTPUT_B, true, true);
    let angle = queries.getData(WEIR_ANGLE, true, true);
    let coefficient = queries.getData(WEIR_COEFFICIENT, true, true);
    let weirN = queries.getData(WEIR_N, true, true);

    let customDatumA = queries.getData(WEIR_CUSTOM_DATUM_A, true, true);
    let customDatumB = queries.getData(WEIR_CUSTOM_DATUM_B, true, true);
    let customFlow = queries.getData(WEIR_CUSTOM_FLOW, true, true);

    for (let i = 0;i < names.length;i++) {

        let weir = {
            name: i < names.length && names[i].length > 0 ? names[i][0] : "Weir " + i,
            itemID: i < itemIDs.length && itemIDs[i].length > 0 ? itemIDs[i][0] : -1,

            // array values
            heights: i < heights.length ? heights[i] : Array(timeframes).fill(-10000),
            flows: i < flow.length ? flow[i] : Array(timeframes).fill(0),
            datumsA: i < datumA.length ? datumA[i] : Array(timeframes).fill(-10000),
            datumsB: i < datumB.length ? datumB[i] : Array(timeframes).fill(-10000),

            // single value
            width: i < width.length ? width[i][0] : 0,
            damWidth: i < damWidth.length ? damWidth[i][0] : 0,
            damHeight: i < damHeight.length ? damHeight[i][0] : -1,
            areaOutputA: i < areaOutputA.length ? areaOutputA[i][0] : -1,
            areaOutputB: i < areaOutputB.length ? areaOutputB[i][0] : -1,
            angle: i < angle.length ? angle[i][0] : -10000,
            coefficient: i < coefficient.length && coefficient[i][0] > 0 ? coefficient[i][0] : 1.1,
            weirN: i < weirN.length && weirN[i][0] > 0 ? weirN[i][0] : 3 / 2,

            customDatumA: i < customDatumA.length ? pruneTimeframeValues(customDatumA[i]) : [],
            customDatumB: i < customDatumB.length ? pruneTimeframeValues(customDatumB[i]) : [],
            customFlow: i < customFlow.length ? pruneTimeframeValues(customFlow[i]) : [],
        };
        weirs.push(weir);

    }

    return weirs;
}

function updateWeirList(weirs) {
    removeAllChildren(document.getElementById("weirList"));

    for (let i = 0;i < weirs.length;i++) {
        addWeirListItem(i);
    }

    selectWeir(0, weirTimeframe);   
}

function fillWeirTables(weirs, timeframe) {
    fillWeirParamTable(weirs, timeframe);
    fillWeirResultTable(weirs, timeframe);
}

function fillWeirParamTable(weirs, timeframe) {

    let paramTable = document.getElementById("weirParamTable");

    clearTable(paramTable);

    addHeaderRow(paramTable, WEIR_PARAM_PROPERTIES, WEIR_PARAM_TITLES);
    for (let weir of weirs) {
        addTimeframeRow(paramTable, timeframe, weir, WEIR_PARAM_PROPERTIES, {});
    }
}

function fillWeirResultTable(weirs, timeframe) {

    let resultTable = document.getElementById("weirResultsTable");

    clearTable(resultTable);

    addHeaderRow(resultTable, WEIR_RESULT_PROPERTIES, WEIR_RESULT_TITLES);
    for (let weir of weirs) {
        addTimeframeRow(resultTable, timeframe, weir, WEIR_RESULT_PROPERTIES, {});
    }
}

const weirPanel = new WeirPanel(document.getElementById("weirDetailParent"));

setupTimeframeSlider(weirPanel.timeframeSlider, weirTimeframe, timeframes, function() {
    weirTimeframe = weirPanel.timeframeSlider.style.getPropertyValue("--value");
    selectWeir(getSelectedWeirIndex());
}, data[TIMEFRAMETIMES] );

const weirs = createWeirs();
fillWeirTables(weirs, weirTimeframe);
updateWeirList(weirs);

const weirResultSlider = addTimeframeSlider(document.getElementById("weirResultSliderDiv"));
const weirParamSlider = addTimeframeSlider(document.getElementById("weirParamSliderDiv"));

setupTimeframeSlider(weirParamSlider, weirTimeframe, timeframes, function() {
    let timeframe = weirParamSlider.style.getPropertyValue("--value");
    weirResultSlider.style.setProperty("--value", timeframe);
    fillWeirTables(weirs, timeframe);
}, data[TIMEFRAMETIMES] );

setupTimeframeSlider(weirResultSlider, weirTimeframe, timeframes, function() {
    let timeframe = weirResultSlider.style.getPropertyValue("--value");
    weirParamSlider.style.setProperty("--value", timeframe);
    fillWeirTables(weirs, timeframe);
}, data[TIMEFRAMETIMES] );

addDownloadHandler(document.getElementById("weirDownloadParamCsvButton"), "weir_params.csv", () => toCSVContent(weirs, WEIR_PARAM_PROPERTIES, WEIR_PARAM_TITLES, timeframes));
addDownloadHandler(document.getElementById("weirDownloadResultCsvButton"), "weir_results.csv", () => toCSVContent(weirs, WEIR_RESULT_PROPERTIES, WEIR_RESULT_TITLES, timeframes));

if (weirs.length <= 0) {
    document.getElementById("navGroupWeirs").style.display = 'none';
}

/**
 * CULVERTS
 */
function updateCulvertDetails(culvert) {

    if (culvert == null) {
        culvert = getDummyCulvert();
    }

    culvertPanel.updateCulvertDetailInfoPanel(culvert, culvertTimeframe);

    drawCulvertSide(culvertPanel.culvertSideCanvas, culvertTimeframe, culvert.datumHeight, culvert.datumsA, culvert.datumsB,
        culvert.diameter, culvert.rectangularHeight, culvert.elevationA, culvert.elevationB);
    drawCulvertFront(culvertPanel.culvertFrontCanvas, culvertTimeframe, culvert.datumHeight, culvert.datumsA, culvert.datumsB, culvert.diameter, culvert.rectangularHeight, culvert.elevationA, culvert.elevationB, 1, culvert.culvertN);

    updateCulvertFlowPlot(culvert);

    updateCulvertHeightPlot(culvert);

}

function updateCulvertFlowPlot(culvert) {

    let properties = [HSO_OVERLAY_TIMEFRAMES, CULVERT_FLOW_OUTPUT];
    let colors = {};
    colors[CULVERT_FLOW_OUTPUT] = [218, 10, 10, 0.5];
    colors[CULVERT_CUSTOM_FLOW] = [10, 218, 10, 0.5];

    let titles = {};
    titles[CULVERT_FLOW_OUTPUT] = "Flow";
    titles[CULVERT_CUSTOM_FLOW] = "Measurement Flow (m³/s)";

    let plotdata = {};
    plotdata[HSO_OVERLAY_TIMEFRAMES] = createTimeframeTimesData();
    plotdata[CULVERT_FLOW_OUTPUT] = culvert.flows;

    let traces = xyTraces("scatter", plotdata, properties, colors, titles);

    let customFlow = createCustomDataTrace(culvert.customFlow, CULVERT_CUSTOM_FLOW, colors, titles);
    if (customFlow.length > 0) {
        traces.push(customFlow[0]);
    }

    let layout = createWeirPlotLayout();
    layout.title = {
        text: "Flow (m³/s)"
    };

    copyAndStorePreviousTraceVisibility(culvertPanel.culvertFlowPlot.id, traces);

    Plotly.newPlot(culvertPanel.culvertFlowPlot, traces, layout);
}

function updateCulvertHeightPlot(culvert) {

    let properties = [HSO_OVERLAY_TIMEFRAMES, CULVERT_HEIGHT_OUTPUT, CULVERT_DATUM_OUTPUT_A, CULVERT_DATUM_OUTPUT_B];

    let colors = {};
    colors[CULVERT_HEIGHT_OUTPUT] = [218, 10, 10, 0.5];
    colors[CULVERT_DATUM_OUTPUT_A] = [10, 218, 10, 0.5];
    colors[CULVERT_DATUM_OUTPUT_B] = [10, 10, 218, 0.5];
    colors[CULVERT_CUSTOM_DATUM_A] = [218, 218, 10, 0.5];
    colors[CULVERT_CUSTOM_DATUM_B] = [10, 218, 218, 0.5];

    let titles = {};
    titles[CULVERT_HEIGHT_OUTPUT] = "Height";
    titles[CULVERT_DATUM_OUTPUT_A] = "Datum A"; // replace A with water level area name
    titles[CULVERT_DATUM_OUTPUT_B] = "Datum B"; // replace B with water level area name
    titles[CULVERT_CUSTOM_DATUM_A] = "Measurement A"; // replace A with water level area name
    titles[CULVERT_CUSTOM_DATUM_B] = "Measurement B"; // replace B with water level area name

    let plotdata = {};
    plotdata[HSO_OVERLAY_TIMEFRAMES] = createTimeframeTimesData();
    plotdata[CULVERT_HEIGHT_OUTPUT] = culvert.heights;
    plotdata[CULVERT_DATUM_OUTPUT_A] = culvert.datumsA;
    plotdata[CULVERT_DATUM_OUTPUT_B] = culvert.datumsB;

    let traces = xyTraces("scatter", plotdata, properties, colors, titles);
    let customA = createCustomDataTrace(culvert.customDatumA, CULVERT_CUSTOM_DATUM_A, colors, titles);
    if (customA.length > 0) {
        traces.push(customA[0]);
    }

    let customB = createCustomDataTrace(culvert.customDatumB, CULVERT_CUSTOM_DATUM_B, colors, titles);
    if (customB.length > 0) {
        traces.push(customB[0]);
    }

    let layout = createWeirPlotLayout();
    layout.title = {
        text: "Height and Datum (m)"
    };

    copyAndStorePreviousTraceVisibility(culvertPanel.culvertHeightPlot.id, traces);

    Plotly.newPlot(culvertPanel.culvertHeightPlot, traces, layout);
}

function selectCulvert(index) {
    let culvertInfoTitle = culvertPanel.culvertInfoTitle;

    let culvert = index >= 0 && index < culverts.length ? culverts[index] : null;

    if (culvert == null) {
        culvertInfoTitle.innerHTML = "-";
        updateCulvertDetails(culvert);
        return;
    }


    culvertInfoTitle.innerHTML = culvert.name;
    updateCulvertDetails(culvert);

    let culvertList = document.getElementById("culvertList");
    for (item of culvertList.children) {
        if (item.myIndex == index) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    }
}

function getSelectedCulvertIndex() {
    for (item of document.getElementById("culvertList").children) {
        if (item.classList.contains('selected')) {
            return item.myIndex;
        }
    }
    return 0;
}

function addCulvertListItem(index) {
    let culvertList = document.getElementById("culvertList");


    let listItem = document.createElement("a");
    listItem.onclick = () => selectCulvert(index);
    listItem.innerHTML = culverts[index].name;
    listItem.myIndex = index;

    culvertList.appendChild(listItem);

};

const CULVERT_NAMES = 'culvert_name';
const CULVERT_ITEM_IDS = 'culvert_itemID';
const CULVERT_DIAMETER = 'culvert_diameter';
const CULVERT_DATUM_HEIGHT = 'culvert_heights';
const CULVERT_RECTANGULAR_HEIGHT = 'culvert_width';
const CULVERT_FLOW_OUTPUT = 'culvert_flow_output';
const CULVERT_HEIGHT_OUTPUT = 'culvert_height_output';
const CULVERT_DATUM_OUTPUT_A = 'culvert_datum_output_a';
const CULVERT_DATUM_OUTPUT_B = 'culvert_datum_output_b';
const CULVERT_DATUM_HEIGHT_OUTPUT_A = 'culvert_datum_height_output_a';
const CULVERT_DATUM_HEIGHT_OUTPUT_B = 'culvert_datum_height_output_b';
const CULVERT_AREA_OUTPUT_A = 'culvert_water_area_output_a';
const CULVERT_AREA_OUTPUT_B = 'culvert_water_area_output_b';
const CULVERT_N = 'culvert_n';
const CULVERT_CUSTOM_DATUM_A = 'culvert_custom_datum_a';
const CULVERT_CUSTOM_DATUM_B = 'culvert_custom_datum_b';
const CULVERT_CUSTOM_FLOW = 'culvert_custom_flow';

queries.addQuery(CULVERT_NAMES, '$SELECT_NAME_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY');
queries.addQuery(CULVERT_ITEM_IDS, '$SELECT_ID_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY');
queries.addQuery(CULVERT_DIAMETER, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_CULVERT_DIAMETER');
queries.addQuery(CULVERT_N, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_CULVERT_N');
queries.addQuery(CULVERT_DATUM_HEIGHT, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_CULVERT_THRESHOLD');
queries.addQuery(CULVERT_RECTANGULAR_HEIGHT, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_CULVERT_RECTANGULAR_HEIGHT');
queries.addQuery(CULVERT_HEIGHT_OUTPUT, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_HEIGHT_OUTPUT_AND_TIMEFRAME_IS_X');
queries.addQuery(CULVERT_FLOW_OUTPUT, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_FLOW_OUTPUT_AND_TIMEFRAME_IS_X');
queries.addQuery(CULVERT_DATUM_OUTPUT_A, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_DATUM_OUTPUT_A_AND_TIMEFRAME_IS_X');
queries.addQuery(CULVERT_DATUM_OUTPUT_B, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_DATUM_OUTPUT_B_AND_TIMEFRAME_IS_X');
queries.addQuery(CULVERT_AREA_OUTPUT_A, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_0');
queries.addQuery(CULVERT_AREA_OUTPUT_B, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_1');
queries.addQuery(CULVERT_DATUM_HEIGHT_OUTPUT_A, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_4');
queries.addQuery(CULVERT_DATUM_HEIGHT_OUTPUT_B, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_5');

queries.addQuery(CULVERT_CUSTOM_DATUM_A, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_NAME_IS_CUSTOM_DATUM_A_AND_INDEX_IS_X');
queries.addQuery(CULVERT_CUSTOM_DATUM_B, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_NAME_IS_CUSTOM_DATUM_B_AND_INDEX_IS_X');
queries.addQuery(CULVERT_CUSTOM_FLOW, '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_YK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_NAME_IS_CUSTOM_FLOW_AND_INDEX_IS_X');

const CULVERT_PARAM_PROPERTIES = ["name", "diameter", "rectangularHeight", "datumHeight", "culvertN"];
const CULVERT_PARAM_TITLES = {
    "name": "Name",
    "diameter": "Diameter (m)",
    "rectangularHeight": "Rectangular Height (m)",
    "datumHeight": "Datum Height (m)",
    "culvertN": "Culvert N",
}

const CULVERT_RESULT_PROPERTIES = ["name", "flows", "heights", "datumsA", "datumsB", "areaIDA", "areaIDB", "datumHeightOutputA", "datumHeightOutputB"];
const CULVERT_RESULT_TITLES = {
    "name": CULVERT_PARAM_TITLES["name"],
    "flows": "Flow (m³/s)",
    "heights": "Height (m)",
    "datumsA": "Water Level Datum A (m)",
    "datumsB": "Water Level Datum B (m)",
    "areaIDA": "Area ID A",
    "areaIDB": "Area ID B",
    "datumHeightOutputA": "Datum Elevation A (m)",
    "datumHeightOutputB": "Datum Elevation B (m)",
    "customDatumA": "Measurement Datum A (m)",
    "customDatumB": "Measurement Datum B (m)",
    "customFlow": "Measurement Flow (m³/s)"

}
let culvertTimeframe = 0;

function createCulverts() {

    let culverts = [];

    let names = queries.getData(CULVERT_NAMES, true, true);
    let itemIDs = queries.getData(CULVERT_ITEM_IDS, true, true);
    let diameters = queries.getData(CULVERT_DIAMETER, true, true);
    let datumHeights = queries.getData(CULVERT_DATUM_HEIGHT, true, true);
    let rectangularHeights = queries.getData(CULVERT_RECTANGULAR_HEIGHT, true, true);
    let culvertNs = queries.getData(CULVERT_N, true, true);
    let heights = queries.getData(CULVERT_HEIGHT_OUTPUT, true, true);
    let flows = queries.getData(CULVERT_FLOW_OUTPUT, true, true);
    let datumsA = queries.getData(CULVERT_DATUM_OUTPUT_A, true, true);
    let datumsB = queries.getData(CULVERT_DATUM_OUTPUT_B, true, true);
    let areaIDA = queries.getData(CULVERT_AREA_OUTPUT_A, true, true);
    let areaIDB = queries.getData(CULVERT_AREA_OUTPUT_B, true, true);
    let elevationA = queries.getData(CULVERT_DATUM_HEIGHT_OUTPUT_A, true, true);
    let elevationB = queries.getData(CULVERT_DATUM_HEIGHT_OUTPUT_B, true, true);

    let customDatumA = queries.getData(CULVERT_CUSTOM_DATUM_A, true, true);
    let customDatumB = queries.getData(CULVERT_CUSTOM_DATUM_B, true, true);
    let customFlow = queries.getData(CULVERT_CUSTOM_FLOW, true, true);

    for (let i = 0;i < names.length;i++) {

        let culvert = {

            name: i < names.length && names[i].length > 0 ? names[i][0] : "Culvert " + i,
            itemID: i < itemIDs.length && itemIDs[i].length > 0 ? itemIDs[i][0] : -1,

            // array values
            heights: i < heights.length ? heights[i] : Array(timeframes).fill(-10000),
            flows: i < flows.length ? flows[i] : Array(timeframes).fill(0),
            datumsA: i < datumsA.length ? datumsA[i] : Array(timeframes).fill(-10000),
            datumsB: i < datumsB.length ? datumsB[i] : Array(timeframes).fill(-10000),

            // single value
            datumHeight: i < datumHeights.length ? datumHeights[i][0] : -10000.0,
            diameter: i < diameters.length ? diameters[i][0] : 0,
            rectangularHeight: i < rectangularHeights.length ? rectangularHeights[i][0] : -10000.0,
            culvertN: i < culvertNs.length && culvertNs[i][0] > 0 ? culvertNs[i][0] : 3 / 2,

            areaIDA: i < areaIDA.length ? areaIDA[i][0] : -1,
            areaIDB: i < areaIDB.length ? areaIDB[i][0] : -1,
            elevationA: i < elevationA.length ? elevationA[i][0] : -10000,
            elevationB: i < elevationB.length ? elevationB[i][0] : -10000,

            customDatumA: i < customDatumA.length ? pruneTimeframeValues(customDatumA[i]) : [],
            customDatumB: i < customDatumB.length ? pruneTimeframeValues(customDatumB[i]) : [],
            customFlow: i < customFlow.length ? pruneTimeframeValues(customFlow[i]) : [],
        };
        culverts.push(culvert);

    }

    return culverts;
}

function updateCulvertList(culverts) {
    removeAllChildren(document.getElementById("culvertList"));

    for (let i = 0;i < culverts.length;i++) {
        addCulvertListItem(i);
    }

    selectCulvert(0, culvertTimeframe);
}

function fillCulvertTables(culverts, timeframe) {
    fillCulvertParamTable(culverts, timeframe);
    fillCulvertResultTable(culverts, timeframe);
}

function fillCulvertParamTable(culverts, timeframe) {

    let paramTable = document.getElementById("culvertParamTable");

    clearTable(paramTable);

    addHeaderRow(paramTable, CULVERT_PARAM_PROPERTIES, CULVERT_PARAM_TITLES);
    for (let culvert of culverts) {
        addTimeframeRow(paramTable, timeframe, culvert, CULVERT_PARAM_PROPERTIES, {});
    }
}

function fillCulvertResultTable(culverts, timeframe) {

    let resultTable = document.getElementById("culvertResultsTable");

    clearTable(resultTable);

    addHeaderRow(resultTable, CULVERT_RESULT_PROPERTIES, CULVERT_RESULT_TITLES);
    for (let culvert of culverts) {
        addTimeframeRow(resultTable, timeframe, culvert, CULVERT_RESULT_PROPERTIES, {});
    }
}

const culvertPanel = new CulvertPanel(document.getElementById("culvertDetailParent"));
setupTimeframeSlider(culvertPanel.timeframeSlider, culvertTimeframe, timeframes, function() {
    culvertTimeframe = culvertPanel.timeframeSlider.style.getPropertyValue("--value");
    selectCulvert(getSelectedCulvertIndex());
}, data[TIMEFRAMETIMES] );

const culverts = createCulverts();
fillCulvertTables(culverts, culvertTimeframe);
updateCulvertList(culverts);

const culvertResultSlider = addTimeframeSlider(document.getElementById("culvertResultSliderDiv"));
const culvertParamSlider = addTimeframeSlider(document.getElementById("culvertParamSliderDiv"));
setupTimeframeSlider(culvertParamSlider, culvertTimeframe, timeframes, function() {
    let timeframe = culvertParamSlider.style.getPropertyValue("--value");
    culvertResultSlider.style.setProperty("--value", timeframe);
    fillCulvertTables(culverts, timeframe);
}, data[TIMEFRAMETIMES] );
setupTimeframeSlider(culvertResultSlider, culvertTimeframe, timeframes, function() {
    let timeframe = culvertResultSlider.style.getPropertyValue("--value");
    culvertParamSlider.style.setProperty("--value", timeframe);
    fillCulvertTables(culverts, timeframe);
}, data[TIMEFRAMETIMES] );

addDownloadHandler(document.getElementById("culvertDownloadParamCsvButton"), "culvert_params.csv", () => toCSVContent(culverts, CULVERT_PARAM_PROPERTIES, CULVERT_PARAM_TITLES, timeframes));
addDownloadHandler(document.getElementById("culvertDownloadResultCsvButton"), "culvert_results.csv", () => toCSVContent(culverts, CULVERT_RESULT_PROPERTIES, CULVERT_RESULT_TITLES, timeframes));

if (culverts.length <= 0) {
    document.getElementById("navGroupCulverts").style.display = 'none';
}

/**
 * Volume section 
 */
const M3TOTAL = 'm3Total';
const M3LAND = 'm3Land';
const M3WATER = 'm3Water';
const M3SEWER = 'm3Sewer';
const M3UNSATURATED = 'm3Unsaturated';
const M3SATURATED = 'm3Saturated';
const M3STORAGE = 'm3Storage';
const M3GROUND = 'm3Ground';

queries.addQuery(M3TOTAL,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID_AND_RESULTTYPE_IS_SURFACE_LAST_VALUE');
queries.addQuery(M3GROUND,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID_AND_RESULTTYPE_IS_GROUND_LAST_STORAGE');
queries.addQuery(M3STORAGE,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID_AND_RESULTTYPE_IS_BUILDING_LAST_STORAGE');
queries.addQuery(M3SEWER,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID_AND_RESULTTYPE_IS_SEWER_LAST_VALUE');
queries.addQuery(M3UNSATURATED,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID_AND_RESULTTYPE_IS_GROUND_LAST_UNSATURATED_STORAGE');
queries.addQuery(M3WATER,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_M3WATER_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID');

for (property of [M3TOTAL, M3WATER, M3GROUND, M3STORAGE, M3SEWER, M3UNSATURATED]) {
    data[property] = queries.getData(property);
}

data[M3SATURATED] = data[M3GROUND].map((value, index) => value - data[M3UNSATURATED][index])
data[M3LAND] = data[M3TOTAL].map((value, index) => value - data[M3WATER][index]);

function initVolumeTitles() {
    let titles = {};

    titles[TIMEFRAMES] = "Timeframe";//"Timeframe";
    titles[TIMEFRAMETIMES] = "Timestamp";//"Tijdstap";
    titles[M3LAND] = "Water on land [m³]";// "Water op land [m³]";
    titles[M3WATER] = "Surface water [m³]";//"Oppervlaktewater [m³]";
    titles[M3GROUND] = "Groundwater [m³]";//"Grondwater [m³]";
    titles[M3STORAGE] = "Building storage [m³]";//"Waterbergende voorzieningen [m³]";
    titles[M3SEWER] = "Sewer storage [m³]";//"Rioolwater [m³]";
    titles[M3UNSATURATED] = "Storage unsaturated zone [m³]";//"Berging onverzadidge zone [m³]";
    titles[M3SATURATED] = "Storage saturated zone [m³]";//"Berging verzadidge zone [m³]";

    return titles;
}

function initVolumeColors() {
    let colors = {};

    colors[M3WATER] = [10, 10, 218, 0.5];
    colors[M3LAND] = [10, 218, 10, 0.5];
    colors[M3GROUND] = [165, 42, 42, 0.5];
    colors[M3STORAGE] = [218, 10, 10, 0.5];
    colors[M3SEWER] = [128, 128, 128, 0.5];
    colors[M3UNSATURATED] = [218, 165, 10, 0.5];
    colors[M3SATURATED] = [10, 165, 165, 0.5];

    return colors;
}

const properties = [TIMEFRAMES, TIMEFRAMETIMES, M3LAND, M3WATER, M3SATURATED, M3UNSATURATED, M3SEWER, M3STORAGE];
const plotProperties = [TIMEFRAMES, M3LAND, M3WATER, M3SATURATED, M3UNSATURATED, M3SEWER, M3STORAGE];

const volumeTitles = initVolumeTitles();
const volumeColors = initVolumeColors();

createTable("waterBalanceTable", data, properties, volumeColors, volumeTitles);

const barPlotLayout = createBarPlotLayout();
barPlotLayout.title.text = "Berging per component";
barPlotLayout.yaxis.title.text = "Volume [m³]";
barPlotLayout.xaxis.title.text = "Component";

const barSlider = addTimeframeSlider(document.getElementById("balanceSliderDiv"));

function updateBarPlot() {
    barPlot("balancePlot", data, barSlider.getValue(), plotProperties, volumeColors, volumeTitles, barPlotLayout);
}

updateBarPlot();
setupTimeframeSlider(barSlider, timeframe, timeframes, updateBarPlot, data[TIMEFRAMETIMES] );


/**
 * Flow section 
 */
const MODEL_IN = 'MODEL_IN';
const MODEL_OUT = 'MODEL_OUT';
const RAINM3 = 'RAINM3';
const RAINM3LAND = 'RAINM3LAND';
const RAINM3WATER = 'RAINM3WATER';
const RAINM3STORAGE = 'RAINM3STORAGE';

const LANDSEWER = 'LANDSEWER';

const EVAPOTRANSPIRATION = 'EVAPOTRANSPIRATION';
const BOTTOM_FLOW = "BOTTOM_FLOW";
const GROUND_TRANSPIRATION = 'GROUND_TRANSPIRATION';
const SURFACE_EVAPORATIONLAND = 'SURFACE_EVAPORATIONLAND';
const SURFACE_EVAPORATIONWATER = 'SURFACE_EVAPORATIONWATER';

const SEWER_POC = 'SEWER_POC';
const SEWER_OVERFLOW_OUT = 'SEWER_OVERFLOW_OUT';

const INLET_SURFACE = 'INLET_SURFACE';
const INLET_GROUND = 'INLET_GROUND';
const OUTLET_SURFACE = "OUTLET_SURFACE";
const OUTLET_GROUND = "OUTLET_GROUND";
const BOTTOM_FLOW_IN = "BOTTOM_FLOW_IN";
const BOTTOM_FLOW_OUT = "BOTTOM_FLOW_OUT";
const CULVERT = "CULVERT";
const CULVERT_IN = "CULVERT_IN";
const CULVERT_OUT = "CULVERT_OUT";
const CULVERT_INNER = "CULVERT_INNER";
const PUMP = "PUMP";
const PUMP_IN = "PUMP_IN";
const PUMP_OUT = "PUMP_OUT";
const PUMP_INNER = "PUMP_INNER";
const WEIR = "WEIR";
const WEIR_IN = "WEIR_IN";
const WEIR_OUT = "WEIR_OUT";
const WEIR_INNER = "WEIR_INNER";
const BREACH = "BREACH";
const BREACH_IN = "BREACH_IN";
const BREACH_OUT = "BREACH_OUT";

function initFlowTitles() {

    let flowTitles = {};
    flowTitles[TIMEFRAMES] = "Timeframes";
    flowTitles[TIMEFRAMETIMES] = "Timestamp";//"Tijdstap";

    flowTitles[RAINM3] = 'Rainfall [m³/timeframe]';//'Neerslag [m³/tijdstap]';
    flowTitles[RAINM3LAND] = 'Rainfall on land [m³/timeframe]';// 'Neerslag op land [m³/tijdstap]';
    flowTitles[RAINM3WATER] = 'Rainfall on water [m³/timeframe]';//'Neerslag op water [m³/tijdstap]';
    flowTitles[RAINM3STORAGE] = 'Rainfall on building storage [m³/timeframe]';//'Neerslag op bergende voorzieningen [m³/tijdstap]';
    flowTitles[LANDSEWER] = 'Sewer in [m³/tijdstap]';//Toestroom naar riool [m³/tijdstap]';

    flowTitles[EVAPOTRANSPIRATION] = 'Evapotranspiration[m³/tijdstap]';//'Verdamping [m³/tijdstap]';
    flowTitles[GROUND_TRANSPIRATION] = 'Plant transpiration [m³/tijdstap]';//'Plant transpiratie [m³/tijdstap]';
    flowTitles[SURFACE_EVAPORATIONLAND] = 'Evaporation Land [m³/tijdstap]';//'Verdamping Land [m³/tijdstap]';
    flowTitles[SURFACE_EVAPORATIONWATER] = 'Evaporation Water [m³/tijdstap]';// 'Verdamping Water [m³/tijdstap]';


    flowTitles[SEWER_POC] = 'POC Sewer [m³/tijdstap]';//'POCRiool [m³/tijdstap]';

    flowTitles[SEWER_OVERFLOW_OUT] = 'Sewer Overflow [m³/tijdstap]';//'Riooloverstort [m³/tijdstap]';

    flowTitles[INLET_SURFACE] = 'Inlet (surface) [m³/tijdstap]';//'Inlaat bovengronds [m³/tijdstap]';
    flowTitles[INLET_GROUND] = 'Inlet (ground) [m³/tijdstap]';//'Inlaat ondergronds [m³/tijdstap]';
    flowTitles[OUTLET_SURFACE] = 'Outlet (surface) [m³/tijdstap]';//'Uitlaat bovengronds [m³/tijdstap]';
    flowTitles[OUTLET_GROUND] = 'Outlet (ground) [m³/tijdstap]';//'Uitlaat ondergronds [m³/tijdstap]';
    flowTitles[BOTTOM_FLOW_IN] = 'Bottom flow in [m³/tijdstap]';//'Kwel [m³/tijdstap]';
    flowTitles[BOTTOM_FLOW_OUT] = 'Bottom flow out [m³/tijdstap]';//'Uitzijging [m³/tijdstap]';
    flowTitles[CULVERT] = 'Culvert [m³/tijdstap]';//'Duiker [m³/tijdstap]';
    flowTitles[CULVERT_IN] = 'Culvert in [m³/tijdstap]';//'Duiker in waterbeheergebied [m³/tijdstap]';
    flowTitles[CULVERT_OUT] = 'Culvert out [m³/tijdstap]';//'Duiker uit waterbeheergebied [m³/tijdstap]';
    flowTitles[CULVERT_INNER] = 'Culvert within [m³/tijdstap]';//'Duiker binnen waterbeheergebied [m³/tijdstap]';
    flowTitles[PUMP] = 'Pump';//'Pomp';
    flowTitles[PUMP_IN] = 'Pump in [m³/tijdstap]';//'Pomp in waterbeheergebied [m³/tijdstap]';
    flowTitles[PUMP_OUT] = 'Pump out [m³/tijdstap]';//'Pomp uit waterbeheergebied [m³/tijdstap]';
    flowTitles[PUMP_INNER] = 'Pump within [m³/tijdstap]';//'Pomp binnen waterbeheergebied [m³/tijdstap]';
    flowTitles[WEIR] = 'Weir';//'Stuw';
    flowTitles[WEIR_IN] = 'Weir in [m³/tijdstap]';//'Stuw in [m³/tijdstap]';
    flowTitles[WEIR_OUT] = 'Weir out [m³/tijdstap]';//'Stuw uit [m³/tijdstap]';
    flowTitles[WEIR_INNER] = 'Weir within [m³/tijdstap]';//'Stuw binnen waterbeheergebied [m³/tijdstap]';
    flowTitles[MODEL_IN] = 'Water Level Area in [m³/tijdstap]';//'Waterbeheergebied in [m³/tijdstap]';
    flowTitles[MODEL_OUT] = 'Water Level Area out [m³/tijdstap]';//'Waterbeheergebied uit [m³/tijdstap]';

    flowTitles[M3GROUND] = 'Groundwater [m³]';//'Grondwater [m³]';
    flowTitles[M3UNSATURATED] = 'Unsaturated zone [m³]';//'Onverzadigde zone [m³]';
    flowTitles[M3SATURATED] = 'Saturated zone [m³]';//'Verzadigde zone [m³]';
    flowTitles[M3LAND] = 'Land [m³]';//'Land [m³]';
    flowTitles[M3WATER] = 'Surface water [m³]';//'Oppervlaktewater [m³]';
    flowTitles[M3STORAGE] = 'Building storage [m³]';//'Berging voorzieningen [m³]';
    flowTitles[M3TOTAL] = 'Surface [m³]';//'Surface [m³]';
    flowTitles[M3SEWER] = 'Sewer [m³]';//'Riolering [m³]';
    flowTitles[BREACH] = 'Breach';//'Bres';
    flowTitles[BREACH_IN] = 'Breach in [m³/tijdstap]';//'Bres in [m³/tijdstap]';
    flowTitles[BREACH_OUT] = 'Breach out [m³/tijdstap]';//'Bres uit [m³/tijdstap]';

    return flowTitles;
}

function initFlowColors() {
    let flowColors = {};
    // Model In/Out
    flowColors[MODEL_IN] = [44, 160, 44, 0.5];           // Groen
    flowColors[MODEL_OUT] = [214, 39, 40, 0.5];          // Rood

    //Natuurlijlke processen
    flowColors[RAINM3] = [31, 119, 180, 0.5];          // Donkerblauw - Neerslag
    flowColors[RAINM3LAND] = [31, 119, 180, 0.5];          // Donkerblauw - Neerslag
    flowColors[RAINM3WATER] = [31, 119, 180, 0.5];
    flowColors[RAINM3STORAGE] = [31, 119, 180, 0.5];

    flowColors[LANDSEWER] = [31, 119, 180, 0.5];



    flowColors[EVAPOTRANSPIRATION] = [31, 119, 180, 0.5];
    flowColors[GROUND_TRANSPIRATION] = [31, 119, 180, 0.5];
    flowColors[SURFACE_EVAPORATIONLAND] = [31, 119, 180, 0.5];
    flowColors[SURFACE_EVAPORATIONWATER] = [31, 119, 180, 0.5];


    flowColors[BOTTOM_FLOW_IN] = [31, 119, 180, 0.5];
    flowColors[BOTTOM_FLOW_OUT] = [31, 119, 180, 0.5];

    // Berging - Lichtblauw
    flowColors[M3LAND] = [196, 196, 220, 0.5];         // Berging land
    flowColors[M3WATER] = [196, 196, 220, 0.5];        // Oppervlaktewater
    flowColors[M3GROUND] = [196, 196, 220, 0.5];       // Bodem
    flowColors[M3STORAGE] = [196, 196, 220, 0.5];      // Gebouwen
    flowColors[M3UNSATURATED] = [196, 196, 220, 0.5];      // Onverzadidge zone
    flowColors[M3SATURATED] = [196, 196, 220, 0.5];      // Verzadidge zone
    flowColors[M3TOTAL] = [196, 196, 220, 0.5];        // Totale berging (optioneel)

    // Kunstwerken - Oranje
    flowColors[INLET_SURFACE] = [255, 127, 14, 0.5];
    flowColors[INLET_GROUND] = [255, 127, 14, 0.5];
    flowColors[OUTLET_SURFACE] = [255, 127, 14, 0.5];
    flowColors[OUTLET_GROUND] = [255, 127, 14, 0.5];
    flowColors[PUMP] = [255, 127, 14, 0.5];
    flowColors[PUMP_IN] = [255, 127, 14, 0.5];
    flowColors[PUMP_OUT] = [255, 127, 14, 0.5];
    flowColors[PUMP_INNER] = [255, 127, 14, 0.5];
    flowColors[SEWER_OVERFLOW_OUT] = [255, 127, 14, 0.5]; // Overstort
    flowColors[SEWER_POC] = [255, 127, 14, 0.5];           // POC
    flowColors[CULVERT] = [255, 127, 14, 0.5];
    flowColors[CULVERT_IN] = [255, 127, 14, 0.5];
    flowColors[CULVERT_OUT] = [255, 127, 14, 0.5];
    flowColors[CULVERT_INNER] = [255, 127, 14, 0.5];
    flowColors[WEIR] = [255, 127, 14, 0.5];
    flowColors[WEIR_IN] = [255, 127, 14, 0.5];
    flowColors[WEIR_OUT] = [255, 127, 14, 0.5];
    flowColors[WEIR_INNER] = [255, 127, 14, 0.5];
    flowColors[BREACH] = [255, 127, 14, 0.5];
    flowColors[BREACH_IN] = [255, 127, 14, 0.5];
    flowColors[BREACH_OUT] = [255, 127, 14, 0.5];

    return flowColors;
}

function initNodeColors() {
    let nodeColors = {};

    nodeColors[MODEL_IN] = "#2ca02c";
    nodeColors[MODEL_OUT] = "#d62728";
    nodeColors[M3LAND] = "#6699cc";
    nodeColors[M3WATER] = "#6699cc";
    nodeColors[M3GROUND] = "#6699cc";
    nodeColors[M3STORAGE] = "#6699cc";
    nodeColors[M3SEWER] = "#6699cc";
    nodeColors[M3UNSATURATED] = "#6699cc";
    nodeColors[M3SATURATED] = "#6699cc";
    nodeColors[RAINM3] = "#1f77b4";
    nodeColors[RAINM3LAND] = "#c5b0d5";
    nodeColors[RAINM3WATER] = "#8c564b";
    nodeColors[RAINM3STORAGE] = "#c49c94";
    nodeColors[GROUND_TRANSPIRATION] = "#1f77b4";
    nodeColors[EVAPOTRANSPIRATION] = "#1f77b4";
    nodeColors[SURFACE_EVAPORATIONLAND] = "#1f77b4";
    nodeColors[SURFACE_EVAPORATIONWATER] = "#1f77b4";
    nodeColors[BOTTOM_FLOW_IN] = "#1f77b4";
    nodeColors[BOTTOM_FLOW_OUT] = "#1f77b4";
    nodeColors[LANDSEWER] = "#17becf";
    nodeColors[SEWER_POC] = "#ff7f0e";
    nodeColors[SEWER_OVERFLOW_OUT] = "#ff7f0e";
    nodeColors[CULVERT] = "#ff7f0e";
    nodeColors[CULVERT_IN] = "#ff7f0e";
    nodeColors[CULVERT_OUT] = "#ff7f0e";
    nodeColors[CULVERT_INNER] = "#ff7f0e";
    nodeColors[INLET_SURFACE] = "#ff7f0e";
    nodeColors[OUTLET_SURFACE] = "#ff7f0e";
    nodeColors[INLET_GROUND] = "#ff7f0e";
    nodeColors[OUTLET_GROUND] = "#ff7f0e";
    nodeColors[PUMP] = "#ff7f0e";
    nodeColors[PUMP_IN] = "#ff7f0e";
    nodeColors[PUMP_OUT] = "#ff7f0e";
    nodeColors[PUMP_INNER] = "#ff7f0e";
    nodeColors[WEIR] = "#ff7f0e";
    nodeColors[WEIR_IN] = "#ff7f0e";
    nodeColors[WEIR_OUT] = "#ff7f0e";
    nodeColors[WEIR_INNER] = "#ff7f0e";
    nodeColors[BREACH] = "#ff7f0e";
    nodeColors[BREACH_IN] = "#ff7f0e";
    nodeColors[BREACH_OUT] = "#ff7f0e";

    return nodeColors;
}

const AREA_ID = "AreaID";
queries.addQuery(AREA_ID, '$ID');
const areaID = queries.getData(AREA_ID, false);


const flowTitles = initFlowTitles();
const flowColors = initFlowColors();

const flowProperties = [TIMEFRAMES, TIMEFRAMETIMES, MODEL_IN, MODEL_OUT, RAINM3, RAINM3LAND, RAINM3WATER, RAINM3STORAGE, GROUND_TRANSPIRATION, EVAPOTRANSPIRATION, SURFACE_EVAPORATIONLAND, SURFACE_EVAPORATIONWATER, BOTTOM_FLOW_IN, BOTTOM_FLOW_OUT, LANDSEWER, SEWER_POC, SEWER_OVERFLOW_OUT, CULVERT_IN, CULVERT_OUT, CULVERT_INNER, INLET_SURFACE, OUTLET_SURFACE, INLET_GROUND, OUTLET_GROUND, PUMP_IN, PUMP_OUT, PUMP_INNER, WEIR_IN, WEIR_OUT, WEIR_INNER, BREACH_IN, BREACH_OUT];
const flowData = createTimeframeData(timeframes, areaID, flowProperties);

const CULVERT_AREA_FROM = "culvertAreaFrom";
const CULVERT_AREA_TO = "culvertAreaTo";
const PUMP_AREA_FROM = "pumpAreaFrom";
const PUMP_AREA_TO = "pumpAreaTo";
const INLET_AREA_FROM = "inletAreaFrom";
const INLET_AREA_TO = "inletAreaTo";
const WEIR_AREA_FROM = "weirAreaFrom";
const WEIR_AREA_TO = "weirAreaTo";
const BREACH_AREA_FROM = "breachAreaFrom";
const BREACH_AREA_TO = "breachAreaTo";
const INLET_UNDERGROUND = "inletUnderground";
const INLET_IS_UNDERGROUND = "inletIsUnderground";
const INLET_IS_SURFACE = "inletIsSurface";

queries.addQuery(CULVERT_AREA_FROM,
    '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_0');
queries.addQuery(CULVERT_AREA_TO,
    '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XK_CULVERT_DIAMETER_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_1');
queries.addQuery(PUMP_AREA_FROM,
    '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XK_PUMP_Q_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_0');
queries.addQuery(PUMP_AREA_TO,
    '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XK_PUMP_Q_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_1');
queries.addQuery(INLET_AREA_FROM,
    '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XK_INLET_Q_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_0');
queries.addQuery(INLET_AREA_TO,
    '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XK_INLET_Q_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_1');
queries.addQuery(INLET_UNDERGROUND,
    '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XK_INLET_Q_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_UNDERGROUND_AND_INDEX_IS_0');
queries.addQuery(WEIR_AREA_FROM,
    '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_0');
queries.addQuery(WEIR_AREA_TO,
    '$SELECT_ATTRIBUTE_WHERE_BUILDING_IS_XK_WEIR_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_1');
queries.addQuery(BREACH_AREA_FROM,
    '$SELECT_ATTRIBUTE_WHERE_AREA_IS_XK_BREACH_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_0');
queries.addQuery(BREACH_AREA_TO,
    '$SELECT_ATTRIBUTE_WHERE_AREA_IS_XK_BREACH_HEIGHT_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_KEY_IS_OBJECT_WATER_AREA_OUTPUT_AND_INDEX_IS_1');

for (property of
    [CULVERT_AREA_FROM, CULVERT_AREA_TO, PUMP_AREA_FROM, PUMP_AREA_TO, INLET_AREA_FROM, INLET_AREA_TO,
        WEIR_AREA_FROM, WEIR_AREA_TO, BREACH_AREA_FROM, BREACH_AREA_TO, INLET_UNDERGROUND]) {
    flowData[property] = queries.getData(property);
}
flowData[INLET_IS_SURFACE] = flowData[INLET_UNDERGROUND].map((value, _index) => value <= 0);
flowData[INLET_IS_UNDERGROUND] = flowData[INLET_UNDERGROUND].map((value, _index) => value > 0);

flowData[TIMEFRAMES] = data[TIMEFRAMES];
flowData[TIMEFRAMETIMES] = data[TIMEFRAMETIMES];

queries.addQuery(RAINM3,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID_AND_RESULTTYPE_IS_RAIN');
queries.addQuery(RAINM3STORAGE,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID_AND_RESULTTYPE_IS_BUILDING_LAST_STORAGE');
queries.addQuery(LANDSEWER,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID_AND_RESULTTYPE_IS_SEWER_LAST_VALUE');
queries.addQuery(EVAPOTRANSPIRATION,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID_AND_RESULTTYPE_IS_EVAPOTRANSPIRATION');
queries.addQuery(GROUND_TRANSPIRATION,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID_AND_RESULTTYPE_IS_GROUND_TRANSPIRATION');
queries.addQuery(BOTTOM_FLOW,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID_AND_RESULTTYPE_IS_GROUND_BOTTOM_FLOW');


queries.addQuery(RAINM3LAND,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_RAIN_LAND_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID');
queries.addQuery(RAINM3WATER,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_RAIN_WATER_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID');
queries.addQuery(SURFACE_EVAPORATIONLAND,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_EVAPORATIONLAND_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID');
queries.addQuery(SURFACE_EVAPORATIONWATER,
    '$SELECT_GRIDVOLUME_WHERE_GRID_WITH_ATTRIBUTE_IS_HSO_EVAPORATIONWATER_AND_TIMEFRAME_IS_X_AND_AREA_IS_ID');

for (property of [RAINM3, RAINM3LAND, RAINM3WATER, RAINM3STORAGE, LANDSEWER, EVAPOTRANSPIRATION, SURFACE_EVAPORATIONLAND, SURFACE_EVAPORATIONWATER, GROUND_TRANSPIRATION]) {
    flowData[property] = queries.getData(property).map(stepwise);
}

flowData[BOTTOM_FLOW_IN] = queries.getData(BOTTOM_FLOW).map(countPositive).map(stepwise);
flowData[BOTTOM_FLOW_OUT] = queries.getData(BOTTOM_FLOW).map(countNegative).map(stepwise);


flowData[TIMEFRAMETIMES] = data[TIMEFRAMETIMES];
flowData[M3TOTAL] = data[M3TOTAL];
flowData[M3WATER] = data[M3WATER];
flowData[M3LAND] = data[M3LAND];
flowData[M3STORAGE] = data[M3STORAGE];
flowData[M3GROUND] = data[M3GROUND];
flowData[M3SEWER] = data[M3SEWER];
flowData[M3UNSATURATED] = data[M3UNSATURATED];
flowData[M3SATURATED] = data[M3SATURATED];

flowData[MODEL_IN] = flowData[RAINM3].map((_, i) =>
    flowData[RAINM3][i] +
    flowData[INLET_GROUND][i] +
    flowData[INLET_SURFACE][i] +
    flowData[BOTTOM_FLOW_IN][i]
);

flowData[MODEL_OUT] = flowData[EVAPOTRANSPIRATION].map((_, i) =>
    flowData[EVAPOTRANSPIRATION][i] +
    flowData[OUTLET_GROUND][i] +
    flowData[OUTLET_SURFACE][i] +
    flowData[BOTTOM_FLOW_OUT][i]
);

const BREACH_FLOW = "BREACH_FLOW";
const INLET_FLOW = "INLET_FLOW";
const WEIR_FLOW = "WEIR_FLOW";
const CULVERT_FLOW = "CULVERT_FLOW";
const PUMP_FLOW = "PUMP_FLOW";
const DRAINAGE_FLOW = "DRAINAGE_FLOW";
const SEWER_FLOW = "SEWER_FLOW";
const SERVER_OVERFLOW = "SERVER_OVERFLOW";

queries.addQuery(BREACH_FLOW,
    '$SELECT_ATTRIBUTE_WHERE_KEY_IS_OBJECT_FLOW_OUTPUT_AND_AREA_IS_XK_BREACH_HEIGHT_AND_TIMEFRAME_IS_Y_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY');
queries.addQuery(INLET_FLOW,
    '$SELECT_ATTRIBUTE_WHERE_KEY_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XK_INLET_Q_AND_TIMEFRAME_IS_Y_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY');
queries.addQuery(WEIR_FLOW,
    '$SELECT_ATTRIBUTE_WHERE_KEY_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XK_WEIR_HEIGHT_AND_TIMEFRAME_IS_Y_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY');
queries.addQuery(CULVERT_FLOW,
    '$SELECT_ATTRIBUTE_WHERE_KEY_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XK_CULVERT_DIAMETER_AND_TIMEFRAME_IS_Y_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY');
queries.addQuery(PUMP_FLOW,
    '$SELECT_ATTRIBUTE_WHERE_KEY_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XK_PUMP_Q_AND_TIMEFRAME_IS_Y_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY');
queries.addQuery(DRAINAGE_FLOW,
    '$SELECT_ATTRIBUTE_WHERE_KEY_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XK_DRAINAGE_Q_AND_TIMEFRAME_IS_Y_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY');
queries.addQuery(SEWER_FLOW,
    '$SELECT_ATTRIBUTE_WHERE_KEY_IS_OBJECT_FLOW_OUTPUT_AND_AREA_IS_XK_SEWER_STORAGE_AND_TIMEFRAME_IS_Y_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY');
queries.addQuery(SERVER_OVERFLOW,
    '$SELECT_ATTRIBUTE_WHERE_KEY_IS_OBJECT_FLOW_OUTPUT_AND_BUILDING_IS_XK_SEWER_OVERFLOW_AND_TIMEFRAME_IS_Y_AND_GRID_WITH_ATTRIBUTE_IS_HSO_WATER_OVERLAY');

queries.getData(BREACH_FLOW, false).map((values, timeframe, _array) =>
    addFlowValues(flowData, timeframe, BREACH_IN, BREACH_OUT, BREACH_AREA_FROM, BREACH_AREA_TO, values));

queries.getData(INLET_FLOW, false).map((values, timeframe, _array) =>
    addFlowValues(flowData, timeframe, INLET_SURFACE, OUTLET_SURFACE, INLET_AREA_FROM, INLET_AREA_TO, values, condition = INLET_IS_SURFACE));


queries.getData(INLET_FLOW, false).map((values, timeframe, _array) =>
    addFlowValues(flowData, timeframe, INLET_GROUND, OUTLET_GROUND, INLET_AREA_FROM, INLET_AREA_TO, values, condition = INLET_IS_UNDERGROUND));


queries.getData(WEIR_FLOW, false).map((values, timeframe, _array) =>
    addFlowValuesWithInner(flowData, timeframe, WEIR_IN, WEIR_OUT, WEIR_INNER, WEIR_AREA_FROM, WEIR_AREA_TO, values));

queries.getData(CULVERT_FLOW, false).map((values, timeframe, _array) =>
    addFlowValuesWithInner(flowData, timeframe, CULVERT_IN, CULVERT_OUT, CULVERT_INNER, CULVERT_AREA_FROM, CULVERT_AREA_TO, values));

queries.getData(PUMP_FLOW, false).map((values, timeframe, _array) =>
    addFlowValuesWithInner(flowData, timeframe, PUMP_IN, PUMP_OUT, PUMP_INNER, PUMP_AREA_FROM, PUMP_AREA_TO, values));

//queries.getData(DRAINAGE_FLOW, false).map((values, index, _array) =>
//	addFlowValues(flowData, index, DRAINGE_IN, DRAINAGE_OUT, DRAINAGE_AREA_FROM, DRAINAGE_AREA_TO, values));

//Berging Riool - POC
const sewerPOC = queries.getData(SEWER_FLOW, false);

let sewerPOCSums = [];

for (let areaKey = 0;areaKey < sewerPOC.length;areaKey++) {
    let areaValues = sewerPOC[areaKey];
    for (let timeframeKey = 0;timeframeKey < areaValues.length;timeframeKey++) {
        sewerPOCSums[timeframeKey] = sewerPOCSums[timeframeKey] ?? 0;
        sewerPOCSums[timeframeKey] = sewerPOCSums[timeframeKey] + areaValues[timeframeKey];
    }
}

flowData[SEWER_POC] = sewerPOCSums;

const sewerOverflow = queries.getData(SERVER_OVERFLOW, false);

let sewerOverflowSums = [];

for (let buildingKey = 0;buildingKey < sewerOverflow.length;buildingKey++) {
    let buildingValues = sewerOverflow[buildingKey];
    for (let timeframeKey = 0;timeframeKey < buildingValues.length;timeframeKey++) {
        sewerOverflowSums[timeframeKey] = sewerOverflowSums[timeframeKey] ?? 0;
        sewerOverflowSums[timeframeKey] = sewerOverflowSums[timeframeKey] + buildingValues[timeframeKey];
    }
}

flowData[SEWER_OVERFLOW_OUT] = sewerOverflowSums;

createTable("waterFlowTable", flowData, flowProperties, flowColors, flowTitles);

const sankeyproperties = [TIMEFRAMES, MODEL_IN, MODEL_OUT, M3LAND, M3WATER, M3GROUND, M3SATURATED, M3UNSATURATED, M3STORAGE, M3SEWER, RAINM3, RAINM3LAND, RAINM3WATER, RAINM3STORAGE, GROUND_TRANSPIRATION, EVAPOTRANSPIRATION, SURFACE_EVAPORATIONLAND, SURFACE_EVAPORATIONWATER, BOTTOM_FLOW_IN, BOTTOM_FLOW_OUT, LANDSEWER, SEWER_POC, SEWER_OVERFLOW_OUT, CULVERT, CULVERT_IN, CULVERT_OUT, CULVERT_INNER, INLET_SURFACE, OUTLET_SURFACE, INLET_GROUND, OUTLET_GROUND, PUMP, PUMP_IN, PUMP_OUT, PUMP_INNER, WEIR, WEIR_IN, WEIR_OUT, WEIR_INNER, BREACH, BREACH_IN, BREACH_OUT];

let links = createLinks(sankeyproperties);
for (let i = 0;i < timeframes;i++) {
    //Model in
    addLink(links, i, MODEL_IN, RAINM3, flowData[RAINM3][i]);
    addLink(links, i, MODEL_IN, INLET_GROUND, flowData[INLET_GROUND][i]);
    addLink(links, i, MODEL_IN, INLET_SURFACE, flowData[INLET_SURFACE][i]);
    addLink(links, i, MODEL_IN, BOTTOM_FLOW_IN, flowData[BOTTOM_FLOW_IN][i]);
    addLink(links, i, MODEL_IN, CULVERT, flowData[CULVERT_IN][i]);
    addLink(links, i, MODEL_IN, PUMP, flowData[PUMP_IN][i]);
    addLink(links, i, MODEL_IN, WEIR, flowData[WEIR_IN][i]);
    addLink(links, i, MODEL_IN, BREACH, flowData[BREACH_IN][i]);

    //Neerslag	
    addLink(links, i, RAINM3, M3LAND, flowData[RAINM3LAND][i]);
    addLink(links, i, RAINM3, M3WATER, flowData[RAINM3WATER][i]);
    addLink(links, i, RAINM3, M3STORAGE, flowData[RAINM3STORAGE][i]);

    //Berging Land
    addLink(links, i, M3LAND, M3SEWER, flowData[LANDSEWER][i]);
    addLink(links, i, M3LAND, SURFACE_EVAPORATIONLAND, flowData[SURFACE_EVAPORATIONLAND][i]);
    //addLink(links, i, M3LAND, M3GROUND, flowData[][i]);

    //Berging oppervlaktewater
    //addLink(links, i, M3WATER, M3GROUND, flowData[][i]);
    addLink(links, i, M3WATER, WEIR, flowData[WEIR_OUT][i]);
    addLink(links, i, M3WATER, SURFACE_EVAPORATIONWATER, flowData[SURFACE_EVAPORATIONWATER][i]);
    addLink(links, i, M3WATER, CULVERT, flowData[CULVERT_OUT][i]);
    addLink(links, i, M3WATER, OUTLET_SURFACE, flowData[OUTLET_SURFACE][i]);
    addLink(links, i, M3WATER, PUMP, flowData[PUMP_OUT][i]);
    addLink(links, i, M3WATER, PUMP, flowData[PUMP_INNER][i]);
    addLink(links, i, M3WATER, WEIR, flowData[WEIR_INNER][i]);
    addLink(links, i, M3WATER, CULVERT, flowData[CULVERT_INNER][i]);


    //Berging Bodem
    addLink(links, i, M3GROUND, BOTTOM_FLOW_OUT, flowData[BOTTOM_FLOW_OUT][i]);
    addLink(links, i, M3GROUND, GROUND_TRANSPIRATION, flowData[GROUND_TRANSPIRATION][i]);
    addLink(links, i, M3GROUND, OUTLET_GROUND, flowData[OUTLET_GROUND][i]);

    //Berging Riool
    addLink(links, i, M3SEWER, SEWER_OVERFLOW_OUT, flowData[SEWER_OVERFLOW_OUT][i]);
    addLink(links, i, M3SEWER, SEWER_POC, flowData[SEWER_POC][i]);

    //Inlaat Surface
    addLink(links, i, INLET_SURFACE, M3LAND, flowData[INLET_SURFACE][i]); // Eigenlijk zou hier een uitsplitsing moeten zijn tussen een inlaat op land en een inlaat in het water

    //Inlaat Ground
    addLink(links, i, INLET_GROUND, M3GROUND, flowData[INLET_GROUND][i]);

    //Uitlaat Surface
    addLink(links, i, OUTLET_SURFACE, MODEL_OUT, flowData[OUTLET_SURFACE][i]);

    //Uitlaat Land
    addLink(links, i, OUTLET_GROUND, MODEL_OUT, flowData[OUTLET_GROUND][i]);

    //Kwel 
    addLink(links, i, BOTTOM_FLOW_IN, M3GROUND, flowData[BOTTOM_FLOW_IN][i]);

    //Riool overstort
    addLink(links, i, SEWER_OVERFLOW_OUT, M3LAND, flowData[SEWER_OVERFLOW_OUT][i]);

    //POC
    addLink(links, i, SEWER_POC, MODEL_OUT, flowData[SEWER_POC][i]);

    //Wegzijging
    addLink(links, i, BOTTOM_FLOW_OUT, MODEL_OUT, flowData[BOTTOM_FLOW_OUT][i]);

    //Transpiratie
    addLink(links, i, GROUND_TRANSPIRATION, MODEL_OUT, flowData[GROUND_TRANSPIRATION][i]);

    //Verdamping
    addLink(links, i, SURFACE_EVAPORATIONLAND, MODEL_OUT, flowData[SURFACE_EVAPORATIONLAND][i]);
    addLink(links, i, SURFACE_EVAPORATIONWATER, MODEL_OUT, flowData[SURFACE_EVAPORATIONWATER][i]);

    //Stuw
    addLink(links, i, WEIR, MODEL_OUT, flowData[WEIR_OUT][i]);
    addLink(links, i, WEIR, M3WATER, flowData[WEIR_INNER][i]);

    //Duiker in
    addLink(links, i, CULVERT, M3WATER, flowData[CULVERT_IN][i]);
    addLink(links, i, CULVERT, M3WATER, flowData[CULVERT_INNER][i]);

    //Duiker uit
    addLink(links, i, CULVERT, MODEL_OUT, flowData[CULVERT_OUT][i]);

    //Pomp
    addLink(links, i, PUMP, M3WATER, flowData[PUMP_IN][i]);
    addLink(links, i, PUMP, M3WATER, flowData[PUMP_INNER][i]);

    //Bres
    addLink(links, i, BREACH, M3LAND, flowData[BREACH_IN][i]);
    addLink(links, i, M3LAND, BREACH, flowData[BREACH_OUT][i]);
    addLink(links, i, BREACH, MODEL_OUT, flowData[BREACH_OUT][i]);


}

const nodeColors = initNodeColors();
const sankeyLayout = createSankeyPlotLayout();

const sankeySlider = addTimeframeSlider(document.getElementById("sankeySliderDiv"));

function plotSankey() {
    sankeyPlot(
        "sankeyPlot",         // plotDivName
        links,                // links
        sankeySlider.getValue(),   // timeframe
        sankeyproperties,     // properties
        flowTitles,           // titles
        sankeyLayout,         // layout
        nodeColors           // kleuren als object

    );
}


setupTimeframeSlider(sankeySlider, timeframe, timeframes, plotSankey, data[TIMEFRAMETIMES] );

plotSankey();

addDownloadHandler(document.getElementById("balanceCSVButton"), "waterbalance.csv", () => toCSVContent(data, properties, volumeTitles, timeframes));
addDownloadHandler(document.getElementById("flowCSVButton"), "waterflow.csv", () => toCSVContent(flowData, flowProperties, flowTitles, timeframes));

function showImportCSVButtons(show) {
    document.getElementById("weirImportResultCsvLabel").style.display = show ? "block" : "none";
    document.getElementById("culvertImportResultCsvLabel").style.display = show ? "block" : "none";

}
function isDateValid(dateStr) {
    return !isNaN(new Date(dateStr));
}

function hasValidDateFormat() {

    for (let timeframeTime of data[TIMEFRAMETIMES]) {
        if (!isDateValid(timeframeTime)) {
            return false;
        }
    }
    return true;
}

const installer = new Installer();
function appendChains(...functions) {
    installer.appendChains(functions);
}

document.getElementById('weirImportResultCsvButton').addEventListener('change', (event) => onImportFileSelected(event, weirs, handleWeirCustomValues));
document.getElementById("culvertImportResultCsvButton").addEventListener('change', (event) => onImportFileSelected(event, culverts, handleCulvertCustomValues));

function changeTimestamp() {
    appendChains(
        installer.getConnector().post("event/editorsetting/set_timestamp_format", null, ["YYYY-MM-dd HH:mm:ss"]),

        () => showImportCSVButtons(true)
    );
}

function sendBuildingChanges(config, buildings) {

    let ids = [];
    let attributes = [];
    let values = [];

    for (let building of buildings) {

        for (let mappedProperty of config.mapping) {

            let propertyValue = building[mappedProperty.property];

            if (propertyValue != null && propertyValue.length > 0 && building.itemID != null && building.itemID >= 0) {

                ids.push(building.itemID);
                attributes.push(mappedProperty.attribute);
                values.push(propertyValue);
            }
        }
    }

    if (ids.length == 0) {
        return;
    }

    appendChains(
        installer.getConnector().post("event/editorbuilding/set_attributes", null, [ids, attributes, values])
    );
}

function getSuffixMapping(config, suffix) {
    if (!Array.isArray(config.mapping)) {
        return null;
    }

    for (let mapping of config.mapping) {
        if (mapping.suffix == suffix) {
            return mapping;
        }
    }
    return null;
}

function getWaterLevelTraces(results) {

    let traces = [];

    if (results == null || results.length < 2) {
        return traces;
    }

    let headers = results[0];
    let suffix = results[1];
    for (let i = 0;i < headers.length && i < suffix.length;i++) {

        // Quality column itself contains no values
        if (headers[i] == null || headers[i].length == 0
            || headers[i].endsWith("quality")) {
            continue;
        }

        let trace = {
            x: [],
            y: [],
            mode: 'lines+markers',
            name: headers[i] + " " + suffix[i],
            header: headers[i],
            suffix: suffix[i],
        };

        traces.push(trace);

        for (let r = 0;r < results.length;r++) {

            // Ignore unreliable quality values
            if (i + 1 < headers.length && headers[i + 1].endsWith("quality") && results[r][i + 1] != "original reliable") {
                continue;
            }

            trace.x.push(new Date(results[r][0]));

            //TODO: Replace later with number separator value.
            let value = parseFloat(results[r][i].replace(",", "."));
            trace.y.push(value);
        }
    }

    return traces;
}

function storeTraces(config, items, traces) {

    let changed = false;
    for (let trace of traces) {

        for (let item of items) {

            if (trace.header != item.name) {
                continue;
            }
            let mapping = getSuffixMapping(config, trace.suffix);
            if (mapping == null) {
                continue;
            }


            console.log('Mapped trace values for ' + config.itemName + " : " + item.name + " with id " + item.itemID);

            let valuesArray = [trace.x.length * 2];
            for (let i = 0;i < trace.x.length;i++) {
                let relativeMS = trace.x[i].getTime();
                valuesArray[2 * i] = relativeMS;
                valuesArray[2 * i + 1] = trace.y[i];
            }
            item[mapping.property] = valuesArray;
            changed = true;

        }
    }

    if (changed) {
        if (typeof app !== "undefined") {
            dialogPane.yesNo("The data is currently stored in this browser session. Do you also want to send the data to the project on the server?<br>If so, do not forget to save the project if you want to keep these changes.",
                (e) => {
                    sendBuildingChanges(config, items);
                });
        } else {
            dialogPane.confirmClose("The data was only stored in this browser session, since it has no access to your project's API. Alternatively, open the panel and import the data during a session in the Tygron Client Application.");
        }
		updateDetailPanels();
    }
}

function handleCustomValues(config, items, results) {

    if (results == null || results.length == 0) {
        dialogPane.confirmClose("No matches found for " + config.itemName + "s");
        return;
    }

    if (results.length == 1 && results[0].length == 0 || results[0].length == 1 && results[0][0] == '') {
        dialogPane.confirmClose("No matches found for " + config.itemName + " names");
        return;
    }

    let traces = getWaterLevelTraces(results);
    if (traces.length == 0) {
        dialogPane.confirmClose(results[0].length + " matching columns found, but no traces made for start and end time.")
        return;
    }

    dialogPane.yesNo(results[0].length + " matching columns found, " + traces.length + " traces made for start and end time.<br>Do you want to apply these traces to the " + config.itemName + "s?", (e) => {
        storeTraces(config, items, traces);
    }, null);
}

// CSV Value Handlers with Mappings
function handleWeirCustomValues(reader) {
    handleCustomValues({
        itemName: "Weir",
        mapping:
            [{
                attribute: "CUSTOM_DATUM_A",
                property: "customDatumA",
                suffix: "H.G"
            }, {
                attribute: "CUSTOM_DATUM_B",
                property: "customDatumB",
                suffix: "H.G.h"
            },
            {
                attribute: "CUSTOM_FLOW",
                property: "customFlow",
                suffix: ""
            }]
    },
        weirs,
        reader.getResults());
}

function handleCulvertCustomValues(reader) {
    handleCustomValues({
        itemName: "Culvert",
        mapping: [{
            attribute: "CUSTOM_DATUM_A",
            property: "customDatumA",
            suffix: "Hk"
        }, {
            attribute: "CUSTOM_DATUM_B",
            property: "customDatumB",
            suffix: "Hk.h"
        },
        {
            attribute: "CUSTOM_FLOW",
            property: "customFlow",
            suffix: ""
        }]
    },
        culverts,
        reader.getResults());
}

function onImportFileSelected(event, items, resultFunction) {

    const includeColumnPredicate = (header) => {
        if (header == null || header.endsWith("comments")) {
            return false;
        }

        for (let item of items) {
            if (item.name != null && header.startsWith(item.name)) {
                return true;
            }
        }
        return false;
    }

    const reader = new WaterLevelCSVReader();
    reader.setIncludeColumnPredicate(includeColumnPredicate);
    reader.setOnFinish(resultFunction);

    const file = event.target.files[0];
    if (file) {
        dialogPane.setInfoText(`Importing ${file.name} ... please wait.`);
        dialogPane.show();
        reader.setStartDate(startDate);
        reader.setEndDate(endDate);

        reader.readFromFile(file);
    }


}

function updateDetailPanels(){
	selectWeir(getSelectedWeirIndex());
	selectCulvert(getSelectedCulvertIndex());
}

function validateTimestamp() {
    if (typeof app !== "undefined") {
        installer.init(app.token());
        if (!hasValidDateFormat()) {
            dialogPane.yesNo("Your project's date format is required to be updated before importing date related data. Do you want to do that right now?", (e) => { changeTimestamp() }, null);
        } else {
            showImportCSVButtons(true);
        }
    } else {
        showImportCSVButtons(hasValidDateFormat());
    }
}

$(window).on("load", function() {

    validateTimestamp();
});
