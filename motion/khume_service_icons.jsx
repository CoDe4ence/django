// Animated service icons for the landing page's service cards, in the same style as the logo
// animation (strokes drawing on, pops, small bursts). One 200x200 comp per service, each in its
// card's accent colour. Exported to Lottie by export_web.sh -> static/animations/icons/<slug>.json
//
// Run: effectcraft-cli script motion/khume_service_icons.jsx --project motion/Khume-Logo-Shapes.ecproj --save

#include "craft_helpers.jsx"

var ICON = 200, FPS = 60, DUR = 1.6, SW = 13;

function newIcon(name) {
  var comp = app.project.items.addComp("Icon " + name, ICON, ICON, 1, DUR, FPS);
  comp.bgColor = [0x0d / 255, 0x0d / 255, 0x14 / 255];
  var l = comp.layers.addShape();
  l.name = name;
  T(l, "ADBE Anchor Point").setValue([0, 0]);
  T(l, "ADBE Position").setValue([ICON / 2, ICON / 2]);
  return { comp: comp, layer: l, root: contents(l) };
}
function line(g, color, width) {
  var s = stroke(g, color, width || SW, 2);
  s.property("ADBE Vector Stroke Line Join").setValue(2);
  return s;
}
// radial rays around c: copies lines from r0 to r1 that shoot out between t0 and t0 + 0.45
function burst(root, color, c, r0, r1, copies, t0) {
  var b = group(root, "Burst");
  var ray = group(vecs(b), "Ray");
  curve(ray, [[0, -r0], [0, -r1]]);
  line(ray, color, 9);
  var t = trim(ray);
  anim(t.property("ADBE Vector Trim End"), [[t0, 0], [t0 + 0.25, 100]], [[33, 85], [80, 33]]);
  anim(t.property("ADBE Vector Trim Start"), [[t0 + 0.06, 0], [t0 + 0.45, 100]], [[33, 80], [80, 33]]);
  var rep = vecs(b).addProperty("ADBE Vector Filter - Repeater");
  rep.property("ADBE Vector Repeater Copies").setValue(copies);
  rep.property("ADBE Vector Repeater Transform").property("ADBE Vector Rotation").setValue(360 / copies);
  rep.property("ADBE Vector Repeater Transform").property("ADBE Vector Position").setValue([0, 0]);
  xf(b).property("ADBE Vector Position").setValue(c);
  return b;
}

var built = [];

// 1. Web Design — a browser window drawing itself, then its layout blocks
(function () {
  var C = hex("#a78bfa"), ic = newIcon("Web Design"), root = ic.root;
  var win = group(root, "Window");
  rect(win, [150, 124], [0, 0], 18);
  line(win, C);
  drawOn(win, 0.0, 0.6);
  var bar = group(root, "Top Bar");
  curve(bar, [[-75, -28], [75, -28]]);
  line(bar, C);
  drawOn(bar, 0.35, 0.7);
  for (var i = 0; i < 3; i++) {
    var d = group(root, "Dot " + (i + 1));
    var p = [-54 + i * 16, -45];
    var e = ellipse(d, [10, 10]);
    e.property("ADBE Vector Ellipse Position").setValue(p);
    fill(d, C);
    pivot(d, p);
    pop(d, 0.55 + i * 0.08, 0.3, 140);
  }
  var hero = group(root, "Block");
  rect(hero, [48, 44], [-37, 14], 6);
  fill(hero, C);
  pivot(hero, [-61, 36]);
  pop(hero, 0.8, 0.4, 112);
  var l1 = group(root, "Line 1");
  curve(l1, [[8, 0], [54, 0]]);
  line(l1, C, 10);
  drawOn(l1, 0.9, 1.2);
  var l2 = group(root, "Line 2");
  curve(l2, [[8, 26], [38, 26]]);
  line(l2, C, 10);
  drawOn(l2, 1.0, 1.3);
  built.push(ic.comp.name);
})();

// 2. Motion Graphics — a ring spins on, the play button pops in, rays burst
(function () {
  var C = hex("#f472b6"), ic = newIcon("Motion Graphics"), root = ic.root;
  burst(root, C, [0, 0], 86, 104, 8, 0.85);
  var ring = group(root, "Ring");
  ellipse(ring, [146, 146]);
  line(ring, C);
  var t = drawOn(ring, 0.0, 0.6);
  anim(t.property("ADBE Vector Trim Offset"), [[0, -140], [0.65, 0]], [[33, 70], [85, 33]]);
  var play = group(root, "Play");
  curve(play, [[-20, -32], [36, 0], [-20, 32]], null, null, true);
  fill(play, C);
  line(play, C, 10);
  pivot(play, [4, 0]);
  pop(play, 0.45, 0.45, 120);
  anim(xf(play).property("ADBE Vector Rotation"), [[0.45, -120], [0.9, 0]], [[33, 80], [80, 33]]);
  built.push(ic.comp.name);
})();

