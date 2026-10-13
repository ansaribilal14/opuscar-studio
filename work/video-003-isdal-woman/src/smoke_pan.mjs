import { createCanvas, loadImage } from "canvas";
import { photoPlate } from "./film_look.mjs";
import { writeFileSync } from "fs";
const W=1920,H=1080;
const variants=[
  ["panUp",   {zoom:[1.12,1.05],pan:[0,-0.35,0,0.1],dark:0.55,scrim:0.25}],
  ["zoomTight",{zoom:[1.22,1.14],pan:[0.1,0.15,-0.1,-0.2],dark:0.55,scrim:0.25}],
  ["panDown", {zoom:[1.12,1.05],pan:[0,0.35,0,-0.1],dark:0.55,scrim:0.25}],
];
const bufs=[];
for(const [label,opts] of variants){
  const c=createCanvas(W,H),x=c.getContext("2d");
  photoPlate(x,W,H,1.2,31,"isdalen_valley.jpg",opts);
  bufs.push([label,c.toBuffer("image/jpeg",{quality:88})]);
}
const ims=await Promise.all(bufs.map(([l,b])=>loadImage(b)));
const ctx=createCanvas(W,3*360).getContext("2d");
ims.forEach((im,i)=>ctx.drawImage(im,0,i*360,W,360));
writeFileSync("/home/z/my-project/work/qa/pan_sheet.jpg",ctx.canvas.toBuffer("image/jpeg",{quality:86}));
console.log("order: panUp / zoomTight / panDown");
