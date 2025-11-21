import {visualizeWeir} from "../../src/js/water/structures/weir.js";

let weirHeight = 1.5;
let weirDatumLeft= 2.6;
let weirDatumRight = 0.4;
let flow = 1.0;

let canvas = document.getElementById("weirCanvas") ;
visualizeWeir(canvas, weirHeight, weirDatumLeft, weirDatumRight, flow );