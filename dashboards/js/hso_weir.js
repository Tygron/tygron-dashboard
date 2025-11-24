import {visualizeWeir} from "../../src/js/water/structures/weir.js";

let weirHeight = 1.5;
let weirDatumLeft= 2.6;
let weirDatumRight = 0.4;
let flow = 1.0;
let coefficient = 1.1;//sharp


coefficient = 0.865; //broad perpendicular
coefficient = 0.91; // board rounded
//coefficient = 1.3; // rounded
//coefficient = 1.37; //rounded roof
//coefficient = 1.23; // custom



let canvas = document.getElementById("weirCanvas") ;
visualizeWeir(canvas, weirHeight, weirDatumLeft, weirDatumRight, flow , coefficient);