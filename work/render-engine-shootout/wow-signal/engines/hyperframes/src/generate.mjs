// generate.mjs — v2 "PAPER & SKY" HyperFrames composition from the FROZEN shared package.
// Same TIMELINE.json + SRT + assets as Engine A (no re-authoring of timing).
// v1 rejection fixes: full-frame environments, hero >=55%, type >=34px, every scene
// moves (GSAP push + builds + ambient), caption band clear (bottom text <=78%),
// no caption truncation (all newlines converted), no seam overlaps (clean segment cuts).
import fs from "node:fs";
import path from "node:path";

const FILM = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../..");
const tl = JSON.parse(fs.readFileSync(path.join(FILM, "TIMELINE.json"), "utf8"));
const cues = fs.readFileSync(path.join(FILM, "shared/subtitles/wow-signal.srt"), "utf8")
  .trim().split(/\n\n+/).map((c) => {
    const [, tm, ...rest] = c.split("\n");
    const m = tm.match(/(\d+):(\d+):(\d+),(\d+)\s*-->\s*(\d+):(\d+):(\d+),(\d+)/);
    const s = +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000;
    const e = +m[5] * 3600 + +m[6] * 60 + +m[7] + +m[8] / 1000;
    return { s, e, text: rest.join("\n") };
  });

