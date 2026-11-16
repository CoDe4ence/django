// E-commerce: a store that sells, shown as a sale from both sides.
//   Laptop (the shopper): the "ember" candle store. The cursor adds Rose Ember to the cart, the candle
//   flies into the bag, the cart drawer slides in, Checkout spins and turns into Paid, "Payment
//   successful" with confetti, then Continue shopping closes the drawer: the cart is empty again,
//   which is exactly where the loop starts.
//   Phone (the owner): a lock screen that lights up with "New order #1042 · R279" and today's sales
//   ticking up, then sleeps again before the loop restarts (hiding the reset).
// Chips name the moment: Beautiful storefront, Fast checkout, Instant sale alerts.
//
// The screens are comps of their own ("E-commerce Laptop Screen" 1280x800, "E-commerce Phone Screen"
// 400x860), placed in the scene, so their content is cropped like a real screen.
// Build: motion/build_services.sh e-commerce   (BRIDGE=9877 to build in the live app)

#include "scene_kit.jsx"

LOOP = 9;            // the shopper's story takes 8.4s; 9s gives it a breath before it starts again
L1 = L0 + LOOP;

var INK = hex("#1c1917"), STONE = hex("#57534e"), PAPER = hex("#faf7f2"), SAND = hex("#f5e6d3");
var ORANGE = hex("#ea580c"), GREEN = hex("#16a34a"), PINK = hex("#f472b6");
var BEZEL = hex("#0f0c1a"), BEZEL_LINE = hex("#3f3a56"), PHONE_BG = hex("#1a1325");
var CHIPS = [["Beautiful storefront", 0, 2.5], ["Fast checkout", 2.5, 5.0], ["Instant sale alerts", 5.0, LOOP]];

function parentTo(layers, nul) { for (var i = 0; i < layers.length; i++) layers[i].setParentWithJump(nul); }
function nullAt(comp, name, pos) {
  var n = comp.layers.addNull();
  n.name = name;
  T(n, "ADBE Anchor Point").setValue([0, 0]);
  T(n, "ADBE Position").setValue(pos);
  return n;
}
function quad(p0, pc, p1, u) {
  var a = 1 - u;
  return [a * a * p0[0] + 2 * a * u * pc[0] + u * u * p1[0], a * a * p0[1] + 2 * a * u * pc[1] + u * u * p1[1]];
}

// a candle in a glass jar; c = bottom centre. Returns [layers..., flame layer]
function candle(k, name, c, s, glass, flickerPhase) {
  var j = k.piece(name + " Jar");
  rect(j[1], [80 * s, 96 * s], [c[0], c[1] - 48 * s], 14 * s);
  fill(j[1], glass);
  var lab = k.piece(name + " Label");
  rect(lab[1], [80 * s, 28 * s], [c[0], c[1] - 44 * s]);
  fill(lab[1], WHITE, 70);
  var wax = k.piece(name + " Wax");
  ellipse(wax[1], [68 * s, 13 * s]).property("ADBE Vector Ellipse Position").setValue([c[0], c[1] - 92 * s]);
  fill(wax[1], hex("#fff7ed"));
  var wick = k.piece(name + " Wick");
  rect(wick[1], [3 * s, 12 * s], [c[0], c[1] - 100 * s]);
  fill(wick[1], hex("#44403c"));
  var fl = k.layer(name + " Flame", [c[0], c[1] - 104 * s]);
  var core = group(contents(fl), "Core");
  ellipse(core, [7 * s, 11 * s]).property("ADBE Vector Ellipse Position").setValue([0, -8 * s]);
  fill(core, hex("#fff7ed"));
  var outer = group(contents(fl), "Outer");
  ellipse(outer, [15 * s, 26 * s]).property("ADBE Vector Ellipse Position").setValue([0, -12 * s]);
  fill(outer, hex("#fbbf24"));
  // flicker: periodic through the loop (same at L0 and L1), and through the intro
  var fk = [], v = [[100, 100], [92, 110], [106, 94], [96, 104]], ph = flickerPhase || 0, q;
  for (q = 0; q < 8; q++) fk.push([q * 0.5, v[(q + ph + 1) % 4]]);
  for (q = 0; q <= 20; q++) fk.push([L0 + q * LOOP / 20, v[(q + ph) % 4]]);   // 20 steps: q=0 and q=20 match
  anim(T(fl, "ADBE Scale"), fk, [33, 33]);
  return [j[0], lab[0], wax[0], wick[0], fl];
}

