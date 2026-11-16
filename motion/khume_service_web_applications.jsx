// Web Applications: a business running on its own software, in sync across the team.
//   Laptop: "Fleetline", a delivery company's dispatch dashboard. KPI cards (one with a live
//   throughput line), a city map where three vans drive their routes, and a live activity feed.
//   Phone: the driver's app. The driver slides to deliver, the stop flips to the next one, and a
//   green dot carries the update to the dashboard, where it lands in the feed.
// Four feed events a loop, each pushing the feed down one slot: after four the feed shows the same
// four cards in the same order, so it loops seamlessly (every card exists twice: the copy leaving
// the bottom and the copy arriving at the top). Vans, the chart and pulses are periodic.
//
// Screens are comps of their own ("Web Applications Laptop Screen" 1280x800,
// "Web Applications Phone Screen" 400x860), cropped like real screens.
// Build: motion/build_services.sh web-applications   (BRIDGE=9877 to build in the live app)

#include "scene_kit.jsx"

LOOP = 9;
L1 = L0 + LOOP;

var APP_BG = hex("#0b1220"), PANEL = hex("#111a2e"), PANEL2 = hex("#16213a"), LINE = hex("#1e2a44");
var TXT = hex("#e2e8f0"), MUTE = hex("#94a3b8"), GREEN = hex("#4ade80"), BLUE = hex("#60a5fa"), AMBER = hex("#fbbf24");
var BEZEL = hex("#0f0c1a"), BEZEL_LINE = hex("#3f3a56");
var DELIVER = [0.4, 4.9];                  // the driver slides to deliver (loop time)
var EVENTS = [1.35, 3.2, 5.85, 7.4];        // feed events: Bree St delivered, booking, Jan Smuts delivered, invoice
var CHIPS = [["Driver app in sync", [[0, 2.6], [4.6, 6.8]]], ["Live dashboard", [[2.6, 4.6]]], ["Automated invoicing", [[6.8, LOOP]]]];

function nullAt(comp, name, pos) {
  var n = comp.layers.addNull();
  n.name = name;
  T(n, "ADBE Anchor Point").setValue([0, 0]);
  T(n, "ADBE Position").setValue(pos);
  return n;
}
function parentTo(layers, nul) { for (var i = 0; i < layers.length; i++) layers[i].setParentWithJump(nul); }
function quad(p0, pc, p1, u) {
  var a = 1 - u;
  return [a * a * p0[0] + 2 * a * u * pc[0] + u * u * p1[0], a * a * p0[1] + 2 * a * u * pc[1] + u * u * p1[1]];
}
// point at fraction u (0..1) along a closed polyline
function along(pts, u) {
  var segs = [], total = 0, i;
  for (i = 0; i < pts.length; i++) {
    var a = pts[i], b = pts[(i + 1) % pts.length], d = Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));
    segs.push(d);
    total += d;
  }
  var want = (u - Math.floor(u)) * total;
  for (i = 0; i < pts.length; i++) {
    if (want <= segs[i] || i === pts.length - 1) {
      var f = segs[i] ? want / segs[i] : 0, p = pts[i], q = pts[(i + 1) % pts.length];
      return [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
    }
    want -= segs[i];
  }
}
// a periodic pulse ring at p, firing at the given loop times (and once in the intro)
function pulseRing(k, name, p, r0, r1, color, times) {
  var l = k.piece(name);
  ellipse(l[1], [r0 * 2, r0 * 2]).property("ADBE Vector Ellipse Position").setValue(p);
  stroke(l[1], color, 3);
  pivot(l[1], p);
  var sk = [], ok = [];
  for (var i = 0; i < times.length; i++) {
    var t = times[i];
    sk.push([t, [100, 100]], [t + 1.2, [r1 / r0 * 100, r1 / r0 * 100]]);
    ok.push([t, 0], [t + 0.05, 70], [t + 1.2, 0]);
  }
  anim(xf(l[1]).property("ADBE Vector Scale"), sk, [40, 60]);
  anim(T(l[0], "ADBE Opacity"), ok, [33, 33]);
  return l[0];
}

