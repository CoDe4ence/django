// Service infographics for the landing page's service cards: one 960x540 mograph per service, in
// that card's accent colour. Played by static/js/khume-lottie.js when the card is an active slide.
// Exported to Lottie by export_web.sh -> static/animations/services/<slug>.json
//
// Run: effectcraft-cli script motion/khume_service_infographics.jsx --project motion/Khume-Logo-Shapes.ecproj --save
//
// Everything is shape layers, text (exported as shapes) and track mattes, so it all survives Lottie.
// Numbers are odometers: a column of digits per place, scrolled behind its own matte.

#include "craft_helpers.jsx"

var CW = 960, CH = 540, FPS = 60, DUR = 4.5;
var WHITE = [1, 1, 1];
var MUTED = hex("#a1a1aa");      // zinc-400, labels
var GRID = hex("#3f3f46");       // zinc-700, axes and tracks
var BGC = hex("#0d0d14");

function kit(comp) {
  var k = {};
  k.shape = function (name, pos) {
    var l = comp.layers.addShape();
    l.name = name;
    T(l, "ADBE Anchor Point").setValue([0, 0]);
    T(l, "ADBE Position").setValue(pos || [0, 0]);
    return l;
  };
  // a layer holding a single group; returns the group
  k.part = function (name, pos) { return group(contents(k.shape(name, pos)), name); };
  k.text = function (str, size, pos, color, style, just) {
    var l = comp.layers.addText(str);
    l.name = str.replace(/\r/g, " ").substr(0, 24);
    var p = l.property("ADBE Text Properties").property("ADBE Text Document");
    var td = p.value;
    td.font = "Inter-" + (style || "Bold");
    td.fontSize = size;
    td.fillColor = color || WHITE;
    td.applyFill = true;
    td.applyStroke = false;
    td.justification = just || ParagraphJustification.LEFT_JUSTIFY;
    p.setValue(td);
    T(l, "ADBE Position").setValue(pos);
    return l;
  };
  // fade + rise into place
  k.rise = function (l, t0, dy) {
    var p = T(l, "ADBE Position"), v = p.value;
    anim(p, [[t0, [v[0], v[1] + (dy || 24)]], [t0 + 0.45, v]], [[33, 85], [85, 33]]);
    anim(T(l, "ADBE Opacity"), [[t0, 0], [t0 + 0.3, 100]], [[33, 33], [33, 33]]);
    return l;
  };
  // centred number at (cx, baseline y); digits roll, other characters fade in
  k.odometer = function (str, cx, baseY, size, color, t0, dur) {
    var widths = { "%": 0.86, "+": 0.62, ",": 0.3, ".": 0.3, "k": 0.56 };
    var w = function (ch) { return /[0-9]/.test(ch) ? size * 0.64 : size * (widths[ch] || 0.6); };
    var total = 0, i;
    for (i = 0; i < str.length; i++) total += w(str.charAt(i));
    var x = cx - total / 2, L = size * 1.2, digitIndex = 0;
    for (i = 0; i < str.length; i++) {
      var ch = str.charAt(i), cw = w(ch), mid = x + cw / 2;
      if (/[0-9]/.test(ch)) {
        // ten digits counting up to this one, e.g. 5,6,7,8,9,0,1,2,3,4 for a 4: always a full roll
        var column = [], dg = parseInt(ch, 10);
        for (var n = 1; n <= 10; n++) column.push(String((dg + n) % 10));
        var col = k.text(column.join("\r"), size, [mid, baseY], color, "Bold", ParagraphJustification.CENTER_JUSTIFY);
        var tdp = col.property("ADBE Text Properties").property("ADBE Text Document");
        var td = tdp.value;
        td.leading = L;
        tdp.setValue(td);
        col.name = "Digit " + ch;
        var land = 9, start = t0 + digitIndex * 0.06;
        anim(T(col, "ADBE Position"), [[start, [mid, baseY]], [start + dur, [mid, baseY - land * L]]], [[33, 60], [92, 33]]);
        var m = k.shape("Digit Matte", [mid, baseY - size * 0.36]);
        var mg = group(contents(m), "Window");
        rect(mg, [cw + 8, size * 1.08]);
        fill(mg, WHITE);
        col.setTrackMatte(m, TrackMatteType.ALPHA);
        digitIndex++;
      } else {
        k.rise(k.text(ch, size, [mid, baseY], color, "Bold", ParagraphJustification.CENTER_JUSTIFY), t0 + 0.2, 16);
      }
      x += cw;
    }
  };
  // a filled bar that grows up from its base (bx = left, by = base)
  k.bar = function (name, bx, by, bw, bh, color, opacity, t0) {
    var g = k.part(name);
    rect(g, [bw, bh], [bx + bw / 2, by - bh / 2], 6);
    fill(g, color, opacity);
    pivot(g, [bx + bw / 2, by]);
    anim(xf(g).property("ADBE Vector Scale"), [[t0, [100, 0]], [t0 + 0.4, [100, 106]], [t0 + 0.6, [100, 100]]], [[33, 80], [50, 50], [60, 33]]);
    return g;
  };
  k.stroked = function (g, color, width) {
    var s = stroke(g, color, width, 2);
    s.property("ADBE Vector Stroke Line Join").setValue(2);
    return s;
  };
  k.dot = function (name, p, d, color, t0, over) {
    var g = k.part(name);
    var e = ellipse(g, [d, d]);
    e.property("ADBE Vector Ellipse Position").setValue(p);
    fill(g, color);
    pivot(g, p);
    pop(g, t0, 0.35, over || 130);
    return g;
  };
  return k;
}

