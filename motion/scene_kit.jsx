// Shared pieces for the full-screen service scenes (motion/khume_service_*.jsx).
// Every scene follows the hero's timing: 0..L0 intro (plays once), L0..L1 loop (repeats seamlessly).
// Loop rule: whatever moves inside the loop has the same value at L0 and L1 with zero speed there
// (or is invisible at both ends), so khume-lottie.js can jump from L1 back to L0 unseen.
// Gradient fills are announced as "GRAD|comp|layer|group|stops" lines for motion/build_motion.sh.

#include "craft_helpers.jsx"

var FPS = 60, L0 = 4, LOOP = 8, L1 = L0 + LOOP;
var WHITE = [1, 1, 1];
var VIOLET = hex("#7c3aed"), LILAC = hex("#a78bfa"), PALE = hex("#c4b5fd");
var MUTED = hex("#a1a1aa"), BG = hex("#0b0816");

function A(t) { return L0 + t; }   // a time inside the loop

function lin(p, keys) {
  for (var i = 0; i < keys.length; i++) p.setValueAtTime(keys[i][0], keys[i][1]);
  for (i = 1; i <= p.numKeys; i++) p.setInterpolationTypeAtKey(i, KeyframeInterpolationType.LINEAR);
  return p;
}

// a new comp, replacing one of the same name (scripts can be re-run in the live app)
function sceneComp(name, w, h) {
  for (var n = app.project.numItems; n >= 1; n--) {
    var it = app.project.item(n);
    if (it instanceof CompItem && it.name === name) it.remove();
  }
  var c = app.project.items.addComp(name, w, h, 1, L1, FPS);
  c.bgColor = BG;
  return c;
}

