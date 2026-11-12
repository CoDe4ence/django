// Shared helpers for the EffectCraft scripts in this folder (After Effects-style object model).

function dims(p) {
  if (p.isSpatial) return 1;
  var v = p.value;
  return (v instanceof Array) ? v.length : 1;
}
// keys: [[t, v], ...]; inf: one [in, out] influence pair for every key, or one pair per key
function anim(p, keys, inf) {
  for (var i = 0; i < keys.length; i++) p.setValueAtTime(keys[i][0], keys[i][1]);
  var n = dims(p);
  for (var k = 1; k <= p.numKeys; k++) {
    var e = (inf && inf[0] instanceof Array) ? inf[k - 1] : (inf || [33, 33]);
    var ins = [], outs = [];
    for (var d = 0; d < n; d++) { ins.push(new KeyframeEase(0, e[0])); outs.push(new KeyframeEase(0, e[1])); }
    p.setTemporalEaseAtKey(k, ins, outs);
  }
  return p;
}
function contents(layer) { return layer.property("ADBE Root Vectors Group"); }
function group(parent, name) {
  var g = parent.addProperty("ADBE Vector Group");
  g.name = name;
  return g;
}
function vecs(g) { return g.property("ADBE Vectors Group"); }
function xf(g) { return g.property("ADBE Vector Transform Group"); }
function fill(g, color, opacity) {
  var f = vecs(g).addProperty("ADBE Vector Graphic - Fill");
  f.property("ADBE Vector Fill Color").setValue(color);
  if (opacity !== undefined) f.property("ADBE Vector Fill Opacity").setValue(opacity);
  return f;
}
function stroke(g, color, width, cap) {
  var s = vecs(g).addProperty("ADBE Vector Graphic - Stroke");
  s.property("ADBE Vector Stroke Color").setValue(color);
  s.property("ADBE Vector Stroke Width").setValue(width);
  s.property("ADBE Vector Stroke Line Cap").setValue(cap || 1); // 1 butt, 2 round
  return s;
}
function trim(g) { return vecs(g).addProperty("ADBE Vector Filter - Trim"); }
function pathOf(g, pts, closed) {
  var sh = new Shape();
  sh.vertices = pts;
  sh.closed = closed !== false;
  var p = vecs(g).addProperty("ADBE Vector Shape - Group");
  p.property("ADBE Vector Shape").setValue(sh);
  return p;
}
function rect(g, size, pos, round) {
  var r = vecs(g).addProperty("ADBE Vector Shape - Rect");
  r.property("ADBE Vector Rect Size").setValue(size);
  r.property("ADBE Vector Rect Position").setValue(pos || [0, 0]);
  if (round) r.property("ADBE Vector Rect Roundness").setValue(round);
  return r;
}
function ellipse(g, size) {
  var e = vecs(g).addProperty("ADBE Vector Shape - Ellipse");
  e.property("ADBE Vector Ellipse Size").setValue(size);
  return e;
}
function T(l, name) { return l.property("ADBE Transform Group").property(name); }

// a bezier path: pts with optional per-vertex in/out tangents (relative, as in AE)
function curve(g, pts, ins, outs, closed) {
  var sh = new Shape();
  sh.vertices = pts;
  var zero = [];
  for (var i = 0; i < pts.length; i++) zero.push([0, 0]);
  sh.inTangents = ins || zero;
  sh.outTangents = outs || zero;
  sh.closed = !!closed;
  var p = vecs(g).addProperty("ADBE Vector Shape - Group");
  p.property("ADBE Vector Shape").setValue(sh);
  return p;
}
function star(g, points, outer, inner, pos) {
  var s = vecs(g).addProperty("ADBE Vector Shape - Star");
  s.property("ADBE Vector Star Type").setValue(1);   // 1 star, 2 polygon
  s.property("ADBE Vector Star Points").setValue(points);
  s.property("ADBE Vector Star Outer Radius").setValue(outer);
  s.property("ADBE Vector Star Inner Radius").setValue(inner);
  if (pos) s.property("ADBE Vector Star Position").setValue(pos);
  return s;
}
function hex(h) {
  return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255];
}
// trim-path draw-on between t0 and t1
function drawOn(g, t0, t1) {
  var t = trim(g);
  anim(t.property("ADBE Vector Trim End"), [[t0, 0], [t1, 100]], [[33, 75], [85, 33]]);
  return t;
}
// group scale pop 0 -> overshoot -> 100, around the group's anchor
function pop(g, t0, dur, over) {
  var s = xf(g).property("ADBE Vector Scale"), o = over || 118, d = dur || 0.35;
  anim(s, [[t0, [0, 0]], [t0 + d * 0.6, [o, o]], [t0 + d, [100, 100]]], [[33, 80], [50, 50], [60, 33]]);
}
// sets a group's anchor and position to the same point so it scales/rotates around it
function pivot(g, p) {
  xf(g).property("ADBE Vector Anchor").setValue(p);
  xf(g).property("ADBE Vector Position").setValue(p);
}
