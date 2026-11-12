// Khume logo mograph — the navbar logo (static/images/logo/B_W.svg) rebuilt from shape layers.
// Run:  effectcraft-cli script motion/khume_logo_shapes.jsx --empty --save-as motion/Khume-Logo-Shapes.ecproj
// Then: motion/export_web.sh  (renders the MP4 and exports the web Lottie files)
//
// Builds three comps from the same animation:
//   "Khume Logo Shapes"   1920x1080, side-by-side lockup, blurred glow  -> video (MP4)
//   "Khume Logo Web Wide" 1920x1080, side-by-side lockup, no glow      -> Lottie, Motion Graphics card
//   "Khume Logo Web Square" 1080x1080, stacked lockup, no glow         -> Lottie, hero
//
// Logo geometry is taken from the SVG (2000 x 2000 units), re-centred on (0,0):
//   frame  – rounded square, drawn here as a 186-unit stroke on its centre line
//   stem   – the k's vertical bar
//   chevron– the k's arm + leg polygon
// Everything here exports to Lottie: no effects on web comps, the wordmark reveal is a track matte.

var FPS = 60, DUR = 6;
var WHITE = [1, 1, 1];
var VIOLET = [0x7c / 255, 0x3a / 255, 0xed / 255];   // brand DEFAULT
var LILAC = [0xa7 / 255, 0x8b / 255, 0xfa / 255];    // brand light
var BG = [0x0d / 255, 0x0d / 255, 0x14 / 255];       // site background

#include "craft_helpers.jsx"

