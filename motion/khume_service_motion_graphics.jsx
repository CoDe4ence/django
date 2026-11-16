// Motion Graphics: "your brand, in motion" — a showcase, not the tools. A widescreen player and a
// phone play finished work for made-up client brands; the loop cycles three spots, each a different
// kind of motion work, joined by a two-colour wipe:
//   1. Logo reveal   "nova coffee roasters": dots burst into a ring, a star mark spins in, the name wipes on
//   2. Social ad     "SUMMER SALE": colour blooms, type slams in, a -30% badge pops, a Shop now button
//   3. Explainer     a parcel drops, travels a dashed route to a map pin, "Delivered in 24h" is ticked
// Chips under the screens name the spot that is playing. The intro raises the screens with a play button.
//
// The screens are their own comps ("... Screen 16x9" 1280x720, "... Screen 9x16" 400x860) placed as
// layers, so their content is cropped to the screen. Wide shows both screens, Tall the phone only.
// Build: motion/build_services.sh motion-graphics   (BRIDGE=9877 to build in the live app)

#include "scene_kit.jsx"

// three spots need time to be read: this scene's loop is 10.5s (3.5s a spot), not the kit's 8s
LOOP = 10.5;
L1 = L0 + LOOP;

var PINK = hex("#f472b6"), AMBER = hex("#fbbf24"), INK = hex("#1c1917"), SKY = hex("#0ea5e9");
var CREAM = hex("#fde68a"), KRAFT = hex("#f59e0b"), TAPE = hex("#b45309"), NAVY = hex("#1e1b4b");
var BEZEL = hex("#0f0c1a"), BEZEL_LINE = hex("#3f3a56"), DIM = hex("#2a2540");

// spot boundaries inside the loop; the wipe covers the screen at each one
var CUTS = [0, 3.5, 7.0, LOOP];
var SPOTS = ["Logo reveals", "Social ads", "Explainer videos"];