// ============================ laptop: the dispatch dashboard ============================
function buildLaptop() {
  var W = 1280, H = 800, comp = sceneComp("Web Applications Laptop Screen", W, H), k = sceneKit(comp), i, j;
  var bg = k.piece("App Background");
  rect(bg[1], [W + 4, H + 4], [W / 2, H / 2]);
  fill(bg[1], APP_BG);

  // sidebar
  var side = k.piece("Sidebar");
  rect(side[1], [76, H + 4], [38, H / 2]);
  fill(side[1], PANEL);
  var logo = k.piece("App Logo");
  rect(logo[1], [36, 36], [38, 38], 10);
  fill(logo[1], GREEN);
  var lg = group(contents(logo[0]), "Mark");
  pathOf(lg, [[28, 44], [38, 30], [48, 44]], false);
  stroke(lg, APP_BG, 4, 2);
  var navs = [];
  for (i = 0; i < 5; i++) {
    var nv = k.piece("Nav " + (i + 1));
    rect(nv[1], [36, 36], [38, 112 + i * 56], 10);
    fill(nv[1], i === 0 ? GREEN : LINE, i === 0 ? 22 : 100);
    var dot = group(contents(nv[0]), "Glyph");
    rect(dot, [14, 14], [38, 112 + i * 56], 3);
    fill(dot, i === 0 ? GREEN : MUTE, i === 0 ? 100 : 60);
    navs.push(nv[0]);
  }
  var chrome = [side[0], logo[0]].concat(navs);

  // top bar
  chrome.push(k.text("Dispatch", 24, [100, 42], TXT, "Bold"));
  var live = k.piece("Live Pill");
  rect(live[1], [78, 30], [252, 34], 15);
  fill(live[1], GREEN, 14);
  chrome.push(live[0]);
  var ld = k.piece("Live Dot");
  ellipse(ld[1], [9, 9]).property("ADBE Vector Ellipse Position").setValue([228, 34]);
  fill(ld[1], GREEN);
  var lk = [];
  for (var t = 0; t <= L1 + 0.001; t += 0.5) lk.push([t, (Math.round(t * 2) % 2) ? 25 : 100]);
  anim(T(ld[0], "ADBE Opacity"), lk, [33, 33]);
  chrome.push(k.text("Live", 14, [242, 39], GREEN, "SemiBold"));
  var srch = k.piece("Search");
  rect(srch[1], [300, 38], [760, 34], 19);
  fill(srch[1], PANEL);
  chrome.push(srch[0], k.text("Search orders, drivers…", 14, [632, 39], MUTE, "Medium"));
  var avc = [hex("#f472b6"), hex("#60a5fa"), hex("#fbbf24")];
  for (i = 0; i < 3; i++) {
    var av = k.piece("Teammate " + (i + 1));
    ellipse(av[1], [32, 32]).property("ADBE Vector Ellipse Position").setValue([1160 + i * 22, 34]);
    fill(av[1], avc[i]);
    stroke(av[1], APP_BG, 3);
    chrome.push(av[0]);
  }
  for (i = 0; i < chrome.length; i++) k.fade(chrome[i], 0.4, 0.8);

  // KPI cards
  var kpis = [["Deliveries today", "148"], ["On time", "98%"], ["Active vans", "12"], ["Revenue today", "R46 200"]];
  var KX = 100, KW = 272, KG = 14, KY = 130, kpiCards = [];
  for (i = 0; i < 4; i++) {
    var kc = [KX + KW / 2 + i * (KW + KG), KY];
    var card = k.piece("KPI " + (i + 1));
    rect(card[1], [KW, 92], kc, 14);
    fill(card[1], PANEL);
    var lab = k.text(kpis[i][0], 14, [kc[0] - KW / 2 + 20, KY - 14], MUTE, "Medium");
    var val = k.text(kpis[i][1], 30, [kc[0] - KW / 2 + 20, KY + 26], TXT, "Bold");
    var flash = k.piece("KPI " + (i + 1) + " Flash");
    rect(flash[1], [KW, 92], kc, 14);
    stroke(flash[1], GREEN, 2);
    fill(flash[1], GREEN, 6);
    kpiCards.push(flash[0]);
    var pop0 = 0.7 + i * 0.08;
    k.rise(card[0], pop0, 14);
    k.rise(lab, pop0 + 0.05, 14);
    k.rise(val, pop0 + 0.1, 14);
  }
  // flashes: deliveries on each delivery, revenue on the invoice
  k.windows(T(kpiCards[0], "ADBE Opacity"), [[A(EVENTS[0]), A(EVENTS[0] + 0.9)], [A(EVENTS[2]), A(EVENTS[2] + 0.9)]], 0.2);
  k.windows(T(kpiCards[3], "ADBE Opacity"), [[A(EVENTS[3]), A(EVENTS[3] + 0.9)]], 0.2);
  for (i = 1; i <= 2; i++) T(kpiCards[i], "ADBE Opacity").setValue(0);
  // a live throughput line in the first card, scrolling one period a loop
  var SX = KX + KW - 130, SY = KY + 6, SW = 110, PER = SW, wave = [];
  for (i = 0; i <= 72; i++) {
    var xx = i / 24 * PER, ph = i / 24 * Math.PI * 2;
    wave.push([SX - PER + xx, SY + Math.sin(ph) * 9 + Math.sin(ph * 2 + 1) * 5]);
  }
  var sp = k.piece("Throughput");
  curve(sp[1], wave);
  stroke(sp[1], GREEN, 3, 2);
  lin(T(sp[0], "ADBE Position"), [[0, [PER * L0 / LOOP, 0]], [L1, [-PER, 0]]]);
  var spm = k.piece("Throughput Window");
  rect(spm[1], [SW, 50], [SX + SW / 2, SY]);
  fill(spm[1], WHITE);
  spm[0].moveBefore(sp[0]);
  sp[0].setTrackMatte(spm[0], TrackMatteType.ALPHA);
  k.fade(sp[0], 1.0, 1.4);

  // ---------- the map ----------
  var MX0 = 100, MY0 = 196, MW = 760, MH = 584;
  var map = k.piece("Map");
  rect(map[1], [MW, MH], [MX0 + MW / 2, MY0 + MH / 2], 16);
  fill(map[1], hex("#0f172a"));
  var river = k.piece("River");
  curve(river[1], [[MX0, MY0 + 360], [MX0 + 200, MY0 + 300], [MX0 + 420, MY0 + 400], [MX0 + 760, MY0 + 330]]);
  stroke(river[1], BLUE, 22, 2).property("ADBE Vector Stroke Opacity").setValue(14);
  var roads = k.piece("Roads");
  var rl = [[[MX0, MY0 + 120], [MX0 + MW, MY0 + 90]], [[MX0, MY0 + 470], [MX0 + MW, MY0 + 500]], [[MX0 + 230, MY0], [MX0 + 260, MY0 + MH]],
            [[MX0 + 520, MY0], [MX0 + 490, MY0 + MH]], [[MX0, MY0 + 240], [MX0 + MW, MY0 + 560]]];
  for (i = 0; i < rl.length; i++) {
    var rg = group(contents(roads[0]), "Road " + (i + 1));
    curve(rg, rl[i]);
    stroke(rg, LINE, 10, 2);
  }
  roads[1].remove();
  var mapParts = [map[0], river[0], roads[0]];
  var places = [["CBD", [MX0 + 60, MY0 + 40]], ["Rosebank", [MX0 + 570, MY0 + 40]], ["Sandton", [MX0 + 600, MY0 + 560]]];
  for (i = 0; i < places.length; i++) mapParts.push(k.text(places[i][0], 13, places[i][1], MUTE, "SemiBold"));
  for (i = 0; i < mapParts.length; i++) k.fade(mapParts[i], 0.9, 1.4);
  // routes and vans (one lap a loop, phase-locked so L0 and L1 match)
  var routes = [
    [GREEN, [[180, 300], [520, 280], [560, 460], [300, 520], [160, 430]], 0.0],
    [BLUE, [[420, 620], [760, 600], [800, 720], [460, 740]], 0.35],
    [AMBER, [[620, 260], [820, 330], [780, 480], [600, 420]], 0.7]];
  for (i = 0; i < routes.length; i++) {
    var rp = routes[i][1], rgl = k.piece("Route " + (i + 1));
    curve(rgl[1], rp, null, null, true);
    var rs = stroke(rgl[1], routes[i][0], 3, 2);
    rs.property("ADBE Vector Stroke Opacity").setValue(45);
    var dd = rs.property("ADBE Vector Stroke Dashes");
    dd.addProperty("ADBE Vector Stroke Dash 1").setValue(10);
    dd.addProperty("ADBE Vector Stroke Gap 1").setValue(10);
    drawOn(rgl[1], 1.2 + i * 0.15, 2.0 + i * 0.15);
    var van = k.layer("Van " + (i + 1), rp[0]);
    var vg = group(contents(van), "Marker");
    ellipse(vg, [20, 20]);
    fill(vg, routes[i][0]);
    stroke(vg, WHITE, 3);
    var halo = group(contents(van), "Halo");
    ellipse(halo, [38, 38]);
    fill(halo, routes[i][0], 22);
    var vk = [];
    for (t = 0; t <= L1 + 0.001; t += 0.25) vk.push([t, along(rp, routes[i][2] + (t - L0) / LOOP)]);
    lin(T(van, "ADBE Position"), vk);
    k.fade(van, 1.8, 2.1);
  }
  // depot and a new booking pin (pops with the booking, gone before the loop ends)
  var depot = k.piece("Depot");
  rect(depot[1], [26, 26], [300, 640], 6);
  fill(depot[1], TXT);
  k.fade(depot[0], 1.4, 1.7);
  pulseRing(k, "Depot Pulse", [300, 640], 16, 46, TXT, [2.0, A(0), A(4.5)]);
  var BP = [700, 300], pin = k.piece("Booking Pin");
  ellipse(pin[1], [26, 26]).property("ADBE Vector Ellipse Position").setValue([BP[0], BP[1] - 24]);
  pathOf(pin[1], [[BP[0] - 11, BP[1] - 18], [BP[0], BP[1]], [BP[0] + 11, BP[1] - 18]]);
  fill(pin[1], BLUE);
  pivot(pin[1], BP);
  anim(xf(pin[1]).property("ADBE Vector Scale"), [[A(EVENTS[1]), [0, 0]], [A(EVENTS[1] + 0.25), [120, 120]], [A(EVENTS[1] + 0.4), [100, 100]],
    [A(8.4), [100, 100]], [A(8.7), [0, 0]]], [33, 33]);
  pulseRing(k, "Booking Pulse", [BP[0], BP[1] - 24], 14, 44, BLUE, [A(EVENTS[1]), A(EVENTS[1] + 1.3)]);

  // ---------- live activity feed ----------
  var FX0 = 876, FW = 374, FC = FX0 + FW / 2;
  var fp = k.piece("Feed Panel");
  rect(fp[1], [FW, MH], [FC, MY0 + MH / 2], 16);
  fill(fp[1], PANEL);
  var ft = k.text("Live activity", 17, [FX0 + 22, MY0 + 36], TXT, "Bold");
  var fdot = k.piece("Feed Dot");
  ellipse(fdot[1], [9, 9]).property("ADBE Vector Ellipse Position").setValue([FX0 + FW - 28, MY0 + 30]);
  fill(fdot[1], GREEN);
  anim(T(fdot[0], "ADBE Opacity"), lk, [33, 33]);
  var fparts = [fp[0], ft];
  for (i = 0; i < fparts.length; i++) k.fade(fparts[i], 0.9, 1.3);
  var SLOT = [MY0 + 112, MY0 + 216, MY0 + 320, MY0 + 424];
  var TEMPLATES = [
    ["check", GREEN, "Delivered", "14 Bree St · Sipho M."],
    ["plus", BLUE, "New booking", "Rosebank · 14:30 pickup"],
    ["check", GREEN, "Delivered", "8 Jan Smuts Ave · Sipho M."],
    ["rand", AMBER, "Invoice #318 paid", "R4 200 · Mokoena Trading"]];
  function feedCard(name, tp) {
    var n = nullAt(comp, name, [FC, SLOT[0]]), parts = [];
    var cb = k.piece(name + " Card");
    rect(cb[1], [FW - 32, 92], [0, 0], 14);
    fill(cb[1], PANEL2);
    var ic = k.piece(name + " Icon");
    ellipse(ic[1], [42, 42]).property("ADBE Vector Ellipse Position").setValue([-FW / 2 + 54, 0]);
    fill(ic[1], tp[1], 20);
    var gl = k.piece(name + " Glyph");
    var cx = -FW / 2 + 54;
    if (tp[0] === "check") curve(gl[1], [[cx - 8, 0], [cx - 2, 7], [cx + 9, -7]]);
    else if (tp[0] === "plus") { curve(gl[1], [[cx - 8, 0], [cx + 8, 0]]); curve(gl[1], [[cx, -8], [cx, 8]]); }
    var gs = stroke(gl[1], tp[1], 3.5, 2);
    gs.property("ADBE Vector Stroke Line Join").setValue(2);
    parts.push(cb[0], ic[0], gl[0]);
    if (tp[0] === "rand") parts.push(k.text("R", 19, [cx, 7], tp[1], "Bold", ParagraphJustification.CENTER_JUSTIFY));
    parts.push(k.text(tp[2], 16, [-FW / 2 + 86, -5], TXT, "SemiBold"));
    parts.push(k.text(tp[3], 13.5, [-FW / 2 + 86, 18], MUTE, "Medium"));
    parentTo(parts, n);
    return [n, parts];
  }
  var MOVE = 0.35;
  function fadeParts(parts, keys) { for (var p = 0; p < parts.length; p++) anim(T(parts[p], "ADBE Opacity"), keys, [33, 33]); }
  for (i = 0; i < TEMPLATES.length; i++) {
    // the copy from the last loop: in its slot at L0, moved down by the events before its own, leaves at its own
    var old = feedCard("Feed Old " + (i + 1), TEMPLATES[i]), slot = TEMPLATES.length - 1 - i;
    var ok = [[L0, [FC, SLOT[slot]]]];
    for (j = 0; j < i; j++) { ok.push([A(EVENTS[j]), [FC, SLOT[slot]]], [A(EVENTS[j]) + MOVE, [FC, SLOT[slot + 1]]]); slot++; }
    ok.push([A(EVENTS[i]), [FC, SLOT[3]]], [A(EVENTS[i]) + MOVE, [FC, SLOT[3] + 70]]);
    T(old[0], "ADBE Position").setValue(ok[0][1]);
    anim(T(old[0], "ADBE Position"), ok, [40, 70]);
    fadeParts(old[1], [[1.5 + i * 0.08, 0], [1.8 + i * 0.08, 100], [A(EVENTS[i]), 100], [A(EVENTS[i]) + 0.3, 0]]);
    // this loop's copy: arrives on top at its event, moved down by the later ones
    var nw = feedCard("Feed New " + (i + 1), TEMPLATES[i]);
    var nk = [[A(EVENTS[i]), [FC, SLOT[0] - 30]], [A(EVENTS[i]) + MOVE, [FC, SLOT[0]]]];
    slot = 0;
    for (j = i + 1; j < TEMPLATES.length; j++) { nk.push([A(EVENTS[j]), [FC, SLOT[slot]]], [A(EVENTS[j]) + MOVE, [FC, SLOT[slot + 1]]]); slot++; }
    T(nw[0], "ADBE Position").setValue(nk[0][1]);
    anim(T(nw[0], "ADBE Position"), nk, [40, 70]);
    fadeParts(nw[1], [[0, 0], [A(EVENTS[i]), 0], [A(EVENTS[i]) + 0.25, 100]]);
  }
  // a fade at the panel's foot, so cards slide away under it
  var foot = k.piece("Feed Foot");
  rect(foot[1], [FW, 110], [FC, MY0 + MH - 55], 16);
  fill(foot[1], PANEL);
  k.fade(foot[0], 0.9, 1.3);
  return comp;
}

