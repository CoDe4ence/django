// Full-bleed hero for the landing page: the khume logo builds, then loops for ever.
// Run through motion/build_hero.sh (it also applies the gradient stops, which the script API
// can't set, and exports the Lottie files). Headless or live in the app (BRIDGE=9877).
//
// Two comps from one build():
//   "Khume Hero Wide"  1920x1080  -> static/animations/hero/khume-hero-wide.json  (landscape screens)
//   "Khume Hero Tall"  1080x1920  -> static/animations/hero/khume-hero-tall.json  (portrait / phones)
//
// Timeline: 0..L0 intro (plays once), L0..L1 loop (khume-lottie.js repeats it seamlessly).
// Loop rule: everything animated inside the loop has the same value at L0 and L1 with zero speed
// there, or turns at a constant rate by a whole period of its own symmetry (360 / dash count, ...).
// Gradients: each gradient fill is announced with a "GRAD|comp|layer|group|stops" line; the build
// script sets them through the engine.

#include "craft_helpers.jsx"

var FPS = 60, L0 = 4, LOOP = 8, L1 = L0 + LOOP, DUR = L1;
var WHITE = [1, 1, 1];
var VIOLET = hex("#7c3aed"), LILAC = hex("#a78bfa"), PALE = hex("#c4b5fd"), INDIGO = hex("#4f46e5");
var BG = hex("#0b0816");
var BEATS = [L0, L0 + LOOP / 2];   // logo pulses, twice per loop
var IMPACT = 1.6;                  // the k's chevron lands

function lin(p, keys) {            // linear keys
  for (var i = 0; i < keys.length; i++) p.setValueAtTime(keys[i][0], keys[i][1]);
  for (i = 1; i <= p.numKeys; i++) p.setInterpolationTypeAtKey(i, KeyframeInterpolationType.LINEAR);
  return p;
}
// a constant spin: degPerLoop must be a whole period of the layer's symmetry
function spin(p, degPerLoop) { lin(p, [[0, 0], [L1, degPerLoop * L1 / LOOP]]); }