function holdKeys(prop, keys) {
  for (var i = 0; i < keys.length; i++) prop.setValueAtTime(keys[i][0], keys[i][1]);
  for (i = 1; i <= prop.numKeys; i++) prop.setInterpolationTypeAtKey(i, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
}
// shown only between two loop times (switches happen under the wipe)
function during(l, from, to) {
  var keys = [[0, 0]];
  if (from > 0) keys.push([A(from), 100]); else keys[0] = [0, 0], keys.push([L0, 100]);
  if (to < LOOP) keys.push([A(to), 0]);
  holdKeys(T(l, "ADBE Opacity"), keys);
}
function quad(p0, pc, p1, u) {
  var a = 1 - u;
  return [a * a * p0[0] + 2 * a * u * pc[0] + u * u * p1[0], a * a * p0[1] + 2 * a * u * pc[1] + u * u * p1[1]];
}
function easeIO(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

// ======================= a screen: the three spots, the wipes and the idle intro =======================
function buildScreen(name, W, H) {
  var comp = sceneComp(name, W, H), k = sceneKit(comp), P = H > W, m = Math.min(W, H), i;
  // each spot is a comp of its own (same timing), placed in the screen and switched on in its turn
  var spotNames = ["Logo", "Ad", "Explainer"], spotComps = [], kits = [];
  for (i = 0; i < 3; i++) {
    spotComps.push(sceneComp(name + " " + spotNames[i], W, H));
    kits.push(sceneKit(spotComps[i]));
  }
  var kA = kits[0], kB = kits[1], kC = kits[2];
  function inSpot(n, l) { return l; }
  function bgRect(nm, color, kit) {
    var b = (kit || k).piece(nm);
    rect(b[1], [W + 4, H + 4], [W / 2, H / 2]);
    fill(b[1], color);
    return b[0];
  }

  // ---------- idle (intro): a play button that pulses ----------
  var idle = bgRect("Idle", hex("#130f22"));
  holdKeys(T(idle, "ADBE Opacity"), [[0, 100], [L0, 0]]);
  var C = [W / 2, H / 2], pr = m * 0.11;
  var play = k.piece("Play Button");
  ellipse(play[1], [pr * 2, pr * 2]).property("ADBE Vector Ellipse Position").setValue(C);
  fill(play[1], WHITE, 16);
  var tri = group(contents(play[0]), "Triangle");
  pathOf(tri, [[C[0] - pr * 0.3, C[1] - pr * 0.42], [C[0] + pr * 0.45, C[1]], [C[0] - pr * 0.3, C[1] + pr * 0.42]]);
  fill(tri, WHITE);
  pivot(play[1], C);
  pop(play[1], 1.1, 0.45, 118);
  pivot(tri, C);
  pop(tri, 1.2, 0.45, 118);
  holdKeys(T(play[0], "ADBE Opacity"), [[0, 100], [L0, 0]]);
  for (i = 0; i < 2; i++) {
    var pulse = k.piece("Play Pulse " + (i + 1));
    var pe = ellipse(pulse[1], [pr * 2, pr * 2]);
    pe.property("ADBE Vector Ellipse Position").setValue(C);
    stroke(pulse[1], WHITE, 3);
    pivot(pulse[1], C);
    var t0 = 1.9 + i * 0.8;
    anim(xf(pulse[1]).property("ADBE Vector Scale"), [[t0, [100, 100]], [t0 + 0.9, [190, 190]]], [[33, 80], [80, 33]]);
    anim(T(pulse[0], "ADBE Opacity"), [[t0 - 0.01, 0], [t0, 60], [t0 + 0.9, 0]], [33, 33]);
  }

  // ---------- 1. logo reveal: nova coffee roasters ----------
  var s0 = A(CUTS[0]) + 0.15;
  bgRect("Nova Background", NAVY, kA);
  inSpot(0, kA.blob("Nova Glow", [W / 2, H / 2], m * 0.75, [[0, "#7c3aed", 0.55], [0.6, "#7c3aed", 0.12], [1, "#7c3aed", 0]]));
  var MC = P ? [W / 2, H * 0.4] : [W / 2 - m * 0.3, H / 2], MR = m * 0.2;
  for (i = 0; i < 12; i++) {
    var ang = i * Math.PI / 6, dir = [Math.cos(ang), Math.sin(ang)];
    var dot = inSpot(0, kA.layer("Nova Spark " + (i + 1), MC));
    var dg = group(contents(dot), "Dot");
    ellipse(dg, [m * 0.028, m * 0.028]);
    fill(dg, i % 2 ? PINK : CREAM);
    anim(T(dot, "ADBE Position"), [[s0 + 0.1, MC], [s0 + 0.55, [MC[0] + dir[0] * m * 0.42, MC[1] + dir[1] * m * 0.42]],
      [s0 + 0.95, [MC[0] + dir[0] * MR, MC[1] + dir[1] * MR]]], [[33, 85], [70, 70], [85, 33]]);
    anim(T(dot, "ADBE Opacity"), [[s0 + 0.1, 0], [s0 + 0.15, 100], [s0 + 0.95, 100], [s0 + 1.15, 0]], [33, 33]);
  }
  var ring = kA.piece("Nova Ring");
  inSpot(0, ring[0]);
  ellipse(ring[1], [MR * 2, MR * 2]).property("ADBE Vector Ellipse Position").setValue(MC);
  stroke(ring[1], CREAM, m * 0.016, 2);
  drawOn(ring[1], s0 + 0.85, s0 + 1.35);
  var mark = kA.piece("Nova Mark");
  inSpot(0, mark[0]);
  star(mark[1], 4, MR * 0.62, MR * 0.18, MC);
  fill(mark[1], CREAM);
  pivot(mark[1], MC);
  pop(mark[1], s0 + 1.1, 0.45, 125);
  anim(xf(mark[1]).property("ADBE Vector Rotation"), [[s0 + 1.1, -120], [s0 + 1.6, 0]], [[33, 85], [85, 33]]);
  var wsz = P ? m * 0.24 : m * 0.24;
  var word = inSpot(0, kA.text("nova", wsz, [0, 0], WHITE, "Bold", P ? ParagraphJustification.CENTER_JUSTIFY : ParagraphJustification.LEFT_JUSTIFY));
  var wr = word.sourceRectAtTime(0, false);
  var wpos = P ? [W / 2, H * 0.4 + MR + wsz * 1.05] : [W / 2 - m * 0.04, H / 2 + wsz * 0.3];
  T(word, "ADBE Position").setValue(wpos);
  var tag = inSpot(0, kA.text("COFFEE ROASTERS", m * 0.042, [wpos[0] + (P ? 0 : 4), wpos[1] + m * 0.1], CREAM, "SemiBold",
    P ? ParagraphJustification.CENTER_JUSTIFY : ParagraphJustification.LEFT_JUSTIFY));
  var tdp = tag.property("ADBE Text Properties").property("ADBE Text Document"), td = tdp.value;
  td.tracking = 260;
  tdp.setValue(td);
  kA.rise(tag, s0 + 1.55, 14);
  // the name wipes on left to right
  var wm = inSpot(0, kA.layer("Nova Word Matte", [wpos[0] + wr.left - 20, wpos[1] + wr.top + wr.height / 2]));
  var wmg = group(contents(wm), "Wipe");
  rect(wmg, [wr.width + 40, wr.height + 40], [(wr.width + 40) / 2, 0]);
  fill(wmg, WHITE);
  anim(xf(wmg).property("ADBE Vector Scale"), [[s0 + 1.3, [0, 100]], [s0 + 1.75, [100, 100]]], [[33, 85], [85, 33]]);
  wm.moveBefore(word);
  word.setTrackMatte(wm, TrackMatteType.ALPHA);

  // ---------- 2. social ad: SUMMER SALE ----------
  var s1 = A(CUTS[1]) + 0.15;
  bgRect("Sale Background", AMBER, kB);
  var bloom = kB.piece("Sale Bloom Pink");
  inSpot(1, bloom[0]);
  ellipse(bloom[1], [H * 1.5, H * 1.5]).property("ADBE Vector Ellipse Position").setValue([W, H]);
  fill(bloom[1], PINK);
  pivot(bloom[1], [W, H]);
  anim(xf(bloom[1]).property("ADBE Vector Scale"), [[s1 + 0.1, [0, 0]], [s1 + 0.6, [100, 100]]], [[33, 90], [80, 33]]);
  var bloom2 = kB.piece("Sale Bloom Violet");
  inSpot(1, bloom2[0]);
  ellipse(bloom2[1], [m * 0.8, m * 0.8]).property("ADBE Vector Ellipse Position").setValue([0, 0]);
  fill(bloom2[1], VIOLET);
  pivot(bloom2[1], [0, 0]);
  anim(xf(bloom2[1]).property("ADBE Vector Scale"), [[s1 + 0.2, [0, 0]], [s1 + 0.7, [100, 100]]], [[33, 90], [80, 33]]);
  var tsz = P ? W * 0.21 : m * 0.21;
  var just = P ? ParagraphJustification.CENTER_JUSTIFY : ParagraphJustification.LEFT_JUSTIFY;
  var tx = P ? W / 2 : W * 0.085;
  var l1 = P ? H * 0.34 : H * 0.44, l2 = l1 + tsz * 0.98;
  var summer = inSpot(1, kB.text("SUMMER", tsz, [tx, l1], INK, "Bold", just));
  var sale = inSpot(1, kB.text("SALE", tsz, [tx, l2], hex("#6d28d9"), "Bold", just));
  anim(T(summer, "ADBE Position"), [[s1 + 0.3, [tx - W * 1.1, l1]], [s1 + 0.62, [tx + 12, l1]], [s1 + 0.8, [tx, l1]]], [[33, 90], [50, 50], [50, 33]]);
  anim(T(sale, "ADBE Position"), [[s1 + 0.42, [tx + W * 1.1, l2]], [s1 + 0.74, [tx - 12, l2]], [s1 + 0.92, [tx, l2]]], [[33, 90], [50, 50], [50, 33]]);
  var BC = P ? [W * 0.72, H * 0.6] : [W * 0.74, H * 0.42], BR = P ? W * 0.17 : m * 0.17;
  var badge = kB.piece("Sale Badge");
  inSpot(1, badge[0]);
  star(badge[1], 14, BR, BR * 0.88, BC);
  fill(badge[1], WHITE);
  pivot(badge[1], BC);
  pop(badge[1], s1 + 0.95, 0.4, 130);
  var off = inSpot(1, kB.text("−30%", BR * 0.62, [BC[0], BC[1] + BR * 0.22], INK, "Bold", ParagraphJustification.CENTER_JUSTIFY));
  T(off, "ADBE Anchor Point").setValue([0, -BR * 0.22]);
  T(off, "ADBE Position").setValue(BC);
  anim(T(off, "ADBE Scale"), [[s1 + 1.0, [0, 0]], [s1 + 1.25, [120, 120]], [s1 + 1.4, [100, 100]]], [[33, 80], [50, 50], [60, 33]]);
  anim(T(badge[0], "ADBE Rotate Z"), [[s1 + 1.4, 0], [s1 + 1.8, -8], [s1 + 2.2, 4], [s1 + 2.5, 0]], [33, 33]);
  T(badge[0], "ADBE Anchor Point").setValue(BC);
  T(badge[0], "ADBE Position").setValue(BC);
  anim(T(off, "ADBE Rotate Z"), [[s1 + 1.4, 0], [s1 + 1.8, -8], [s1 + 2.2, 4], [s1 + 2.5, 0]], [33, 33]);
  var CP = P ? [W / 2, H * 0.82] : [W * 0.085 + 150, l2 + tsz * 0.75], CW = P ? 230 : 300, CH = P ? 56 : 70;
  var cta = kB.piece("Sale Button");
  inSpot(1, cta[0]);
  rect(cta[1], [CW, CH], CP, CH / 2);
  fill(cta[1], INK);
  pivot(cta[1], CP);
  pop(cta[1], s1 + 1.3, 0.4, 112);
  kB.rise(inSpot(1, kB.text("Shop now  →", CH * 0.4, [CP[0], CP[1] + CH * 0.14], WHITE, "SemiBold", ParagraphJustification.CENTER_JUSTIFY)), s1 + 1.4, 10);

  // ---------- 3. explainer: delivered in 24h ----------
  var s2 = A(CUTS[2]) + 0.15;
  bgRect("Delivery Background", SKY, kC);
  inSpot(2, kC.blob("Delivery Glow", P ? [W / 2, H * 0.6] : [W * 0.6, H * 0.55], m * 0.7, [[0, "#ffffff", 0.22], [1, "#ffffff", 0]]));
  var P0 = P ? [W * 0.22, H * 0.84] : [W * 0.17, H * 0.74], PC = P ? [W * 1.05, H * 0.8] : [W * 0.45, H * 0.12],
      P1 = P ? [W * 0.62, H * 0.52] : [W * 0.8, H * 0.5];
  var route = [], NR = 40;
  for (i = 0; i <= NR; i++) route.push(quad(P0, PC, P1, i / NR));
  var rt = kC.piece("Route");
  inSpot(2, rt[0]);
  curve(rt[1], route);
  var rs = stroke(rt[1], WHITE, m * 0.012, 2);
  rs.property("ADBE Vector Stroke Opacity").setValue(75);
  var rd = rs.property("ADBE Vector Stroke Dashes");
  rd.addProperty("ADBE Vector Stroke Dash 1").setValue(m * 0.025);
  rd.addProperty("ADBE Vector Stroke Gap 1").setValue(m * 0.03);
  drawOn(rt[1], s2 + 0.25, s2 + 0.9);
  // map pin at the end of the route
  var pinR = m * 0.07, PH = [P1[0], P1[1] - pinR * 1.7];
  var pin = kC.piece("Pin");
  inSpot(2, pin[0]);
  ellipse(pin[1], [pinR * 2, pinR * 2]).property("ADBE Vector Ellipse Position").setValue(PH);
  pathOf(pin[1], [[PH[0] - pinR * 0.86, PH[1] + pinR * 0.5], [P1[0], P1[1]], [PH[0] + pinR * 0.86, PH[1] + pinR * 0.5]]);
  fill(pin[1], WHITE);
  var pinHole = kC.layer("Pin Hole");   // its own layer, above the pin
  var hole = group(contents(pinHole), "Hole");
  ellipse(hole, [pinR * 0.8, pinR * 0.8]).property("ADBE Vector Ellipse Position").setValue(PH);
  fill(hole, SKY);
  pivot(pin[1], P1);
  pivot(hole, P1);
  anim(xf(pin[1]).property("ADBE Vector Scale"), [[s2 + 0.8, [0, 0]], [s2 + 1.05, [110, 125]], [s2 + 1.25, [100, 100]],
    [s2 + 1.95, [100, 100]], [s2 + 2.05, [115, 85]], [s2 + 2.25, [100, 100]]], [33, 33]);
  anim(xf(hole).property("ADBE Vector Scale"), [[s2 + 0.8, [0, 0]], [s2 + 1.05, [110, 125]], [s2 + 1.25, [100, 100]],
    [s2 + 1.95, [100, 100]], [s2 + 2.05, [115, 85]], [s2 + 2.25, [100, 100]]], [33, 33]);
  // the parcel: drops in, rides the route, pops into the pin
  var ps = m * 0.12, parcel = inSpot(2, kC.layer("Parcel", P0));
  // (in a shape layer the first group draws on top: tape before box)
  var tape = group(contents(parcel), "Tape");
  rect(tape, [ps * 0.17, ps], [0, -ps / 2]);
  fill(tape, TAPE);
  var box = group(contents(parcel), "Box");
  rect(box, [ps, ps], [0, -ps / 2], ps * 0.14);
  fill(box, KRAFT);
  var pk = [[s2 + 0.15, [P0[0], P0[1] - H * 0.6]], [s2 + 0.45, P0], [s2 + 0.8, P0]];
  for (i = 1; i <= 14; i++) pk.push([s2 + 0.8 + i * (1.0 / 14), quad(P0, PC, P1, easeIO(i / 14))]);
  anim(T(parcel, "ADBE Position"), pk, [50, 50]);
  anim(T(parcel, "ADBE Scale"), [[s2 + 0.45, [100, 100]], [s2 + 0.52, [120, 80]], [s2 + 0.68, [100, 100]],
    [s2 + 1.8, [100, 100]], [s2 + 1.98, [0, 0]]], [33, 33]);
  anim(T(parcel, "ADBE Rotate Z"), [[s2 + 0.8, 0], [s2 + 1.1, -10], [s2 + 1.45, 8], [s2 + 1.8, 0]], [33, 33]);
  // tick
  var TC = [P1[0] + pinR * 2.1, PH[1] - pinR * 1.1], tr = pinR * 0.95;
  var tick = kC.piece("Tick Badge");
  inSpot(2, tick[0]);
  ellipse(tick[1], [tr * 2, tr * 2]).property("ADBE Vector Ellipse Position").setValue(TC);
  fill(tick[1], hex("#22c55e"));
  pivot(tick[1], TC);
  pop(tick[1], s2 + 2.0, 0.35, 130);
  var ck = kC.piece("Tick");
  inSpot(2, ck[0]);
  curve(ck[1], [[TC[0] - tr * 0.45, TC[1] + tr * 0.02], [TC[0] - tr * 0.1, TC[1] + tr * 0.36], [TC[0] + tr * 0.48, TC[1] - tr * 0.32]]);
  var cks = stroke(ck[1], WHITE, tr * 0.24, 2);
  cks.property("ADBE Vector Stroke Line Join").setValue(2);
  drawOn(ck[1], s2 + 2.1, s2 + 2.35);
  var head = inSpot(2, kC.text(P ? "Delivered\rin 24h" : "Delivered in 24h", P ? W * 0.12 : m * 0.09,
    P ? [W / 2, H * 0.17] : [W * 0.085, H * 0.24], WHITE, "Bold", P ? ParagraphJustification.CENTER_JUSTIFY : ParagraphJustification.LEFT_JUSTIFY));
  kC.rise(head, s2 + 0.4, 18);
  var sub = inSpot(2, kC.text("Tracked from our door to yours", P ? W * 0.05 : m * 0.035,
    P ? [W / 2, H * 0.17 + W * 0.26] : [W * 0.085 + 3, H * 0.24 + m * 0.07], WHITE, "SemiBold", P ? ParagraphJustification.CENTER_JUSTIFY : ParagraphJustification.LEFT_JUSTIFY));
  kC.rise(sub, s2 + 0.6, 12);

  for (var n = 0; n < 3; n++) {
    var sl = comp.layers.add(spotComps[n]);
    sl.name = "Spot " + spotNames[n];
    during(sl, CUTS[n], CUTS[n + 1]);
  }

  // ---------- wipes: pink then violet sweep across at every cut ----------
  function wipe(nm, color, din, dout) {
    var l = k.piece(nm), r = rect(l[1], [0, H + 4], [-24, H / 2]);
    fill(l[1], color);
    var size = [], pos = [];
    function edges(t, a, b) { size.push([t, [b - a, H + 4]]); pos.push([t, [(a + b) / 2, H / 2]]); }
    for (var c = 0; c < CUTS.length; c++) {
      var s = A(CUTS[c]);
      // parked just off screen (cropped) when idle: a zero-width rect at the edge still draws a hairline
      var e = 24;
      edges(s - 0.38 + din, -e, -e);      // sweeps in from the left ...
      edges(s - 0.08 + din, -e, W + e);
      // ... and, except at the loop's end, out to the right, then goes back to its parking spot unseen
      if (c < CUTS.length - 1) { edges(s + dout, -e, W + e); edges(s + 0.3 + dout, W + e, W + e); edges(s + 0.32 + dout, -e, -e); }
    }
    anim(r.property("ADBE Vector Rect Size"), size, [45, 70]);
    anim(r.property("ADBE Vector Rect Position"), pos, [45, 70]);
  }
  wipe("Wipe Pink", PINK, 0, 0.08);
  wipe("Wipe Violet", VIOLET, 0.08, 0);
  return comp;
}

// ======================= the scene: screens in their frames, chips naming the spot =======================
function build(o, screens) {
  var comp = sceneComp(o.name, o.w, o.h), k = sceneKit(comp), i;
  k.background({
    grid: 0, c1: "#db2777", c2: "#7c3aed",
    a1: [[o.w * 0.18, o.h * 0.72], 760, [o.w * 0.3, o.h * 0.6]],
    a2: [[o.w * 0.86, o.h * 0.22], 720, [o.w * 0.74, o.h * 0.32]]
  });
  function device(nm, sc, c, scale, padX, padY, round, t0) {
    var sw = sc.width * scale / 100, sh = sc.height * scale / 100;
    var glow = k.blob(nm + " Glow", c, Math.max(sw, sh) * 0.75, [[0, "#7c3aed", 0.35], [0.6, "#7c3aed", 0.08], [1, "#7c3aed", 0]]);
    k.fade(glow, t0 + 0.2, t0 + 1.2);
    var bz = k.piece(nm + " Bezel");
    rect(bz[1], [sw + padX * 2, sh + padY * 2], c, round);
    fill(bz[1], BEZEL);
    stroke(bz[1], BEZEL_LINE, 3);
    var sl = comp.layers.add(sc);
    sl.name = nm + " Screen";
    T(sl, "ADBE Position").setValue(c);
    T(sl, "ADBE Scale").setValue([scale, scale]);
    var parts = [bz[0], sl];
    if (o.notch && sh > sw) {
      var nt = k.piece(nm + " Notch");
      rect(nt[1], [sw * 0.28, 18], [c[0], c[1] - sh / 2 + 18], 9);
      fill(nt[1], BEZEL);
      parts.push(nt[0]);
    }
    for (var p = 0; p < parts.length; p++) {
      var pp = T(parts[p], "ADBE Position"), v = pp.value;
      anim(pp, [[t0, [v[0], v[1] + 70]], [t0 + 0.7, v]], [[33, 85], [85, 33]]);
      anim(T(parts[p], "ADBE Opacity"), [[t0, 0], [t0 + 0.4, 100]], [33, 33]);
    }
    return [sw, sh];
  }
  var dims = null;
  if (o.player) {
    dims = device("Player", screens.wide, o.player, o.playerScale, 12, 12, 22, 0.1);
    // progress bar: runs through the loop
    var bx0 = o.player[0] - dims[0] / 2, by = o.player[1] + dims[1] / 2 + 34;
    var trk = k.piece("Progress Track");
    rect(trk[1], [dims[0], 6], [o.player[0], by], 3);
    fill(trk[1], DIM);
    var pf = k.piece("Progress");
    rect(pf[1], [dims[0], 6], [o.player[0], by], 3);
    fill(pf[1], PINK);
    pivot(pf[1], [bx0, by]);
    lin(xf(pf[1]).property("ADBE Vector Scale"), [[L0, [0, 100]], [L1, [100, 100]]]);
    xf(pf[1]).property("ADBE Vector Scale").setValueAtTime(0, [0, 100]);
    k.fade(trk[0], 1.0, 1.4);
    k.fade(pf[0], 1.0, 1.4);
  }
  device("Phone", screens.tall, o.phone, o.phoneScale, o.phonePad, o.phonePad + 6, o.phoneRound, o.player ? 0.4 : 0.1);

  // chips naming the spot on screen
  var sizes = [], total = 0, gap = 14;
  for (i = 0; i < SPOTS.length; i++) { sizes.push(SPOTS[i].length * o.chipSize * 0.56 + 44); total += sizes[i]; }
  total += gap * (SPOTS.length - 1);
  var x = o.chips[0] - total / 2;
  for (i = 0; i < SPOTS.length; i++) {
    var c = [x + sizes[i] / 2, o.chips[1]];
    var base = k.piece("Chip " + (i + 1));
    rect(base[1], [sizes[i], o.chipSize * 2.1], c, o.chipSize * 1.05);
    stroke(base[1], BEZEL_LINE, 2);
    fill(base[1], BEZEL, 70);
    k.rise(base[0], 1.4 + i * 0.1, 12);
    var on = k.piece("Chip " + (i + 1) + " On");
    rect(on[1], [sizes[i], o.chipSize * 2.1], c, o.chipSize * 1.05);
    fill(on[1], PINK, 22);
    stroke(on[1], PINK, 2);
    k.windows(T(on[0], "ADBE Opacity"), [[A(CUTS[i]), A(CUTS[i + 1])]], 0.15);
    var lb = k.text(SPOTS[i], o.chipSize, [c[0], c[1] + o.chipSize * 0.36], WHITE, "SemiBold", ParagraphJustification.CENTER_JUSTIFY);
    k.rise(lb, 1.45 + i * 0.1, 12);
    x += sizes[i] + gap;
  }
  return comp.name + " (" + comp.numLayers + " layers)";
}

var screens = {
  wide: buildScreen("Motion Graphics Screen 16x9", 1280, 720),
  tall: buildScreen("Motion Graphics Screen 9x16", 400, 860)
};
var built = [
  build({ name: "Motion Graphics Wide", w: 1920, h: 1080, player: [780, 370], playerScale: 68.75,
          phone: [1400, 384], phoneScale: 60, phonePad: 12, phoneRound: 40, notch: true,
          chips: [780, 712], chipSize: 19 }, screens),
  build({ name: "Motion Graphics Tall", w: 1080, h: 1920, phone: [540, 640], phoneScale: 105, phonePad: 16,
          phoneRound: 64, notch: true, chips: [540, 1168], chipSize: 21 }, screens)
];
"built " + built.join(", ");