// ============================ phone: the driver's app ============================
var STOPS = [["14 Bree St", "CBD · 2 parcels"], ["8 Jan Smuts Ave", "Rosebank · 1 parcel"]];
function buildPhone() {
  var W = 400, H = 860, comp = sceneComp("Web Applications Phone Screen", W, H), k = sceneKit(comp), i;
  var bg = k.piece("Background");
  rect(bg[1], [W + 4, H + 4], [W / 2, H / 2]);
  fill(bg[1], APP_BG);
  var head = [k.text("09:41", 15, [28, 36], TXT, "SemiBold"), k.text("Today", 32, [24, 108], TXT, "Bold"),
              k.text("Route 12  ·  Sipho M.", 15, [24, 136], MUTE, "Medium")];
  var av = k.piece("Driver");
  ellipse(av[1], [44, 44]).property("ADBE Vector Ellipse Position").setValue([350, 100]);
  fill(av[1], GREEN, 25);
  head.push(av[0], k.text("SM", 14, [350, 105], GREEN, "Bold", ParagraphJustification.CENTER_JUSTIFY));
  for (i = 0; i < head.length; i++) k.fade(head[i], 0.5, 0.9);

  // map snippet with the route to the next stop
  var mc = k.piece("Map Card");
  rect(mc[1], [352, 260], [W / 2, 300], 20);
  fill(mc[1], hex("#0f172a"));
  var rd = k.piece("Map Roads");
  var rr = [[[24, 230], [376, 210]], [[24, 360], [376, 380]], [[140, 170], [160, 430]], [[300, 170], [270, 430]]];
  for (i = 0; i < rr.length; i++) { var g = group(contents(rd[0]), "Road " + i); curve(g, rr[i]); stroke(g, LINE, 9, 2); }
  rd[1].remove();
  var me = [110, 380], pins = [[300, 222], [262, 318]];
  var mapParts = [mc[0], rd[0]];
  for (i = 0; i < 2; i++) {
    var rt = k.piece("Route To Stop " + (i + 1));
    curve(rt[1], [me, [me[0] + 40, pins[i][1] + 40], pins[i]]);
    stroke(rt[1], GREEN, 4, 2);
    var pn = k.piece("Stop Pin " + (i + 1));
    ellipse(pn[1], [24, 24]).property("ADBE Vector Ellipse Position").setValue([pins[i][0], pins[i][1] - 22]);
    pathOf(pn[1], [[pins[i][0] - 10, pins[i][1] - 16], pins[i], [pins[i][0] + 10, pins[i][1] - 16]]);
    fill(pn[1], GREEN);
    // stop 1 shows from L0 to the first delivery and after the second; stop 2 in between
    var keys = i === 0 ? [[0.9, 0], [1.2, 100], [A(DELIVER[0] + 0.75), 100], [A(DELIVER[0] + 0.95), 0], [A(DELIVER[1] + 0.75), 0], [A(DELIVER[1] + 0.95), 100]]
                       : [[A(DELIVER[0] + 0.75), 0], [A(DELIVER[0] + 0.95), 100], [A(DELIVER[1] + 0.75), 100], [A(DELIVER[1] + 0.95), 0]];
    anim(T(rt[0], "ADBE Opacity"), keys, [33, 33]);
    anim(T(pn[0], "ADBE Opacity"), keys, [33, 33]);
  }
  var meD = k.piece("You Are Here");
  ellipse(meD[1], [18, 18]).property("ADBE Vector Ellipse Position").setValue(me);
  fill(meD[1], BLUE);
  stroke(meD[1], WHITE, 3);
  mapParts.push(meD[0]);
  for (i = 0; i < mapParts.length; i++) k.fade(mapParts[i], 0.8, 1.2);
  pulseRing(k, "You Are Here Pulse", me, 10, 30, BLUE, [1.5, A(0), A(1.5), A(3), A(4.5), A(6), A(7.5)]);

  // next stop card (two stops that take turns)
  var sc = k.piece("Stop Card");
  rect(sc[1], [352, 150], [W / 2, 530], 20);
  fill(sc[1], PANEL);
  var lab = k.text("NEXT STOP", 12, [44, 490], MUTE, "SemiBold");
  var td = lab.property("ADBE Text Properties").property("ADBE Text Document"), tdv = td.value;
  tdv.tracking = 200;
  td.setValue(tdv);
  k.fade(sc[0], 1.0, 1.3);
  k.fade(lab, 1.0, 1.3);
  for (i = 0; i < 2; i++) {
    var a = k.text(STOPS[i][0], 26, [44, 532], TXT, "Bold"), b = k.text(STOPS[i][1], 15, [44, 560], MUTE, "Medium");
    var sk = i === 0 ? [[1.1, 0], [1.4, 100], [A(DELIVER[0] + 0.75), 100], [A(DELIVER[0] + 0.95), 0], [A(DELIVER[1] + 0.75), 0], [A(DELIVER[1] + 0.95), 100]]
                     : [[A(DELIVER[0] + 0.75), 0], [A(DELIVER[0] + 0.95), 100], [A(DELIVER[1] + 0.75), 100], [A(DELIVER[1] + 0.95), 0]];
    anim(T(a, "ADBE Opacity"), sk, [33, 33]);
    anim(T(b, "ADBE Opacity"), sk, [33, 33]);
  }

  // slide to deliver
  var TY = 700, TX0 = 58, TX1 = 342;
  var track = k.piece("Slide Track");
  rect(track[1], [352, 68], [W / 2, TY], 34);
  fill(track[1], GREEN, 12);
  stroke(track[1], GREEN, 2).property("ADBE Vector Stroke Opacity").setValue(40);
  var prog = k.piece("Slide Fill");
  var pr = rect(prog[1], [68, 68], [TX0, TY], 34);
  var pf = fill(prog[1], GREEN, 35);
  var thumb = k.layer("Slide Thumb", [TX0, TY]);
  var tg = group(contents(thumb), "Thumb");
  ellipse(tg, [56, 56]);
  fill(tg, GREEN);
  var chev = group(contents(thumb), "Chevron");
  pathOf(chev, [[-5, -10], [6, 0], [-5, 10]], false);
  stroke(chev, APP_BG, 4, 2);
  var hint = k.text("Slide to deliver", 17, [W / 2 + 24, TY + 6], hex("#bbf7d0"), "SemiBold", ParagraphJustification.CENTER_JUSTIFY);
  var done = k.text("Delivered  ✓", 18, [W / 2, TY + 6], APP_BG, "Bold", ParagraphJustification.CENTER_JUSTIFY);
  var thK = [], szK = [], psK = [], fillK = [], hintK = [[1.3, 0], [1.6, 100]], doneK = [], thO = [[1.3, 0], [1.6, 100]];
  for (i = 0; i < DELIVER.length; i++) {
    var d = A(DELIVER[i]);
    thK.push([d, [TX0, TY]], [d + 0.55, [TX1, TY]], [d + 1.2, [TX1, TY]], [d + 1.45, [TX0, TY]]);
    szK.push([d, [68, 68]], [d + 0.55, [352, 68]], [d + 1.2, [352, 68]], [d + 1.45, [68, 68]]);
    psK.push([d, [TX0, TY]], [d + 0.55, [W / 2, TY]], [d + 1.2, [W / 2, TY]], [d + 1.45, [TX0, TY]]);
    fillK.push([d + 0.5, 35], [d + 0.6, 100], [d + 1.2, 100], [d + 1.4, 35]);
    hintK.push([d, 100], [d + 0.2, 0], [d + 1.3, 0], [d + 1.5, 100]);
    doneK.push([d + 0.55, 0], [d + 0.65, 100], [d + 1.15, 100], [d + 1.3, 0]);
    thO.push([d + 1.15, 100], [d + 1.25, 0], [d + 1.35, 0], [d + 1.5, 100]);
  }
  anim(T(thumb, "ADBE Position"), thK, [50, 50]);
  anim(pr.property("ADBE Vector Rect Size"), szK, [50, 50]);
  anim(pr.property("ADBE Vector Rect Position"), psK, [50, 50]);
  anim(pf.property("ADBE Vector Fill Opacity"), fillK, [33, 33]);
  anim(T(hint, "ADBE Opacity"), hintK, [33, 33]);
  anim(T(done, "ADBE Opacity"), doneK, [33, 33]);
  anim(T(thumb, "ADBE Opacity"), thO, [33, 33]);
  k.fade(track[0], 1.2, 1.5);
  k.fade(prog[0], 1.2, 1.5);
  return comp;
}

