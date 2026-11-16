// Motion Graphics: a motion designer's workspace, in sync. A composition viewer plays a little
// piece (a shape runs a figure-eight motion path, squashing and stretching with its speed, turning
// along its direction, morphing and changing colour, with onion-skin ghosts), the graph editor
// draws its eased progress with a riding dot, and a timeline playhead sweeps over keyframes that
// flash as it passes. The word MOTION drops in, and waves once a loop.
//
// Build: motion/build_services.sh motion-graphics   (BRIDGE=9877 to build in the live app)
// Comps: "Motion Graphics Wide" 1920x1080, "Motion Graphics Tall" 1080x1920
// The bottom ~30% of each comp stays clear for the page's title and text.

#include "scene_kit.jsx"

var PINK = hex("#f472b6"), AMBER = hex("#fbbf24");
var PANEL_FILL = hex("#120e1f"), PANEL_LINE = hex("#3f3a56"), DIM = hex("#2a2540"), VIEW_BG = hex("#0b0816");

// ---------- the piece: progress p(t) over the loop (0..2, two eased laps of half the path) ----------
var GO1 = 0.2, END1 = 3.0, GO2 = 3.4, END2 = 6.2;
function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
function progress(t) {
  if (t <= GO1) return 0;
  if (t < END1) return ease((t - GO1) / (END1 - GO1));
  if (t <= GO2) return 1;
  if (t < END2) return 1 + ease((t - GO2) / (END2 - GO2));
  return 2;
}
// lemniscate of Bernoulli: theta = PI is the left tip, 2*PI the right tip, 3*PI the left tip again
function lemn(a, th) {
  var s = Math.sin(th), c = Math.cos(th), d = 1 + s * s;
  return [a * c / d, a * s * c / d];
}