// ============================ the laptop screen: the ember store ============================
function buildLaptop() {
  var W = 1280, H = 800, comp = sceneComp("E-commerce Laptop Screen", W, H), k = sceneKit(comp), i;
  var page = k.piece("Page");
  rect(page[1], [W + 4, H + 4], [W / 2, H / 2]);
  fill(page[1], PAPER);

  // ---------- nav ----------
  var flame = k.piece("Logo Flame");
  ellipse(flame[1], [16, 24]).property("ADBE Vector Ellipse Position").setValue([58, 36]);
  fill(flame[1], ORANGE);
  var logo = k.text("ember", 30, [74, 46], INK, "Bold");
  var links = [["Shop", 520], ["Gift sets", 600], ["About", 712]];
  var navParts = [flame[0], logo];
  for (i = 0; i < links.length; i++) navParts.push(k.text(links[i][0], 17, [links[i][1], 42], STONE, "Medium"));
  var bag = k.piece("Cart Bag");
  rect(bag[1], [30, 26], [1200, 42], 5);
  stroke(bag[1], INK, 3);
  var handle = group(contents(bag[0]), "Handle");
  curve(handle, [[1192, 30], [1192, 22], [1208, 22], [1208, 30]]);
  stroke(handle, INK, 3, 2);
  navParts.push(bag[0]);
  var navLine = k.piece("Nav Line");
  rect(navLine[1], [W, 1.5], [W / 2, 76]);
  fill(navLine[1], hex("#e7e5e4"));
  navParts.push(navLine[0]);
  for (i = 0; i < navParts.length; i++) k.fade(navParts[i], 0.4 + i * 0.04, 0.8 + i * 0.04);

  // ---------- hero banner ----------
  var ban = k.piece("Banner");
  rect(ban[1], [W - 128, 200], [W / 2, 196], 20);
  fill(ban[1], SAND);
  pivot(ban[1], [64, 196]);
  anim(xf(ban[1]).property("ADBE Vector Scale"), [[0.6, [0, 100]], [1.1, [100, 100]]], [[33, 85], [85, 33]]);
  k.rise(k.text("Hand-poured candles", 46, [104, 190], INK, "Bold"), 1.0, 16);
  k.rise(k.text("Small batches. Big glow. Delivered countrywide.", 19, [106, 228], STONE, "Medium"), 1.1, 12);
  var hc = candle(k, "Hero Candle", [1060, 288], 1.55, hex("#f59e0b"), 0);
  for (i = 0; i < hc.length; i++) k.fade(hc[i], 1.0, 1.3);

  // ---------- products ----------
  var products = [["Amber Glow", "R249", hex("#fde68a"), hex("#f59e0b")],
                  ["Rose Ember", "R279", hex("#fecaca"), PINK],
                  ["Fig & Cedar", "R299", hex("#d9f99d"), hex("#65a30d")]];
  var CW = 360, CH = 420, CY = 330, cards = [];
  for (i = 0; i < 3; i++) {
    var x0 = 64 + i * (CW + 44), cc = [x0 + CW / 2, CY + CH / 2];
    var nul = nullAt(comp, "Card " + (i + 1), cc);
    var parts = [];
    var sh = k.piece("Card Shadow " + (i + 1));
    rect(sh[1], [CW, CH], [0, 10], 18);
    fill(sh[1], INK, 7);
    var bgc = k.piece("Card " + (i + 1) + " Body");
    rect(bgc[1], [CW, CH], [0, 0], 18);
    fill(bgc[1], WHITE);
    var img = k.piece("Card " + (i + 1) + " Image");
    rect(img[1], [CW - 24, 220], [0, -CH / 2 + 122], 12);
    fill(img[1], products[i][2]);
    parts.push(sh[0], bgc[0], img[0]);
    parts = parts.concat(candle(k, products[i][0], [0, -CH / 2 + 200], 1.05, products[i][3], i + 1));
    parts.push(k.text(products[i][0], 22, [-CW / 2 + 24, 74], INK, "SemiBold"));
    parts.push(k.text(products[i][1], 22, [CW / 2 - 24, 74], INK, "Bold", ParagraphJustification.RIGHT_JUSTIFY));
    var btn = k.piece("Card " + (i + 1) + " Button");
    var bf = rect(btn[1], [CW - 48, 48], [0, 152], 12);
    var bfill = fill(btn[1], INK);
    parts.push(btn[0]);
    var bt = k.text("Add to cart", 17, [0, 158], WHITE, "SemiBold", ParagraphJustification.CENTER_JUSTIFY);
    parts.push(bt);
    parentTo(parts, nul);
    var pop0 = 1.15 + i * 0.12;
    anim(T(nul, "ADBE Scale"), [[pop0, [90, 90]], [pop0 + 0.45, [100, 100]]], [[33, 85], [85, 33]]);
    for (var p = 0; p < parts.length; p++) if (!(i === 1 && parts[p] === bt)) k.fade(parts[p], pop0, pop0 + 0.3);
    cards.push({ nul: nul, btnFill: bfill, btnText: bt, x0: x0, center: cc });
  }
  // the chosen one: Rose Ember (card 2) lifts on hover, its button says Added
  var C2 = cards[1];
  anim(T(C2.nul, "ADBE Scale"), [[A(0.45), [100, 100]], [A(0.7), [103, 103]], [A(1.5), [103, 103]], [A(1.8), [100, 100]]], [33, 33]);
  anim(C2.btnFill.property("ADBE Vector Fill Color"), [[A(0.92), INK], [A(1.0), ORANGE], [A(2.1), ORANGE], [A(2.3), INK]], [33, 33]);
  var added = k.text("Added  ✓", 17, [0, 158], WHITE, "SemiBold", ParagraphJustification.CENTER_JUSTIFY);
  added.setParentWithJump(C2.nul);
  k.windows(T(added, "ADBE Opacity"), [[A(0.97), A(2.25)]], 0.08);
  anim(T(C2.btnText, "ADBE Opacity"), [[1.27, 0], [1.57, 100], [A(0.93), 100], [A(1.0), 0], [A(2.2), 0], [A(2.3), 100]], [33, 33]);

  // ---------- add to cart: the candle flies into the bag ----------
  var fly = k.layer("Flying Candle");
  var fg = group(contents(fly), "Jar");
  rect(fg, [56, 66], [0, 0], 10);
  fill(fg, PINK);
  var fw = group(contents(fly), "Wax");
  ellipse(fw, [48, 10]).property("ADBE Vector Ellipse Position").setValue([0, -30]);
  fill(fw, hex("#fff7ed"));
  var from = [C2.center[0], CY + 122], to = [1200, 42], ctrl = [980, 60], fk = [];
  for (i = 0; i <= 8; i++) fk.push([A(1.0 + i * 0.075), quad(from, ctrl, to, i / 8)]);
  T(fly, "ADBE Position").setValue(from);
  anim(T(fly, "ADBE Position"), fk, [50, 50]);
  anim(T(fly, "ADBE Scale"), [[A(1.0), [100, 100]], [A(1.6), [30, 30]]], [[33, 60], [60, 33]]);
  anim(T(fly, "ADBE Opacity"), [[A(0.98), 0], [A(1.02), 100], [A(1.56), 100], [A(1.62), 0]], [33, 33]);
  anim(T(bag[0], "ADBE Scale"), [[A(1.6), [100, 100]], [A(1.7), [118, 118]], [A(1.85), [100, 100]]], [33, 33]);
  T(bag[0], "ADBE Anchor Point").setValue([1200, 42]);
  T(bag[0], "ADBE Position").setValue([1200, 42]);
  var badge = k.piece("Cart Badge");
  ellipse(badge[1], [24, 24]).property("ADBE Vector Ellipse Position").setValue([1216, 28]);
  fill(badge[1], ORANGE);
  pivot(badge[1], [1216, 28]);
  anim(xf(badge[1]).property("ADBE Vector Scale"), [[A(1.65), [0, 0]], [A(1.85), [125, 125]], [A(1.95), [100, 100]],
    [A(7.15), [100, 100]], [A(7.35), [0, 0]]], [33, 33]);
  var one = k.text("1", 15, [1216, 33], WHITE, "Bold", ParagraphJustification.CENTER_JUSTIFY);
  k.windows(T(one, "ADBE Opacity"), [[A(1.75), A(7.3)]], 0.08);

  // ---------- the cart drawer ----------
  var dim = k.piece("Page Dim");
  rect(dim[1], [W + 4, H + 4], [W / 2, H / 2]);
  fill(dim[1], INK);
  k.windows(T(dim[0], "ADBE Opacity"), [[A(2.55), A(7.4)]], 0.35, 28);
  var DX_IN = 880, DX_OUT = W + 10, DW = 400;
  var drawer = nullAt(comp, "Drawer", [DX_OUT, 0]);
  anim(T(drawer, "ADBE Position"), [[A(2.55), [DX_OUT, 0]], [A(2.95), [DX_IN, 0]], [A(7.0), [DX_IN, 0]], [A(7.4), [DX_OUT, 0]]],
    [[33, 90], [85, 33], [33, 85], [85, 33]]);
  var dl = [];
  var dsh = k.piece("Drawer Shadow");
  rect(dsh[1], [DW + 30, H + 4], [DW / 2 - 15, H / 2]);
  fill(dsh[1], INK, 10);
  var dbg = k.piece("Drawer Body");
  rect(dbg[1], [DW, H + 4], [DW / 2, H / 2]);
  fill(dbg[1], WHITE);
  dl.push(dsh[0], dbg[0]);
  dl.push(k.text("Your cart", 26, [32, 66], INK, "Bold"));
  var x = k.piece("Drawer Close");
  curve(x[1], [[356, 46], [372, 62]]);
  curve(x[1], [[372, 46], [356, 62]]);
  stroke(x[1], STONE, 2.5, 2);
  dl.push(x[0]);
  var th = k.piece("Line Item Thumb");
  rect(th[1], [72, 72], [68, 140], 10);
  fill(th[1], hex("#fecaca"));
  var tj = group(contents(th[0]), "Jar");
  rect(tj, [30, 36], [68, 146], 6);
  fill(tj, PINK);
  dl.push(th[0]);
  dl.push(k.text("Rose Ember", 18, [124, 134], INK, "SemiBold"));
  dl.push(k.text("Qty 1", 15, [124, 160], STONE, "Medium"));
  dl.push(k.text("R279", 18, [368, 134], INK, "SemiBold", ParagraphJustification.RIGHT_JUSTIFY));
  function rule(y) { var r = k.piece("Rule " + y); rect(r[1], [DW - 64, 1.5], [DW / 2, y]); fill(r[1], hex("#e7e5e4")); dl.push(r[0]); }
  rule(206);
  var rows = [["Subtotal", "R279", 246], ["Delivery", "Free", 280]];
  for (i = 0; i < rows.length; i++) {
    dl.push(k.text(rows[i][0], 16, [32, rows[i][2]], STONE, "Medium"));
    dl.push(k.text(rows[i][1], 16, [368, rows[i][2]], INK, "Medium", ParagraphJustification.RIGHT_JUSTIFY));
  }
  rule(308);
  dl.push(k.text("Total", 22, [32, 348], INK, "Bold"));
  dl.push(k.text("R279", 22, [368, 348], INK, "Bold", ParagraphJustification.RIGHT_JUSTIFY));
  // checkout button: Checkout -> spinner -> Paid (reset while the drawer is away)
  var cb = k.piece("Checkout Button");
  rect(cb[1], [DW - 64, 56], [DW / 2, 420], 12);
  var cbf = fill(cb[1], INK);
  anim(cbf.property("ADBE Vector Fill Color"), [[A(4.85), INK], [A(4.95), GREEN], [A(7.5), GREEN], [A(7.55), INK]], [33, 33]);
  dl.push(cb[0]);
  var cbt = k.text("Checkout  ·  R279", 18, [DW / 2, 426], WHITE, "SemiBold", ParagraphJustification.CENTER_JUSTIFY);
  anim(T(cbt, "ADBE Opacity"), [[A(3.98), 100], [A(4.04), 0], [A(7.5), 0], [A(7.55), 100]], [33, 33]);
  dl.push(cbt);
  var spin = k.layer("Spinner", [DW / 2, 420]);
  var sg = group(contents(spin), "Ring");
  ellipse(sg, [26, 26]);
  stroke(sg, WHITE, 3.5, 2);
  trim(sg).property("ADBE Vector Trim End").setValue(28);
  lin(T(spin, "ADBE Rotate Z"), [[A(4.0), 0], [A(4.85), 720]]);
  k.windows(T(spin, "ADBE Opacity"), [[A(4.0), A(4.86)]], 0.05);
  dl.push(spin);
  var paid = k.text("Paid  ✓", 18, [DW / 2, 426], WHITE, "Bold", ParagraphJustification.CENTER_JUSTIFY);
  k.windows(T(paid, "ADBE Opacity"), [[A(4.88), A(7.5)]], 0.08);
  dl.push(paid);
  // success
  var succ = [];
  var ok = k.piece("Success Badge");
  ellipse(ok[1], [88, 88]).property("ADBE Vector Ellipse Position").setValue([DW / 2, 548]);
  fill(ok[1], GREEN);
  pivot(ok[1], [DW / 2, 548]);
  anim(xf(ok[1]).property("ADBE Vector Scale"), [[A(4.9), [0, 0]], [A(5.15), [120, 120]], [A(5.3), [100, 100]]], [33, 33]);
  var okc = k.piece("Success Tick");
  curve(okc[1], [[DW / 2 - 18, 549], [DW / 2 - 5, 562], [DW / 2 + 20, 536]]);
  var oks = stroke(okc[1], WHITE, 7, 2);
  oks.property("ADBE Vector Stroke Line Join").setValue(2);
  drawOn(okc[1], A(5.1), A(5.35));
  succ.push(ok[0], okc[0]);
  var st1 = k.text("Payment successful", 22, [DW / 2, 630], INK, "Bold", ParagraphJustification.CENTER_JUSTIFY);
  var st2 = k.text("Order #1042 confirmed", 16, [DW / 2, 658], STONE, "Medium", ParagraphJustification.CENTER_JUSTIFY);
  var cs = k.piece("Continue Button");
  rect(cs[1], [DW - 120, 48], [DW / 2, 724], 12);
  stroke(cs[1], INK, 2);
  var cst = k.text("Continue shopping", 16, [DW / 2, 730], INK, "SemiBold", ParagraphJustification.CENTER_JUSTIFY);
  succ.push(st1, st2, cs[0], cst);
  for (i = 0; i < succ.length; i++) k.windows(T(succ[i], "ADBE Opacity"), [[A(4.9 + (i > 1 ? 0.15 : 0)), A(7.5)]], 0.15);
  dl = dl.concat(succ);
  // confetti from the badge
  var cols = [ORANGE, PINK, hex("#fbbf24"), GREEN, hex("#7c3aed")];
  for (i = 0; i < 14; i++) {
    var ang = -Math.PI / 2 + (i / 13 - 0.5) * 2.6, sp = 150 + (i % 4) * 40;
    var cf = k.layer("Confetti " + (i + 1), [DW / 2, 548]);
    var cg = group(contents(cf), "Bit");
    rect(cg, [10, 6], [0, 0], 1);
    fill(cg, cols[i % cols.length]);
    var p1 = [DW / 2 + Math.cos(ang) * sp, 548 + Math.sin(ang) * sp], p2 = [p1[0] + Math.cos(ang) * 40, p1[1] + 120];
    anim(T(cf, "ADBE Position"), [[A(5.0), [DW / 2, 548]], [A(5.45), p1], [A(6.2), p2]], [[33, 90], [40, 40], [40, 33]]);
    anim(T(cf, "ADBE Rotate Z"), [[A(5.0), 0], [A(6.2), (i % 2 ? 1 : -1) * 540]], [33, 33]);
    anim(T(cf, "ADBE Opacity"), [[A(4.99), 0], [A(5.02), 100], [A(5.8), 100], [A(6.2), 0]], [33, 33]);
    dl.push(cf);
  }
  parentTo(dl, drawer);

  // ---------- the shopper's cursor ----------
  var cur = k.layer("Cursor");
  var arrow = group(contents(cur), "Arrow");
  pathOf(arrow, [[0, 0], [0, 26], [7, 20], [12, 31], [17, 29], [12, 18], [21, 18]]);
  fill(arrow, INK);
  stroke(arrow, WHITE, 2);
  T(cur, "ADBE Scale").setValue([130, 130]);
  var rest = [980, 268], addBtn = [C2.center[0] + 20, CY + CH / 2 + 158], cartPt = [1204, 48],
      checkout = [DX_IN + DW / 2 + 30, 428], cont = [DX_IN + DW / 2 + 30, 732];
  anim(T(cur, "ADBE Position"), [[2.5, [W + 40, 360]], [3.2, rest],
    [A(0.1), rest], [A(0.8), addBtn], [A(1.8), addBtn], [A(2.4), cartPt], [A(2.6), cartPt], [A(3.4), cartPt],
    [A(3.9), checkout], [A(6.1), checkout], [A(6.7), cont], [A(6.95), cont], [A(7.7), rest], [L1, rest]], [50, 50]);
  var clicks = [A(0.92), A(2.5), A(3.95), A(6.82)], ck = [[0, [130, 130]]];
  for (i = 0; i < clicks.length; i++) ck.push([clicks[i], [130, 130]], [clicks[i] + 0.07, [108, 108]], [clicks[i] + 0.2, [130, 130]]);
  ck.push([L1, [130, 130]]);
  anim(T(cur, "ADBE Scale"), ck, [33, 33]);
  k.fade(cur, 2.5, 2.8);
  return comp;
}