// ============================ the scene ============================
function build(o, screens) {
  var comp = sceneComp(o.name, o.w, o.h), k = sceneKit(comp), i;
  k.background({
    grid: 0, c1: "#16a34a", c2: "#7c3aed",
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
  var L = o.laptop, ls = o.laptopScale / 100, sw = 1280 * ls, sh = 800 * ls;
  var glow = k.blob("Laptop Glow", L, sw * 0.7, [[0, "#16a34a", 0.22], [0.6, "#7c3aed", 0.08], [1, "#7c3aed", 0]]);
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
  fill(notch, BEZEL_LINE);
  rise([lid[0], scr, base[0]], 0.1);
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

  // the update travels from the driver's phone to the dashboard's feed
  function onLaptop(p) { return [L[0] + (p[0] - 640) * ls, L[1] + (p[1] - 400) * ls]; }
  function onPhone(p) { return [P[0] + (p[0] - 200) * ps, P[1] + (p[1] - 430) * ps]; }
  var from = onPhone([342, 700]), to = onLaptop([1063, 308]);
  var mid = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - o.arc];
  for (i = 0; i < DELIVER.length; i++) {
    var t0 = A(DELIVER[i] + 0.55), dur = EVENTS[i * 2] - DELIVER[i] - 0.55;
    var dot = k.layer("Sync " + (i + 1), from);
    var dg = group(contents(dot), "Dot");
    ellipse(dg, [16, 16]);
    fill(dg, GREEN);
    var hg = group(contents(dot), "Glow");
    ellipse(hg, [40, 40]);
    fill(hg, GREEN, 25);
    var sk = [];
    for (var s = 0; s <= 10; s++) sk.push([t0 + dur * s / 10, quad(from, mid, to, s / 10)]);
    anim(T(dot, "ADBE Position"), sk, [50, 50]);
    anim(T(dot, "ADBE Opacity"), [[t0 - 0.02, 0], [t0 + 0.05, 100], [t0 + dur - 0.05, 100], [t0 + dur + 0.1, 0]], [33, 33]);
    var trail = k.piece("Sync Trail " + (i + 1));
    var tp = [];
    for (s = 0; s <= 24; s++) tp.push(quad(from, mid, to, s / 24));
    curve(trail[1], tp);
    stroke(trail[1], GREEN, 3, 2).property("ADBE Vector Stroke Opacity").setValue(45);
    var tt = trim(trail[1]);
    anim(tt.property("ADBE Vector Trim End"), [[t0, 0], [t0 + dur, 100]], [50, 50]);
    anim(tt.property("ADBE Vector Trim Start"), [[t0 + 0.15, 0], [t0 + dur + 0.2, 100]], [50, 50]);
    // beneath the phone: the update comes out from behind it rather than crossing its screen
    trail[0].moveAfter(shadow[0]);
    dot.moveAfter(shadow[0]);
  }

  // chips
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
    fill(on[1], GREEN, 18);
    stroke(on[1], GREEN, 2);
    var wins = [];
    for (var w = 0; w < CHIPS[i][1].length; w++) wins.push([A(CHIPS[i][1][w][0]), A(CHIPS[i][1][w][1])]);
    k.windows(T(on[0], "ADBE Opacity"), wins, 0.15);
    k.rise(k.text(CHIPS[i][0], cs, [c[0], c[1] + cs * 0.36], WHITE, "SemiBold", ParagraphJustification.CENTER_JUSTIFY), 1.45 + i * 0.1, 12);
    x += sizes[i] + gap;
  }
  return comp.name + " (" + comp.numLayers + " layers)";
}

var screens = { laptop: buildLaptop(), phone: buildPhone() };
var built = [
  build({ name: "Web Applications Wide", w: 1920, h: 1080, laptop: [770, 352], laptopScale: 62, phone: [1330, 430], phoneScale: 56,
          chips: [770, 714], chipSize: 19, arc: 120 }, screens),
  build({ name: "Web Applications Tall", w: 1080, h: 1920, laptop: [540, 452], laptopScale: 62, phone: [540, 945], phoneScale: 46,
          chips: [540, 1192], chipSize: 20, arc: 60 }, screens)
];
"built " + built.join(", ");