const P = {
  skyTop: "#13203f", skyMid: "#0a1226", skyLow: "#04070f",
  paper: "#ece3cd", inkPrint: "#2e2a22", penRed: "#c0392b",
  ink: "#f4f2ec", dim: "#9db0c8", signal: "#4be1a0", cyan: "#58c7f0",
  crimson: "#c0392b", warn: "#e0b34c",
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- shared building blocks (all mirror Engine A v2 layouts) ----------
const sky = (seed = 7, opts = "") =>
  `<div class="sky" ${opts}><div class="band"></div><div class="stars" data-seed="${seed}"></div><div class="hor"></div></div>`;
const paperbg = () =>
  `<div class="paperbg"><div class="rules"></div><div class="perfL"></div><div class="perfR"></div><div class="pglow"></div></div>`;
const bigear = (x, y, w, cls = "") =>
  `<svg class="${cls}" style="position:absolute;left:${x};top:${y};width:${w}" viewBox="0 0 1000 300">
    <rect x="0" y="240" width="1000" height="60" fill="#02040a"/>
    <polygon points="30,240 90,140 910,140 970,240" fill="#02040a"/>
    <path d="M560,240 Q660,20 780,240 Z" fill="#02040a"/>
    <line x1="630" y1="120" x2="630" y2="60" stroke="#02040a" stroke-width="10"/>
    <line x1="710" y1="130" x2="710" y2="75" stroke="#02040a" stroke-width="10"/></svg>`;
const disp = (txt, size, color = P.ink, ls = 6, extra = "") =>
  `<div class="disp" style="font-size:${size}px;color:${color};letter-spacing:${ls}px;${extra}">${esc(txt)}</div>`;
const secT = (txt, size = 72, color = P.ink, top = "10%", extra = "") =>
  `<div class="disp" style="top:${top};font-size:${size}px;color:${color};${extra}">${esc(txt)}</div>`;
const lab = (txt, x, y, size = 40, color = P.dim, align = "left") =>
  `<div class="lab" style="left:${x};top:${y};font-size:${size}px;color:${color};text-align:${align}">${esc(txt)}</div>`;
const num = (txt, top, size = 116, color = P.ink, extra = "") =>
  `<div class="disp" style="top:${top};font-size:${size}px;color:${color};${extra}">${esc(txt)}</div>`;
const chip2 = (txt, color, x, y, size = 38) =>
  `<div class="chip2" style="left:${x};top:${y};font-size:${size}px;color:${color};border-color:${color}">${esc(txt)}</div>`;
const pcard = (inner, x, y, w, h, rot = 0, extra = "") =>
  `<div class="pcard" style="left:${x};top:${y};width:${w};height:${h};transform:rotate(${rot}deg);${extra}">${inner}</div>`;
const mark = () =>
  `<div class="cmark"><i></i>THE UNCLOSED FILE</div>`;
const recon = (txt = "RECONSTRUCTION") =>
  `<div class="recon">${esc(txt)}</div>`;

// arch path (hero beam-transit)
const ARCH = "M0,290 C200,290 300,40 600,40 C900,40 1000,290 1200,290";

// ---------- per-scene inner HTML + GSAP tweens (LOCAL seconds) ----------
const sceneGens = {
  SC01(w) {
    return { html: `${sky(7)}${bigear("8%", "70%", "84%")}
      ${disp("AUGUST 15, 1977", 92, P.ink, 8, "top:13%")}
      ${disp("11:16 P.M. EASTERN", 44, P.dim, 10, "top:24%")}
      <svg viewBox="0 0 1200 300" style="position:absolute;left:12%;top:38%;width:76%">
        <path class="draw" data-dur="7" data-at="2.2" d="${ARCH}" fill="none" stroke="${P.signal}" stroke-width="7" style="filter:drop-shadow(0 0 18px rgba(75,225,160,0.55))"/></svg>
      <div class="sigbar" style="left:30%;top:71.5%;width:40%"><i class="fillbar" data-at="9.2" data-dur="4"></i></div>
      ${disp("OHIO IS LISTENING TO THE SKY", 40, P.dim, 6, "top:77.5%")}${mark()}`,
      tween: `[["fromTo","#SC01 .disp",{opacity:0,y:46},{opacity:1,y:0,duration:0.7,stagger:0.5,delay:0.4}]]` };
  },
  SC02(w) {
    const chars = ["6","E","Q","U","J","5"].map((c, i) =>
      `<span class="pc" style="color:${i === 3 ? P.signal : P.ink};text-shadow:${i === 3 ? "0 0 34px rgba(75,225,160,0.6)" : "none"}">${c}</span>`).join("");
    return { html: `${sky(11, 'data-empty="1"')}
      <div class="sixmono2">${chars}</div>
      <svg viewBox="0 0 1000 340" style="position:absolute;left:14%;top:29%;width:72%;pointer-events:none">
        <ellipse class="draw" data-dur="1.8" data-at="3.4" cx="500" cy="170" rx="470" ry="150" fill="none" stroke="${P.penRed}" stroke-width="12" stroke-linecap="round" transform="rotate(-4 500 170)"/></svg>
      <div class="wownote2">Wow!</div>
      ${disp("SIX CHARACTERS FROM DEEP SPACE", 48, P.dim, 8, "top:79%")}${mark()}${recon("PRINTOUT CHARACTERS — WIKIMEDIA COMMONS (PD)")}`,
      tween: `[["fromTo",".pc",{opacity:0},{opacity:1,duration:0.35,stagger:0.5,delay:0.5}],
               ["fromTo",".wownote2",{opacity:0},{opacity:1,duration:1.1,delay:5.4}]]` };
  },
  SC03(w) {
    return { html: `${sky(21)}
      <div class="tcrule" style="top:23.5%"></div>
      ${disp("THE WOW! SIGNAL", 148, P.ink, 16, "top:34%")}
      ${disp("72 SECONDS FROM DEEP SPACE", 58, P.signal, 14, "top:49%")}
      ${disp("A FILM FROM THE UNCLOSED FILE", 40, P.dim, 10, "top:61%")}`,
      tween: `[["fromTo","#SC03 .disp,#SC03 .tcrule",{opacity:0,y:40},{opacity:1,y:0,duration:0.8,stagger:0.45,delay:0.6}]]` };
  },
  SC04(w) {
    const labels = [["FLAT REFLECTOR", "24%", "42%", "29%", "54%"], ["FIXED PARABOLOID", "68%", "29%", "70%", "46%"],
                    ["FEED HORNS", "79%", "43%", "71%", "50%"], ["STEEL GROUND PLANE", "13%", "76%", "25%", "69%"]];
    const labHtml = labels.map(([t, lx, ly, tx, ty], i) =>
      `<div class="leader" style="left:${lx};top:${ly}" data-lx="${tx}" data-ly="${ty}"><span>${t}</span></div>`).join("");
    return { html: `${sky(31)}
      ${disp("BIG EAR", 78, P.ink, 10, "top:8%")}${disp("OHIO STATE UNIVERSITY RADIO OBSERVATORY", 40, P.dim, 6, "top:17%")}
      ${bigear("7%", "52%", "86%")}
      <div class="beamglow" style="left:64%;top:22%"></div>${labHtml}${mark()}${recon()}`,
      tween: `[["fromTo","#SC04 .disp",{opacity:0,y:36},{opacity:1,y:0,duration:0.7,stagger:0.4,delay:0.5}],
               ["fromTo","#SC04 .leader",{opacity:0},{opacity:1,duration:0.5,stagger:0.5,delay:4.2}],
               ["fromTo","#SC04 .beamglow",{opacity:0},{opacity:1,duration:1.4,delay:3.2}]]` };
  },
  SC05(w) {
    const dots = Array.from({ length: 40 }, (_, i) =>
      `<i style="left:${(i * 173) % 1840}px;top:${(i * 97) % 380}px;animation-delay:${(i % 7) * 0.7}s"></i>`).join("");
    return { html: `${sky(55, 'data-empty="1"')}
      ${secT("THE SKY SWEEPS — THE TELESCOPE NEVER MOVES", 64, P.ink, "8%")}
      <div class="swath">${dots}<div class="beamrect"></div></div>
      ${lab("DECLINATION STRIP +30° TO −50° (1950.0)", "3.5%", "24%")}
      ${num("72 SECONDS PER SKY POINT", "75%", 60, P.ink)}${mark()}${recon()}`,
      tween: `[["fromTo","#SC05 .beamrect",{x:0},{x:1460,duration:24,ease:"none"},0],
               ["fromTo","#SC05 .disp",{opacity:0,y:36},{opacity:1,y:0,duration:0.7,stagger:0.4,delay:0.5}]]` };
  },
  SC06(w) {
    const cards = [["~20,000", "RADIO SOURCES CATALOGUED", P.inkPrint, -1],
                   ["2", "RECORD QUASARS FOUND", P.inkPrint, 0],
                   ["1972", "FUNDING CUT ORDERED", P.penRed, 1]]
      .map(([b, s, c, r], i) => pcard(
        `<div class="pnum" style="color:${c}">${b}</div><div class="pcap">${esc(s)}</div>${i === 2 ? '<div class="penline"></div>' : ""}`,
        `${6 + i * 33}%`, "28%", "26%", "42%", r, `data-d="${1.2 + i * 0.55}"`)).join("");
    return { html: `${paperbg()}${secT("A DECADE OF LISTENING", 72, P.inkPrint, "9%")}${cards}${mark()}${recon()}`,
      tween: `[["fromTo","#SC06 .pcard",{opacity:0,y:56},{opacity:1,y:0,duration:0.6,stagger:0.55,delay:1.2}]]` };
  },
  SC07(w) {
    let cells = "";
    for (let r = 0; r < 5; r++) for (let c = 0; c < 10; c++) {
      const idx = r * 10 + c;
      cells += `<div class="cell" data-d="${1.6 + idx * 0.16}"><span>${String(idx + 1).padStart(2, "0")}</span></div>`;
    }
    return { html: `${paperbg()}${secT("THE NARROWBAND SEARCH MACHINE", 72, P.inkPrint, "7%")}
      ${lab("50 channels · IBM 1130-era computing · line printer", "50%", "17.5%", 40, "#5a5240", "center")}
      <div class="cellgrid">${cells}</div>
      ${chip2("ONE CHARACTER PER ROW — EVERY 12 SECONDS", "#5a5240", "8.5%", "77%")}${mark()}${recon()}`,
      tween: `[["fromTo","#SC07 .cell",{opacity:0.25},{opacity:1,duration:0.2,stagger:0.16,delay:1.6},],
               ["fromTo","#SC07 .cell i",{opacity:0},{opacity:0.3,duration:0.3,stagger:0.16,delay:1.6}]]` };
  },
  SC08(w) {
    return { html: `${paperbg()}
      <img class="scanR" src="assets/printout_page.jpg" style="right:2.3%;top:10%;width:55.6%;height:82%;transform:rotate(0.5deg)">
      ${secT("THE RUN OF", 62, P.inkPrint, "18%", "left:4.5%;text-align:left")}
      ${secT("AUGUST 15, 1977", 62, P.inkPrint, "27%", "left:4.5%;text-align:left")}
      ${num("11:16 P.M.", "40%", 76, P.penRed, "left:0;right:44%")}
      ${lab("Two feed horns alternate rows", "4.5%", "53%", 40, "#33302a")}
      ${lab("A/B/A/B — 50 channels of sky", "4.5%", "58.5%", 40, "#5a5240")}
      ${mark()}${recon("ARCHIVAL PRINTOUT — WIKIMEDIA COMMONS (PD)")}`,
      tween: `[["fromTo","#SC08 .scanR",{opacity:0},{opacity:1,duration:0.8,delay:0.4}],
               ["fromTo","#SC08 .disp,#SC08 .lab",{opacity:0,y:36},{opacity:1,y:0,duration:0.6,stagger:0.35,delay:0.8}]]` };
  },
  SC09(w) {
    const rows = [["6", 6], ["E", 14], ["Q", 24], ["U", 30], ["J", 17], ["5", 5]].map(([ch, v], i) =>
      `<div class="hlrow" style="top:${i * 16.66}%" data-d="${1.4 + i * 1.15}">
         <b style="width:${(v / 32) * 100}%"></b><span style="color:${i === 3 ? "#0d5c3f" : "#1d2430"}">${ch}</span></div>`).join("");
    return { html: `${sky(77, 'data-empty="1"')}
      <div class="scanC" style="left:50%;top:10%;width:auto"><img src="assets/printout_close.jpg" style="height:86%;transform:rotate(-0.4deg)">
        <div class="hlladder">${rows}</div></div>
      ${mark()}${recon("CHANNEL 2 — SIX ROWS · SCAN — WIKIMEDIA COMMONS (PD)")}`,
      tween: `[["fromTo","#SC09 .hlrow",{opacity:0},{opacity:1,duration:0.4,stagger:1.15,delay:1.4}],
               ["fromTo","#SC09 .hlrow b",{scaleX:0},{scaleX:1,duration:0.5,stagger:1.15,delay:1.5}]]` };
  },
  SC10(w) {
    const ticks = Array.from({ length: 8 }, (_, i) =>
      `<div class="tick" style="bottom:${i * 12.5}%"><span>${i * 5}</span></div>`).join("");
    return { html: `${paperbg()}${secT("WHAT 'U' MEANS", 72, P.inkPrint, "7%")}
      <div class="vscale"><i class="vfill" data-d="4.5" data-at="1"></i>${ticks}
        <div class="lzone"><span>LETTER ZONE — 10σ TO 30σ</span></div>
        <div class="uring" data-d="1.2" data-at="5.5"><span>U</span></div></div>
      ${pcard(`<div class="pcap" style="font-size:40px;margin-top:34px">PEAK: 30σ ± 0.5σ</div>
        <div class="pcap" style="font-size:36px;line-height:1.5;margin-top:20px">Most background is the receiver's own hiss — the galaxy and the afterglow of the Big Bang.</div>`,
        "55%", "30%", "34%", "42%", 0.7, 'data-d="6.4"')}
      ${mark()}${recon()}`,
      tween: `[["fromTo","#SC10 .vscale .vfill",{scaleY:0},{scaleY:1,duration:4.5,delay:1,ease:"power1.inOut"}],
               ["fromTo","#SC10 .pcard",{opacity:0,y:40},{opacity:1,y:0,duration:0.6,delay:6.4}],
               ["fromTo","#SC10 .uring",{opacity:0},{opacity:1,duration:1,delay:5.5}]]` };
  },
  SC11(w) {
    return { html: `${sky(87)}
      ${secT("THE SHAPE OF A REAL TRANSIT", 72, P.ink, "8%")}
      <svg viewBox="0 0 1200 300" style="position:absolute;left:10%;top:32%;width:80%">
        <path class="draw" data-dur="5" data-at="1" d="${ARCH}" fill="none" stroke="${P.signal}" stroke-width="8" style="filter:drop-shadow(0 0 16px rgba(75,225,160,0.5))"/>
        <line class="hpline" x1="320" y1="110" x2="880" y2="110" stroke="${P.warn}" stroke-width="4" stroke-dasharray="12 10" data-d="6"/>
      </svg>
      ${num("FULL WIDTH ≈ 37 s", "52%", 38, P.warn)}
      <div class="chipsrow" style="top:77.5%">${chip2("FULL WINDOW: 72 s", P.dim, "11%", "0")}
        ${chip2("RISE 36 s → PEAK → FALL", P.dim, "41%", "0")}${chip2("NOT A SQUARE PULSE", P.dim, "71%", "0")}</div>
      ${mark()}${recon()}`,
      tween: `[["fromTo","#SC11 .hpline",{opacity:0},{opacity:1,duration:0.6,delay:6}],
               ["fromTo","#SC11 .chipsrow .chip2",{opacity:0,y:30},{opacity:1,y:0,duration:0.5,stagger:1,delay:8.2}]]` };
  },
  SC12(w) {
    return { html: `${sky(91, 'data-empty="1"')}
      ${secT("ONE HORN ONLY", 80, P.ink, "8%")}
      <div class="cone big live" style="left:16%" data-d="1.4"><b></b></div>
      <div class="cone big" style="left:56%" data-d="3.2"><b></b></div>
      ${lab("HORN A — SIGNAL", "30%", "72.5%", 40, P.signal, "center")}
      ${lab("HORN B — EMPTY · NOTHING CAME BACK", "70%", "72.5%", 40, P.dim, "center")}
      ${num("+5 MINUTES — SAME PATCH OF SKY: NOTHING", "78%", 48, P.warn)}${mark()}${recon()}`,
      tween: `[["fromTo","#SC12 .cone",{opacity:0},{opacity:1,duration:0.7,stagger:1.8,delay:1.4}],
               ["fromTo","#SC12 .lab,#SC12 .disp:not(.cmark)",{opacity:0,y:30},{opacity:1,y:0,duration:0.6,stagger:0.5,delay:2}]]` };
  },
  SC13(w) {
    let sheets = "";
    for (let i = 4; i >= 0; i--) sheets += `<div class="sheet" style="left:${i * 10}px;top:${i * 12}px;transform:rotate(${-1.7 + i * 0.9}deg)"></div>`;
    const rows = ["ROW 41 — SCAN", "ROW 42 — SCAN", "ROW 43 — 6EQUJ5", "ROW 44 — SCAN", "ROW 45 — SCAN"].map((r, i) =>
      `<div class="rrow${i === 2 ? " hi" : ""}" style="top:${i * 58}px">${r}</div>`).join("");
    return { html: `${paperbg()}${secT("JERRY R. EHMAN", 82, P.inkPrint, "13%")}
      ${lab("Radio astronomer · Ohio State University", "50%", "24%", 42, "#5a5240", "center")}
      <div class="stack">${sheets}</div>
      <div class="review">${rows}</div>
      ${lab("EVERY FEW DAYS — REVIEW PAGE BY PAGE", "52%", "71%", 36, "#5a5240")}${mark()}${recon()}`,
      tween: `[["fromTo","#SC13 .stack,#SC13 .review",{opacity:0,y:40},{opacity:1,y:0,duration:0.7,stagger:0.5,delay:1.2}]]` };
  },
  SC14(w) {
    return { html: `${sky(97, 'data-empty="1"')}
      <div class="scanC" style="left:44%;top:4%"><img src="assets/printout_close.jpg" style="height:94%;transform:rotate(0.3deg)"></div>
      <svg viewBox="0 0 1000 1000" style="position:absolute;left:44%;top:4%;height:94%;pointer-events:none">
        <ellipse class="draw" data-dur="2.2" data-at="1.6" cx="520" cy="420" rx="130" ry="240" fill="none" stroke="${P.penRed}" stroke-width="14" stroke-linecap="round" transform="rotate(-8 520 420)"/></svg>
      <div class="wownote2" style="left:88%;top:30%;font-size:120px">Wow!</div>
      ${chip2("AUGUST 19, 1977", P.dim, "86%", "48%")}${mark()}${recon("THE PRINTOUT — WIKIMEDIA COMMONS (PD)")}`,
      tween: `[["fromTo","#SC14 .wownote2",{opacity:0},{opacity:1,duration:1.2,delay:4}]]` };
  },
  SC15(w) {
    const rows = Array.from({ length: 9 }, (_, r) =>
      `<div style="top:${r * 96}px" class="mrow">${["1 1 1 2 3 1 1 1 1 1 1", "1 2 1 1 1 1 1 1 1 1 1", "1 1 1 1 2 1 1 1 1 1 1", "1 1 1 1 1 1 1 1 1 1 1"][r % 4]}</div>`).join("");
    return { html: `${paperbg()}${secT("HE CHECKED THE REST FIRST", 72, P.inkPrint, "7%")}
      ${lab("Did the annotation appear again on later rows? No.", "50%", "16%", 42, "#5a5240", "center")}
      <div class="scrollpage"><div class="scrollinner">${rows}</div></div>
      <div class="chipsrow" style="top:77.5%">${chip2("NOT REPEATED ON ANY LATER ROW", "#8a2f22", "14%", "0")}
        ${chip2("THE CIRCLE STANDS ALONE", "#4a4436", "50%", "0")}</div>${mark()}${recon()}`,
      tween: `[["fromTo","#SC15 .chipsrow .chip2",{opacity:0,y:30},{opacity:1,y:0,duration:0.5,stagger:3,delay:3.4}]]` };
  },
  SC16(w) {
    const pts = [[288, 360], [350, 275], [410, 295], [430, 365], [375, 390], [325, 385], [288, 360]];
    const poly = pts.map((p) => p.join(",")).join(" ");
    return { html: `${sky(101)}
      ${secT("WHERE THE SKY WAS", 72, P.ink, "7%")}
      <div class="coordcard">
        <div>R.A.&nbsp; 19h 22m 25s ± 10s</div><div>DEC.&nbsp; −27° 03′ ± 20′</div><div>EPOCH 1950.0</div></div>
      <svg viewBox="0 0 700 500" style="position:absolute;left:34%;top:20%;width:56%;height:62%">
        <polyline class="draw" data-dur="2.5" data-at="1.4" points="${poly}" fill="none" stroke="rgba(88,199,240,0.55)" stroke-width="3"/>
        ${pts.slice(0, 6).map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#fff"/>`).join("")}
        <circle cx="365" cy="360" r="16" fill="none" stroke="${P.signal}" stroke-width="6"/>
        <circle cx="365" cy="360" r="34" fill="none" stroke="rgba(75,225,160,0.5)" stroke-width="3"/>
        <text x="410" y="345" fill="${P.signal}" font-size="30" font-weight="700">WOW! SOURCE</text></svg>
      ${lab("TOWARD THE CENTER OF THE MILKY WAY · SAGITTARIUS", "5.5%", "68%", 38)}${mark()}${recon()}`,
      tween: `[["fromTo","#SC16 .coordcard",{opacity:0,x:-40},{opacity:1,x:0,duration:0.7,delay:1}],
               ["fromTo","#SC16 .lab",{opacity:0},{opacity:1,duration:0.6,delay:4.4}]]` };
  },
  SC17(w) {
    return { html: `${paperbg()}${secT("1959 — A NATURAL MEETING FREQUENCY", 68, P.inkPrint, "7%")}
      ${lab("Giuseppe Cocconi · Philip Morrison — where would civilization listen?", "50%", "16.5%", 40, "#5a5240", "center")}
      <svg viewBox="0 0 600 300" style="position:absolute;left:28%;top:22%;width:44%">
        <g transform="rotate(-17 300 150)">
          <ellipse cx="300" cy="150" rx="150" ry="62" fill="none" stroke="#3a352b" stroke-width="4"/>
          <circle cx="300" cy="150" r="16" fill="#3a352b"/>
          <circle class="orbitdot" cx="450" cy="150" r="11" fill="#5a5240"/></g>
        <path d="M340,120 a34,34 0 0 1 26,52" fill="none" stroke="${P.penRed}" stroke-width="8" stroke-linecap="round"/>
        <polygon points="374,178 358,166 366,190" fill="${P.penRed}"/></svg>
      ${num("1420 MEGAHERTZ", "64%", 104, "#1d5c44")}
      ${lab("THE WATERING HOLE — THE 21-CENTIMETER LINE OF HYDROGEN", "50%", "78%", 40, "#4a4436", "center")}
      ${mark()}${recon()}`,
      tween: `[["fromTo","#SC17 .orbitdot",{attr:{cx:450}},{motionPath:false,duration:0.01},0],
               ["fromTo","#SC17 .disp,#SC17 .lab",{opacity:0,y:36},{opacity:1,y:0,duration:0.7,stagger:0.5,delay:0.5}]]` };
  },
  SC18(w) {
    return { html: `${paperbg()}${secT("ALMOST — BUT NOT EXACTLY — THE HYDROGEN LINE", 58, P.inkPrint, "8%")}
      <div class="specbar"><i class="mk" style="left:8%" data-d="1.4"><b>1420.4058</b><span>HYDROGEN LINE</span></i>
        <i class="mk red" style="left:68%" data-d="3.2"><b>1420.4556</b><span>WOW! SIGNAL</span></i></div>
      <div class="bracket"><span>≈ 50 KILOHERTZ&nbsp; →&nbsp; ≈ 10 KM/S TOWARD EARTH</span></div>
      ${mark()}${recon()}`,
      tween: `[["fromTo","#SC18 .mk",{opacity:0},{opacity:1,duration:0.6,stagger:1.8,delay:1.4}],
               ["fromTo","#SC18 .bracket",{opacity:0},{opacity:1,duration:0.8,delay:5.2}]]` };
  },
  SC19(w) {
    const rows = [["LOCAL OSCILLATOR — ORDERED", "1450.4056 MHz", 0], ["LOCAL OSCILLATOR — DELIVERED", "1450.5056 MHz", 1],
                  ["EHMAN'S 1979 CALCULATION", "CORRECTED", 0], ["KRAUS'S 1995 SUMMARY FOR SAGAN", "UNCORRECTED", 1]]
      .map(([k, v, st], i) =>
        `<div class="ledrow2" style="top:${i * 74}px" data-d="${1.2 + i * 1.3}">
          <span>${esc(k)}</span><b class="${st ? "red" : "grn"}">${st ? `<i class="penstrike"></i>` : ""}${v}</b></div>`).join("");
    return { html: `${paperbg()}${secT("EVEN THE NUMBER HAS A STORY", 72, P.inkPrint, "8%")}
      ${lab("The local oscillator was delivered 100 kHz off", "50%", "17%", 40, "#5a5240", "center")}
      <div class="ledger">${rows}</div>
      ${disp("TWO VALUES IN THE LITERATURE — ONE KNOB", 40, "#4a4436", 4, "top:77.5%;font-weight:400;font-family:'Carlito'")}${mark()}${recon()}`,
      tween: `[["fromTo","#SC19 .ledrow2",{opacity:0,x:-30},{opacity:1,x:0,duration:0.5,stagger:1.3,delay:1.2}]]` };
  },
  SC20(w) {
    return { html: `${paperbg()}${secT("NARROWNESS IS WHAT TECHNOLOGY DOES", 62, P.inkPrint, "8%")}
      ${lab("NATURAL RADIO SOURCES — BROADBAND (PULSARS · QUASARS · GALAXIES)", "10%", "26%", 38, "#33302a")}
      <div class="wbar grey" data-d="1.2" data-at="1.2"></div>
      ${lab("THE WOW! SIGNAL — ONE 10-KILOHERTZ CHANNEL", "10%", "46%", 38, "#1d5c44")}
      <div class="wbar grn" data-d="1.2" data-at="2.8"></div>
      ${num("AND YET — NOTHING TECHNOLOGICAL WAS THERE TO DO IT", "72%", 44, "#33302a", "font-family:'Carlito';font-weight:700")}${mark()}${recon()}`,
      tween: `[["fromTo","#SC20 .wbar.grey",{scaleX:0},{scaleX:1,duration:1.4,delay:1.2,ease:"power2.out"}],
               ["fromTo","#SC20 .wbar.grn",{scaleX:0},{scaleX:1,duration:1.2,delay:2.8,ease:"power2.out"}]]` };
  },
  SC21(w) {
    const cards = [0, 1, 2].map((i) =>
      `<div class="sweepcard" style="left:${10 + i * 28}%" data-d="${1.2 + i * 0.8}">
        <div class="null">NULL</div><span>SWEEP ${i + 1}</span></div>`).join("");
    return { html: `${sky(113, 'data-empty="1"')}
      ${secT("THE FIRST FOLLOW-UP: LOOK AGAIN", 72, P.ink, "8%")}${cards}
      ${num("BIG EAR COULD NEVER BE REPOINTED", "66%", 52, P.ink)}
      ${disp("THE SKY ONLY PASSES — ONCE PER DAY, UNDER THE SAME BEAM", 38, P.dim, 4, "top:74%;font-weight:400")}
      ${mark()}${recon()}`,
      tween: `[["fromTo","#SC21 .sweepcard",{opacity:0,y:40},{opacity:1,y:0,duration:0.5,stagger:0.8,delay:1.2}]]` };
  },
  SC22(w) {
    const rows = [["1987 - 1989", "META ARRAY — OAK RIDGE (GRAY)"], ["1995", "GREEN BANK 35-m SNIFTING SCAN (SHOSTAK)"],
                  ["1995 - 1996", "VERY LARGE ARRAY (GRAY)"], ["1999", "MOUNT PLEASANT 26-m, TASMANIA"]]
      .map(([yr, what], i) =>
        `<div class="nullrow2" style="top:${i * 84}px" data-d="${1.4 + i * 1.5}">
          <b class="mono">${yr}</b><span>${esc(what)}</span><i class="stamp">NULL</i></div>`).join("");
    return { html: `${sky(127, 'data-empty="1"')}
      ${secT("DECADES OF BETTER INSTRUMENTS", 72, P.ink, "8%")}
      ${lab("Every instrument that could hear it — heard nothing", "50%", "17.5%", 40, P.dim, "center")}
      <div class="nulllist">${rows}</div>
      ${disp("SILENCE, EVERY TIME", 48, P.dim, 12, "top:76%")}${mark()}`,
      tween: `[["fromTo","#SC22 .nullrow2",{opacity:0,x:-30},{opacity:1,x:0,duration:0.55,stagger:1.5,delay:1.4}],
               ["fromTo","#SC22 .stamp",{opacity:0,scale:1.6,rotate:-8},{opacity:1,scale:1,rotate:-6,duration:0.4,stagger:1.5,delay:1.6}]]` };
  },
  SC23(w) {
    const cards = [["2022", "BREAKTHROUGH LISTEN", "GREEN BANK + ALLEN ARRAYS", 1.2], ["2025", "SETI INSTITUTE", "COORDINATED SEARCH ACROSS ARCHIVES", 3.0]]
      .map(([yr, org, what, d], i) =>
        `<div class="ncard" style="left:${8 + i * 46}%" data-d="${d}">
          <b class="mono">${yr}</b><span class="org">${org}</span><span class="what">${what}</span><i class="stamp">NULL</i></div>`).join("");
    return { html: `${sky(131, 'data-empty="1"')}
      ${secT("THE SEARCHES CONTINUE", 72, P.ink, "10%")}${cards}
      ${num("0", "58%", 150, P.signal)}
      ${disp("REPEATS IN FORTY-NINE YEARS", 48, P.ink, 10, "top:72%")}${mark()}`,
      tween: `[["fromTo","#SC23 .ncard",{opacity:0,y:40},{opacity:1,y:0,duration:0.6,stagger:1.8,delay:1.2}]]` };
  },
  SC24(w) {
    const chips = ["PLANETS", "ASTEROIDS", "SATELLITES", "AIRCRAFT", "SPACECRAFT"].map((c, i) =>
      `<div class="struck" style="left:${9 + (i % 3) * 32}%;top:${26 + Math.floor(i / 3) * 22}%" data-d="${1.2 + i * 1.1}">
        <span>${c}</span><i class="penstrike big"></i></div>`).join("");
    return { html: `${paperbg()}${secT("THE ORIGINAL TEAM RULED OUT THE OBVIOUS", 58, P.inkPrint, "7%")}
      ${chips}
      <svg viewBox="0 0 500 220" style="position:absolute;left:12%;top:60%;width:26%">
        <circle cx="80" cy="150" r="26" fill="none" stroke="#33302a" stroke-width="4"/>
        <line x1="106" y1="144" x2="210" y2="88" stroke="#33302a" stroke-width="4"/>
        <line x1="210" y1="88" x2="140" y2="40" stroke="#33302a" stroke-width="4"/>
        <circle cx="210" cy="88" r="8" fill="#5a5240"/></svg>
      ${lab("A TERRESTRIAL SIGNAL OFF SPACE DEBRIS —", "40%", "64%", 36, "#4a4436")}
      ${lab("WRONG TRANSMITTER, WRONG GEOMETRY", "40%", "68.5%", 36, "#4a4436")}
      ${lab("IMPROBABLE IN PRACTICE", "40%", "74%", 40, "#8a2f22")}${mark()}${recon()}`,
      tween: `[["fromTo","#SC24 .struck",{opacity:0},{opacity:1,duration:0.45,stagger:1.1,delay:1.2}],
               ["fromTo","#SC24 .struck .penstrike",{scaleX:0},{scaleX:1,duration:0.4,stagger:1.1,delay:1.4}]]` };
  },
  SC25(w) {
    return { html: `${paperbg()}${secT("TWO IDEAS SURVIVE AS POSSIBILITIES", 62, P.inkPrint, "8%")}
      <svg viewBox="0 0 520 300" style="position:absolute;left:8%;top:22%;width:36%">
        <circle cx="90" cy="150" r="12" fill="#5a5240"/><circle cx="260" cy="150" r="22" fill="#2a2620"/>
        <path d="M102,144 Q260,92 440,124" fill="none" stroke="rgba(29,92,68,0.8)" stroke-width="5"/>
        <path d="M102,156 Q260,208 440,176" fill="none" stroke="rgba(29,92,68,0.8)" stroke-width="5"/></svg>
      ${lab("GRAVITATIONAL LENSING", "26%", "56%", 40, "#33302a", "center")}
      ${lab("an unseen mass briefly focuses", "26%", "61.5%", 36, "#4a4436", "center")}
      ${lab("a fainter background source", "26%", "66%", 36, "#4a4436", "center")}
      <svg viewBox="0 0 520 300" style="position:absolute;left:54%;top:22%;width:36%">
        <line x1="20" y1="200" x2="380" y2="200" stroke="#33302a" stroke-width="4"/>
        <circle cx="120" cy="120" r="20" fill="none" stroke="rgba(88,199,240,0.55)" stroke-width="3"/>
        <circle cx="240" cy="95" r="24" fill="none" stroke="rgba(88,199,240,0.55)" stroke-width="3"/>
        <circle cx="350" cy="130" r="18" fill="none" stroke="rgba(88,199,240,0.55)" stroke-width="3"/>
        <circle cx="420" cy="70" r="12" fill="${P.signal}"/></svg>
      ${lab("INTERSTELLAR SCINTILLATION", "72%", "56%", 40, "#33302a", "center")}
      ${lab("the interstellar medium twinkles", "72%", "61.5%", 36, "#4a4436", "center")}
      ${lab("— the triangle of 3 NVSS sources", "72%", "66%", 36, "#4a4436", "center")}
      ${chip2("BOTH SAY: SHOULD HAVE LASTED LONGER — OR RETURNED", "#8a2f22", "23.5%", "77.5%")}${mark()}${recon()}`,
      tween: `[["fromTo","#SC25 svg,#SC25 .lab",{opacity:0,y:30},{opacity:1,y:0,duration:0.6,stagger:0.4,delay:1.2}]]` };
  },
  SC26(w) {
    const strikes = ["NOT IN THE BEAM AT THE RIGHT TIME", "COMETS RARELY EMIT AT THE RIGHT FREQUENCY", "ONE HORN ONLY — WOULD SHOW IN BOTH"]
      .map((s, i) => `<div class="ledrow2" style="left:44%;width:52%;top:${30 + i * 13}%" data-d="${2.6 + i * 1.6}">
        <span style="font-size:34px">${esc(s)}</span><i class="penstrike" style="height:6px"></i></div>`).join("");
    return { html: `${paperbg()}${secT("2017 — THE COMET HYPOTHESIS", 72, P.inkPrint, "7%")}
      ${lab("Hydrogen clouds around two comets (266P / P/2008 Y2)", "50%", "16.5%", 40, "#5a5240", "center")}
      <svg viewBox="0 0 500 300" style="position:absolute;left:6%;top:26%;width:32%">
        <circle cx="110" cy="150" r="26" fill="#5a5240"/>
        <polygon points="100,128 380,40 360,110" fill="rgba(88,199,240,0.35)"/>
        <polygon points="104,172 360,250 330,180" fill="rgba(88,199,240,0.30)"/></svg>
      ${lab("266P — NEOWISE", "12%", "58%", 36, "#4a4436")}
      ${lab("P/2008 Y2 — GIBBS", "20%", "26%", 36, "#4a4436")}
      ${strikes}
      ${lab("DISMISSED BY THE ORIGINAL OBSERVERS", "44%", "72%", 42, "#8a2f22")}${mark()}${recon()}`,
      tween: `[["fromTo","#SC26 .ledrow2",{opacity:0},{opacity:1,duration:0.5,stagger:1.6,delay:2.6}],
               ["fromTo","#SC26 .penstrike",{scaleX:0},{scaleX:1,duration:0.4,stagger:1.6,delay:2.8}]]` };
  },
  SC27(w) {
    const dots = Array.from({ length: 30 }, (_, i) =>
      `<i style="left:${(i * 53) % 300}px;top:${(i * 37) % 130}px"></i>`).join("");
    return { html: `${paperbg()}${secT("2024 — THE NEWEST HYPOTHESIS", 72, P.inkPrint, "7%")}
      ${lab("Arecibo archive re-examination — a hydrogen cloud and a magnetar flare", "50%", "16.5%", 38, "#5a5240", "center")}
      <div class="hcloud" style="left:12%;top:38%">${dots}</div>
      ${lab("COLD HYDROGEN CLOUD", "20%", "60%", 38, "#1d5c44", "center")}
      <svg viewBox="0 0 700 300" style="position:absolute;left:26%;top:26%;width:48%">
        <line x1="120" y1="30" x2="250" y2="110" stroke="${P.penRed}" stroke-width="8" stroke-linecap="round"/>
        <polygon points="258,114 218,96 236,134" fill="${P.penRed}"/>
        <line x1="258" y1="130" x2="520" y2="220" stroke="${P.signal}" stroke-width="6"/></svg>
      ${lab("MAGNETAR FLARE", "38%", "28%", 36, "#8a2f22", "center")}
      ${lab("MASER BURST AT 1420 MHz", "62%", "66%", 40, "#1d5c44", "center")}
      ${chip2("PROPOSED — NOT PROVEN", P.warn, "60%", "22%", 44)}
      ${num("MODEL EVENTS ~100× WEAKER THAN WOW!", "77%", 42, "#33302a", "left:12%;right:0;text-align:center;font-family:'Carlito'")}${mark()}${recon()}`,
      tween: `[["fromTo","#SC27 svg,#SC27 .lab,#SC27 .chip2",{opacity:0},{opacity:1,duration:0.7,stagger:0.5,delay:1.4}]]` };
  },
  SC28(w) {
    const facts = ["A STRONG, NARROWBAND RADIO BURST", "ON THE SKY FOR 72 SECONDS", "ON ONE OF THE 50 CHANNELS",
                   "NEVER DETECTED AGAIN — DESPITE 5 DECADES OF BETTER INSTRUMENTS", "THE FACT THAT IT SITS ON ONE SHEET OF LINE-PRINTER PAPER"]
      .map((f, i) => `<div class="evrow" style="top:${i * 84}px" data-d="${1.2 + i * 1.35}"><span>${esc(f)}</span><i>✓</i></div>`).join("");
    return { html: `${paperbg()}${secT("WHERE THE EVIDENCE STANDS", 72, P.inkPrint, "6.5%")}
      ${chip2("ESTABLISHED", "#1d5c44", "13%", "17%", 44)}<div class="evlist">${facts}</div>${mark()}${recon()}`,
      tween: `[["fromTo","#SC28 .evrow",{opacity:0,x:-30},{opacity:1,x:0,duration:0.5,stagger:1.35,delay:1.2}],
               ["fromTo","#SC28 .evrow i",{opacity:0},{opacity:1,duration:0.3,stagger:1.35,delay:1.5}]]` };
  },
  SC29(w) {
    const items = [["WHO — OR WHAT — SENT IT", "NO EVIDENCE EITHER WAY"],
                   ["THAT IT WAS AN EXTRATERRESTRIAL TRANSMISSION", "CANNOT BE RULED OUT — CANNOT BE CLAIMED"],
                   ["ANY PROVEN NATURAL PHENOMENON", "ALL EXPLANATIONS REMAIN HYPOTHESES"]]
      .map(([k, sub], i) => `<div class="evrow red" style="height:100px;top:${i * 108}px" data-d="${1.4 + i * 1.7}">
        <span>${esc(k)}</span><em>${esc(sub)}</em></div>`).join("");
    return { html: `${paperbg()}${secT("WHAT IS NOT ESTABLISHED", 72, P.inkPrint, "6.5%")}
      ${chip2("NOT ESTABLISHED", "#8a2f22", "13%", "17%", 44)}<div class="evlist">${items}</div>
      ${disp("REPLICATION IS THE CURRENCY — NOTHING HAS REPLICATED", 42, "#4a4436", 4, "top:77.5%;font-family:'Carlito';font-weight:700")}${mark()}${recon()}`,
      tween: `[["fromTo","#SC29 .evrow",{opacity:0,x:-30},{opacity:1,x:0,duration:0.6,stagger:1.7,delay:1.4}]]` };
  },
  SC30(w) {
    return { html: `${paperbg()}<div class="qmark">“</div>
      ${disp("THE ORIGIN OF THE WOW! SIGNAL", 66, "#2e2a22", 2, "top:26%;text-align:left;left:17%;font-weight:700")}
      ${disp("IS STILL AN OPEN QUESTION FOR ME.", 66, "#2e2a22", 2, "top:36%;text-align:left;left:17%;font-weight:700")}
      ${disp("…HALF-VAST DATA.", 60, "rgba(46,42,34,0.75)", 2, "top:52%;text-align:left;left:17%;font-weight:700")}
      <div class="penline" style="left:17%;width:29%;top:59.5%"></div>
      ${lab("JERRY R. EHMAN — BIGEAR.ORG", "17%", "62.5%", 40, "#5a5240")}${mark()}${recon()}`,
      tween: `[["fromTo","#SC30 .disp,#SC30 .lab",{opacity:0,y:30},{opacity:1,y:0,duration:0.7,stagger:0.6,delay:1}]]` };
  },
  SC31(w) {
    return { html: `${sky(137, 'data-empty="1"')}
      ${secT("1998 — THE TELESCOPE CAME DOWN", 72, P.ink, "8%")}
      ${bigear("10%", "56%", "80%", "fadeout")}
      ${bigear("10%", "56%", "80%", "outline")}
      ${num("THE LAND WAS SOLD — A GOLF COURSE AND 400 HOUSES", "66%", 42, P.dim, "font-family:'Carlito'")}
      ${disp("WHAT SURVIVES IS PAPER.", 52, P.ink, 8, "top:73%")}${mark()}${recon()}`,
      tween: `[["fromTo","#SC31 .fadeout",{opacity:1},{opacity:0.12,duration:7,delay:1.5,ease:"power1.inOut"}],
               ["fromTo","#SC31 .outline",{opacity:0},{opacity:0.8,duration:4,delay:3.5}],
               ["fromTo","#SC31 .disp,#SC31 .num",{opacity:0,y:30},{opacity:1,y:0,duration:0.7,stagger:0.5,delay:4.5}]]` };
  },
  SC32(w) {
    const cones = [0, 1, 2].map((i) =>
      `<div class="cone sweep" style="left:${10 + i * 30}%" data-d="${1.2 + i * 0.9}"></div>`).join("");
    return { html: `${sky(143)}${secT("LISTENING FOR ANOTHER WOW!", 72, P.ink, "8%")}
      ${chip2("NEW INSTRUMENTS · NEW SURVEYS · WIDER BANDS", P.signal, "28%", "15%")}
      ${cones}${mark()}${recon()}`,
      tween: `[["fromTo","#SC32 .cone",{opacity:0},{opacity:1,duration:0.7,stagger:0.9,delay:1.2}],
               ["fromTo","#SC32 .cone",{rotation:8},{rotation:-8,duration:6,yoyo:true,repeat:3,ease:"sine.inOut"},2]]` };
  },
  SC33(w) {
    return { html: `${sky(149)}
      <svg viewBox="0 0 200 200" style="position:absolute;left:57%;top:33%;width:14%">
        <circle cx="100" cy="100" r="30" fill="none" stroke="${P.signal}" stroke-width="5"/>
        <circle cx="100" cy="100" r="52" fill="none" stroke="rgba(75,225,160,0.45)" stroke-width="3"/>
      </svg>
      ${disp("IF IT WAS A BEACON, IT SPOKE ONCE.", 64, P.ink, 6, "top:60%")}
      ${disp("IF IT WAS NATURE, WE HAVE NOT CAUGHT IT AGAIN.", 56, P.signal, 6, "top:69%")}
      ${mark(0.8)}`,
      tween: `[["fromTo","#SC33 .disp",{opacity:0},{opacity:1,duration:1.2,stagger:3,delay:4.5}]]` };
  },
  SC34(w) {
    const credit = ["RESEARCH: BIGEAR.ORG · THE SETI INSTITUTE · PUBLISHED LITERATURE",
                    "NARRATION: SYNTHETIC VOICE (MICROSOFT EDGE-TTS NEURAL)",
                    "VISUALS: CODE-GENERATED + PUBLIC-DOMAIN ARCHIVAL (WIKIMEDIA COMMONS)"]
      .map((c, i) => `<div style="margin-top:${i ? 14 : 0}px">${esc(c)}</div>`).join("");
    return { html: `${sky(151)}
      <div class="tcrule" style="top:26%"></div>
      ${disp("THE UNCLOSED FILE", 132, P.ink, 18, "top:33%")}
      ${disp("THE WOW! SIGNAL — 72 SECONDS FROM DEEP SPACE", 44, P.dim, 8, "top:46%")}
      <div class="credits">${credit}</div>
      ${disp("SOME FILES NEVER CLOSE.", 64, P.crimson, 14, "top:72%")}`,
      tween: `[["fromTo","#SC34 .disp,#SC34 .tcrule,#SC34 .credits",{opacity:0,y:36},{opacity:1,y:0,duration:0.8,stagger:0.5,delay:0.5}]]` };
  },
};

// ---------- assemble full composition ----------
const sceneHTML = [];
const tweenGroups = [];
for (const [id, w] of Object.entries(tl.scenes)) {
  const gen = sceneGens[id];
  if (!gen) throw new Error(`no generator for ${id}`);
  const dur = w.end - w.start;
  const g = gen(w);
  // global slow push on the scene section (v2 rule: every scene moves)
  const push = `["fromTo","#${id} .pushw",{scale:1},{scale:1.05,duration:${dur.toFixed(2)},ease:"none"},0]`;
  sceneHTML.push(
    `<section id="${id}" class="clip scene" data-track-index="1" data-start="${w.start.toFixed(3)}" data-duration="${dur.toFixed(3)}"><div class="pushw">${g.html}</div></section>`);
  tweenGroups.push({ start: w.start, tweens: Function("return ([" + push + (g.tween ? "," + g.tween : "") + "])")() });
}

const capHTML = cues.map((c) =>
  `<div class="clip cap" data-track-index="9" data-start="${c.s.toFixed(3)}" data-duration="${(c.e - c.s).toFixed(3)}">${esc(c.text).split("\n").join("<br>")}</div>`).join("\n");

const starsJs = `
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
document.querySelectorAll('.stars').forEach(el=>{
  const seed=+el.dataset.seed||7, empty=el.dataset.empty?0.45:1;
  const r=mulberry(seed); let h='';
  const n=Math.round(210*empty);
  for(let i=0;i<n;i++){const x=r()*1920,y=r()*1040,s=(r()*2.2+0.6).toFixed(2);
    h+=\`<i style="left:\${x}px;top:\${y}px;width:\${s}px;height:\${s}px;opacity:\${(0.25+r()*0.6).toFixed(2)}\`;h+='</i>';}
  el.innerHTML=h;
});`;

const CSS = `
  html,body{margin:0;background:#04070f;font-family:'DejaVu Sans',Arial,sans-serif;}
  #stage{width:1920px;height:1080px;position:relative;overflow:hidden;background:#04070f;transform-origin:center;}
  .scene{position:absolute;inset:0;transform-origin:center;}
  .pushw{position:absolute;inset:0;transform-origin:center;}
  .mono{font-family:'DejaVu Sans Mono',monospace;}
  .disp{position:absolute;left:0;right:0;text-align:center;font-weight:700;}
  .lab{position:absolute;font-weight:400;font-family:'Carlito','DejaVu Sans',sans-serif;}
  /* SKY world */
  .sky{position:absolute;inset:0;background:linear-gradient(180deg,${P.skyTop} 0%,${P.skyMid} 45%,${P.skyLow} 100%);}
  .sky .band{position:absolute;left:-20%;top:30%;width:140%;height:26%;background:linear-gradient(90deg,rgba(88,199,240,0),rgba(88,199,240,0.07),rgba(88,199,240,0));transform:rotate(-16deg);}
  .stars{position:absolute;inset:0;}
  .stars i{position:absolute;background:#fff;border-radius:50%;display:block;}
  .sky .hor{position:absolute;left:0;right:0;bottom:0;height:16%;background:linear-gradient(180deg,rgba(16,44,72,0),rgba(16,44,72,0.5));border-top:2px solid rgba(88,199,240,0.14);}
  /* PAPER world */
  .paperbg{position:absolute;inset:0;background:
    radial-gradient(ellipse at 50% 42%, #241a10 0%, #170f08 75%);}
  .paperbg::before{content:"";position:absolute;left:-2%;top:-3%;width:104%;height:106%;background:linear-gradient(180deg,#efe6d0,#e6dcbf);transform:rotate(-0.7deg);box-shadow:0 0 120px rgba(0,0,0,0.55);}
  .paperbg .rules{position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0 46px,rgba(90,84,62,0.28) 46px 48px);}
  .paperbg .perfL,.paperbg .perfR{position:absolute;top:0;bottom:0;width:34px;background:repeating-linear-gradient(180deg,rgba(40,34,20,0.25) 0 14px,transparent 14px 50px);}
  .paperbg .perfL{left:0.6%;} .paperbg .perfR{right:0.6%;}
  .paperbg .pglow{position:absolute;left:20%;top:0;width:60%;height:100%;background:radial-gradient(ellipse at 50% 30%,rgba(255,250,230,0.14),rgba(120,100,60,0.16));}
  /* shared */
  .cmark{position:absolute;left:48px;top:44px;font-size:36px;color:${P.ink};font-weight:700;letter-spacing:2px;}
  .cmark i{display:inline-block;width:6px;height:44px;background:${P.crimson};margin-right:20px;vertical-align:middle;}
  .recon{position:absolute;right:48px;top:52px;font-size:34px;color:rgba(157,176,200,0.72);font-family:'Carlito',sans-serif;}
  .chip2{position:absolute;border:3px solid;padding:12px 28px;font-weight:700;letter-spacing:1px;font-family:'Carlito',sans-serif;white-space:nowrap;}
  .disp .tcrule,.tcrule{position:absolute;left:36%;width:28%;height:8px;background:${P.crimson};}
  .sigbar{position:absolute;height:22px;border:3px solid ${P.signal};background:rgba(255,255,255,0.07);}
  .fillbar{position:absolute;left:0;top:0;bottom:0;width:100%;background:linear-gradient(90deg,rgba(75,225,160,0.25),${P.signal},rgba(75,225,160,0.25));transform:scaleX(0);transform-origin:center;display:block;}
  .sixmono2{position:absolute;left:0;right:0;top:30%;text-align:center;font-family:'DejaVu Sans Mono';font-size:215px;letter-spacing:30px;}
  .pc{opacity:0;}
  .wownote2{position:absolute;left:9%;top:64%;font-style:italic;font-weight:700;font-size:165px;color:${P.penRed};opacity:0;font-family:'DejaVu Sans';}
  .scanR,.scanC{position:absolute;box-shadow:0 0 90px rgba(0,0,0,0.6);border:4px solid rgba(88,199,240,0.4);}
  .scanR img,.scanC img{width:100%;height:100%;object-fit:cover;display:block;}
  .scanC{transform:translateX(-50%);}
  .hlladder{position:absolute;inset:0;}
  .hlrow{position:absolute;left:0;right:0;height:16.66%;background:rgba(75,225,160,0.30);opacity:0;}
  .hlrow b{position:absolute;left:6%;bottom:10%;height:12px;background:rgba(40,60,90,0.75);display:block;transform-origin:left;}
  .hlrow span{position:absolute;right:8%;top:8%;font-family:'DejaVu Sans Mono';font-size:64px;font-weight:700;}
  .pcard{position:absolute;background:#ece3cd;border:3px solid rgba(120,105,70,0.5);box-shadow:14px 18px 40px rgba(20,12,6,0.45);opacity:0;text-align:center;box-sizing:border-box;padding-top:8%;}
  .pnum{font-size:112px;font-weight:700;font-family:'DejaVu Sans';}
  .pcap{font-size:36px;color:#4a4436;margin-top:18px;padding:0 26px;font-family:'Carlito',sans-serif;}
  .penline{position:absolute;height:7px;background:${P.penRed};border-radius:4px;transform:rotate(-0.5deg);opacity:0.9;}
  .cellgrid{position:absolute;left:8.5%;top:26%;width:83%;height:44%;display:grid;grid-template-columns:repeat(10,1fr);grid-template-rows:repeat(5,1fr);background:#d9cfb2;border:3px solid rgba(120,105,70,0.55);box-shadow:12px 16px 34px rgba(20,12,6,0.4);}
  .cell{border:2px solid rgba(90,80,55,0.4);margin:5px;display:flex;align-items:center;justify-content:center;font-family:'DejaVu Sans Mono';font-size:30px;color:rgba(70,64,48,0.75);position:relative;background:rgba(60,54,40,0.10);}
  .leader{position:absolute;font-size:40px;color:${P.ink};font-weight:700;}
  .leader::before{content:"";position:absolute;left:-70px;top:24px;width:64px;border-top:3px dashed rgba(157,176,200,0.5);}
  .beamglow{position:absolute;width:14px;height:400px;background:linear-gradient(180deg,rgba(75,225,160,0),rgba(75,225,160,0.5));filter:blur(2px);opacity:0;}
  .swath{position:absolute;left:0;top:28%;width:100%;height:42%;background:rgba(10,18,38,0.55);border:3px solid rgba(88,199,240,0.35);overflow:hidden;}
  .swath i{position:absolute;width:7px;height:7px;border-radius:50%;background:#cfe2ff;animation:drift 26s linear infinite;}
  @keyframes drift{from{transform:translateX(0)}to{transform:translateX(-1980px)}}
  .beamrect{position:absolute;top:0;bottom:0;width:280px;background:rgba(75,225,160,0.14);border:5px solid ${P.signal};}
  .vscale{position:absolute;left:14%;top:22%;width:26px;height:62%;background:rgba(70,64,48,0.25);}
  .vscale .vfill{position:absolute;left:0;right:0;bottom:0;top:0;background:#46402f;transform-origin:bottom;display:block;}
  .tick{position:absolute;left:-6px;right:-90px;border-top:3px solid rgba(70,64,48,0.7);}
  .tick span{position:absolute;right:0;top:-20px;font-size:36px;color:#4a4436;font-family:'Carlito',sans-serif;}
  .lzone{position:absolute;left:44px;top:14.3%;width:400px;height:57%;background:rgba(75,225,160,0.16);border:4px solid ${P.signal};}
  .lzone span{position:absolute;left:26px;top:24px;font-size:38px;color:#1d5c44;font-weight:700;font-family:'Carlito',sans-serif;}
  .uring{position:absolute;left:-58px;top:14.3%;width:120px;height:80px;opacity:0;}
  .uring span{position:absolute;left:0;right:0;top:14px;text-align:center;font-size:64px;color:${P.penRed};font-weight:700;}
  .uring::before{content:"";position:absolute;inset:0;border:10px solid ${P.penRed};border-radius:50%;transform:rotate(-6deg);}
  .hpline{opacity:0;}
  .chipsrow{position:absolute;left:0;right:0;}
  .cone{position:absolute;top:24%;width:270px;height:46%;background:linear-gradient(to bottom,rgba(88,199,240,0.20),rgba(88,199,240,0.02));clip-path:polygon(38% 0,62% 0,100% 100%,0 100%);border:none;}
  .cone.big.live{background:linear-gradient(to bottom,rgba(75,225,160,0.55),rgba(75,225,160,0.03));border-top:34px solid rgba(75,225,160,0.85);}
  .cone.big:not(.live){border-top:34px solid rgba(88,199,240,0.45);}
  .cone.sweep{background:linear-gradient(to bottom,rgba(75,225,160,0.45),rgba(75,225,160,0.02));}
  .stack{position:absolute;left:16%;top:38%;width:440px;height:420px;}
  .sheet{position:absolute;width:440px;height:400px;background:#e9e0c8;border:3px solid rgba(120,105,70,0.55);}
  .sheet::after{content:"";position:absolute;left:24px;top:30px;width:78%;height:64%;background:repeating-linear-gradient(180deg,rgba(46,42,34,0.5) 0 6px,transparent 6px 42px);}
  .review{position:absolute;left:52%;top:36%;width:34%;height:290px;}
  .rrow{position:absolute;left:0;right:0;height:50px;background:rgba(60,54,40,0.10);border:2px solid rgba(90,80,55,0.45);font-family:'DejaVu Sans Mono';font-size:32px;color:#3a352b;padding:8px 0 0 20px;box-sizing:border-box;}
  .rrow.hi{background:rgba(75,225,160,0.30);}
  .coordcard{position:absolute;left:5.5%;top:26%;background:rgba(5,10,22,0.66);border:3px solid rgba(88,199,240,0.4);padding:26px 36px;font-family:'DejaVu Sans Mono';font-size:44px;color:${P.cyan};line-height:1.6;}
  .specbar{position:absolute;left:10%;top:44%;width:80%;height:34px;background:rgba(60,54,40,0.12);border:3px solid rgba(70,64,48,0.6);}
  .mk{position:absolute;top:-70px;bottom:-12px;width:8px;background:#1d5c44;display:block;opacity:0;}
  .mk.red{background:#8a2f22;}
  .mk b{position:absolute;top:-46px;left:50%;transform:translateX(-50%);font-family:'DejaVu Sans Mono';font-size:44px;color:inherit;white-space:nowrap;}
  .mk span{position:absolute;top:56px;left:50%;transform:translateX(-50%);font-size:36px;color:inherit;font-family:'Carlito',sans-serif;white-space:nowrap;}
  .bracket{position:absolute;left:10%;top:56%;width:80%;border-top:4px solid #5a5240;border-left:4px solid #5a5240;border-right:4px solid #5a5240;height:26px;opacity:0;}
  .bracket span{position:absolute;top:44px;left:0;right:0;text-align:center;font-size:40px;color:#3a352b;font-family:'Carlito',sans-serif;font-weight:700;}
  .ledger{position:absolute;left:14%;top:28%;width:72%;height:320px;}
  .ledrow2{position:absolute;left:0;right:0;height:66px;display:flex;justify-content:space-between;align-items:center;background:rgba(60,54,40,0.10);padding:0 28px;opacity:0;font-family:'Carlito',sans-serif;}
  .ledrow2 span{font-size:36px;color:#33302a;}
  .ledrow2 b{font-family:'DejaVu Sans Mono';font-size:40px;position:relative;}
  .ledrow2 b.red{color:#8a2f22;} .ledrow2 b.grn{color:#1d5c44;}
  .penstrike{position:absolute;left:-2%;right:-2%;top:50%;height:6px;background:${P.penRed};border-radius:4px;transform:rotate(-2deg);transform-origin:left;display:block;}
  .penstrike.big{height:9px;}
  .struck{position:absolute;background:#f0e8d0;border:3px solid rgba(70,64,48,0.6);padding:20px 36px;font-size:44px;color:#33302a;font-weight:700;}
  .wbar{position:absolute;left:10%;width:80%;height:56px;transform-origin:left;}
  .wbar.grey{top:31%;background:rgba(60,54,40,0.30);transform:scaleX(0);}
  .wbar.grn{top:51%;background:rgba(29,92,68,0.55);width:26px;transform:scaleX(0);}
  .sweepcard{position:absolute;top:26%;width:24%;height:36%;background:rgba(10,18,38,0.7);border:3px solid rgba(88,199,240,0.4);opacity:0;}
  .sweepcard .null{position:absolute;left:0;right:0;top:38%;text-align:center;font-size:44px;color:${P.warn};font-weight:700;}
  .sweepcard span{position:absolute;left:0;right:0;bottom:8%;text-align:center;font-size:36px;color:${P.dim};font-family:'Carlito',sans-serif;}
  .nulllist{position:absolute;left:10%;top:26%;width:80%;height:340px;}
  .nullrow2{position:absolute;left:0;right:0;height:72px;display:flex;align-items:center;gap:36px;opacity:0;}
  .nullrow2 b{font-family:'DejaVu Sans Mono';font-size:44px;color:${P.cyan};white-space:nowrap;}
  .nullrow2 span{font-size:36px;color:${P.ink};font-family:'Carlito',sans-serif;}
  .stamp{margin-left:auto;border:5px solid rgba(192,57,43,0.9);color:rgba(192,57,43,0.95);font-size:42px;font-weight:700;padding:6px 24px;transform:rotate(-6deg);font-family:'DejaVu Sans';display:inline-block;background:rgba(4,7,15,0.3);}
  .ncard{position:absolute;top:28%;width:38%;height:26%;background:rgba(10,18,38,0.75);border:3px solid rgba(88,199,240,0.45);text-align:center;opacity:0;padding-top:3.5%;box-sizing:border-box;}
  .ncard b{display:block;font-family:'DejaVu Sans Mono';font-size:72px;color:${P.cyan};}
  .ncard .org{display:block;font-size:40px;color:${P.ink};font-weight:700;margin-top:2px;}
  .ncard .what{display:block;font-size:34px;color:${P.dim};font-family:'Carlito',sans-serif;margin-top:6px;}
  .ncard .stamp{position:absolute;left:50%;transform:translateX(-50%) rotate(-6deg);bottom:7%;}
  .hcloud{position:absolute;width:300px;height:130px;}
  .hcloud i{position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(88,199,240,0.5);}
  .evlist{position:absolute;left:13%;top:24%;width:74%;height:430px;}
  .evrow{position:absolute;left:0;right:0;height:74px;background:rgba(60,54,40,0.12);border:3px solid rgba(29,92,68,0.5);display:flex;align-items:center;padding:0 30px;opacity:0;box-sizing:border-box;}
  .evrow span{font-size:40px;color:#26332b;font-family:'Carlito',sans-serif;font-weight:700;}
  .evrow i{margin-left:auto;font-style:normal;font-size:44px;color:#1d5c44;font-weight:700;opacity:0;}
  .evrow.red{border-color:rgba(138,47,34,0.55);flex-direction:column;align-items:flex-start;justify-content:center;}
  .evrow.red span{color:#33302a;}
  .evrow.red em{font-style:normal;font-size:34px;color:#8a2f22;margin-top:4px;font-family:'Carlito',sans-serif;}
  .qmark{position:absolute;left:9%;top:14%;font-size:200px;color:rgba(138,47,34,0.55);font-weight:700;font-family:'DejaVu Sans';}
  .fadeout,.outline{position:absolute;}
  .outline{opacity:0;filter:drop-shadow(0 0 1px rgba(157,176,200,0.01));}
  .outline svg,.outline{outline:none;}
  .credits{position:absolute;left:0;right:0;top:57%;text-align:center;font-size:36px;color:rgba(157,176,200,0.85);line-height:1.5;font-family:'Carlito',sans-serif;}
  .cap{position:absolute;left:50%;bottom:36px;transform:translateX(-50%);background:rgba(4,7,15,0.74);color:${P.ink};
       font-size:44px;line-height:1.32;padding:18px 48px;text-align:center;max-width:1700px;border:2px solid rgba(88,199,240,0.20);font-family:'Carlito',sans-serif;}
`;

const stage = (inner, dur) =>
  `<div id="stage" data-composition-id="main" data-start="0" data-duration="${dur}" data-width="1920" data-height="1080" data-fps="30">\n${inner}\n</div>`;

const GSAP_SRC = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "../node_modules/gsap/dist/gsap.min.js"), "utf8");
const scripts = (groups) => `
<script>${GSAP_SRC}</${"script"}>
<script>
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
const GROUPS = ${JSON.stringify(groups)};
for (const g of GROUPS) {
  for (const t of g.tweens.flatMap((x) => Array.isArray(x[0]) ? x : [x])) {
    if (!Array.isArray(t)) continue;
    const [kind, target, from, to] = t;
    const at = g.start + ((to && to.delay) || (from && from.delay) || 0);
    const clean = (o) => { if (!o) return o; const c = { ...o }; delete c.delay; return c; };
    if (kind === "fromTo") tl.fromTo(target, clean(from), clean(to), at);
    else tl.to(target, clean(from), at);
  }
}
document.querySelectorAll('path.draw, ellipse.draw').forEach((p) => {
  try {
    const L = p.getTotalLength();
    p.style.strokeDasharray = L;
    p.style.strokeDashoffset = L;
    const sceneStart = +p.closest('section').dataset.start;
    const segStart = +document.getElementById('stage').dataset.start;
    tl.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: +(p.dataset.dur || 5), ease: 'none' },
      sceneStart - segStart + +(p.dataset.at || 1));
  } catch (e) {}
});
document.querySelectorAll('.fillbar').forEach((el) => {
  const sceneStart = +el.closest('section').dataset.start;
  const segStart = +document.getElementById('stage').dataset.start;
  tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: +(el.dataset.dur || 3), ease: 'none' },
    sceneStart - segStart + +(el.dataset.at || 1));
});
window.__timelines.main = tl;
</script>
<script>${starsJs}</script>`;

// ---------- full composition ----------
const fullHTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>${CSS}</style></head>
<body>
${stage(sceneHTML.join("\n") + "\n" + capHTML +
  '\n<audio id="narration" class="clip" data-track-index="10" data-start="0" data-duration="600" data-volume="1" src="assets/narration_full.wav"></audio>', 600)}
${scripts(tweenGroups)}
</body></html>`;
fs.writeFileSync("index.html", fullHTML);

// ---------- segment compositions (60 s render units; scenes/tweens/caps re-based) ----------
const SEGDUR = 30, NSEG = 20;
fs.mkdirSync("segments", { recursive: true });
for (let k = 0; k < NSEG; k++) {
  const t0 = k * SEGDUR, t1 = t0 + SEGDUR;
  const inWin = (s, e) => e > t0 + 0.001 && s < t1 - 0.001;
  const segScenes = [], segGroups = [];
  for (const [id, w] of Object.entries(tl.scenes)) {
    if (!inWin(w.start, w.end)) continue;
    const ls = Math.max(0, w.start - t0), le = Math.min(SEGDUR, w.end - t0);
    segScenes.push(
      `<section id="${id}" class="clip scene" data-track-index="1" data-start="${ls.toFixed(3)}" data-duration="${(le - ls).toFixed(3)}"><div class="pushw">${sceneGens[id](w).html}</div></section>`);
    const g = tweenGroups.find((x) => Math.abs(x.start - w.start) < 0.001);
    segGroups.push({ start: g.start - t0, tweens: g.tweens });
  }
  const segCaps = cues.filter((c) => inWin(c.s, c.e)).map((c) => {
    const ls = Math.max(0, c.s - t0), le = Math.min(SEGDUR, c.e - t0);
    return `<div class="clip cap" data-track-index="9" data-start="${ls.toFixed(3)}" data-duration="${(le - ls).toFixed(3)}">${esc(c.text).split("\n").join("<br>")}</div>`;
  }).join("\n");
  const segPage = `<!doctype html>
<html><head><meta charset="utf-8"><style>${CSS}</style></head>
<body>
${stage(segScenes.join("\n") + "\n" + segCaps +
    `\n<audio id="narration" class="clip" data-track-index="10" data-start="0" data-duration="${SEGDUR}" data-volume="1" src="assets/narration_seg${k}.wav"></audio>`, SEGDUR)}
${scripts(segGroups)}
</body></html>`;
  fs.writeFileSync(`segments/segment_${String(k).padStart(2, "0")}.html`, segPage);
}
console.log(`index.html + ${NSEG} segment compositions written (PAPER & SKY v2)`);
