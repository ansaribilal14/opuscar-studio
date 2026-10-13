import { createCanvas } from "canvas";
import { photoPlate } from "./film_look.mjs";
import { renderFrame } from "./scenes2.mjs";
import { writeFileSync } from "fs";
import { buildTimeline } from "./timeline.js";
const W=1920,H=1080;
const tl=buildTimeline();
const gt=898.5;
// 1) full renderFrame (known: has ellipse)
const cA=createCanvas(W,H),xA=cA.getContext("2d");
renderFrame(xA,W,H,tl,gt);
writeFileSync("/home/z/my-project/work/qa/ly_full.jpg",cA.toBuffer("image/jpeg",{quality:90}));
// 2) scene-only composition replicating funeral_card layers
const cB=createCanvas(W,H),xB=cB.getContext("2d");
photoPlate(xB,W,H,2.5,31,"isdalen_valley.jpg",{zoom:[1.09,1.04],pan:[0,0.1,0,-0.1],dark:0.55,scrim:0.25});
writeFileSync("/home/z/my-project/work/qa/ly_photo_only.jpg",cB.toBuffer("image/jpeg",{quality:90}));
console.log("dumped");