// ============================ the phone screen: the owner's lock screen ============================
function buildPhone() {
  var W = 400, H = 860, comp = sceneComp("E-commerce Phone Screen", W, H), k = sceneKit(comp), i;
  var bg = k.piece("Wallpaper");
  rect(bg[1], [W + 4, H + 4], [W / 2, H / 2]);
  fill(bg[1], PHONE_BG);
  k.blob("Wallpaper Glow A", [60, 760], 420, [[0, "#ea580c", 0.55], [1, "#ea580c", 0]]);
  k.blob("Wallpaper Glow B", [360, 160], 380, [[0, "#7c3aed", 0.55], [1, "#7c3aed", 0]]);
  k.text("09:41", 76, [W / 2, 176], WHITE, "SemiBold", ParagraphJustification.CENTER_JUSTIFY);
  k.text("Monday, 16 November", 18, [W / 2, 210], WHITE, "Medium", ParagraphJustification.CENTER_JUSTIFY);
  // today's sales widget: ticks up when the new order lands (reset while the screen is dark)
  var wd = k.piece("Sales Widget");
  rect(wd[1], [200, 40], [W / 2, 254], 20);
  fill(wd[1], WHITE, 14);
  var before = k.text("Today  ·  R12 480", 16, [W / 2, 260], WHITE, "SemiBold", ParagraphJustification.CENTER_JUSTIFY);
  var after = k.text("Today  ·  R12 759", 16, [W / 2, 260], hex("#bbf7d0"), "SemiBold", ParagraphJustification.CENTER_JUSTIFY);
  anim(T(before, "ADBE Opacity"), [[A(5.55), 100], [A(5.7), 0], [A(8.9), 0], [A(8.92), 100]], [33, 33]);
  anim(T(after, "ADBE Opacity"), [[A(5.55), 0], [A(5.7), 100], [A(8.9), 100], [A(8.92), 0]], [33, 33]);

  // notifications: the new one drops in on top, the others move down
  var SLOTS = [312, 420, 528, 636], NH = 96;
  function note(id, title, body, sub, when) {
    var n = nullAt(comp, "Note " + id, [W / 2, SLOTS[0]]);
    var parts = [];
    var card = k.piece("Note " + id + " Card");
    rect(card[1], [W - 32, NH], [0, 0], 22);
    fill(card[1], WHITE, 16);
    var icon = k.piece("Note " + id + " Icon");
    rect(icon[1], [40, 40], [-W / 2 + 52, -12], 10);
    fill(icon[1], ORANGE);
    var fl = group(contents(icon[0]), "Flame");
    ellipse(fl, [10, 16]).property("ADBE Vector Ellipse Position").setValue([-W / 2 + 52, -12]);
    fill(fl, hex("#fff7ed"));
    parts.push(card[0], icon[0]);
    parts.push(k.text(title, 14, [-W / 2 + 84, -22], hex("#d6d3d1"), "SemiBold"));
    parts.push(k.text(when, 13, [W / 2 - 34, -22], hex("#a8a29e"), "Medium", ParagraphJustification.RIGHT_JUSTIFY));
    parts.push(k.text(body, 17, [-W / 2 + 84, 4], WHITE, "SemiBold"));
    parts.push(k.text(sub, 14, [-W / 2 + 84, 26], hex("#d6d3d1"), "Medium"));
    parentTo(parts, n);
    return [n, parts];
  }
  var N2 = note("1040", "Ember Candle Co.", "New order #1040 · R747", "Paid by card · 3 items", "1h ago");
  var N1 = note("1041", "Ember Candle Co.", "New order #1041 · R498", "Paid by card · 2 items", "12m ago");
  var N0 = note("1042", "Ember Candle Co.", "New order #1042 · R279", "Paid by card · 1 item", "now");
  var n0 = N0[0], n1 = N1[0], n2 = N2[0], px = W / 2, ARR = A(5.3), MV = 0.45;
  function moves(n, a, b) {
    var p = T(n, "ADBE Position");
    p.setValue([px, SLOTS[a]]);
    anim(p, [[ARR, [px, SLOTS[a]]], [ARR + MV, [px, SLOTS[b]]], [A(8.9), [px, SLOTS[b]]], [A(8.92), [px, SLOTS[a]]]],
      [[33, 85], [85, 33], [33, 33], [33, 33]]);
  }
  moves(n1, 0, 1);
  moves(n2, 1, 2);
  var p0 = T(n0, "ADBE Position");
  anim(p0, [[ARR, [px, SLOTS[0] - 36]], [ARR + MV, [px, SLOTS[0]]], [A(8.9), [px, SLOTS[0]]], [A(8.92), [px, SLOTS[0] - 36]]],
    [[33, 85], [85, 33], [33, 33], [33, 33]]);
  anim(T(n0, "ADBE Scale"), [[ARR, [90, 90]], [ARR + MV, [100, 100]]], [[33, 85], [85, 33]]);
  // the new card's own layers fade with it (a null has no opacity of its own in Lottie)
  for (i = 0; i < N0[1].length; i++) {
    anim(T(N0[1][i], "ADBE Opacity"), [[ARR, 0], [ARR + 0.25, 100], [A(8.9), 100], [A(8.92), 0]], [33, 33]);
  }

  // asleep (dark) except: the intro, and from the sale until just before the loop ends
  var dark = k.piece("Screen Off");
  rect(dark[1], [W + 4, H + 4], [W / 2, H / 2]);
  fill(dark[1], hex("#050308"));
  anim(T(dark[0], "ADBE Opacity"), [[0, 100], [0.6, 0], [3.3, 0], [3.9, 100], [A(5.0), 100], [A(5.25), 0], [A(8.3), 0], [A(8.85), 100]],
    [[33, 33], [60, 33], [33, 33], [60, 33], [33, 33], [60, 33], [33, 33], [60, 33]]);
  return comp;
}