function newComp(name) {
  var c = app.project.items.addComp("Info " + name, CW, CH, 1, DUR, FPS);
  c.bgColor = BGC;
  return c;
}

var built = [];

// ---------- 1. Web Design: a page wireframe assembles, PageSpeed gauge fills to 98 ----------
(function () {
  var A = hex("#a78bfa"), comp = newComp("Web Design"), k = kit(comp);
  var win = k.part("Browser");
  rect(win, [440, 380], [290, 270], 22);
  k.stroked(win, A, 6);
  drawOn(win, 0.0, 0.7);
  var bar = k.part("Top Bar");
  curve(bar, [[70, 140], [510, 140]]);
  k.stroked(bar, A, 6);
  drawOn(bar, 0.35, 0.8);
  for (var i = 0; i < 3; i++) k.dot("Nav Dot " + (i + 1), [102 + i * 26, 116], 14, A, 0.6 + i * 0.07);
  var hero = k.part("Hero Block");
  rect(hero, [390, 120], [290, 220], 10);
  fill(hero, A, 35);
  pivot(hero, [95, 280]);
  anim(xf(hero).property("ADBE Vector Scale"), [[0.8, [0, 100]], [1.25, [100, 100]]], [[33, 85], [85, 33]]);
  var hl = k.part("Headline");
  curve(hl, [[125, 205], [330, 205]]);
  k.stroked(hl, WHITE, 16);
  drawOn(hl, 1.1, 1.45);
  var sl = k.part("Subline");
  curve(sl, [[125, 240], [260, 240]]);
  k.stroked(sl, WHITE, 10);
  drawOn(sl, 1.2, 1.55);
  for (i = 0; i < 3; i++) {
    var card = k.part("Card " + (i + 1));
    rect(card, [118, 120], [160 + i * 135, 368], 10);
    fill(card, A, 70);
    pivot(card, [160 + i * 135, 428]);
    pop(card, 1.3 + i * 0.1, 0.4, 112);
  }
  // gauge
  var C = [745, 245], R = 125;
  var track = k.part("Gauge Track");
  var te = ellipse(track, [R * 2, R * 2]);
  te.property("ADBE Vector Ellipse Position").setValue(C);
  k.stroked(track, GRID, 20);
  drawOn(track, 0.3, 1.0);
  var arc = k.part("Gauge Arc");
  var ae = ellipse(arc, [R * 2, R * 2]);
  ae.property("ADBE Vector Ellipse Position").setValue(C);
  k.stroked(arc, A, 20);
  var at = trim(arc);
  anim(at.property("ADBE Vector Trim End"), [[1.1, 0], [2.5, 98]], [[33, 60], [90, 33]]);
  k.odometer("98", C[0], C[1] + 38, 110, WHITE, 1.1, 1.4);
  k.rise(k.text("PageSpeed", 36, [C[0], 470], MUTED, "SemiBold", ParagraphJustification.CENTER_JUSTIFY), 2.2);
  built.push(comp.name);
})();