// opts: {name, w, h, glow, stacked, logoScale (final), startScale}
function build(opts) {
  var W = opts.w, H = opts.h;
  var comp = app.project.items.addComp(opts.name, W, H, 1, DUR, FPS);
  comp.bgColor = BG;
  comp.motionBlur = true;

  function shapeLayer(name, pos) {
    var l = comp.layers.addShape();
    l.name = name;
    T(l, "ADBE Anchor Point").setValue([0, 0]);
    T(l, "ADBE Position").setValue(pos || [W / 2, H / 2]);
    return l;
  }

  // ---------- background glow (video only: blur doesn't belong in a web Lottie) ----------
  var glow = null;
  if (opts.glow) {
    glow = shapeLayer("BG Glow");
    var gg = group(contents(glow), "Glow");
    ellipse(gg, [900, 900]);
    fill(gg, VIOLET);
    glow.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2").property(1).setValue(260);
    anim(T(glow, "ADBE Opacity"), [[0, 0], [0.6, 28], [2.4, 22], [3.4, 30]], [33, 33]);
    anim(T(glow, "ADBE Scale"), [[0, [60, 60]], [1.6, [110, 110]], [DUR, [125, 125]]], [[33, 60], [40, 40], [60, 33]]);
  }

  // ---------- logo control null ----------
  var ctrl = comp.layers.addNull();
  ctrl.name = "LOGO CTRL";
  T(ctrl, "ADBE Anchor Point").setValue([0, 0]);
  T(ctrl, "ADBE Position").setValue([W / 2, H / 2]);

  // ---------- impact burst (behind the logo) ----------
  var IMPACT = 1.5;
  var burst = shapeLayer("Burst Lines");
  var bl = group(contents(burst), "Ray");
  pathOf(bl, [[0, -1250], [0, -2050]], false);
  stroke(bl, LILAC, 70, 2);
  var bt = trim(bl);
  anim(bt.property("ADBE Vector Trim End"), [[IMPACT, 0], [IMPACT + 0.35, 100]], [[33, 90], [80, 33]]);
  anim(bt.property("ADBE Vector Trim Start"), [[IMPACT + 0.08, 0], [IMPACT + 0.55, 100]], [[33, 80], [80, 33]]);
  var rep = vecs(contents(burst)).addProperty("ADBE Vector Filter - Repeater");
  rep.property("ADBE Vector Repeater Copies").setValue(12);
  rep.property("ADBE Vector Repeater Transform").property("ADBE Vector Rotation").setValue(30);
  rep.property("ADBE Vector Repeater Transform").property("ADBE Vector Position").setValue([0, 0]);
  anim(T(burst, "ADBE Rotate Z"), [[IMPACT, -8], [IMPACT + 0.6, 6]], [[33, 70], [70, 33]]);

  var ring = shapeLayer("Burst Ring");
  var rg = group(contents(ring), "Ring");
  var re = ellipse(rg, [2100, 2100]);
  anim(re.property("ADBE Vector Ellipse Size"), [[IMPACT, [2000, 2000]], [IMPACT + 0.7, [3400, 3400]]], [[33, 85], [70, 33]]);
  var rs = stroke(rg, VIOLET, 90);
  anim(rs.property("ADBE Vector Stroke Width"), [[IMPACT, 120], [IMPACT + 0.7, 0]], [[33, 85], [70, 33]]);
  anim(T(ring, "ADBE Opacity"), [[IMPACT - 1 / FPS, 0], [IMPACT, 100]], [[33, 33], [33, 33]]);

  // ---------- frame: violet lead stroke, then white ----------
  var FRAME_SIZE = [1812, 1815], FRAME_ROUND = 125, FRAME_W = 186;

  var lead = shapeLayer("Frame Lead (violet)");
  var lg = group(contents(lead), "Frame");
  rect(lg, FRAME_SIZE, [0, 0], FRAME_ROUND);
  stroke(lg, VIOLET, FRAME_W);
  var lt = trim(lg);
  anim(lt.property("ADBE Vector Trim End"), [[0.1, 0], [1.0, 100]], [[33, 85], [90, 33]]);
  anim(lt.property("ADBE Vector Trim Offset"), [[0.1, -120], [1.15, 0]], [[33, 80], [90, 33]]);

  var frame = shapeLayer("Frame");
  var fg = group(contents(frame), "Frame");
  rect(fg, FRAME_SIZE, [0, 0], FRAME_ROUND);
  stroke(fg, WHITE, FRAME_W);
  var ft = trim(fg);
  anim(ft.property("ADBE Vector Trim End"), [[0.22, 0], [1.15, 100]], [[33, 80], [90, 33]]);
  anim(ft.property("ADBE Vector Trim Offset"), [[0.22, -120], [1.15, 0]], [[33, 80], [90, 33]]);

  // travelling highlight that laps the frame once the logo has landed
  var lap = shapeLayer("Frame Lap Light");
  var lpg = group(contents(lap), "Lap");
  rect(lpg, FRAME_SIZE, [0, 0], FRAME_ROUND);
  stroke(lpg, LILAC, FRAME_W * 0.5, 2);
  var lpt = trim(lpg);
  lpt.property("ADBE Vector Trim Start").setValue(0);
  anim(lpt.property("ADBE Vector Trim End"), [[3.5, 0], [3.8, 14], [4.5, 14], [4.8, 0]], [[33, 60], [60, 60], [60, 60], [60, 33]]);
  anim(lpt.property("ADBE Vector Trim Offset"), [[3.5, 0], [4.8, 360]], [[33, 55], [55, 33]]);

  // ---------- k stem: grows up from the base ----------
  var stem = shapeLayer("k Stem");
  var sg = group(contents(stem), "Stem");
  rect(sg, [283, 1364], [-232.77, 136.14]);   // bar spans x -374.27..-91.27, y -545.86..818.14
  fill(sg, WHITE);
  xf(sg).property("ADBE Vector Anchor").setValue([-232.77, 818.14]);
  xf(sg).property("ADBE Vector Position").setValue([-232.77, 818.14]);
  anim(xf(sg).property("ADBE Vector Scale"),
    [[0.8, [100, 0]], [1.12, [100, 108]], [1.3, [100, 97]], [1.45, [100, 100]]],
    [[33, 85], [50, 50], [50, 50], [50, 33]]);

  // ---------- k chevron: slams in from the right ----------
  var chev = shapeLayer("k Chevron");
  var cg = group(contents(chev), "Chevron");
  pathOf(cg, [[47.54, -177.86], [-81.13, 167.8], [95.98, 818.14], [409.31, 818.14], [203.45, 184.78], [341.95, -177.86]]);
  fill(cg, WHITE);
  xf(cg).property("ADBE Vector Anchor").setValue([-81.13, 167.8]);
  xf(cg).property("ADBE Vector Position").setValue([-81.13, 167.8]);
  anim(xf(cg).property("ADBE Vector Position"),
    [[1.1, [1300, 167.8]], [IMPACT, [-121.13, 167.8]], [IMPACT + 0.12, [-71.13, 167.8]], [IMPACT + 0.25, [-81.13, 167.8]]],
    [[33, 20], [50, 50], [50, 50], [50, 33]]);
  anim(xf(cg).property("ADBE Vector Rotation"), [[1.1, 35], [IMPACT, -6], [IMPACT + 0.25, 0]], [[33, 20], [50, 50], [60, 33]]);
  anim(xf(cg).property("ADBE Vector Group Opacity"), [[1.1, 0], [1.2, 100]], [[33, 33], [33, 33]]);
  chev.motionBlur = true;
  stem.motionBlur = true;

  // ---------- wordmark ----------
  var word = comp.layers.addText("khume");
  word.name = "Wordmark";
  var tdp = word.property("ADBE Text Properties").property("ADBE Text Document");
  var td = tdp.value;
  td.font = "Inter-Bold";
  td.fontSize = 230;
  td.fillColor = WHITE;
  td.applyFill = true;
  td.justification = ParagraphJustification.LEFT_JUSTIFY;
  td.tracking = -20;
  tdp.setValue(td);
  var r = word.sourceRectAtTime(0, false);

  // ---------- lockup layout ----------
  var S0 = opts.startScale, S1 = opts.logoScale;
  var LOGO_PX = 2000 * S1 / 100, GAP = 70;
  var logoEnd, textPos, textFrom;   // textPos = text left edge, vertical middle
  if (opts.stacked) {
    var total = LOGO_PX + GAP + r.height;
    logoEnd = [W / 2, H / 2 - total / 2 + LOGO_PX / 2];
    textPos = [W / 2 - r.width / 2, logoEnd[1] + LOGO_PX / 2 + GAP + r.height / 2];
    textFrom = [textPos[0], textPos[1] + 60];
  } else {
    logoEnd = [W / 2 - (LOGO_PX + GAP + r.width) / 2 + LOGO_PX / 2, H / 2];
    textPos = [logoEnd[0] + LOGO_PX / 2 + GAP, H / 2 + 6];
    textFrom = [textPos[0] - 120, textPos[1]];
  }

  // ---------- parent logo pieces to the control null ----------
  var logoLayers = [burst, ring, lead, frame, lap, stem, chev];
  for (var i = 0; i < logoLayers.length; i++) {
    T(logoLayers[i], "ADBE Position").setValue([0, 0]);
    logoLayers[i].setParentWithJump(ctrl);
  }

  // logo: pop in, squash on impact, then move aside to make room for the wordmark
  var SLIDE0 = 2.3, SLIDE1 = 3.1;
  function sc(k) { return [S0 * k, S0 * k]; }
  anim(T(ctrl, "ADBE Scale"),
    [[0, sc(0.8)], [1.0, sc(1)], [IMPACT, sc(1)], [IMPACT + 0.07, sc(0.93)], [IMPACT + 0.22, sc(1.04)], [IMPACT + 0.4, sc(1)],
     [SLIDE0, sc(1)], [SLIDE1, [S1, S1]]],
    [[33, 70], [70, 33], [33, 60], [50, 50], [50, 50], [50, 33], [33, 85], [85, 33]]);
  anim(T(ctrl, "ADBE Position"), [[SLIDE0, [W / 2, H / 2]], [SLIDE1, logoEnd]], [[33, 85], [85, 33]]);

  // wordmark: slides into place, revealed left -> right by a growing track matte
  T(word, "ADBE Anchor Point").setValue([r.left, r.top + r.height / 2]);
  anim(T(word, "ADBE Position"), [[SLIDE0 + 0.2, textFrom], [SLIDE1 + 0.25, textPos]], [[33, 85], [85, 33]]);
  word.motionBlur = true;

  var PAD = 140;
  var matte = shapeLayer("Wordmark Matte", [textPos[0] - PAD, textPos[1]]);
  var mg = group(contents(matte), "Wipe");
  rect(mg, [r.width + PAD * 2, r.height + PAD * 2], [(r.width + PAD * 2) / 2, 0]);
  fill(mg, WHITE);
  anim(xf(mg).property("ADBE Vector Scale"), [[SLIDE0 + 0.25, [0, 100]], [SLIDE1 + 0.35, [100, 100]]], [[33, 80], [80, 33]]);
  matte.moveBefore(word);
  word.setTrackMatte(matte, TrackMatteType.ALPHA);

  // small violet underline accent, grows from the left edge
  var bar = shapeLayer("Wordmark Accent", [textPos[0], textPos[1] + r.height / 2 + 50]);
  var bg = group(contents(bar), "Bar");
  rect(bg, [r.width, 14], [r.width / 2, 0], 7);
  fill(bg, VIOLET);
  anim(xf(bg).property("ADBE Vector Scale"), [[SLIDE1 + 0.05, [0, 100]], [SLIDE1 + 0.65, [100, 100]]], [[33, 85], [85, 33]]);

  if (glow) glow.moveToEnd();
  return comp.name + " (" + comp.numLayers + " layers)";
}

var built = [
  build({ name: "Khume Logo Shapes", w: 1920, h: 1080, glow: true, stacked: false, startScale: 21, logoScale: 21 }),
  build({ name: "Khume Logo Web Wide", w: 1920, h: 1080, glow: false, stacked: false, startScale: 21, logoScale: 21 }),
  build({ name: "Khume Logo Web Square", w: 1080, h: 1080, glow: false, stacked: true, startScale: 34, logoScale: 24 })
];
"built " + built.join(", ");