// ============================ the scene ============================
function build(o, screens) {
  var comp = sceneComp(o.name, o.w, o.h), k = sceneKit(comp), i;
  k.background({
    grid: 0, c1: "#ea580c", c2: "#7c3aed",
    a1: [[o.w * 0.15, o.h * 0.78], 760, [o.w * 0.28, o.h * 0.62]],
    a2: [[o.w * 0.85, o.h * 0.2], 700, [o.w * 0.72, o.h * 0.3]]
  });
  function rise(layers, t0) {
    for (var p = 0; p < layers.length; p++) {
      var pp = T(layers[p], "ADBE Position"), v = pp.value;
      anim(pp, [[t0, [v[0], v[1] + 70]], [t0 + 0.7, v]], [[33, 85], [85, 33]]);
      anim(T(layers[p], "ADBE Opacity"), [[t0, 0], [t0 + 0.4, 100]], [33, 33]);
    }
  }
  // laptop
  var L = o.laptop, ls = o.laptopScale / 100, sw = 1280 * ls, sh = 800 * ls;
  var glow = k.blob("Laptop Glow", L, sw * 0.7, [[0, "#ea580c", 0.25], [0.6, "#7c3aed", 0.08], [1, "#7c3aed", 0]]);
  k.fade(glow, 0.3, 1.3);
  var lid = k.piece("Laptop Lid");
  rect(lid[1], [sw + 28, sh + 28], L, 18);
  fill(lid[1], BEZEL);
  stroke(lid[1], BEZEL_LINE, 3);
  var scr = comp.layers.add(screens.laptop);
  scr.name = "Laptop Screen";
  T(scr, "ADBE Position").setValue(L);
  T(scr, "ADBE Scale").setValue([o.laptopScale, o.laptopScale]);
  var base = k.piece("Laptop Base");
  rect(base[1], [sw * 1.18, 16], [L[0], L[1] + sh / 2 + 22], 8);
  fill(base[1], hex("#2a2540"));
  var notch = group(contents(base[0]), "Notch");
  rect(notch, [120, 6], [L[0], L[1] + sh / 2 + 17], 3);
  fill(notch, hex("#3f3a56"));
  rise([lid[0], scr, base[0]], 0.1);
  // phone, beside the laptop (in Tall it sits below the laptop's corner, clear of the cart drawer)
  var P = o.phone, ps = o.phoneScale / 100, pw = 400 * ps, ph = 860 * ps;
  var shadow = k.piece("Phone Shadow");
  rect(shadow[1], [pw + 30, ph + 40], [P[0] + 10, P[1] + 16], 40 * ps / 0.56);
  fill(shadow[1], hex("#000000"), 35);
  var pb = k.piece("Phone Bezel");
  rect(pb[1], [pw + 22, ph + 30], P, 38 * ps / 0.56);
  fill(pb[1], BEZEL);
  stroke(pb[1], BEZEL_LINE, 3);
  var pscr = comp.layers.add(screens.phone);
  pscr.name = "Phone Screen";
  T(pscr, "ADBE Position").setValue(P);
  T(pscr, "ADBE Scale").setValue([o.phoneScale, o.phoneScale]);
  var pn = k.piece("Phone Notch");
  rect(pn[1], [pw * 0.3, 16 * ps / 0.56], [P[0], P[1] - ph / 2 + 16 * ps / 0.56], 8);
  fill(pn[1], BEZEL);
  rise([shadow[0], pb[0], pscr, pn[0]], 0.45);

  // chips naming the moment
  var sizes = [], total = 0, gap = 14, cs = o.chipSize;
  for (i = 0; i < CHIPS.length; i++) { sizes.push(CHIPS[i][0].length * cs * 0.56 + 44); total += sizes[i]; }
  total += gap * (CHIPS.length - 1);
  var x = o.chips[0] - total / 2;
  for (i = 0; i < CHIPS.length; i++) {
    var c = [x + sizes[i] / 2, o.chips[1]];
    var cb = k.piece("Chip " + (i + 1));
    rect(cb[1], [sizes[i], cs * 2.1], c, cs * 1.05);
    stroke(cb[1], BEZEL_LINE, 2);
    fill(cb[1], BEZEL, 70);
    k.rise(cb[0], 1.4 + i * 0.1, 12);
    var on = k.piece("Chip " + (i + 1) + " On");
    rect(on[1], [sizes[i], cs * 2.1], c, cs * 1.05);
    fill(on[1], ORANGE, 22);
    stroke(on[1], ORANGE, 2);
    k.windows(T(on[0], "ADBE Opacity"), [[A(CHIPS[i][1]), A(CHIPS[i][2])]], 0.15);
    k.rise(k.text(CHIPS[i][0], cs, [c[0], c[1] + cs * 0.36], WHITE, "SemiBold", ParagraphJustification.CENTER_JUSTIFY), 1.45 + i * 0.1, 12);
    x += sizes[i] + gap;
  }
  return comp.name + " (" + comp.numLayers + " layers)";
}

var screens = { laptop: buildLaptop(), phone: buildPhone() };
var built = [
  build({ name: "E-commerce Wide", w: 1920, h: 1080, laptop: [770, 352], laptopScale: 62, phone: [1330, 430], phoneScale: 56,
          chips: [770, 714], chipSize: 19 }, screens),
  build({ name: "E-commerce Tall", w: 1080, h: 1920, laptop: [540, 452], laptopScale: 62, phone: [540, 945], phoneScale: 46,
          chips: [540, 1192], chipSize: 20 }, screens)
];
"built " + built.join(", ");