// ---------- 2. Motion Graphics: an easing curve with a riding dot, keyframes on a timeline ----------
(function () {
  var A = hex("#f472b6"), comp = newComp("Motion Graphics"), k = kit(comp);
  var X0 = 80, X1 = 520, Y0 = 470, Y1 = 110;
  var axes = k.part("Axes");
  curve(axes, [[X0, Y1 - 20], [X0, Y0], [X1 + 20, Y0]]);
  k.stroked(axes, GRID, 5);
  drawOn(axes, 0.0, 0.5);
  for (var i = 1; i <= 3; i++) {
    var gl = k.part("Grid " + i);
    curve(gl, [[X0, Y0 - i * 90], [X1 + 20, Y0 - i * 90]]);
    var gs = k.stroked(gl, GRID, 2);
    drawOn(gl, 0.15 + i * 0.08, 0.6 + i * 0.08);
  }
  // cubic-bezier(.42,0,.58,1) drawn as a graph
  var hx = (X1 - X0) * 0.42;
  var handles = k.part("Handles");
  curve(handles, [[X0, Y0], [X0 + hx, Y0]]);
  curve(handles, [[X1, Y1], [X1 - hx, Y1]]);
  k.stroked(handles, MUTED, 3);
  drawOn(handles, 0.6, 0.95);
  k.dot("Handle In", [X0 + hx, Y0], 18, MUTED, 0.9);
  k.dot("Handle Out", [X1 - hx, Y1], 18, MUTED, 1.0);
  var ease = k.part("Ease Curve");
  curve(ease, [[X0, Y0], [X1, Y1]], [[0, 0], [-hx, 0]], [[hx, 0], [0, 0]]);
  k.stroked(ease, A, 9);
  drawOn(ease, 0.5, 1.3);
  // dot that rides the curve: x is time, so sample the bezier into linear keys
  var T0 = 1.5, T1 = 3.5, rider = k.shape("Rider", [X0, Y0]);
  var rg = group(contents(rider), "Dot");
  ellipse(rg, [30, 30]);
  fill(rg, WHITE);
  var rp = T(rider, "ADBE Position"), N = 24;
  for (i = 0; i <= N; i++) {
    var u = i / N, a = 1 - u;
    var bx = a * a * a * X0 + 3 * a * a * u * (X0 + hx) + 3 * a * u * u * (X1 - hx) + u * u * u * X1;
    var by = a * a * a * Y0 + 3 * a * a * u * Y0 + 3 * a * u * u * Y1 + u * u * u * Y1;
    rp.setValueAtTime(T0 + (T1 - T0) * (bx - X0) / (X1 - X0), [bx, by]);
  }
  for (i = 1; i <= rp.numKeys; i++) rp.setInterpolationTypeAtKey(i, KeyframeInterpolationType.LINEAR);
  anim(T(rider, "ADBE Opacity"), [[T0 - 0.2, 0], [T0, 100]], [[33, 33], [33, 33]]);
  // timeline: three tracks with keyframes, a playhead in sync with the rider
  var TX0 = 610, TX1 = 900, rows = [250, 330, 410];
  k.odometer("60", 700, 170, 96, WHITE, 0.6, 1.0);
  k.rise(k.text("fps", 44, [772, 170], MUTED, "SemiBold"), 1.0);
  for (i = 0; i < rows.length; i++) {
    var tr = k.part("Track " + (i + 1));
    curve(tr, [[TX0, rows[i]], [TX1, rows[i]]]);
    k.stroked(tr, GRID, 5);
    drawOn(tr, 0.3 + i * 0.1, 0.8 + i * 0.1);
    var keys = [[0.0, 1.0], [0.35, 0.55, 1.0], [0.0, 0.7]][i];
    for (var j = 0; j < keys.length; j++) {
      var kx = TX0 + keys[j] * (TX1 - TX0);
      var d = k.part("Key " + (i + 1) + "." + (j + 1));
      rect(d, [22, 22], [kx, rows[i]]);
      fill(d, A);
      pivot(d, [kx, rows[i]]);
      xf(d).property("ADBE Vector Rotation").setValue(45);
      pop(d, 0.9 + i * 0.12 + j * 0.08, 0.35, 140);
    }
  }
  var ph = k.shape("Playhead", [TX0, 0]);
  var pg = group(contents(ph), "Line");
  curve(pg, [[0, rows[0] - 40], [0, rows[2] + 40]]);
  k.stroked(pg, WHITE, 4);
  var ptp = T(ph, "ADBE Position");
  ptp.setValueAtTime(T0, [TX0, 0]);
  ptp.setValueAtTime(T1, [TX1, 0]);
  for (i = 1; i <= ptp.numKeys; i++) ptp.setInterpolationTypeAtKey(i, KeyframeInterpolationType.LINEAR);
  anim(T(ph, "ADBE Opacity"), [[T0 - 0.2, 0], [T0, 100]], [[33, 33], [33, 33]]);
  built.push(comp.name);
})();

