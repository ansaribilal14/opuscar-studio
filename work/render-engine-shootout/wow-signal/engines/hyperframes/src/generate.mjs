// generate.mjs — build the HyperFrames composition from the FROZEN shared package.
// Same TIMELINE.json + SRT + assets as Engine A (no re-authoring of timing).
// Output: index.html (+ hyperframes.json) ready for `hyperframes render`.
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

const P = { bg: "#070b16", panel: "#0d1424", ink: "#f4f2ec", dim: "#8fa0b8",
            signal: "#4be1a0", cyan: "#58c7f0", crimson: "#c0392b",
            beige: "#e8dfc8", warn: "#e0b34c" };

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const chip = (txt, color, size = 26, x = 0, y = 0) =>
  `<div class="chip" style="left:${x}px;top:${y}px;font-size:${size}px;color:${color};border-color:${color}">${esc(txt)}</div>`;
const disp = (txt, size, color = P.ink, ls = 6) =>
  `<div class="disp" style="font-size:${size}px;color:${color};letter-spacing:${ls}px">${esc(txt)}</div>`;
const para = (lines, size, color = P.ink, lh = 1.5) =>
  lines.map((l) => `<div style="font-size:${size}px;color:${color};line-height:${lh}">${esc(l)}</div>`).join("");