function build(o) {
  var comp = sceneComp(o.name, o.w, o.h), k = sceneKit(comp), i, j;

  k.background({
    grid: 60, c1: "#db2777", c2: "#7c3aed",
    a1: [[o.w * 0.2, o.h * 0.75], 760, [o.w * 0.32, o.h * 0.62]],
    a2: [[o.w * 0.85, o.h * 0.2], 700, [o.w * 0.72, o.h * 0.3]]
  });

  // ---------- panels ----------
  function panel(name, r, title, t0) {
    var f = k.piece(name + " Fill");
    rect(f[1], [r[2], r[3]], [r[0] + r[2] / 2, r[1] + r[3] / 2], 16);
    fill(f[1], PANEL_FILL, 92);
    k.fade(f[0], t0 + 0.2, t0 + 0.7);
    var l = k.piece(name + " Frame");
    rect(l[1], [r[2], r[3]], [r[0] + r[2] / 2, r[1] + r[3] / 2], 16);
    stroke(l[1], PANEL_LINE, 3);
    drawOn(l[1], t0, t0 + 0.8);
    var sep = k.piece(name + " Header Line");
    pathOf(sep[1], [[r[0], r[1] + 38], [r[0] + r[2], r[1] + 38]], false);
    stroke(sep[1], PANEL_LINE, 2);
    drawOn(sep[1], t0 + 0.3, t0 + 0.8);
    k.rise(k.text(title, 17, [r[0] + 18, r[1] + 25], MUTED, "SemiBold"), t0 + 0.5, 10);
  }
  var C = o.canvas, G = o.graph, TL = o.timeline;
  panel("Composition", C, "Composition  ·  Khume Promo", 0.0);
  panel("Graph Editor", G, "Graph Editor  ·  Position", 0.12);
  panel("Timeline", TL, "Timeline", 0.24);
  k.rise(k.text("60 fps  ·  1920×1080", 15, [C[0] + C[2] - 18, C[1] + 25], MUTED, "Medium", ParagraphJustification.RIGHT_JUSTIFY), 0.7, 10);

  // ---------- composition viewer ----------
  var V = [C[0] + 16, C[1] + 52, C[2] - 32, C[3] - 68];          // x, y, w, h
  var VC = [V[0] + V[2] / 2, V[1] + V[3] / 2 - 14];
  var vbg = k.piece("Viewer");
  rect(vbg[1], [V[2], V[3]], [V[0] + V[2] / 2, V[1] + V[3] / 2], 8);
  fill(vbg[1], VIEW_BG);
  k.fade(vbg[0], 0.8, 1.2);
  var guide = k.piece("Safe Area");
  var ga = rect(guide[1], [V[2] * 0.9, V[3] * 0.86], [V[0] + V[2] / 2, V[1] + V[3] / 2]);
  var gs = stroke(guide[1], WHITE, 1.5);
  var gd = gs.property("ADBE Vector Stroke Dashes");
  gd.addProperty("ADBE Vector Stroke Dash 1").setValue(8);
  gd.addProperty("ADBE Vector Stroke Gap 1").setValue(8);
  var cross = group(contents(guide[0]), "Centre");
  pathOf(cross, [[VC[0] - 14, V[1] + V[3] / 2], [VC[0] + 14, V[1] + V[3] / 2]], false);
  pathOf(cross, [[VC[0], V[1] + V[3] / 2 - 14], [VC[0], V[1] + V[3] / 2 + 14]], false);
  stroke(cross, WHITE, 1.5);
  k.fade(guide[0], 1.0, 1.4, 14);

  // motion path: a dotted figure-eight with spatial keyframes and handles at its tips
  var a = o.lemnA, pts = [];
  for (i = 0; i < 120; i++) { var q = lemn(a, Math.PI + i / 120 * 2 * Math.PI); pts.push([VC[0] + q[0], VC[1] + q[1]]); }
  var mp = k.piece("Motion Path");
  curve(mp[1], pts, null, null, true);
  var ms = stroke(mp[1], PINK, 4, 2);
  ms.property("ADBE Vector Stroke Opacity").setValue(55);
  var md = ms.property("ADBE Vector Stroke Dashes");
  md.addProperty("ADBE Vector Stroke Dash 1").setValue(0.1);
  md.addProperty("ADBE Vector Stroke Gap 1").setValue(11);
  drawOn(mp[1], 1.0, 1.9);
  var tips = [[VC[0] - a, VC[1]], [VC[0] + a, VC[1]]];
  for (i = 0; i < 2; i++) {
    var hd = k.piece("Path Handle " + (i + 1));
    curve(hd[1], [[tips[i][0], tips[i][1] - 54], [tips[i][0], tips[i][1] + 54]]);
    stroke(hd[1], MUTED, 2);
    drawOn(hd[1], 1.85, 2.15);
    var ends = k.piece("Path Handle Ends " + (i + 1));
    for (j = 0; j < 2; j++) {
      var eg = group(contents(ends[0]), "End " + (j + 1));
      var ee = ellipse(eg, [10, 10]);
      ee.property("ADBE Vector Ellipse Position").setValue([tips[i][0], tips[i][1] + (j ? 54 : -54)]);
      fill(eg, MUTED);
    }
    ends[1].remove();
    k.fade(ends[0], 2.05, 2.2);
    var sk = k.piece("Spatial Key " + (i + 1));
    rect(sk[1], [12, 12], tips[i]);
    fill(sk[1], WHITE);
    stroke(sk[1], PINK, 2);
    pivot(sk[1], tips[i]);
    pop(sk[1], 1.8 + i * 0.1, 0.35, 150);
  }

  // ---------- the moving shape ----------
  // samples of the piece through the loop (moving stretches only; holds need no keys)
  var SPS = 20, moving = [[GO1, END1], [GO2, END2]];
  function at(t) {     // loop time -> {pos, ang (deg along the path), speed (px/s)}
    var th = Math.PI + progress(t) * Math.PI;
    var p = lemn(a, th), dt = 0.004;
    var p2 = lemn(a, Math.PI + progress(t + dt) * Math.PI), p1 = lemn(a, Math.PI + progress(t - dt) * Math.PI);
    var t1 = lemn(a, th + 0.001), t0 = lemn(a, th - 0.001);
    return { pos: [VC[0] + p[0], VC[1] + p[1]],
             ang: Math.atan2(t1[1] - t0[1], t1[0] - t0[0]) * 180 / Math.PI,
             speed: Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)) / (2 * dt) };
  }
  function sampleTimes() {
    var ts = [];
    for (var m = 0; m < moving.length; m++) {
      var n = Math.round((moving[m][1] - moving[m][0]) * SPS);
      for (var s = 0; s <= n; s++) ts.push(moving[m][0] + (moving[m][1] - moving[m][0]) * s / n);
    }
    return ts;
  }
  var TS = sampleTimes();
  function setLinear(prop, keys) {
    for (var n = 0; n < keys.length; n++) prop.setValueAtTime(keys[n][0], keys[n][1]);
    for (n = 1; n <= prop.numKeys; n++) prop.setInterpolationTypeAtKey(n, KeyframeInterpolationType.LINEAR);
  }
  var SIZE = o.ball;

  // onion-skin ghosts: the shape a moment ago (periodic, so they wrap round the loop)
  var lags = [0.05, 0.1, 0.15], ghostOp = [34, 20, 10];
  for (i = lags.length - 1; i >= 0; i--) {
    var gh = k.layer("Ghost " + (i + 1));
    var gg = group(contents(gh), "Dot");
    ellipse(gg, [SIZE * (0.9 - i * 0.1), SIZE * (0.9 - i * 0.1)]);
    fill(gg, PINK);
    var gk = [];
    for (j = 0; j < TS.length; j++) {
      var tt = TS[j] - lags[i];
      gk.push([A(TS[j]), at(tt < 0 ? tt + LOOP : tt).pos]);
    }
    // the ghosts trail into the holds: one more key a lag after each stretch ends
    for (j = 0; j < moving.length; j++) gk.push([A(moving[j][1] + lags[i]), at(moving[j][1]).pos]);
    gk.sort(function (x, y) { return x[0] - y[0]; });
    T(gh, "ADBE Position").setValue(at(0).pos);
    setLinear(T(gh, "ADBE Position"), gk);
    k.fade(gh, 1.9, 2.2, ghostOp[i]);
  }

  var ball = k.layer("Shape");
  var bg = group(contents(ball), "Shape");
  var br = rect(bg, [SIZE, SIZE], [0, 0], SIZE / 2);
  var bf = fill(bg, PINK);
  pop(bg, 1.7, 0.4, 135);
  var posK = [], rotK = [], sclK = [], last = null;
  for (j = 0; j < TS.length; j++) {
    var s0 = at(TS[j]), ang = s0.ang;
    if (last !== null) { while (ang - last > 180) ang -= 360; while (ang - last < -180) ang += 360; }
    last = ang;
    var st = Math.min(s0.speed * 0.045, 42);
    posK.push([A(TS[j]), s0.pos]);
    rotK.push([A(TS[j]), ang]);
    sclK.push([A(TS[j]), [100 + st, 100 - st * 0.55]]);
  }
  T(ball, "ADBE Position").setValue(at(0).pos);
  T(ball, "ADBE Rotate Z").setValue(rotK[0][1]);
  setLinear(T(ball, "ADBE Position"), posK);
  setLinear(T(ball, "ADBE Rotate Z"), rotK);
  setLinear(T(ball, "ADBE Scale"), sclK);
  // circle at rest, rounded square on the move; colour shifts along the way
  var R0 = SIZE / 2, R1 = SIZE * 0.2;
  anim(br.property("ADBE Vector Rect Roundness"), [[A(0.2), R0], [A(0.8), R1], [A(2.6), R1], [A(3.0), R0],
    [A(3.4), R0], [A(4.0), R1], [A(5.8), R1], [A(6.2), R0]], [50, 50]);
  var colK = [[A(0.2), PINK], [A(1.6), VIOLET], [A(3.2), AMBER], [A(4.8), VIOLET], [A(6.4), PINK]];
  anim(bf.property("ADBE Vector Fill Color"), colK, [50, 50]);

  // ---------- kinetic word ----------
  var word = "MOTION", wx = V[0] + 34, wy = V[1] + V[3] - 30, wsize = o.wordSize;
  for (i = 0; i < word.length; i++) {
    var lt = k.text(word.charAt(i), wsize, [wx, wy], WHITE, "Bold");
    lt.name = "Letter " + word.charAt(i) + (i + 1);
    var rr = lt.sourceRectAtTime(0, false);
    var base = [wx, wy];
    var d0 = 2.3 + i * 0.08, w0 = A(6.5) + i * 0.06;
    anim(T(lt, "ADBE Position"), [[d0, [wx, wy - 70]], [d0 + 0.35, [wx, wy + 8]], [d0 + 0.5, base],
      [w0, base], [w0 + 0.15, [wx, wy - 22]], [w0 + 0.4, [wx, wy + 4]], [w0 + 0.55, base]], [33, 33]);
    anim(T(lt, "ADBE Opacity"), [[d0, 0], [d0 + 0.2, 100]], [33, 33]);
    wx += rr.width + wsize * 0.06;
  }

  // ---------- timeline ----------
  var lane0 = TL[0] + 150, lane1 = TL[0] + TL[2] - 30;
  function tx(t) { return lane0 + (lane1 - lane0) * t / LOOP; }
  var rows = ["Position", "Scale", "Rotation", "Color"], rowCol = [PINK, VIOLET, LILAC, AMBER];
  var rowKeys = [[GO1, END1, GO2, END2], [GO1, 1.6, END1, GO2, 4.8, END2], [0.8, 2.6, 4.0, 5.8], [GO1, 1.6, 3.2, 4.8, 6.4]];
  var rowY = function (n) { return TL[1] + 60 + n * o.rowGap; };
  var ticks = k.piece("Ruler");
  for (i = 0; i <= LOOP; i++) {
    var tg = group(contents(ticks[0]), "Tick " + i);
    curve(tg, [[tx(i), TL[1] + 40], [tx(i), TL[1] + 48]]);
    stroke(tg, MUTED, 2);
  }
  ticks[1].remove();
  k.fade(ticks[0], 1.1, 1.4, 70);
  for (i = 0; i < rows.length; i++) {
    var ln = k.piece("Lane " + rows[i]);
    curve(ln[1], [[lane0, rowY(i)], [lane1, rowY(i)]]);
    stroke(ln[1], DIM, 3);
    drawOn(ln[1], 1.0 + i * 0.06, 1.5 + i * 0.06);
    k.rise(k.text(rows[i], 15, [TL[0] + 18, rowY(i) + 5], MUTED, "Medium"), 1.1 + i * 0.06, 8);
    for (j = 0; j < rowKeys[i].length; j++) {
      var kt = rowKeys[i][j], kp = [tx(kt), rowY(i)];
      var dk = k.piece("Key " + rows[i] + " " + (j + 1));
      rect(dk[1], [13, 13], kp);
      fill(dk[1], rowCol[i]);
      pivot(dk[1], kp);
      xf(dk[1]).property("ADBE Vector Rotation").setValue(45);
      var tin = 1.5 + i * 0.06 + j * 0.05;
      // pops in, then flashes each time the playhead crosses it
      anim(xf(dk[1]).property("ADBE Vector Scale"), [[tin, [0, 0]], [tin + 0.2, [140, 140]], [tin + 0.35, [100, 100]],
        [A(kt), [100, 100]], [A(kt) + 0.08, [165, 165]], [A(kt) + 0.35, [100, 100]]], [33, 33]);
    }
  }
  var ph = k.layer("Playhead", [tx(0), 0]);
  var phl = group(contents(ph), "Line");
  curve(phl, [[0, TL[1] + 40], [0, TL[1] + TL[3] - 8]]);
  stroke(phl, PINK, 2);
  var phh = group(contents(ph), "Head");
  rect(phh, [14, 12], [0, TL[1] + 40], 3);
  fill(phh, PINK);
  lin(T(ph, "ADBE Position"), [[L0, [tx(0), 0]], [L1, [tx(LOOP), 0]]]);
  k.fade(ph, 3.2, 3.5);

  // ---------- graph editor ----------
  var gx0 = G[0] + 26, gx1 = G[0] + G[2] - 26, gy0 = G[1] + 62, gy1 = G[1] + G[3] - 26;
  function gp(t) { return [gx0 + (gx1 - gx0) * t / LOOP, gy1 - (gy1 - gy0) * progress(t) / 2]; }
  var grid = k.piece("Graph Grid");
  for (i = 0; i <= 2; i++) {
    var hg = group(contents(grid[0]), "Row " + i);
    var yy = gy1 - (gy1 - gy0) * i / 2;
    curve(hg, [[gx0, yy], [gx1, yy]]);
    stroke(hg, DIM, 2);
  }
  grid[1].remove();
  k.fade(grid[0], 1.2, 1.5);
  var gpts = [];
  for (i = 0; i <= 96; i++) gpts.push(gp(LOOP * i / 96));
  var gc = k.piece("Value Curve");
  curve(gc[1], gpts);
  var gcs = stroke(gc[1], PINK, 4, 2);
  gcs.property("ADBE Vector Stroke Line Join").setValue(2);
  drawOn(gc[1], 1.6, 2.6);
  // bezier handles of the first ease
  var h0 = gp(GO1), h1 = gp(END1), hl = (h1[0] - h0[0]) * 0.55;
  var gh2 = k.piece("Ease Handles");
  curve(gh2[1], [h0, [h0[0] + hl, h0[1]]]);
  curve(gh2[1], [h1, [h1[0] - hl, h1[1]]]);
  stroke(gh2[1], MUTED, 2);
  drawOn(gh2[1], 2.5, 2.8);
  var gends = [[h0[0] + hl, h0[1]], [h1[0] - hl, h1[1]], h0, h1];
  for (i = 0; i < gends.length; i++) {
    var hd2 = k.piece("Ease Handle " + (i + 1));
    var he = ellipse(hd2[1], i < 2 ? [11, 11] : [14, 14]);
    he.property("ADBE Vector Ellipse Position").setValue(gends[i]);
    fill(hd2[1], i < 2 ? MUTED : WHITE);
    pivot(hd2[1], gends[i]);
    pop(hd2[1], 2.6 + i * 0.05, 0.3, 150);
  }
  // playhead line and a dot riding the curve
  var gl = k.layer("Graph Playhead", [gx0, 0]);
  var gll = group(contents(gl), "Line");
  curve(gll, [[0, G[1] + 46], [0, G[1] + G[3] - 14]]);
  stroke(gll, PINK, 2).property("ADBE Vector Stroke Opacity").setValue(60);
  lin(T(gl, "ADBE Position"), [[L0, [gx0, 0]], [L1, [gx1, 0]]]);
  k.fade(gl, 3.2, 3.5);
  var gdot = k.layer("Graph Dot", gp(0));
  var gdg = group(contents(gdot), "Dot");
  ellipse(gdg, [18, 18]);
  fill(gdg, WHITE);
  stroke(gdg, PINK, 4);
  var gdk = [];
  for (i = 0; i <= LOOP * 10; i++) gdk.push([A(i / 10), gp(i / 10)]);
  setLinear(T(gdot, "ADBE Position"), gdk);
  k.fade(gdot, 3.2, 3.5);

  return comp.name + " (" + comp.numLayers + " layers)";
}

var built = [
  build({ name: "Motion Graphics Wide", w: 1920, h: 1080, canvas: [250, 96, 920, 480], graph: [1190, 96, 480, 480],
          timeline: [250, 596, 1420, 150], rowGap: 22, lemnA: 300, ball: 64, wordSize: 50 }),
  build({ name: "Motion Graphics Tall", w: 1080, h: 1920, canvas: [140, 170, 800, 480], graph: [140, 670, 800, 260],
          timeline: [140, 950, 800, 150], rowGap: 22, lemnA: 262, ball: 58, wordSize: 46 })
];
"built " + built.join(", ");