// ---------- 3. E-commerce: sales bars grow, a trend line draws over them, +184% ----------
(function () {
  var A = hex("#60a5fa"), comp = newComp("E-commerce"), k = kit(comp);
  var base = 470, x0 = 70, bw = 46, step = 66, hs = [90, 130, 115, 180, 220, 265, 330];
  var axis = k.part("Baseline");
  curve(axis, [[x0 - 20, base], [x0 + step * hs.length, base]]);
  k.stroked(axis, GRID, 5);
  drawOn(axis, 0.0, 0.5);
  var pts = [];
  for (var i = 0; i < hs.length; i++) {
    var last = i === hs.length - 1;
    k.bar("Bar " + (i + 1), x0 + i * step, base, bw, hs[i], A, last ? 100 : 40, 0.25 + i * 0.08);
    pts.push([x0 + i * step + bw / 2, base - hs[i] - 26]);
  }
  var trend = k.part("Trend");
  curve(trend, pts);
  k.stroked(trend, WHITE, 6);
  drawOn(trend, 1.0, 1.9);
  for (i = 0; i < pts.length; i++) k.dot("Point " + (i + 1), pts[i], 18, WHITE, 1.05 + i * 0.12);
  k.odometer("+184%", 720, 250, 100, WHITE, 1.2, 1.5);
  k.rise(k.text("Online sales", 36, [720, 320], MUTED, "SemiBold", ParagraphJustification.CENTER_JUSTIFY), 1.6);
  var trackBar = k.part("Conversion Track");
  rect(trackBar, [300, 16], [720, 400], 8);
  fill(trackBar, GRID);
  pop(trackBar, 1.7, 0.3, 102);
  var conv = k.part("Conversion Fill");
  rect(conv, [300, 16], [720, 400], 8);
  fill(conv, A);
  pivot(conv, [570, 400]);
  anim(xf(conv).property("ADBE Vector Scale"), [[2.0, [0, 100]], [3.0, [72, 100]]], [[33, 85], [85, 33]]);
  built.push(comp.name);
})();