function sceneKit(comp) {
  var k = { comp: comp, W: comp.width, H: comp.height };

  k.layer = function (name, pos) {
    var l = comp.layers.addShape();
    l.name = name;
    T(l, "ADBE Anchor Point").setValue([0, 0]);
    T(l, "ADBE Position").setValue(pos || [0, 0]);
    return l;
  };
  // a layer holding one group; returns [layer, group]
  k.piece = function (name, pos) {
    var l = k.layer(name, pos);
    return [l, group(contents(l), name)];
  };

  // radial gradient fill, centre (0,0) of the group; stops: [[pos, "#hex", alpha], ...]
  k.grad = function (l, g, radius, stops) {
    var gf = vecs(g).addProperty("ADBE Vector Graphic - G-Fill");
    gf.property("type").setValue(2);
    gf.property("end").setValue([radius, 0]);
    var colors = [], ops = [];
    for (var i = 0; i < stops.length; i++) {
      var c = hex(stops[i][1]);
      colors.push([stops[i][0], [c[0], c[1], c[2], 1]]);
      ops.push([stops[i][0], stops[i][2]]);
    }
    writeLn("GRAD|" + comp.name + "|" + l.name + "|" + g.name + "|" +
      JSON.stringify({ t: "Gradient", v: { colors: colors, opacities: ops } }));
    return gf;
  };
  k.blob = function (name, pos, radius, stops) {
    var lg = k.piece(name, pos);
    ellipse(lg[1], [radius * 2, radius * 2]);
    k.grad(lg[0], lg[1], radius, stops);
    return lg[0];
  };

  k.fade = function (l, t0, t1, to) {
    anim(T(l, "ADBE Opacity"), [[t0, 0], [t1, to === undefined ? 100 : to]], [[33, 33], [60, 33]]);
  };
  // opacity windows: [[on, off], ...] with short fades; 0 at L0 and L1 unless a window spans them
  k.windows = function (p, wins, fadeDur, peak) {
    var f = fadeDur || 0.12, v = peak === undefined ? 100 : peak, keys = [];
    for (var i = 0; i < wins.length; i++) {
      keys.push([wins[i][0], 0], [wins[i][0] + f, v], [wins[i][1] - f, v], [wins[i][1], 0]);
    }
    anim(p, keys, [33, 33]);
  };

  // background: fill, a faint blueprint grid and two aurora blobs that drift through the loop
  k.background = function (o) {
    var bg = k.piece("Background", [k.W / 2, k.H / 2]);
    rect(bg[1], [k.W + 40, k.H + 40]);
    fill(bg[1], BG);
    if (o.grid) {
      var gl = k.layer("Blueprint Grid");
      var v = group(contents(gl), "Columns");
      pathOf(v, [[0, 0], [0, k.H]], false);
      stroke(v, WHITE, 1);
      var rv = vecs(v).addProperty("ADBE Vector Filter - Repeater");
      rv.property("ADBE Vector Repeater Copies").setValue(Math.ceil(k.W / o.grid) + 1);
      rv.property("ADBE Vector Repeater Transform").property("ADBE Vector Position").setValue([o.grid, 0]);
      var hgrp = group(contents(gl), "Rows");
      pathOf(hgrp, [[0, 0], [k.W, 0]], false);
      stroke(hgrp, WHITE, 1);
      var rh = vecs(hgrp).addProperty("ADBE Vector Filter - Repeater");
      rh.property("ADBE Vector Repeater Copies").setValue(Math.ceil(k.H / o.grid) + 1);
      rh.property("ADBE Vector Repeater Transform").property("ADBE Vector Position").setValue([0, o.grid]);
      k.fade(gl, 0, 1.2, 4);
    }
    function drift(l, p0, p1, s1) {
      anim(T(l, "ADBE Position"), [[L0, p0], [A(LOOP / 2), p1], [L1, p0]], [33, 33]);
      anim(T(l, "ADBE Scale"), [[L0, [100, 100]], [A(LOOP / 2), [s1, s1]], [L1, [100, 100]]], [33, 33]);
    }
    var a1 = k.blob("Aurora A", o.a1[0], o.a1[1], [[0, o.c1, 0.4], [0.55, o.c1, 0.1], [1, o.c1, 0]]);
    drift(a1, o.a1[0], o.a1[2], 116);
    k.fade(a1, 0, 1.6);
    var a2 = k.blob("Aurora B", o.a2[0], o.a2[1], [[0, o.c2, 0.3], [0.6, o.c2, 0.07], [1, o.c2, 0]]);
    drift(a2, o.a2[0], o.a2[2], 110);
    k.fade(a2, 0.2, 1.8);
  };

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
  k.rise = function (l, t0, dy) {
    var p = T(l, "ADBE Position"), v = p.value;
    anim(p, [[t0, [v[0], v[1] + (dy || 24)]], [t0 + 0.45, v]], [[33, 85], [85, 33]]);
    anim(T(l, "ADBE Opacity"), [[t0, 0], [t0 + 0.3, 100]], [[33, 33], [33, 33]]);
    return l;
  };
  // centred number at (cx, baseline y); digits roll up behind their own mattes, other characters rise
  k.odometer = function (str, cx, baseY, size, color, t0, dur) {
    var widths = { "%": 0.86, "+": 0.62, ",": 0.3, ".": 0.3, "k": 0.56 };
    var w = function (ch) { return /[0-9]/.test(ch) ? size * 0.64 : size * (widths[ch] || 0.6); };
    var total = 0, i;
    for (i = 0; i < str.length; i++) total += w(str.charAt(i));
    var x = cx - total / 2, L = size * 1.2, digitIndex = 0;
    for (i = 0; i < str.length; i++) {
      var ch = str.charAt(i), cw = w(ch), mid = x + cw / 2;
      if (/[0-9]/.test(ch)) {
        var column = [], dg = parseInt(ch, 10);
        for (var n = 1; n <= 10; n++) column.push(String((dg + n) % 10));
        var col = k.text(column.join("\r"), size, [mid, baseY], color, "Bold", ParagraphJustification.CENTER_JUSTIFY);
        var tdp = col.property("ADBE Text Properties").property("ADBE Text Document");
        var td = tdp.value;
        td.leading = L;
        tdp.setValue(td);
        col.name = "Digit " + ch;
        var start = t0 + digitIndex * 0.06;
        anim(T(col, "ADBE Position"), [[start, [mid, baseY]], [start + dur, [mid, baseY - 9 * L]]], [[33, 60], [92, 33]]);
        var m = k.piece("Digit Matte", [mid, baseY - size * 0.36]);
        rect(m[1], [cw + 8, size * 1.08]);
        fill(m[1], WHITE);
        col.setTrackMatte(m[0], TrackMatteType.ALPHA);
        digitIndex++;
      } else {
        k.rise(k.text(ch, size, [mid, baseY], color, "Bold", ParagraphJustification.CENTER_JUSTIFY), t0 + 0.2, 16);
      }
      x += cw;
    }
  };
  return k;
}
