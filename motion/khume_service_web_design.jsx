// Web Design: a website designed live. A browser window builds its wireframe, Lighthouse-style
// scores count up, then (loop) a cursor selects the headline, recolours the button and drags the
// window from desktop to tablet to phone and back while the layout reflows on a column grid.
//
// Build: motion/build_services.sh web-design   (BRIDGE=9877 to build in the live app)
// Comps: "Web Design Wide" 1920x1080, "Web Design Tall" 1080x1920
// The bottom ~30% of each comp stays clear: the page puts the service's title and text there.

#include "scene_kit.jsx"

var SEL = hex("#38bdf8");        // design-tool selection blue
var PINK = hex("#f472b6"), GREEN = hex("#4ade80");
var WIN_FILL = hex("#120e1f"), WIN_LINE = hex("#3f3a56"), DIM = hex("#2a2540");

function build(o) {
  var comp = sceneComp(o.name, o.w, o.h), k = sceneKit(comp);
  var cx = o.cx, cy = o.cy, HW = o.winH;
  var BPS = { d: { w: o.widths.d, f: 1280 / o.widths.d, cols: 12, g: 16, p: 40 },
              t: { w: o.widths.t, f: 768 / o.widths.t, cols: 8, g: 14, p: 28 },
              p: { w: o.widths.p, f: 390 / o.widths.p, cols: 4, g: 10, p: 18 } };

  // ---------- responsive layout: every element's rect [cx, cy, w, h] at a breakpoint ----------
  function layout(bpName) {
    var bp = BPS[bpName], w = bp.w, p = bp.p, x0 = cx - w / 2, y0 = cy - HW / 2, L = {}, i;
    var phone = bpName === "p";
    L.win = [cx, cy, w, HW];
    L.sep = [cx, y0 + 44, w, 2];
    for (i = 0; i < 3; i++) L["dot" + i] = [x0 + 24 + i * 20, y0 + 22];
    L.url = [(x0 + 92 + x0 + w - 20) / 2, y0 + 22, w - 112, 24];
    L.urlText = [x0 + 106, y0 + 27];
    var navY = y0 + 44 + 30;
    L.logo = [x0 + p + 30, navY, 60, 14];
    for (i = 0; i < 3; i++) {
      L["link" + i] = phone ? [x0 + w - p - 12, navY, 0, 8] : [x0 + w - p - 25 - (2 - i) * 66, navY, 50, 8];
      L["burger" + i] = [x0 + w - p - 12, navY - 7 + i * 7, phone ? 24 : 0, 3];
    }
    L.linksOp = phone ? 0 : 100;
    L.burgerOp = phone ? 100 : 0;
    var hy, colW, gap = 28;
    if (!phone) {
      hy = navY + 36;
      colW = (w - 2 * p - gap) / 2;
      var hw = [0.95, 0.7, 0.85], hh = [22, 22, 10], ho = [11, 43, 75];
      for (i = 0; i < 3; i++) L["head" + i] = [x0 + p + colW * hw[i] / 2, hy + ho[i], colW * hw[i], hh[i]];
      L.btn = [x0 + p + 65, hy + 112, 130, 34];
      L.img = [x0 + p + colW + gap + colW / 2, hy + 70, colW, 150];
      var ct = hy + 170, ch = (y0 + HW - p) - ct, cw = (w - 2 * p - 2 * gap) / 3;
      for (i = 0; i < 3; i++) L["card" + i] = [x0 + p + cw / 2 + i * (cw + gap), ct + ch / 2, cw, ch];
      L.headBox = [x0 + p + colW * 0.95 / 2, hy + 40, colW * 0.95, 80];
    } else {
      hy = navY + 30;
      colW = w - 2 * p;
      var pw = [0.95, 0.7, 0.85], ph = [18, 18, 9], po = [10, 38, 64];
      for (i = 0; i < 3; i++) L["head" + i] = [x0 + p + colW * pw[i] / 2, hy + po[i], colW * pw[i], ph[i]];
      L.btn = [x0 + p + 55, hy + 98, 110, 30];
      L.img = [cx, hy + 178, colW, 110];
      var top = hy + 250, avail = (y0 + HW - p) - top, rh = (avail - 20) / 3;
      for (i = 0; i < 3; i++) L["card" + i] = [cx, top + rh / 2 + i * (rh + 10), colW, rh];
      L.headBox = [x0 + p + colW * 0.95 / 2, hy + 35, colW * 0.95, 70];
    }
    L.icon = [L.img[0], L.img[1]];
    // layout grid: unused columns collapse to nothing at the right edge
    var n = bp.cols, g = bp.g, cwid = (w - 2 * p - (n - 1) * g) / n;
    for (i = 0; i < 12; i++) {
      L["col" + i] = i < n ? [x0 + p + cwid / 2 + i * (cwid + g), y0 + 44 + (HW - 44) / 2, cwid, HW - 44]
                           : [x0 + w - p, y0 + 44 + (HW - 44) / 2, 0, HW - 44];
    }
    L.edge = [x0 + w, cy];
    return L;
  }
  var LD = layout("d"), LT = layout("t"), LP = layout("p");
  var LAYOUT_KEYS = [[A(3.3), LD], [A(4.0), LT], [A(4.2), LT], [A(4.9), LP], [A(6.4), LP], [A(7.2), LD]];

  // keys a property from the layout timeline: get(L) -> value
  // delay: seconds this element lags the others (staggers a reflow)
  function follow(prop, get, delay) {
    var keys = [];
    for (var i = 0; i < LAYOUT_KEYS.length; i++) keys.push([LAYOUT_KEYS[i][0] + (delay || 0), get(LAYOUT_KEYS[i][1])]);
    anim(prop, keys, [50, 50]);
  }
  function followRect(r, name, delay) {
    follow(r.property("ADBE Vector Rect Size"), function (L) { return [L[name][2], L[name][3]]; }, delay);
    follow(r.property("ADBE Vector Rect Position"), function (L) { return [L[name][0], L[name][1]]; }, delay);
  }
  // a rect element that reflows; returns [layer, group, rect]
  function el(name, key, color, opacity, round, delay) {
    var lg = k.piece(name), d = LD[key];
    var r = rect(lg[1], [d[2], d[3]], [d[0], d[1]], round || 0);
    if (color) fill(lg[1], color, opacity);
    followRect(r, key, delay);
    pivot(lg[1], [d[0], d[1]]);
    return [lg[0], lg[1], r];
  }

  // ---------- background ----------
  k.background({
    grid: 60, c1: "#7c3aed", c2: "#0ea5e9",
    a1: [[cx - 520 * o.u, cy + 300 * o.u], 820 * o.u, [cx - 300 * o.u, cy + 200 * o.u]],
    a2: [[cx + 700 * o.u, cy - 320 * o.u], 700 * o.u, [cx + 520 * o.u, cy - 180 * o.u]]
  });

  // ---------- layout grid overlay (shown while the window is resized) ----------
  var cols = k.piece("Layout Grid");
  for (var i = 0; i < 12; i++) {
    var cg = group(contents(cols[0]), "Col " + (i + 1));
    var cr = rect(cg, [LD["col" + i][2], LD["col" + i][3]], [LD["col" + i][0], LD["col" + i][1]]);
    fill(cg, PINK, 100);
    followRect(cr, "col" + i);
  }
  cols[1].remove();   // only the named groups are needed
  k.windows(T(cols[0], "ADBE Opacity"), [[A(3.1), A(7.35)]], 0.25, 22);

  // ---------- browser window ----------
  var wf = el("Window Fill", "win", WIN_FILL, 92, 18);
  k.fade(wf[0], 0.3, 0.9, 100);
  var wl = k.piece("Window Frame");
  var wr = rect(wl[1], [LD.win[2], LD.win[3]], [LD.win[0], LD.win[1]], 18);
  stroke(wl[1], WIN_LINE, 3);
  followRect(wr, "win");
  drawOn(wl[1], 0.1, 0.9);
  var sep = el("Chrome Line", "sep", WIN_LINE, 100);
  anim(xf(sep[1]).property("ADBE Vector Scale"), [[0.5, [0, 100]], [0.9, [100, 100]]], [[33, 85], [85, 33]]);
  var dotCols = [hex("#f87171"), hex("#fbbf24"), hex("#4ade80")];
  for (i = 0; i < 3; i++) {
    var dl = k.piece("Chrome Dot " + (i + 1));
    var de = ellipse(dl[1], [11, 11]);
    de.property("ADBE Vector Ellipse Position").setValue(LD["dot" + i]);
    (function (n) { follow(de.property("ADBE Vector Ellipse Position"), function (L) { return L["dot" + n]; }); })(i);
    fill(dl[1], dotCols[i], 85);
    pivot(dl[1], LD["dot" + i]);
    pop(dl[1], 0.7 + i * 0.08, 0.35, 140);
  }
  var url = el("URL Bar", "url", DIM, 100, 12);
  pop(url[1], 0.8, 0.4, 106);
  var ut = k.text("khume.co.za", 15, LD.urlText, MUTED, "Medium");
  follow(T(ut, "ADBE Position"), function (L) { return L.urlText; });
  k.fade(ut, 1.0, 1.4);

  // ---------- page wireframe ----------
  var logo = el("Site Logo", "logo", LILAC, 100, 4);
  pop(logo[1], 1.1, 0.35, 120);
  var links = k.piece("Nav Links"), burger = k.piece("Nav Burger");
  for (i = 0; i < 3; i++) {
    var lkg = group(contents(links[0]), "Link " + (i + 1));
    var lr = rect(lkg, [LD["link" + i][2], LD["link" + i][3]], [LD["link" + i][0], LD["link" + i][1]], 4);
    fill(lkg, MUTED, 80);
    followRect(lr, "link" + i);
    var bg = group(contents(burger[0]), "Line " + (i + 1));
    var br = rect(bg, [LD["burger" + i][2], LD["burger" + i][3]], [LD["burger" + i][0], LD["burger" + i][1]], 2);
    fill(bg, WHITE, 85);
    followRect(br, "burger" + i);
  }
  links[1].remove();   // only the named groups are needed
  anim(T(links[0], "ADBE Opacity"), [[1.15, 0], [1.4, 100], [A(4.5), 100], [A(4.8), 0], [A(6.5), 0], [A(6.9), 100]], [33, 33]);
  anim(T(burger[0], "ADBE Opacity"), [[A(4.6), 0], [A(4.9), 100], [A(6.4), 100], [A(6.7), 0]], [33, 33]);

  var heads = [];
  for (i = 0; i < 3; i++) {
    var hd = el("Headline " + (i + 1), "head" + i, i < 2 ? WHITE : MUTED, i < 2 ? 92 : 70, i < 2 ? 5 : 3);
    pivot(hd[1], [LD["head" + i][0] - LD["head" + i][2] / 2, LD["head" + i][1]]);
    anim(xf(hd[1]).property("ADBE Vector Scale"), [[1.3 + i * 0.1, [0, 100]], [1.75 + i * 0.1, [100, 100]]], [[33, 85], [85, 33]]);
    heads.push(hd);
  }
  var btn = el("Button", "btn", VIOLET, 100, 8);
  pop(btn[1], 1.75, 0.4, 118);
  var btnFill = vecs(btn[1]).property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color");
  anim(btnFill, [[A(2.55), VIOLET], [A(2.72), PINK], [A(7.2), PINK], [A(7.5), VIOLET]], [33, 33]);

  var img = el("Image", "img", LILAC, 20, 10);
  pivot(img[1], [LD.img[0], LD.img[1] + LD.img[3] / 2]);
  anim(xf(img[1]).property("ADBE Vector Scale"), [[1.55, [100, 0]], [1.95, [100, 100]]], [[33, 85], [85, 33]]);
  // a picture icon (sun over mountains) that rides the image's centre
  var ic = k.piece("Image Icon");
  var mount = group(contents(ic[0]), "Mountains");
  pathOf(mount, [[-34, 18], [-12, -8], [2, 8], [12, -2], [34, 18]]);
  fill(mount, LILAC, 75);
  var sun = group(contents(ic[0]), "Sun");
  var se = ellipse(sun, [14, 14]);
  se.property("ADBE Vector Ellipse Position").setValue([18, -16]);
  fill(sun, PALE, 90);
  follow(T(ic[0], "ADBE Position"), function (L) { return L.icon; });
  ic[1].remove();   // only the named groups are needed
  anim(T(ic[0], "ADBE Opacity"), [[1.9, 0], [2.2, 100], [A(4.2), 100], [A(4.55), 25], [A(4.9), 100],
    [A(6.4), 100], [A(6.8), 25], [A(7.2), 100]], [33, 33]);

  // row <-> stack: content crosses itself on the way, so it dims while it moves
  function reflowDim(l, lag) {
    anim(T(l, "ADBE Opacity"), [
      [A(4.2) + lag, 100], [A(4.55) + lag, 25], [A(4.9) + lag, 100],
      [A(6.4) + lag, 100], [A(6.8) + lag, 25], [A(7.2) + lag, 100]], [33, 33]);
  }
  reflowDim(img[0], 0);
  for (i = 0; i < 3; i++) {
    var lag = 0;   // a stagger lets cards poke out of the moving window, so they move together
    var cd = el("Card " + (i + 1), "card" + i, LILAC, 12, 10, lag);
    stroke(cd[1], LILAC, 2).property("ADBE Vector Stroke Opacity").setValue(45);
    pop(cd[1], 1.95 + i * 0.1, 0.4, 110);
    reflowDim(cd[0], lag);
  }

  // ---------- scores ----------
  var scores = [["98", "Performance"], ["100", "Accessibility"], ["100", "Best Practices"], ["100", "SEO"]];
  for (i = 0; i < 4; i++) {
    var gc = o.gauges[i], R = o.gaugeR;
    var tr = k.piece("Score Track " + (i + 1));
    var te = ellipse(tr[1], [R * 2, R * 2]);
    te.property("ADBE Vector Ellipse Position").setValue(gc);
    stroke(tr[1], DIM, 12);
    drawOn(tr[1], 1.1 + i * 0.1, 1.7 + i * 0.1);
    var ar = k.piece("Score Arc " + (i + 1));
    var ae = ellipse(ar[1], [R * 2, R * 2]);
    ae.property("ADBE Vector Ellipse Position").setValue(gc);
    stroke(ar[1], GREEN, 12, 2);
    var at = trim(ar[1]);
    anim(at.property("ADBE Vector Trim End"), [[1.7 + i * 0.12, 0], [3.1 + i * 0.12, parseInt(scores[i][0], 10)]], [[33, 60], [90, 33]]);
    k.odometer(scores[i][0], gc[0], gc[1] + R * 0.28, R * 0.72, WHITE, 1.7 + i * 0.12, 1.4);
    k.rise(k.text(scores[i][1], o.labelSize, [gc[0], gc[1] + R + o.labelSize + 10], MUTED, "SemiBold", ParagraphJustification.CENTER_JUSTIFY), 2.3 + i * 0.1, 12);
  }

  // ---------- design-tool overlay ----------
  // selection box: head block -> button -> (hidden) -> phone card -> (hidden) back to head block
  var selBox = function (L, key) { var r = L[key]; return [r[0], r[1], r[2] + 12, r[3] + 12]; };
  var SK = [[A(0.8), selBox(LD, "headBox")], [A(1.95), selBox(LD, "headBox")], [A(2.2), selBox(LD, "btn")],
            [A(3.0), selBox(LD, "btn")], [A(5.4), selBox(LP, "card0")], [A(6.3), selBox(LP, "card0")],
            [A(7.6), selBox(LD, "headBox")]];
  var sel = k.piece("Selection");
  var sr = rect(sel[1], [SK[0][1][2], SK[0][1][3]], [SK[0][1][0], SK[0][1][1]]);
  stroke(sel[1], SEL, 2);
  var sizeKeys = [], posKeys = [];
  for (i = 0; i < SK.length; i++) { sizeKeys.push([SK[i][0], [SK[i][1][2], SK[i][1][3]]]); posKeys.push([SK[i][0], [SK[i][1][0], SK[i][1][1]]]); }
  anim(sr.property("ADBE Vector Rect Size"), sizeKeys, [50, 50]);
  anim(sr.property("ADBE Vector Rect Position"), posKeys, [50, 50]);
  // corner handles
  var corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (i = 0; i < 4; i++) {
    var hg = group(contents(sel[0]), "Handle " + (i + 1));
    var hr = rect(hg, [10, 10], [0, 0]);
    fill(hg, WHITE);
    stroke(hg, SEL, 2);
    var hk = [];
    for (var j = 0; j < SK.length; j++) {
      var b = SK[j][1];
      hk.push([SK[j][0], [b[0] + corners[i][0] * b[2] / 2, b[1] + corners[i][1] * b[3] / 2]]);
    }
    anim(hr.property("ADBE Vector Rect Position"), hk, [50, 50]);
  }
  k.windows(T(sel[0], "ADBE Opacity"), [[A(0.82), A(2.9)], [A(5.45), A(6.15)]], 0.08);

  // size labels under the selection
  function sizeLabel(key, L, f, on, off) {
    var r = L[key], txt = Math.round(r[2] * f) + " × " + Math.round(r[3] * f);
    var at = [r[0], r[1] + r[3] / 2 + 30];
    var pl = k.piece("Size Pill " + txt);
    rect(pl[1], [txt.length * 10 + 22, 28], at, 6);
    fill(pl[1], SEL);
    var tl = k.text(txt, 16, [at[0], at[1] + 6], WHITE, "SemiBold", ParagraphJustification.CENTER_JUSTIFY);
    k.windows(T(pl[0], "ADBE Opacity"), [[on, off]], 0.08);
    k.windows(T(tl, "ADBE Opacity"), [[on, off]], 0.08);
  }
  sizeLabel("headBox", LD, BPS.d.f, A(0.85), A(1.95));
  sizeLabel("btn", LD, BPS.d.f, A(2.2), A(2.9));
  sizeLabel("card0", LP, BPS.p.f, A(5.5), A(6.15));

  // colour picker next to the button
  var pk = k.piece("Colour Picker");
  var pc = [LD.btn[0] + LD.btn[2] / 2 + 92, LD.btn[1]];
  rect(pk[1], [146, 38], pc, 19);
  fill(pk[1], hex("#1c1729"));
  stroke(pk[1], WIN_LINE, 2);
  var sw = [VIOLET, PINK, hex("#fbbf24"), GREEN], swPos = [];
  for (i = 0; i < 4; i++) {
    var sg = group(contents(pk[0]), "Swatch " + (i + 1));
    var sp = [pc[0] - 48 + i * 32, pc[1]];
    swPos.push(sp);
    var sE = ellipse(sg, [20, 20]);
    sE.property("ADBE Vector Ellipse Position").setValue(sp);
    fill(sg, sw[i]);
    if (i === 1) {
      var ring = stroke(sg, WHITE, 0);
      anim(ring.property("ADBE Vector Stroke Width"), [[A(2.5), 0], [A(2.6), 3]], [33, 33]);
    }
  }
  pivot(pk[1], [pc[0] - 73, pc[1]]);
  anim(xf(pk[1]).property("ADBE Vector Scale"), [[A(2.1), [80, 80]], [A(2.3), [100, 100]]], [[33, 80], [80, 33]]);
  k.windows(T(pk[0], "ADBE Opacity"), [[A(2.1), A(2.95)]], 0.12);

  // resize handle on the window's right edge, and the width readout above the window
  var eh = k.piece("Resize Handle");
  var ehr = rect(eh[1], [8, 46], LD.edge, 4);
  fill(eh[1], SEL);
  follow(ehr.property("ADBE Vector Rect Position"), function (L) { return L.edge; });
  k.windows(T(eh[0], "ADBE Opacity"), [[A(2.95), A(7.4)]], 0.15);
  var wlab = [cx, cy - HW / 2 - 34];
  var wp = k.piece("Width Pill");
  rect(wp[1], [104, 30], wlab, 15);
  fill(wp[1], hex("#1c1729"));
  stroke(wp[1], SEL, 2);
  k.windows(T(wp[0], "ADBE Opacity"), [[A(3.05), A(7.45)]], 0.15);
  // readouts cross-fade into each other, so the pill is never empty
  var widthTexts = [["1280px", [[A(3.05), A(3.7)], [A(6.95), A(7.45)]]], ["768px", [[A(3.6), A(4.6)]]], ["390px", [[A(4.5), A(7.05)]]]];
  for (i = 0; i < widthTexts.length; i++) {
    var wt = k.text(widthTexts[i][0], 17, [wlab[0], wlab[1] + 6], WHITE, "SemiBold", ParagraphJustification.CENTER_JUSTIFY);
    wt.name = "Width " + widthTexts[i][0];
    k.windows(T(wt, "ADBE Opacity"), widthTexts[i][1], 0.1);
  }

  // ---------- cursor ----------
  var cur = k.layer("Cursor");
  var cgp = group(contents(cur), "Arrow");
  pathOf(cgp, [[0, 0], [0, 26], [7, 20], [12, 31], [17, 29], [12, 18], [21, 18]]);
  fill(cgp, WHITE);
  stroke(cgp, BG, 2);
  T(cur, "ADBE Scale").setValue([140, 140]);
  var rest = [LD.card2[0] + 20, LD.card2[1] + 10];
  var headPt = [LD.head0[0] + LD.head0[2] * 0.15, LD.head0[1] + 4];
  var btnPt = [LD.btn[0] + 14, LD.btn[1] + 6];
  var cardPt = [LP.card0[0] + 40, LP.card0[1] + 4];
  var edge = function (L) { return [L.edge[0] + 2, L.edge[1] + 4]; };
  anim(T(cur, "ADBE Position"), [
    [3.0, [o.w + 60, rest[1] + 120]], [3.8, rest],
    [A(0.3), rest], [A(0.75), headPt], [A(1.5), headPt], [A(1.9), btnPt], [A(2.2), btnPt],
    [A(2.5), swPos[1]], [A(2.85), swPos[1]], [A(3.2), edge(LD)], [A(3.3), edge(LD)], [A(4.0), edge(LT)],
    [A(4.2), edge(LT)], [A(4.9), edge(LP)], [A(5.05), edge(LP)], [A(5.4), cardPt], [A(6.1), cardPt],
    [A(6.35), edge(LP)], [A(6.4), edge(LP)], [A(7.2), edge(LD)], [A(7.3), edge(LD)], [A(7.85), rest], [L1, rest]
  ], [50, 50]);
  var clicks = [A(0.8), A(1.95), A(2.55), A(3.25), A(5.45), A(6.37)], ck = [[0, [140, 140]]];
  for (i = 0; i < clicks.length; i++) ck.push([clicks[i], [140, 140]], [clicks[i] + 0.07, [118, 118]], [clicks[i] + 0.2, [140, 140]]);
  ck.push([L1, [140, 140]]);
  anim(T(cur, "ADBE Scale"), ck, [33, 33]);
  k.fade(cur, 3.0, 3.25);

  return comp.name + " (" + comp.numLayers + " layers)";
}

var built = [
  build({ name: "Web Design Wide", w: 1920, h: 1080, u: 1, cx: 720, cy: 420, winH: 560,
          widths: { d: 1000, t: 640, p: 330 }, gauges: [[1400, 290], [1640, 290], [1400, 560], [1640, 560]],
          gaugeR: 68, labelSize: 20 }),
  build({ name: "Web Design Tall", w: 1080, h: 1920, u: 1, cx: 540, cy: 530, winH: 560,
          widths: { d: 840, t: 600, p: 330 }, gauges: [[240, 960], [440, 960], [640, 960], [840, 960]],
          gaugeR: 58, labelSize: 19 })
];
"built " + built.join(", ");