// ---------- 4. Web Applications: an architecture diagram with requests flowing through it ----------
(function () {
  var A = hex("#4ade80"), comp = newComp("Web Applications"), k = kit(comp);
  var nodes = [["App", [150, 300]], ["API", [480, 300]], ["DB", [810, 300]], ["Auth", [480, 110]]];
  var NW = 210, NH = 120;
  var links = [[[255, 300], [375, 300]], [[585, 300], [705, 300]], [[480, 150], [480, 240]]];
  for (var i = 0; i < links.length; i++) {
    var ln = k.part("Link " + (i + 1));
    curve(ln, links[i]);
    var ls = k.stroked(ln, GRID, 6);
    drawOn(ln, 0.7 + i * 0.15, 1.1 + i * 0.15);
  }
  for (i = 0; i < nodes.length; i++) {
    var small = nodes[i][0] === "Auth", w = small ? 170 : NW, h = small ? 80 : NH, p = nodes[i][1];
    var box = k.part(nodes[i][0] + " Node");
    rect(box, [w, h], p, 18);
    fill(box, A, 12);
    k.stroked(box, A, 5);
    pivot(box, p);
    pop(box, 0.05 + i * 0.12, 0.45, 112);
    k.rise(k.text(nodes[i][0], small ? 32 : 40, [p[0], p[1] + (small ? 11 : 14)], WHITE, "SemiBold", ParagraphJustification.CENTER_JUSTIFY), 0.3 + i * 0.12, 12);
  }
  // packets: request out to the database, response back to the app
  function packet(name, path, color, t0, seg) {
    var l = k.shape(name, path[0]);
    var g = group(contents(l), "Dot");
    ellipse(g, [24, 24]);
    fill(g, color);
    var p = T(l, "ADBE Position");
    for (var j = 0; j < path.length; j++) p.setValueAtTime(t0 + j * seg, path[j]);
    for (j = 1; j <= p.numKeys; j++) p.setInterpolationTypeAtKey(j, KeyframeInterpolationType.LINEAR);
    var tEnd = t0 + (path.length - 1) * seg;
    anim(T(l, "ADBE Opacity"), [[t0 - 0.05, 0], [t0, 100], [tEnd, 100], [tEnd + 0.05, 0]], [[33, 33], [33, 33], [33, 33], [33, 33]]);
  }
  packet("Auth Check", [[480, 150], [480, 240]], WHITE, 1.4, 0.35);
  packet("Request", [[255, 300], [375, 300], [585, 300], [705, 300]], A, 1.6, 0.25);
  packet("Response", [[705, 300], [585, 300], [375, 300], [255, 300]], WHITE, 2.5, 0.25);
  packet("Request 2", [[255, 300], [375, 300], [585, 300], [705, 300]], A, 3.0, 0.2);
  var ok = k.text("200 OK  ·  38 ms", 38, [480, 470], A, "SemiBold", ParagraphJustification.CENTER_JUSTIFY);
  k.rise(ok, 3.3, 16);
  built.push(comp.name);
})();