// ---- per-scene inner HTML + GSAP tweens (times are LOCAL to the scene) ----
const sceneGens = {
  SC01(w) {
    return { html: `${disp("AUGUST 15, 1977", 40, P.dim, 8)}${disp("11:16 P.M. EDT", 32, "rgba(143,160,184,0.7)", 8)}
      <div class="stars" data-seed="7"></div>
      <svg class="arch" viewBox="0 0 1200 300" style="top:38%;left:8%;width:84%">
        <path class="draw" style="stroke-dasharray:4000;stroke-dashoffset:4000" data-dur="10" data-at="2" d="M0,290 C200,290 300,40 600,40 C900,40 1000,290 1200,290" fill="none" stroke="${P.signal}" stroke-width="4"/></svg>`,
      tween: `[["fromTo",".arch",{opacity:1},{opacity:1,duration:0.1,delay:2}]]` };
  },
  SC02(w) {
    const chars = ["6","E","Q","U","J","5"].map((c, i) =>
      `<span class="pc" data-d="${0.5 + i * 0.55}" style="color:${i === 3 ? P.signal : P.ink}">${c}</span>`).join("");
    return { html: `<div class="sixmono">${chars}</div>
      <div class="wownote">Wow!</div>${chip("PRINTOUT SCAN — WIKIMEDIA COMMONS", P.dim, 22, 40, 950)}`,
      tween: `[["fromTo",".pc",{opacity:0},{opacity:1,duration:0.35,stagger:0.55,delay:0.4}],
               ["fromTo",".wownote",{opacity:0,scale:0.7},{opacity:1,scale:1,duration:1.2,delay:4.5,ease:"power2.out"}]]` };
  },
  SC03(w) {
    return { html: `<div class="stars" data-seed="21" data-slow="1"></div>
      <div class="vcenter">${disp("THE WOW! SIGNAL", 120, P.ink, 10)}
      <div class="rule"></div>${disp("72 SECONDS FROM DEEP SPACE", 48, P.dim, 8)}
      <div style="height:60px"></div>${disp("THE UNCLOSED FILE", 34, P.crimson, 12)}</div>`,
      tween: `[["fromTo","#SC03 .vcenter",{opacity:0,y:40},{opacity:1,y:0,duration:1.2}]]` };
  },
  SC04(w) {
    return { html: `${disp("BIG EAR — OHIO STATE UNIVERSITY RADIO OBSERVATORY", 38, P.ink, 3)}
      <svg viewBox="0 0 1400 700" style="position:absolute;left:10%;top:22%;width:80%">
        <line x1="100" y1="640" x2="1300" y2="640" stroke="${P.dim}" stroke-width="10"/>
        <rect class="flat" x="330" y="360" width="380" height="16" fill="#141d33" stroke="${P.ink}" stroke-width="4" transform="rotate(24 520 368)"/>
        <path d="M820,640 A320,320 0 0 0 1460,640" fill="none" stroke="${P.ink}" stroke-width="5"/>
        <path class="beam" d="M520,140 L520,368 L960,300 L960,640" fill="none" stroke="${P.signal}" stroke-width="3" stroke-dasharray="12 10"/>
        <text x="520" y="320" fill="${P.dim}" font-size="30" text-anchor="middle">TILTABLE FLAT REFLECTOR</text>
        <text x="1120" y="330" fill="${P.dim}" font-size="30" text-anchor="middle">FIXED PARABOLOID</text>
        <text x="200" y="620" fill="${P.dim}" font-size="30">STEEL GROUND PLANE</text>
      </svg>${chip("RECONSTRUCTION", P.dim, 22, 40, 950)}`,
      tween: `[["fromTo","#SC04 .flat",{opacity:0},{opacity:1,duration:1,delay:0.6}],
               ["fromTo","#SC04 .beam",{opacity:0},{opacity:1,duration:1.2,delay:1.6}]]` };
  },
  SC05(w) {
    return { html: `${disp("THE SKY SWEEPS — THE TELESCOPE NEVER MOVES", 38, P.ink, 3)}
      <div class="sweepbox"><div class="beamrect"></div></div>
      <div class="tclock mono">T+00s</div>${chip("72 s PER SKY POINT", P.dim, 26, 40, 950)}`,
      tween: `[["fromTo","#SC05 .beamrect",{x:-200},{x:1500,duration:${(w.end-w.start-3).toFixed(2)},delay:1,ease:"none"}],
               ["fromTo","#SC05 .tclock",{opacity:0.6},{opacity:1,duration:1,delay:1}]]` };
  },
  SC06(w) {
    const cards = [["~20,000","RADIO SOURCES CATALOGUED",P.signal],["2","MOST DISTANT QUASARS THEN KNOWN",P.signal],["1972","NSF FUNDING CUT — TEAM LET GO",P.warn]]
      .map(([b,s,c], i) => `<div class="card" style="left:${230 + i * 520}px" data-d="${1 + i * 1.6}">
        <div class="mono big" style="color:${c}">${b}</div><div class="small">${esc(s)}</div></div>`).join("");
    return { html: `${disp("THE OHIO SKY SURVEY", 54, P.ink, 6)}<div class="cards" style="top:36%">${cards}</div>`,
      tween: `[["fromTo","#SC06 .card",{opacity:0,y:50},{opacity:1,y:0,duration:0.9,stagger:1.6,delay:1}]]` };
  },
  SC07(w) {
    const rows = Array.from({length: 10}, (_, r) => Array.from({length: 22}, (_, c) => {
      const v = Math.abs(Math.sin(r * 12.9898 + c * 78.233) * 43758.5453) % 1;
      return `<span style="display:inline-block;width:38px">${v > 0.9 ? Math.floor(v * 9) + 1 : v > 0.82 ? 1 : ""}</span>`;
    }).join("")).map((r, i) => `<div style="white-space:pre" data-d="${1.4 + i * 0.55}">${r}</div>`).join("");
    return { html: `${disp("N50CH — THE NARROWBAND SEARCH", 42, P.ink, 3)}
      <div class="ibmpanel mono">IBM 1130</div>
      <div class="paper mono">${rows}</div>${chip("ONE CHARACTER PER CHANNEL, PER ROW", P.dim, 24, 40, 950)}${chip("RECONSTRUCTION", P.dim, 22, 40, 990)}`,
      tween: `[["fromTo","#SC07 .paper div",{opacity:0},{opacity:1,duration:0.3,stagger:0.55,delay:1.4}]]` };
  },
  SC08(w) {
    return { html: `${disp("THE RUN OF AUGUST 15, 1977", 38, P.ink, 4)}
      <div class="archival" style="background-image:url(assets/printout_page.jpg)"></div>${chip("ARCHIVAL SCAN — WIKIMEDIA COMMONS", P.dim, 22, 40, 950)}`,
      tween: `[["fromTo","#SC08 .archival",{scale:1.02,y:0},{scale:1.10,y:-30,duration:${(w.end-w.start).toFixed(2)},ease:"none"}]]` };
  },
  SC09(w) {
    const chars = [["6",6],["E",14],["Q",26],["U",30],["J",19],["5",5]];
    const bars = chars.map(([c, v], i) => `<div class="lad" data-d="${0.8 + i * 0.9}" style="left:${240 + i * 250}px">
      <div class="ladbar" style="height:${Math.round(v / 32 * 380)}px;background:${i === 3 ? "rgba(75,225,160,0.3)" : "rgba(143,160,184,0.18)"};border-color:${i === 3 ? P.signal : P.dim}"></div>
      <div class="mono ladc" style="color:${i === 3 ? P.signal : P.ink}">${c}</div><div class="mono ladv">${v}</div></div>`).join("");
    return { html: `${disp("CHANNEL 2 — SIX CONSECUTIVE ROWS", 40, P.ink, 4)}${bars}
      <div class="footline">SIGNAL-TO-NOISE RATIO · LETTERS BEGIN AT 10 (A) THROUGH 35 (Z)</div>`,
      tween: `[["fromTo","#SC09 .lad",{opacity:0},{opacity:1,duration:0.4,stagger:0.9,delay:0.8}],
               ["fromTo","#SC09 .ladbar",{scaleY:0,transformOrigin:"bottom"},{scaleY:1,duration:0.5,stagger:0.9,delay:0.8}]]` };
  },
  SC10(w) {
    return { html: `${disp("WHAT 'U' MEANS", 50, P.ink, 5)}
      <div class="vcenter" style="top:30%">
        <div class="mono" style="font-size:100px;color:${P.signal}">U</div>
        ${para(["PEAK INTENSITY: 30.5 ± 0.5 × BACKGROUND NOISE", "THE NOISE FLOOR IS THE RECEIVER'S OWN HISS —", "THE GALAXY, AND THE AFTERGLOW OF THE BIG BANG"], 34)}
      </div>`,
      tween: `[["fromTo","#SC10 .vcenter",{opacity:0},{opacity:1,duration:1,delay:0.8}]]` };
  },
  SC11(w) {
    return { html: `${disp("THE SHAPE OF A REAL TRANSIT", 44, P.ink, 4)}
      <svg viewBox="0 0 1200 320" style="position:absolute;left:9%;top:28%;width:82%">
        <path class="draw" style="stroke-dasharray:4000;stroke-dashoffset:4000" data-dur="5" data-at="0.8" d="M0,300 C250,300 350,40 600,40 C850,40 950,300 1200,300" fill="none" stroke="${P.signal}" stroke-width="4"/>
        <line x1="0" y1="300" x2="1200" y2="300" stroke="${P.dim}" stroke-width="3"/></svg>
      <div style="position:absolute;top:74%;left:9%">${chip("FULL WINDOW: 72 s", P.signal, 30)}</div>
      <div style="position:absolute;top:74%;left:42%">${chip("NOT '37 s' — THAT IS THE HALF-POWER WIDTH", P.warn, 30)}</div>
      <div class="footline">RISE ~36 s → PEAK → FALL — EXACTLY WHAT A BEAM SWEEP SHOULD DRAW</div>`,
      tween: `[["fromTo","#SC11 .draw",{opacity:1},{opacity:1,duration:0.1,delay:0.8}]]` };
  },
  SC12(w) {
    return { html: `${disp("ONE HORN ONLY", 54, P.ink, 6)}
      <svg viewBox="0 0 1600 600" style="position:absolute;left:5%;top:26%;width:90%">
        <path d="M280,560 L460,120 L640,560 Z" fill="rgba(75,225,160,0.18)" stroke="${P.signal}" stroke-width="3"/>
        <path class="arch2" style="stroke-dasharray:1200;stroke-dashoffset:1200" data-dur="2" data-at="0.8" d="M320,540 C380,300 540,300 600,540" fill="none" stroke="${P.signal}" stroke-width="4"/>
        <path d="M960,560 L1140,120 L1320,560 Z" fill="rgba(143,160,184,0.10)" stroke="${P.dim}" stroke-width="3"/>
        <text x="460" y="596" fill="${P.dim}" font-size="30" text-anchor="middle">POSITIVE HORN — SIGNAL</text>
        <text x="1140" y="596" fill="${P.dim}" font-size="30" text-anchor="middle">SECOND HORN — +5 MIN — NOTHING</text></svg>
      <div class="footline" style="top:88%">THE SAME PATCH OF SKY. NO SECOND IMPRESSION.</div>`,
      tween: `[["fromTo","#SC12 .arch2",{opacity:1},{opacity:1,duration:0.1,delay:0.8}]]` };
  },
  SC13(w) {
    return { html: `<div class="vcenter" style="top:24%">${disp("JERRY R. EHMAN", 82, P.ink, 8)}
      ${disp("RADIO ASTRONOMER · OHIO STATE UNIVERSITY", 34, P.dim, 4)}</div>
      <div class="footline" style="top:78%">EVERY FEW DAYS THE PRINTOUTS ARRIVED — HE READ THEM, ROW BY ROW</div>`,
      tween: `[["fromTo","#SC13 .vcenter",{opacity:0,y:30},{opacity:1,y:0,duration:1,delay:0.6}]]` };
  },
  SC14(w) {
    return { html: `${disp("AUGUST 19, 1977 — A FEW PAGES INTO THE RUN", 36, P.ink, 3)}
      <div class="archival" style="background-image:url(assets/printout_close.jpg)"></div>${chip("ARCHIVAL SCAN — WIKIMEDIA COMMONS", P.dim, 22, 40, 950)}`,
      tween: `[["fromTo","#SC14 .archival",{scale:1.02},{scale:1.12,duration:${(w.end-w.start).toFixed(2)},ease:"none"}]]` };
  },
  SC15(w) {
    return { html: `<div class="archival" style="background-image:url(assets/printout_page.jpg)"></div>
      <div class="footline" style="top:88%">KRAUS BEGAN CALLING IT THE WOW! SOURCE — AND THE NAME STUCK</div>${chip("ARCHIVAL SCAN — WIKIMEDIA COMMONS", P.dim, 22, 40, 950)}`,
      tween: `[["fromTo","#SC15 .archival",{scale:1.10},{scale:1.02,duration:${(w.end-w.start).toFixed(2)},ease:"none"}]]` };
  },
  SC16(w) {
    const pts = [[744,562],[816,540],[888,594],[864,680],[768,712],[720,648]];
    return { html: `<div class="stars" data-seed="55"></div>${disp("WHERE THE SKY WAS", 46, P.ink, 5)}
      <div class="mono" style="position:absolute;left:16%;top:30%;font-size:40px;color:${P.cyan}">R.A. 19h 22m 25s ± 10s<br>DECL. −27° 03′ ± 20′ (1950.0)</div>
      <svg viewBox="0 0 1920 1080" style="position:absolute;inset:0">
        <polyline points="${pts.map(p => p.join(",")).join(" ")}" fill="none" stroke="rgba(143,160,184,0.6)" stroke-width="2"/>
        ${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${P.ink}"/>`).join("")}
        <circle cx="806" cy="616" r="28" fill="none" stroke="${P.signal}" stroke-width="3"/>
        <text x="850" y="625" fill="${P.signal}" font-size="30">SAGITTARIUS</text></svg>`,
      tween: `[["fromTo","#SC16 .mono",{opacity:0},{opacity:1,duration:1,delay:0.8}]]` };
  },
  SC17(w) {
    return { html: `${disp("1959 — A NATURAL MEETING FREQUENCY", 40, P.ink, 3)}${disp("MORRISON & COCCONI", 28, P.dim, 8)}
      <svg viewBox="0 0 700 500" style="position:absolute;left:12%;top:34%;width:34%">
        <circle cx="200" cy="220" r="14" fill="${P.cyan}"/>
        <ellipse cx="200" cy="220" rx="90" ry="36" fill="none" stroke="rgba(88,199,240,0.5)" stroke-width="2.5" transform="rotate(28 200 220)"/>
        <ellipse cx="200" cy="220" rx="90" ry="36" fill="none" stroke="rgba(88,199,240,0.5)" stroke-width="2.5" transform="rotate(-28 200 220)"/>
        <text x="90" y="330" fill="${P.dim}" font-size="26">21-cm line of neutral hydrogen</text></svg>
      <div class="vcenter" style="left:52%;top:40%;position:absolute;text-align:center">
        <div class="mono" style="font-size:92px;color:${P.signal}">1420 MHz</div>
        ${disp("THE WATERING HOLE", 38, P.ink, 6)}</div>`,
      tween: `[["fromTo","#SC17 svg",{opacity:0},{opacity:1,duration:1.2,delay:0.8}],["fromTo","#SC17 .vcenter",{opacity:0},{opacity:1,duration:1.2,delay:1.4}]]` };
  },
  SC18(w) {
    return { html: `${disp("ALMOST — BUT NOT EXACTLY — THE HYDROGEN LINE", 38, P.ink, 3)}
      <svg viewBox="0 0 1600 420" style="position:absolute;left:5%;top:34%;width:90%">
        <line x1="0" y1="210" x2="1600" y2="210" stroke="${P.dim}" stroke-width="3"/>
        <line x1="560" y1="150" x2="560" y2="270" stroke="${P.cyan}" stroke-width="5"/>
        <text x="560" y="310" fill="${P.cyan}" font-size="28" text-anchor="middle">1420.4058 MHz · HYDROGEN LINE</text>
        <line class="wowmark" x1="1040" y1="130" x2="1040" y2="290" stroke="${P.signal}" stroke-width="5"/>
        <text class="wowmark" x="1040" y="100" fill="${P.signal}" font-size="30" text-anchor="middle">WOW!  1420.4556 MHz</text>
        <text class="offset" x="800" y="60" fill="${P.warn}" font-size="26" text-anchor="middle">+50 kHz · ≈ 10 km/s TOWARD EARTH</text></svg>`,
      tween: `[["fromTo","#SC18 .wowmark",{opacity:0,x:60},{opacity:1,x:0,duration:1.2,delay:1.2}],
               ["fromTo","#SC18 .offset",{opacity:0},{opacity:1,duration:0.8,delay:2.2}]]` };
  },
  SC19(w) {
    const rows = [["LOCAL OSCILLATOR — ORDERED","1450.4056 MHz",P.dim],["LOCAL OSCILLATOR — DELIVERED","1450.5056 MHz",P.warn],
      ["EHMAN'S CALCULATION","CORRECTED",P.signal],["KRAUS'S 1994 SUMMARY FOR SAGAN","UNCORRECTED",P.warn]];
    return { html: `${disp("EVEN THE NUMBER HAS A STORY", 44, P.ink, 4)}
      ${rows.map(([k, v, c], i) => `<div class="ledrow" data-d="${0.8 + i * 1.3}" style="top:${28 + i * 11}%">
        <span style="color:${P.dim};text-align:right;width:44%">${esc(k)}</span><span class="mono" style="color:${c}">${v}</span></div>`).join("")}
      <div class="footline" style="top:80%">THE SIGNAL DID NOT MOVE. THE PAPERWORK DID.</div>`,
      tween: `[["fromTo","#SC19 .ledrow",{opacity:0,x:-40},{opacity:1,x:0,duration:0.7,stagger:1.3,delay:0.8}]]` };
  },
  SC20(w) {
    return { html: `${disp("NARROWNESS IS WHAT TECHNOLOGY DOES", 42, P.ink, 3)}
      <div style="position:absolute;left:14%;top:32%;width:72%">
        <div style="font-size:28px;color:${P.dim};margin-bottom:10px">NATURAL RADIO SOURCES — BROADBAND (PULSARS, QUASARS, GALAXIES)</div>
        <div style="height:56px;background:rgba(143,160,184,0.25)"></div>
        <div style="font-size:28px;color:${P.signal};margin:36px 0 10px">THE WOW! SIGNAL — ONE 10 kHz CHANNEL</div>
        <div class="narrow" style="height:56px;background:rgba(75,225,160,0.55);width:56px"></div></div>
      <div class="footline" style="top:72%">AND YET — NOTHING TECHNOLOGICAL WAS THERE TO DO IT</div>`,
      tween: `[["fromTo","#SC20 .narrow",{width:10},{width:96,duration:1.2,delay:1.2}]]` };
  },
  SC21(w) {
    return { html: `${disp("THE FIRST FOLLOW-UP: LOOK AGAIN", 44, P.ink, 4)}
      ${[0, 1, 2].map((i) => `<div class="nullrow" data-d="${1 + i * 2.4}" style="top:${36 + i * 13}%">
        <div class="beammini"></div><span class="mono" style="color:${P.warn};margin-left:auto">NULL</span></div>`).join("")}
      <div style="position:absolute;top:82%;left:16%">${chip("NOT REPOINTABLE — THE SKY HAD TO BRING IT BACK. IT NEVER DID.", P.dim, 26)}</div>`,
      tween: `[["fromTo","#SC21 .nullrow",{opacity:0},{opacity:1,duration:1.2,stagger:2.4,delay:1}]]` };
  },
  SC22(w) {
    const items = [["1987 · 1989","META ARRAY — OAK RIDGE (GRAY)"],["1995","GREEN BANK 12-m DRIFT SCAN (SHUCH)"],
      ["1995 · 1996","VERY LARGE ARRAY (GRAY)"],["1999","MOUNT PLEASANT 26-m, TASMANIA (GRAY & ELLINGSEN)"]];
    return { html: `${disp("DECADES OF BETTER INSTRUMENTS", 44, P.ink, 4)}
      ${items.map(([yr, nm], i) => `<div class="ledrow" data-d="${0.8 + i * 1.5}" style="top:${27 + i * 12}%">
        <span class="mono" style="color:${P.cyan};width:24%">${yr}</span>
        <span style="color:${P.ink};width:56%;text-align:center">${esc(nm)}</span>
        <span class="mono" style="color:${P.warn};width:16%;text-align:right">NULL</span></div>`).join("")}
      <div class="footline" style="top:80%">SILENCE, EVERY TIME.</div>`,
      tween: `[["fromTo","#SC22 .ledrow",{opacity:0},{opacity:1,duration:0.8,stagger:1.5,delay:0.8}]]` };
  },
  SC23(w) {
    return { html: `<div class="stars" data-seed="88"></div>${disp("THE SEARCHES CONTINUE", 46, P.ink, 4)}
      ${[["2022","BREAKTHROUGH LISTEN","GREEN BANK + ALLEN ARRAYS — INCL. SIMULTANEOUS",230],["2025","SETI INSTITUTE","COORDINATED GBT/ATA OBSERVATION OF THE POSITION",990]]
        .map(([yr, org, note, x], i) => `<div class="card" data-d="${0.8 + i * 2}" style="left:${x}px;top:34%;width:640px;height:250px">
        <div class="mono big" style="color:${P.cyan};font-size:42px">${yr}</div>
        <div style="font-size:32px;color:${P.ink}">${org}</div>
        <div style="font-size:24px;color:${P.dim}">${esc(note)}</div>
        <div class="mono" style="color:${P.warn};font-size:28px;margin-top:8px">NULL</div></div>`).join("")}
      <div class="vcenter mono" style="top:78%;font-size:50px;color:${P.signal}">0 REPEATS IN 49 YEARS</div>`,
      tween: `[["fromTo","#SC23 .card",{opacity:0,y:40},{opacity:1,y:0,duration:1,stagger:2,delay:0.8}],
               ["fromTo","#SC23 .vcenter",{opacity:0},{opacity:1,duration:1,delay:5}]]` };
  },
  SC24(w) {
    const items = ["PLANETS","ASTEROIDS","SATELLITES","AIRCRAFT","SPACECRAFT"];
    return { html: `${disp("THE ORIGINAL TEAM RULED OUT THE OBVIOUS", 40, P.ink, 3)}
      ${items.map((s, i) => `<div class="strike" data-d="${0.6 + i * 0.7}" style="left:${140 + (i % 3) * 400}px;top:${26 + Math.floor(i / 3) * 14}%">${s}</div>`).join("")}
      <div class="footline" style="top:64%">A TERRESTRIAL SIGNAL OFF SPACE DEBRIS?</div>
      <div class="footline" style="top:70%;color:${P.warn}">ILLEGAL TRANSMITTER + NON-TUMBLING SURFACE + PERFECT GEOMETRY</div>
      <div class="footline" style="top:76%">IMPROBABLE IN PRACTICE</div>`,
      tween: `[["fromTo","#SC24 .strike",{opacity:0},{opacity:1,duration:0.4,stagger:0.7,delay:0.6}],
               ["fromTo","#SC24 .strike .ln",{scaleX:0},{scaleX:1,duration:0.3,stagger:0.7,delay:0.9}]]` };
  },
  SC25(w) {
    return { html: `${disp("TWO IDEAS SURVIVE AS POSSIBILITIES", 42, P.ink, 3)}
      <svg viewBox="0 0 1600 520" style="position:absolute;left:5%;top:26%;width:90%">
        <circle cx="400" cy="220" r="34" fill="#000" stroke="${P.dim}" stroke-width="3"/>
        <path d="M100,140 Q400,240 700,120" fill="none" stroke="${P.cyan}" stroke-width="2.5"/>
        <path d="M100,200 Q400,260 700,190" fill="none" stroke="${P.cyan}" stroke-width="2.5"/>
        <path d="M100,260 Q400,280 700,260" fill="none" stroke="${P.cyan}" stroke-width="2.5"/>
        <text x="400" y="330" fill="${P.ink}" font-size="30" text-anchor="middle">GRAVITATIONAL LENSING</text>
        <text x="400" y="368" fill="${P.dim}" font-size="24" text-anchor="middle">SHOULD HAVE LASTED LONGER</text>
        <circle class="flick" cx="1180" cy="220" r="24" fill="${P.cyan}"/>
        <text x="1180" y="330" fill="${P.ink}" font-size="30" text-anchor="middle">INTERSTELLAR SCINTILLATION</text>
        <text x="1180" y="368" fill="${P.dim}" font-size="24" text-anchor="middle">THE TWINKLE OF STARS, IN RADIO</text></svg>
      <div class="footline" style="top:82%;color:${P.warn}">BOTH SHOULD ALSO HAVE SHOWN IN THE SECOND HORN</div>`,
      tween: `[["to","#SC25 .flick",{opacity:0.3,duration:0.4,yoyo:true,repeat:9}]]` };
  },
  SC26(w) {
    return { html: `${disp("2017 — THE COMET HYPOTHESIS", 44, P.ink, 4)}
      ${["NOT IN THE BEAM AT THE RIGHT TIME","COMETS BARELY EMIT AT THAT FREQUENCY","ONE HORN SAW EVERYTHING — THE OTHER NOTHING"]
        .map((s, i) => `<div class="strikebox" data-d="${2 + i * 1.5}" style="left:52%;top:${28 + i * 13}%">${esc(s)}</div>`).join("")}
      <div class="footline" style="top:80%;color:${P.warn}">DISMISSED — INCLUDING BY BIG EAR'S OWN VETERANS</div>`,
      tween: `[["fromTo","#SC26 .strikebox",{opacity:0},{opacity:1,duration:0.7,stagger:1.5,delay:2}]]` };
  },
  SC27(w) {
    return { html: `${disp("2024 — THE NEWEST HYPOTHESIS", 42, P.ink, 3)}
      <div class="cloud" style="left:14%;top:32%;width:38%;height:40%"><span></span></div>
      <div class="vcenter" style="left:56%;top:44%;position:absolute;text-align:center">
        ${chip("PROPOSED — NOT PROVEN", P.warn, 34)}
        <div style="font-size:30px;color:${P.dim};margin-top:24px">MODEL EVENTS RUN ~100× WEAKER THAN WOW!<br>A NEW CLASS OF FALSE POSITIVE FOR FUTURE SEARCHES</div></div>
      <div class="footline" style="top:26%;left:56%;width:40%;color:${P.warn}">COLD HYDROGEN CLOUD + TRANSIENT EXCITATION (MAGNETAR FLARE) → MASER-LIKE BURST AT THE HYDROGEN LINE</div>`,
      tween: `[["fromTo","#SC27 .cloud",{opacity:0},{opacity:1,duration:1.2,delay:0.8}]]` };
  },
  SC28(w) {
    const rows = ["A STRONG, NARROWBAND RADIO BURST","ON THE SKY FOR 72 SECONDS",
      "NEVER DETECTED AGAIN — DESPITE 25 YEARS OF BETTER INSTRUMENTS",
      "THE FACT BASE FITS ON ONE SHEET OF LINE-PRINTER PAPER"];
    return { html: `${disp("WHERE THE EVIDENCE STANDS", 46, P.ink, 4)}${chip("ESTABLISHED", P.signal, 32, 16, 15)}
      ${rows.map((s, i) => `<div class="chip wide" data-d="${0.7 + i * 1.4}" style="left:16%;top:${27 + i * 11}%;font-size:28px;color:${i === 3 ? P.signal : P.ink};border-color:${i === 3 ? P.signal : P.dim}">${s}</div>`).join("")}`,
      tween: `[["fromTo","#SC28 .chip.wide",{opacity:0,x:-40},{opacity:1,x:0,duration:0.7,stagger:1.4,delay:0.7}]]` };
  },
  SC29(w) {
    const rows = ["WHO — OR WHAT — SENT IT","\u201CSENT\u201D MAY BE THE WRONG VERB ENTIRELY",
      "AN EXTRATERRESTRIAL TRANSMISSION CANNOT BE RULED OUT","NEITHER CAN A RARE NATURAL PHENOMENON"];
    return { html: `${disp("WHAT IS NOT ESTABLISHED", 46, P.ink, 4)}${chip("NOT ESTABLISHED", P.warn, 32, 16, 15)}
      ${rows.map((s, i) => `<div class="chip wide" data-d="${0.7 + i * 1.4}" style="left:16%;top:${27 + i * 11}%;font-size:28px;color:${P.dim};border-color:${P.dim}">${s}</div>`).join("")}
      <div class="footline" style="top:76%">BOTH REMAIN HYPOTHESES — NEITHER IS A CONCLUSION</div>`,
      tween: `[["fromTo","#SC29 .chip.wide",{opacity:0,x:-40},{opacity:1,x:0,duration:0.7,stagger:1.4,delay:0.7}]]` };
  },
  SC30(w) {
    return { html: `<div class="vcenter" style="top:26%;padding:0 12%">
      <div style="font-size:50px;color:${P.ink};line-height:1.4">\u201CThe origin of the Wow! signal is still an open question for me.\u201D</div>
      <div style="font-size:50px;color:${P.ink};line-height:1.4;margin-top:8%" class="q2">\u201CI choose not to draw vast conclusions from half-vast data.\u201D</div>
      <div style="font-size:28px;color:${P.dim};text-align:right;margin-top:6%">— JERRY R. EHMAN, bigear.org</div></div>`,
      tween: `[["fromTo","#SC30 .vcenter",{opacity:0},{opacity:1,duration:1,delay:0.8}],
               ["fromTo","#SC30 .q2",{opacity:0},{opacity:1,duration:1,delay:4.4}]]` };
  },
  SC31(w) {
    return { html: `${disp("1998 — THE TELESCOPE CAME DOWN", 44, P.ink, 3)}
      <svg viewBox="0 0 900 400" style="position:absolute;left:25%;top:30%;width:50%">
        <path d="M100,380 L260,220 L340,220 L460,120 L540,120 L550,150 L490,150 L480,220 L660,380 Z"
          fill="rgba(26,36,56,0.9)" stroke="rgba(143,160,184,0.55)" stroke-width="3"/></svg>
      <div class="footline" style="top:80%">THE LAND WAS SOLD — A GOLF COURSE AND 400 HOUSES</div>
      <div class="footline" style="top:87%;color:${P.ink}">WHAT SURVIVES IS PAPER</div>${chip("RECONSTRUCTION", P.dim, 22, 40, 950)}`,
      tween: `[["fromTo","#SC31 svg",{opacity:1},{opacity:0.35,duration:4,delay:1}]]` };
  },
  SC32(w) {
    return { html: `<div class="stars" data-seed="121"></div>
      ${disp("EVERY NARROWBAND SEARCH IS LISTENING FOR ANOTHER WOW!", 38, P.ink, 2)}
      ${[300, 1300].map((x) => `<div class="cone" style="left:${x}px"></div>`).join("")}`,
      tween: `[["fromTo","#SC32 .cone",{scaleY:0.7,transformOrigin:"bottom"},{scaleY:1.1,duration:3,yoyo:true,repeat:5,ease:"sine.inOut"}]]` };
  },
  SC33(w) {
    return { html: `<div class="stars" data-seed="55"></div>
      <div class="vcenter" style="top:52%">${disp("IF IT WAS A BEACON, IT SPOKE ONCE.", 42, P.ink, 3)}
      ${disp("IF IT WAS NATURE, WE HAVE NOT CAUGHT IT AGAIN.", 42, P.ink, 3)}</div>`,
      tween: `[["fromTo","#SC33 .vcenter",{opacity:0},{opacity:1,duration:1.4,delay:1.5}]]` };
  },
  SC34(w) {
    return { html: `<div class="stars" data-seed="21" data-slow="1"></div>
      <div class="vcenter" style="top:18%">${disp("THE UNCLOSED FILE", 70, P.ink, 10)}<div class="rule"></div>
      ${disp("THE WOW! SIGNAL — 72 SECONDS FROM DEEP SPACE", 32, P.dim, 3)}</div>
      <div class="vcenter" style="top:44%;font-size:24px;color:${P.dim};line-height:2">
        RESEARCH &amp; SOURCES: bigear.org · THE SETI INSTITUTE · THE PUBLISHED LITERATURE<br>
        PRINTOUT SCANS: WIKIMEDIA COMMONS (PUBLIC DOMAIN)<br>NARRATION: SYNTHETIC VOICE (EDGE-TTS)<br>
        VISUALS: CODE-GENERATED · LABELLED RECONSTRUCTIONS WHERE APPLICABLE</div>
      <div class="vcenter" style="top:74%">${disp("SOME FILES NEVER CLOSE.", 44, P.crimson, 8)}</div>`,
      tween: `[["fromTo","#SC34 .vcenter",{opacity:0},{opacity:1,duration:1.2,delay:0.5,stagger:0.6}]]` };
  },
};