function build(opts) {
  var W = opts.w, H = opts.h, C = opts.center, S = opts.scale, h = 1000 * S / 100, u = h / 250;
  // re-running replaces the comp (so the script can be run again in the live app)
  for (var n = app.project.numItems; n >= 1; n--) {
    var it = app.project.item(n);
    if (it instanceof CompItem && it.name === opts.name) it.remove();
  }
  var comp = app.project.items.addComp(opts.name, W, H, 1, DUR, FPS);
  comp.bgColor = BG;

  function layer(name, pos) {
    var l = comp.layers.addShape();
    l.name = name;
    T(l, "ADBE Anchor Point").setValue([0, 0]);
    T(l, "ADBE Position").setValue(pos || C);
    return l;
  }
  function gradFill(l, g, stops) {   // radial, centre (0,0) to radius; stops: [[pos, hex, alpha], ...]
    var gf = vecs(g).addProperty("ADBE Vector Graphic - G-Fill");
    gf.property("type").setValue(2);
    var colors = [], ops = [];
    for (var i = 0; i < stops.length; i++) {
      var c = hex(stops[i][1]);
      colors.push([stops[i][0], [c[0], c[1], c[2], 1]]);
      ops.push([stops[i][0], stops[i][2]]);
    }
    writeLn("GRAD|" + comp.name + "|" + l.name + "|" + g.name + "|" +
      JSON.stringify({ t: "Gradient", v: { colors: colors, opacities: ops } }));
    return gf;
  }
  function blob(name, pos, radius, stops) {
    var l = layer(name, pos);
    var g = group(contents(l), "Blob");
    ellipse(g, [radius * 2, radius * 2]);
    var gf = gradFill(l, g, stops);
    gf.property("end").setValue([radius, 0]);
    return l;
  }
  function dashes(s, d, gap) {
    var ds = s.property("ADBE Vector Stroke Dashes");
    ds.addProperty("ADBE Vector Stroke Dash 1").setValue(d);
    ds.addProperty("ADBE Vector Stroke Gap 1").setValue(gap);
  }
  // intro fade for ambient layers
  function fadeIn(l, t0, t1, to) { anim(T(l, "ADBE Opacity"), [[t0, 0], [t1, to === undefined ? 100 : to]], [[33, 33], [60, 33]]); }

  // ---------- background ----------
  var bg = layer("Background", [W / 2, H / 2]);
  var bgg = group(contents(bg), "Fill");
  rect(bgg, [W + 40, H + 40]);
  fill(bgg, BG);

  // ---------- aurora: two soft blobs that drift and breathe through the loop ----------
  function drift(l, p0, p1, s1) {
    var p = T(l, "ADBE Position");
    anim(p, [[0, p0], [L0, p0], [L0 + LOOP / 2, p1], [L1, p0]], [33, 33]);
    anim(T(l, "ADBE Scale"), [[L0, [100, 100]], [L0 + LOOP / 2, [s1, s1]], [L1, [100, 100]]], [33, 33]);
  }
  var ax = opts.wide ? 360 * u : 160 * u, ay = opts.wide ? 160 * u : 420 * u;
  var a1 = blob("Aurora Violet", [C[0] - ax, C[1] + ay], 900 * u, [[0, "#7c3aed", 0.42], [0.55, "#7c3aed", 0.12], [1, "#7c3aed", 0]]);
  drift(a1, [C[0] - ax, C[1] + ay], [C[0] - ax * 0.4, C[1] + ay * 0.5], 118);
  fadeIn(a1, 0, 1.8);
  var a2 = blob("Aurora Indigo", [C[0] + ax, C[1] - ay], 760 * u, [[0, "#4f46e5", 0.34], [0.6, "#4f46e5", 0.08], [1, "#4f46e5", 0]]);
  drift(a2, [C[0] + ax, C[1] - ay], [C[0] + ax * 0.5, C[1] - ay * 0.2], 112);
  fadeIn(a2, 0.2, 2.0);

  // ---------- rays: faint spokes around the logo ----------
  var rays = layer("Rays");
  var rg = group(contents(rays), "Spoke");
  pathOf(rg, [[0, -1.6 * h], [0, -4.6 * h]], false);
  stroke(rg, PALE, 2 * u, 2);
  var rr = vecs(contents(rays)).addProperty("ADBE Vector Filter - Repeater");
  rr.property("ADBE Vector Repeater Copies").setValue(36);
  rr.property("ADBE Vector Repeater Transform").property("ADBE Vector Position").setValue([0, 0]);
  rr.property("ADBE Vector Repeater Transform").property("ADBE Vector Rotation").setValue(10);
  spin(T(rays, "ADBE Rotate Z"), 10);
  fadeIn(rays, 1.0, 2.6, 7);

  // ---------- glow behind the logo, swells on each beat ----------
  var glow = blob("Logo Glow", C, 1.5 * h, [[0, "#7c3aed", 0.75], [0.5, "#7c3aed", 0.25], [1, "#7c3aed", 0]]);
  var gk = [[0, 0], [IMPACT, 30], [IMPACT + 0.25, 85], [L0 - 0.5, 60]];
  for (var b = 0; b < BEATS.length; b++) gk.push([BEATS[b], 60], [BEATS[b] + 0.15, 100], [BEATS[b] + 1.6, 60]);
  gk.push([L1, 60]);
  anim(T(glow, "ADBE Opacity"), gk, [33, 33]);

  // ---------- orbit rings ----------
  // ring(name, radius, width, colour, opacity, dash count (0 = solid), dash fraction, deg per loop, draw-on start)
  function ring(name, r, w, color, op, n, frac, deg, t0) {
    var l = layer(name);
    var g = group(contents(l), "Ring");
    ellipse(g, [r * 2, r * 2]);
    var s = stroke(g, color, w, 2);
    if (n) { var per = 2 * Math.PI * r / n; dashes(s, per * frac, per * (1 - frac)); }
    var t = trim(g);
    anim(t.property("ADBE Vector Trim End"), [[t0, 0], [t0 + 1.4, 100]], [[33, 70], [85, 33]]);
    spin(T(l, "ADBE Rotate Z"), deg);
    fadeIn(l, t0, t0 + 0.4, op);
    return l;
  }
  ring("Ring Dots", 1.35 * h, 4 * u, PALE, 55, 90, 0.02, -8, 0.2);           // dotted, period 4 deg
  ring("Ring Dash", 1.72 * h, 3 * u, LILAC, 40, 24, 0.55, 30, 0.35);          // period 15 deg
  var sat = ring("Ring Orbit", 2.25 * h, 2 * u, LILAC, 45, 0, 0, -60, 0.5);  // 6 satellites, period 60 deg
  for (var i = 0; i < 6; i++) {
    var ang = i * Math.PI / 3, big = i % 3 === 0;
    var d = group(contents(sat), "Satellite " + (i + 1));
    var e = ellipse(d, [(big ? 16 : 9) * u, (big ? 16 : 9) * u]);
    var sp = [Math.sin(ang) * 2.25 * h, -Math.cos(ang) * 2.25 * h];
    e.property("ADBE Vector Ellipse Position").setValue(sp);
    fill(d, big ? WHITE : PALE);
    pivot(d, sp);
    pop(d, 1.2 + i * 0.08, 0.4, 150);
  }
  ring("Ring Outer", 3.0 * h, 1.5 * u, PALE, 22, 0, 0, 0, 0.65);
  // tick marks on the outer ring, period 3 deg
  var ticks = layer("Ring Ticks");
  var tg = group(contents(ticks), "Tick");
  pathOf(tg, [[0, -3.0 * h], [0, -3.0 * h - 14 * u]], false);
  stroke(tg, PALE, 2 * u, 1);
  var tr = vecs(contents(ticks)).addProperty("ADBE Vector Filter - Repeater");
  tr.property("ADBE Vector Repeater Copies").setValue(120);
  tr.property("ADBE Vector Repeater Transform").property("ADBE Vector Position").setValue([0, 0]);
  tr.property("ADBE Vector Repeater Transform").property("ADBE Vector Rotation").setValue(3);
  spin(T(ticks, "ADBE Rotate Z"), 6);
  fadeIn(ticks, 0.9, 1.8, 30);

  // ---------- shockwaves: one at the impact, one per beat ----------
  function shock(name, t0, from, to, w, color, peak) {
    var l = layer(name);
    var g = group(contents(l), "Wave");
    var e = ellipse(g, [from, from]);
    anim(e.property("ADBE Vector Ellipse Size"), [[t0, [from, from]], [t0 + 1.6, [to, to]]], [[33, 90], [70, 33]]);
    var s = stroke(g, color, w);
    anim(s.property("ADBE Vector Stroke Width"), [[t0, w], [t0 + 1.6, 0]], [[33, 85], [70, 33]]);
    anim(T(l, "ADBE Opacity"), [[t0 - 1 / FPS, 0], [t0, peak], [t0 + 1.6, 0]], [[33, 33], [33, 60], [60, 33]]);
  }
  shock("Impact Wave", IMPACT, 2.0 * h, 6.5 * h, 46 * u, VIOLET, 100);
  for (b = 0; b < BEATS.length; b++) {
    // the loop restarts on the first beat: its opacity is 0 at L0 and back to 0 well before L1
    shock("Beat Wave " + (b + 1), BEATS[b] + 1 / FPS, 1.9 * h, 5.2 * h, 14 * u, LILAC, 70);
  }

  // impact rays
  var burst = layer("Impact Rays");
  var bl = group(contents(burst), "Ray");
  pathOf(bl, [[0, -1.25 * h], [0, -2.3 * h]], false);
  stroke(bl, LILAC, 18 * u, 2);
  var bt = trim(bl);
  anim(bt.property("ADBE Vector Trim End"), [[IMPACT, 0], [IMPACT + 0.35, 100]], [[33, 90], [80, 33]]);
  anim(bt.property("ADBE Vector Trim Start"), [[IMPACT + 0.08, 0], [IMPACT + 0.55, 100]], [[33, 80], [80, 33]]);
  var brp = vecs(contents(burst)).addProperty("ADBE Vector Filter - Repeater");
  brp.property("ADBE Vector Repeater Copies").setValue(12);
  brp.property("ADBE Vector Repeater Transform").property("ADBE Vector Rotation").setValue(30);
  brp.property("ADBE Vector Repeater Transform").property("ADBE Vector Position").setValue([0, 0]);
  anim(T(burst, "ADBE Rotate Z"), [[IMPACT, -8], [IMPACT + 0.6, 6]], [[33, 70], [70, 33]]);

  // ---------- the logo (SVG units, 2000 x 2000, centred) under a control null ----------
  var ctrl = comp.layers.addNull();
  ctrl.name = "LOGO CTRL";
  T(ctrl, "ADBE Anchor Point").setValue([0, 0]);
  T(ctrl, "ADBE Position").setValue(C);
  var FRAME = [1812, 1815], ROUND = 125, FW = 186;

  var lead = layer("Frame Lead", [0, 0]);
  var lg = group(contents(lead), "Frame");
  rect(lg, FRAME, [0, 0], ROUND);
  stroke(lg, VIOLET, FW);
  var lt = trim(lg);
  anim(lt.property("ADBE Vector Trim End"), [[0.2, 0], [1.1, 100]], [[33, 85], [90, 33]]);
  anim(lt.property("ADBE Vector Trim Offset"), [[0.2, -120], [1.25, 0]], [[33, 80], [90, 33]]);

  var frame = layer("Frame", [0, 0]);
  var fg = group(contents(frame), "Frame");
  rect(fg, FRAME, [0, 0], ROUND);
  stroke(fg, WHITE, FW);
  var ft = trim(fg);
  anim(ft.property("ADBE Vector Trim End"), [[0.32, 0], [1.25, 100]], [[33, 80], [90, 33]]);
  anim(ft.property("ADBE Vector Trim Offset"), [[0.32, -120], [1.25, 0]], [[33, 80], [90, 33]]);

  // a highlight laps the frame on every beat; its offset keeps climbing by 360 a lap (same look)
  var lap = layer("Frame Lap Light", [0, 0]);
  var lpg = group(contents(lap), "Lap");
  rect(lpg, FRAME, [0, 0], ROUND);
  stroke(lpg, PALE, FW * 0.55, 2);
  var lpt = trim(lpg);
  var lte = [[0, 0]], lto = [[0, 0]];
  for (b = 0; b < BEATS.length; b++) {
    var tb = BEATS[b];
    lte.push([tb, 0], [tb + 0.3, 16], [tb + 1.0, 16], [tb + 1.35, 0]);
    lto.push([tb, b * 360], [tb + 1.35, (b + 1) * 360]);
  }
  lte.push([L1, 0]);
  lto.push([L1, BEATS.length * 360]);
  anim(lpt.property("ADBE Vector Trim End"), lte, [33, 33]);
  anim(lpt.property("ADBE Vector Trim Offset"), lto, [33, 45]);

  var stem = layer("k Stem", [0, 0]);
  var sg = group(contents(stem), "Stem");
  rect(sg, [283, 1364], [-232.77, 136.14]);
  fill(sg, WHITE);
  pivot(sg, [-232.77, 818.14]);
  anim(xf(sg).property("ADBE Vector Scale"),
    [[0.85, [100, 0]], [1.2, [100, 108]], [1.38, [100, 97]], [1.52, [100, 100]]],
    [[33, 85], [50, 50], [50, 50], [50, 33]]);

  var chev = layer("k Chevron", [0, 0]);
  var cg = group(contents(chev), "Chevron");
  pathOf(cg, [[47.54, -177.86], [-81.13, 167.8], [95.98, 818.14], [409.31, 818.14], [203.45, 184.78], [341.95, -177.86]]);
  fill(cg, WHITE);
  pivot(cg, [-81.13, 167.8]);
  anim(xf(cg).property("ADBE Vector Position"),
    [[1.15, [1300, 167.8]], [IMPACT, [-121.13, 167.8]], [IMPACT + 0.12, [-71.13, 167.8]], [IMPACT + 0.25, [-81.13, 167.8]]],
    [[33, 20], [50, 50], [50, 50], [50, 33]]);
  anim(xf(cg).property("ADBE Vector Rotation"), [[1.15, 35], [IMPACT, -6], [IMPACT + 0.25, 0]], [[33, 20], [50, 50], [60, 33]]);
  anim(xf(cg).property("ADBE Vector Group Opacity"), [[1.15, 0], [1.25, 100]], [[33, 33], [33, 33]]);

  var parts = [lead, frame, lap, stem, chev];
  for (i = 0; i < parts.length; i++) parts[i].setParentWithJump(ctrl);

  // logo scale: pop in, squash on impact, thump on every beat
  function sc(k) { return [S * k, S * k]; }
  var sk = [[0, sc(0.86)], [1.1, sc(1)], [IMPACT, sc(1)], [IMPACT + 0.07, sc(0.93)], [IMPACT + 0.22, sc(1.04)], [IMPACT + 0.42, sc(1)]];
  for (b = 0; b < BEATS.length; b++) {
    tb = BEATS[b];
    sk.push([tb, sc(1)], [tb + 0.08, sc(0.965)], [tb + 0.24, sc(1.025)], [tb + 0.5, sc(1)]);
  }
  sk.push([L1, sc(1)]);
  anim(T(ctrl, "ADBE Scale"), sk, [33, 33]);

  // ---------- wordmark ----------
  function word(name, color) {
    var l = comp.layers.addText("khume");
    l.name = name;
    var p = l.property("ADBE Text Properties").property("ADBE Text Document");
    var td = p.value;
    td.font = "Inter-Bold";
    td.fontSize = opts.wordSize;
    td.fillColor = color;
    td.applyFill = true;
    td.tracking = -20;
    td.justification = ParagraphJustification.LEFT_JUSTIFY;
    p.setValue(td);
    return l;
  }
  var wm = word("Wordmark", WHITE);
  var r = wm.sourceRectAtTime(0, false);
  var WP = [C[0], C[1] + h * 1.0 + opts.wordGap + r.height / 2];   // centre of the wordmark
  var W0 = 2.25, W1 = 3.1;
  T(wm, "ADBE Anchor Point").setValue([r.left + r.width / 2, r.top + r.height / 2]);
  anim(T(wm, "ADBE Position"), [[W0, [WP[0], WP[1] + 50 * u]], [W1, WP]], [[33, 85], [85, 33]]);
  var PAD = 60 * u;
  var wmm = layer("Wordmark Matte", [WP[0] - r.width / 2 - PAD, WP[1]]);
  var wmg = group(contents(wmm), "Wipe");
  rect(wmg, [r.width + PAD * 2, r.height + PAD * 3], [(r.width + PAD * 2) / 2, 0]);
  fill(wmg, WHITE);
  anim(xf(wmg).property("ADBE Vector Scale"), [[W0, [0, 100]], [W1 + 0.1, [100, 100]]], [[33, 80], [80, 33]]);
  wmm.moveBefore(wm);
  wm.setTrackMatte(wmm, TrackMatteType.ALPHA);

  var acc = layer("Wordmark Accent", [WP[0], WP[1] + r.height / 2 + 34 * u]);
  var ag = group(contents(acc), "Bar");
  rect(ag, [r.width * 0.32, 8 * u], [0, 0], 4 * u);
  fill(ag, VIOLET);
  anim(xf(ag).property("ADBE Vector Scale"), [[W1, [0, 100]], [W1 + 0.6, [100, 100]]], [[33, 85], [85, 33]]);

  // sheen: a pale copy of the wordmark seen through a slanted bar that sweeps across once a loop
  var sh = word("Wordmark Sheen", PALE);
  T(sh, "ADBE Anchor Point").setValue([r.left + r.width / 2, r.top + r.height / 2]);
  T(sh, "ADBE Position").setValue(WP);
  var SW0 = L0 + LOOP / 2 - 1.6, SW1 = SW0 + 0.9;
  var left = [WP[0] - r.width / 2 - 120 * u, WP[1]], right = [WP[0] + r.width / 2 + 120 * u, WP[1]];
  var shm = layer("Sheen Matte", left);
  var shg = group(contents(shm), "Bar");
  rect(shg, [60 * u, r.height * 2.2]);
  fill(shg, WHITE);
  xf(shg).property("ADBE Vector Rotation").setValue(18);
  var shp = T(shm, "ADBE Position");
  anim(shp, [[SW0, left], [SW1, right]], [[33, 60], [60, 33]]);
  shp.setValueAtTime(SW1 + 0.2, left);           // back to the start while it is off the text
  shp.setInterpolationTypeAtKey(2, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
  shm.moveBefore(sh);
  sh.setTrackMatte(shm, TrackMatteType.ALPHA);

  return comp.name + " (" + comp.numLayers + " layers)";
}

var built = [
  // the bottom ~30% stays clear for the page's tagline and buttons
  build({ name: "Khume Hero Wide", w: 1920, h: 1080, wide: true, center: [960, 400], scale: 21, wordSize: 130, wordGap: 60 }),
  build({ name: "Khume Hero Tall", w: 1080, h: 1920, wide: false, center: [540, 700], scale: 30, wordSize: 170, wordGap: 70 })
];
"built " + built.join(", ");