// ---------- 5. Brand Revamps: palette swatches, a type specimen, consistency score ----------
(function () {
  var A = hex("#fbbf24"), comp = newComp("Brand Revamps"), k = kit(comp);
  var swatches = ["#fbbf24", "#f59e0b", "#7c3aed", "#a78bfa", "#ffffff"];
  for (var i = 0; i < swatches.length; i++) {
    var p = [110 + i * 92, 150];
    var sw = k.part("Swatch " + (i + 1));
    var e = ellipse(sw, [76, 76]);
    e.property("ADBE Vector Ellipse Position").setValue(p);
    fill(sw, hex(swatches[i]));
    pivot(sw, p);
    pop(sw, 0.1 + i * 0.09, 0.4, 125);
  }
  var rule = k.part("Guide Rule");
  curve(rule, [[60, 250], [520, 250]]);
  k.stroked(rule, GRID, 4);
  drawOn(rule, 0.5, 1.0);
  // type specimen, revealed upward by a matte
  var aa = k.text("Aa", 230, [60, 470], WHITE, "Bold");
  var am = k.shape("Specimen Matte", [50, 470]);
  var amg = group(contents(am), "Wipe");
  rect(amg, [420, 260], [210, -110]);
  fill(amg, WHITE);
  pivot(amg, [210, 30]);
  anim(xf(amg).property("ADBE Vector Scale"), [[0.7, [100, 0]], [1.3, [100, 100]]], [[33, 85], [85, 33]]);
  aa.setTrackMatte(am, TrackMatteType.ALPHA);
  k.rise(k.text("Inter", 36, [400, 400], MUTED, "SemiBold"), 1.2);
  k.rise(k.text("Bold", 36, [400, 450], A, "SemiBold"), 1.3);
  // consistency ring
  var C = [760, 230], R = 120;
  var tr = k.part("Ring Track");
  var te = ellipse(tr, [R * 2, R * 2]);
  te.property("ADBE Vector Ellipse Position").setValue(C);
  k.stroked(tr, GRID, 22);
  drawOn(tr, 0.4, 1.0);
  var ring = k.part("Ring");
  var re = ellipse(ring, [R * 2, R * 2]);
  re.property("ADBE Vector Ellipse Position").setValue(C);
  k.stroked(ring, A, 22);
  var rt = trim(ring);
  anim(rt.property("ADBE Vector Trim End"), [[1.2, 0], [2.6, 96]], [[33, 60], [90, 33]]);
  k.odometer("96%", C[0], C[1] + 34, 92, WHITE, 1.2, 1.4);
  k.rise(k.text("On-brand", 36, [C[0], 470], MUTED, "SemiBold", ParagraphJustification.CENTER_JUSTIFY), 2.2);
  built.push(comp.name);
})();

// ---------- 6. Membership & Portals: access tiers stack up, members fill in, 2,400 ----------
(function () {
  var A = hex("#fb923c"), comp = newComp("Membership & Portals"), k = kit(comp);
  var tiers = [["Free", 470, 30, 400], ["Pro", 360, 60, 290], ["VIP", 250, 100, 180]];
  for (var i = 0; i < tiers.length; i++) {
    var w = tiers[i][1], y = tiers[i][3], cx = 280;
    var t = k.part(tiers[i][0] + " Tier");
    rect(t, [w, 86], [cx, y], 14);
    fill(t, A, tiers[i][2]);
    anim(xf(t).property("ADBE Vector Position"), [[0.1 + i * 0.18, [-560, 0]], [0.65 + i * 0.18, [0, 0]]], [[33, 90], [80, 33]]);
    var label = k.text(tiers[i][0], 38, [cx, y + 13], i === 2 ? BGC : WHITE, "Bold", ParagraphJustification.CENTER_JUSTIFY);
    k.rise(label, 0.5 + i * 0.18, 10);
  }
  // crown-ish spark over VIP
  var spark = k.part("VIP Spark");
  star(spark, 4, 30, 8, [280, 105]);
  fill(spark, A);
  pivot(spark, [280, 105]);
  pop(spark, 1.1, 0.4, 140);
  anim(xf(spark).property("ADBE Vector Rotation"), [[1.1, -90], [1.5, 0]], [[33, 80], [80, 33]]);
  k.odometer("2,400", 735, 160, 96, WHITE, 0.9, 1.6);
  k.rise(k.text("Active members", 36, [735, 220], MUTED, "SemiBold", ParagraphJustification.CENTER_JUSTIFY), 1.3);
  // member grid fills in row by row
  for (var r = 0; r < 3; r++) {
    for (var c = 0; c < 6; c++) {
      var on = !(r === 2 && c > 3);
      k.dot("Member " + (r * 6 + c + 1), [610 + c * 50, 300 + r * 55], 34, on ? A : GRID, 1.2 + (r * 6 + c) * 0.045, 140);
    }
  }
  built.push(comp.name);
})();

"built " + built.join(", ");