// 3. E-commerce — a shopping bag draws on, lands with a squash, then a "+" badge pops
(function () {
  var C = hex("#60a5fa"), ic = newIcon("E-commerce"), root = ic.root;
  var bag = group(root, "Bag");
  var body = group(vecs(bag), "Body");
  curve(body, [[-52, -22], [52, -22], [60, 68], [-60, 68]], null, null, true);
  line(body, C);
  drawOn(body, 0.0, 0.6);
  var handle = group(vecs(bag), "Handle");
  curve(handle, [[-26, -22], [0, -62], [26, -22]], [[0, 0], [-18, 0], [0, -22]], [[0, -22], [18, 0], [0, 0]]);
  line(handle, C);
  drawOn(handle, 0.4, 0.75);
  pivot(bag, [0, 68]);
  anim(xf(bag).property("ADBE Vector Scale"),
    [[0.75, [100, 100]], [0.85, [108, 90]], [1.0, [96, 104]], [1.12, [100, 100]]], [[33, 60], [50, 50], [50, 50], [50, 33]]);
  var badge = group(root, "Badge");
  // the plus goes first: items higher in a group's stack draw in front
  var plus = group(vecs(badge), "Plus");
  curve(plus, [[52, -66], [52, -42]]);
  curve(plus, [[40, -54], [64, -54]]);
  line(plus, [0x0d / 255, 0x0d / 255, 0x14 / 255], 8);
  var dot = group(vecs(badge), "Dot");
  var be = ellipse(dot, [46, 46]);
  be.property("ADBE Vector Ellipse Position").setValue([52, -54]);
  fill(dot, C);
  pivot(badge, [52, -54]);
  pop(badge, 0.95, 0.4, 125);
  built.push(ic.comp.name);
})();

// 4. Web Applications — < and > slide together, the slash snaps into place
(function () {
  var C = hex("#4ade80"), ic = newIcon("Web Applications"), root = ic.root;
  var sides = [["Left", [[-30, -42], [-72, 0], [-30, 42]], -50], ["Right", [[30, -42], [72, 0], [30, 42]], 50]];
  for (var i = 0; i < sides.length; i++) {
    var g = group(root, sides[i][0]);
    curve(g, sides[i][1]);
    line(g, C);
    drawOn(g, 0.05, 0.5);
    anim(xf(g).property("ADBE Vector Position"), [[0.05, [sides[i][2], 0]], [0.55, [0, 0]]], [[33, 85], [85, 33]]);
    anim(xf(g).property("ADBE Vector Group Opacity"), [[0.05, 0], [0.25, 100]], [[33, 33], [33, 33]]);
  }
  var slash = group(root, "Slash");
  curve(slash, [[14, -52], [-14, 52]]);
  line(slash, C);
  drawOn(slash, 0.5, 0.85);
  anim(xf(slash).property("ADBE Vector Rotation"), [[0.5, 40], [0.95, -6], [1.15, 0]], [[33, 80], [50, 50], [60, 33]]);
  built.push(ic.comp.name);
})();

// 5. Brand Revamps — a sparkle spins in and bursts, two small sparkles follow
(function () {
  var C = hex("#fbbf24"), ic = newIcon("Brand Revamps"), root = ic.root;
  burst(root, C, [-12, 12], 80, 96, 8, 0.5);
  var big = group(root, "Sparkle");
  star(big, 4, 68, 17, [-12, 12]);
  fill(big, C);
  pivot(big, [-12, 12]);
  pop(big, 0.05, 0.5, 116);
  anim(xf(big).property("ADBE Vector Rotation"), [[0.05, -135], [0.6, 0]], [[33, 85], [80, 33]]);
  var smalls = [[[56, -52], 26, 0.45], [[52, 56], 18, 0.62]];
  for (var i = 0; i < smalls.length; i++) {
    var s = group(root, "Sparkle " + (i + 2));
    star(s, 4, smalls[i][1], smalls[i][1] * 0.26, smalls[i][0]);
    fill(s, C);
    pivot(s, smalls[i][0]);
    pop(s, smalls[i][2], 0.4, 135);
    anim(xf(s).property("ADBE Vector Rotation"), [[smalls[i][2], 90], [smalls[i][2] + 0.4, 0]], [[33, 80], [80, 33]]);
  }
  built.push(ic.comp.name);
})();

// 6. Membership & Portals — a member draws on, a second slides in behind
(function () {
  var C = hex("#fb923c"), ic = newIcon("Membership & Portals"), root = ic.root;
  var back = group(root, "Member 2");
  var bh = group(vecs(back), "Head");
  var bhe = ellipse(bh, [38, 38]);
  bhe.property("ADBE Vector Ellipse Position").setValue([46, -36]);
  line(bh, C, 11);
  drawOn(bh, 0.5, 0.85);
  var bs = group(vecs(back), "Shoulders");
  curve(bs, [[34, 14], [88, 58]], [[0, 0], [0, -30]], [[24, -10], [0, 0]]);
  line(bs, C, 11);
  drawOn(bs, 0.6, 0.95);
  anim(xf(back).property("ADBE Vector Position"), [[0.45, [36, 0]], [0.95, [0, 0]]], [[33, 85], [85, 33]]);
  anim(xf(back).property("ADBE Vector Group Opacity"), [[0.45, 0], [0.7, 65]], [[33, 33], [33, 33]]);

  var front = group(root, "Member 1");
  var fh = group(vecs(front), "Head");
  var fhe = ellipse(fh, [50, 50]);
  fhe.property("ADBE Vector Ellipse Position").setValue([-16, -30]);
  line(fh, C);
  var ht = drawOn(fh, 0.0, 0.45);
  anim(ht.property("ADBE Vector Trim Offset"), [[0, -90], [0.5, 0]], [[33, 70], [85, 33]]);
  var fs = group(vecs(front), "Shoulders");
  curve(fs, [[-68, 64], [-16, 12], [36, 64]], [[0, 0], [-30, 0], [0, -30]], [[0, -30], [30, 0], [0, 0]]);
  line(fs, C);
  drawOn(fs, 0.25, 0.7);
  pivot(front, [-16, 64]);
  anim(xf(front).property("ADBE Vector Scale"),
    [[0.7, [100, 100]], [0.82, [104, 95]], [0.98, [99, 101]], [1.1, [100, 100]]], [[33, 60], [50, 50], [50, 50], [50, 33]]);
  built.push(ic.comp.name);
})();

"built " + built.join(", ");