const sceneHTML = [];
const tweenGroups = [];
for (const [id, w] of Object.entries(tl.scenes)) {
  const gen = sceneGens[id];
  if (!gen) throw new Error(`no generator for ${id}`);
  const g = gen(w);
  sceneHTML.push(
    `<section id="${id}" class="clip scene" data-track-index="1" data-start="${w.start}" data-duration="${(w.end - w.start).toFixed(3)}">${g.html}</section>`);
  if (g.tween) tweenGroups.push({ start: w.start, tweens: Function("return (" + g.tween + ")")() });
}
// caption clips (track 9)
const capHTML = cues.map((c, i) =>
  `<div class="clip cap" data-track-index="9" data-start="${c.s.toFixed(3)}" data-duration="${(c.e - c.s).toFixed(3)}">${esc(c.text).replace("\n", "<br>")}</div>`).join("\n");

const starsJs = `
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
document.querySelectorAll('.stars').forEach(el=>{
  const seed=+el.dataset.seed||7, slow=el.dataset.slow?0.3:1;
  const r=mulberry(seed); let h='';
  for(let i=0;i<150;i++){const x=r()*1920,y=r()*1080,s=(r()*1.8+0.6).toFixed(2);
    h+=\`<i style="left:\${x}px;top:\${y}px;width:\${s}px;height:\${s}px;opacity:\${(0.3+r()*0.6).toFixed(2)}\`;h+='</i>';}
  el.innerHTML=h; el.style.animationDuration=(60/slow)+'s';
});`;

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  html,body{margin:0;background:${P.bg};font-family:'DejaVu Sans',Arial,sans-serif;}
  #stage{width:1920px;height:1080px;position:relative;overflow:hidden;background:${P.bg};}
  .scene{position:absolute;inset:0;}
  .stars{position:absolute;inset:0;}
  .stars i{position:absolute;background:#fff;border-radius:50%;display:block;}
  .mono{font-family:'DejaVu Sans Mono',monospace;}
  .disp{position:absolute;left:0;right:0;text-align:center;font-weight:700;}
  .vcenter{position:absolute;left:0;right:0;text-align:center;}
  .rule{height:4px;background:${P.crimson};width:28%;margin:22px auto;}
  .chip{position:absolute;border:2px solid;padding:10px 20px;font-weight:700;letter-spacing:1px;background:rgba(5,8,16,0.4);}
  .chip.wide{display:inline-block;}
  .footline{position:absolute;left:0;right:0;top:90%;text-align:center;font-size:30px;color:${P.dim};}
  .cards{position:absolute;left:0;right:0;}
  .card{position:absolute;width:420px;height:290px;background:${P.panel};border:2px solid rgba(143,160,184,0.35);text-align:center;padding-top:60px;box-sizing:border-box;}
  .card .big{font-size:80px;}
  .card .small{font-size:26px;color:${P.dim};margin-top:16px;padding:0 24px;}
  .ibmpanel{position:absolute;left:12%;top:26%;width:32%;height:42%;background:${P.panel};border:2px solid rgba(143,160,184,0.4);color:${P.signal};font-size:34px;padding:24px;box-sizing:border-box;}
  .paper{position:absolute;left:54%;top:24%;width:34%;height:50%;background:${P.beige};color:#111;font-size:24px;padding:20px;box-sizing:border-box;line-height:1.5;}
  .archival{position:absolute;left:8%;top:16%;width:84%;height:68%;background-size:cover;background-position:center;box-shadow:0 0 120px rgba(0,0,0,0.8);}
  .sixmono{position:absolute;left:0;right:0;top:36%;text-align:center;font-family:'DejaVu Sans Mono';font-size:180px;letter-spacing:40px;}
  .pc{opacity:0;}
  .wownote{position:absolute;left:13%;top:40%;font-style:italic;font-size:140px;color:${P.crimson};opacity:0;}
  .lad{position:absolute;top:26%;width:190px;height:62%;opacity:0;}
  .ladbar{position:absolute;bottom:110px;left:0;right:0;border:2px solid;}
  .ladc{position:absolute;bottom:20px;left:0;right:0;text-align:center;font-size:84px;}
  .ladv{position:absolute;bottom:64%;left:0;right:0;text-align:center;font-size:28px;color:${P.dim};}
  .sweepbox{position:absolute;left:12%;top:40%;width:76%;height:30%;border:2px solid ${P.dim};}
  .beamrect{position:absolute;top:0;bottom:0;width:160px;background:rgba(88,199,240,0.14);border:2px solid ${P.cyan};}
  .tclock{position:absolute;left:0;right:0;top:84%;text-align:center;font-size:60px;color:${P.signal};}
  .ledrow{position:absolute;left:13%;right:13%;display:flex;justify-content:space-between;font-size:30px;border-top:1px solid rgba(143,160,184,0.4);padding-top:10px;opacity:0;}
  .strike{position:absolute;width:340px;border:2px solid rgba(143,160,184,0.4);color:${P.dim};font-size:30px;text-align:center;padding:14px 0;opacity:0;}
  .strikebox{position:absolute;width:40%;border:2px solid rgba(143,160,184,0.4);color:${P.ink};font-size:27px;text-align:center;padding:14px 10px;opacity:0;}
  .nullrow{position:absolute;left:16%;right:16%;height:70px;border:2px solid rgba(143,160,184,0.4);display:flex;align-items:center;padding:0 18px;opacity:0;}
  .beammini{width:90px;height:44px;background:rgba(88,199,240,0.12);border:2px solid ${P.cyan};}
  .cone{position:absolute;top:28%;width:180px;height:52%;background:linear-gradient(to top,rgba(88,199,240,0.16),rgba(88,199,240,0.02));clip-path:polygon(35% 100%,65% 100%,100% 0,0 0);}
  .cloud{position:absolute;border:2px solid rgba(88,199,240,0.5);border-radius:50%;opacity:0;}
  .cap{position:absolute;left:50%;bottom:120px;transform:translateX(-50%);background:rgba(5,8,16,0.72);color:${P.ink};
       font-size:36px;line-height:1.3;padding:14px 34px;text-align:center;max-width:1500px;border-radius:4px;}
</style>
<script src="node_modules/gsap/dist/gsap.min.js"></script>
</head>
<body>
<div id="stage" data-composition-id="main" data-start="0" data-duration="600" data-width="1920" data-height="1080" data-fps="30">
${sceneHTML.join("\n")}
${capHTML}
<audio id="narration" class="clip" data-track-index="10" data-start="0" data-duration="600" data-volume="1" src="assets/narration_program.wav"></audio>
</div>
<script>${starsJs}</script>
<script>
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
const GROUPS = ${JSON.stringify(tweenGroups)};
for (const g of GROUPS) {
  for (const t of g.tweens) {
    const [kind, target, from, to] = t;
    const at = g.start + ((to && to.delay) || (from && from.delay) || 0);
    const clean = (o) => { if (!o) return o; const c = { ...o }; delete c.delay; return c; };
    if (kind === "fromTo") tl.fromTo(target, clean(from), clean(to), at);
    else tl.to(target, clean(from), at);
  }
}
// path draw-on: dashoffset trick (no premium plugins)
document.querySelectorAll('path.draw, path.arch2').forEach((p) => {
  const L = p.getTotalLength();
  p.style.strokeDasharray = L;
  p.style.strokeDashoffset = L;
  const sceneStart = +p.closest('section').dataset.start;
  tl.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: +(p.dataset.dur || 5), ease: 'none' },
    sceneStart + +(p.dataset.at || 1));
});
window.__timelines.main = tl;
</script>
</body></html>`;

fs.writeFileSync("index.html", html);
fs.writeFileSync("hyperframes.json", JSON.stringify({ name: "wow-signal-hyperframes", fps: 30, width: 1920, height: 1080 }, null, 1));

// ---- segment compositions (render unit = 60 s; sandbox foreground limit) ----
const SEGDUR = 60;
const NSEG = 10;
fs.mkdirSync("segments", { recursive: true });
for (let k = 0; k < NSEG; k++) {
  const t0 = k * SEGDUR, t1 = t0 + SEGDUR;
  const inWin = (s, e) => e > t0 + 0.001 && s < t1 - 0.001;
  const segScenes = Object.values(tl.scenes).filter(({ start, end }) => inWin(start, end));
  const segHtml = sceneHTML.filter((_, i) => {
    const id = Object.keys(tl.scenes)[i];
    const w = tl.scenes[id];
    return inWin(w.start, w.end);
  }).map((h, i) => {
    const w = segScenes[i];
    const localStart = Math.max(0, w.start - t0);
    const localEnd = Math.min(SEGDUR, w.end - t0);
    return h.replace(/data-start="[^"]*"/, `data-start="${localStart.toFixed(3)}"`)
            .replace(/data-duration="[^"]*"/, `data-duration="${(localEnd - localStart).toFixed(3)}"`);
  });
  const segCaps = cues.filter((c) => inWin(c.s, c.e)).map((c) => {
    const ls = Math.max(0, c.s - t0), le = Math.min(SEGDUR, c.e - t0);
    return `<div class="clip cap" data-track-index="9" data-start="${ls.toFixed(3)}" data-duration="${(le - ls).toFixed(3)}">${esc(c.text).replace("\n", "<br>")}</div>`;
  }).join("\n");
  // shift this segment's scene tweens into composition-local time
  const localGroups = tweenGroups
    .map((g) => ({ start: g.start - t0, tweens: g.tweens }))
    .filter((g) => g.start > -60 && g.start < SEGDUR + 60);
  const segDoc = html
    .replace(/<section id="(SC\d+)" class="clip scene"[^>]*>[\s\S]*?<\/section>/g, "") // strip all scenes
    .replace(/<div class="clip cap"[^>]*>.*?<\/div>/g, "") // strip all captions (line-based below is unreliable; do regex loop)
    .replace('</div>\n<script>' + starsJs.slice(0, 40), '</div>\n<script>' + starsJs.slice(0, 40));
  // simpler: rebuild from parts
  const segPage = html.split('<div id="stage"')[0] + '<div id="stage" data-composition-id="main" data-start="0" data-duration="' + SEGDUR + '" data-width="1920" data-height="1080" data-fps="30">\n'
    + segHtml.join("\n") + "\n" + segCaps
    + '\n<audio id="narration" class="clip" data-track-index="10" data-start="0" data-duration="' + SEGDUR + '" data-volume="1" src="assets/narration_seg' + k + '.wav"></audio>\n</div>'
    + html.split('</div>\n<script>')[1].replace(/^/, '<script>').replace('const GROUPS = ' + JSON.stringify(tweenGroups), 'const GROUPS = ' + JSON.stringify(localGroups));
  fs.writeFileSync(`segments/segment_${String(k).padStart(2, "0")}.html`, segPage);
}
console.log(`index.html + ${NSEG} segment compositions written`);
