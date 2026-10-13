import { createCanvas } from "canvas";
import { photoPlate } from "./film_look.mjs";
import { writeFileSync } from "fs";
const W=1920,H=1080;
const cands=[["moody_peak_p0","moody_peak.jpg",{zoom:[1.09,1.04],pan:[0,0,0,0],dark:0.60,scrim:0.24}],
             ["isdalen","isdalen_valley.jpg",{zoom:[1.09,1.04],pan:[0,0.1,0,-0.1],dark:0.60,scrim:0.24}],
             ["misty","misty_fjord.jpg",{zoom:[1.09,1.04],pan:[0,0.1,0,-0.1],dark:0.60,scrim:0.24}]];
const tiles=[];
for(const [label,name,opts] of cands){
  const c=createCanvas(W,H),ctx=c.getContext("2d");
  ctx.fillStyle="#101318";ctx.fillRect(0,0,W,H);
  photoPlate(ctx,W,H,2.5,31,name,opts);
  tiles.push(c.toBuffer("image/jpeg",{quality:88}));
}
const { loadImage }=await import("canvas");
const ims=await Promise.all(tiles.map(b=>loadImage(b)));
const sheet=createCanvas(W,3*540).getContext("2d");
ims.forEach((im,i)=>sheet.drawImage(im,0,i*540,W,540));
writeFileSync("/home/z/my-project/work/qa/fix2_sheet.jpg",sheet.canvas.toBuffer("image/jpeg",{quality:85}));
console.log("ok");
