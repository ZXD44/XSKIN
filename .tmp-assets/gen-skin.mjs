import { writeFileSync } from 'node:fs';

const rects = [];
const C = {
  skin: '#e3ac7d',
  skinMid: '#d8a173',
  skinDark: '#c88f63',
  hair: '#2a2237',
  hairLight: '#382c4c',
  hoodie: '#1a6653',
  hoodieMid: '#155a49',
  hoodieDark: '#104638',
  hoodieDeep: '#0a2b23',
  pants: '#434b6e',
  pantsMid: '#393f5d',
  pantsDark: '#2e344b',
  shoe: '#1d2130',
  shoeMid: '#171a26',
  sole: '#3a4160',
  accent: '#57f287',
  emblem: '#6d79ff',
  white: '#f2f6ff',
  iris: '#2f3ba8',
  mouth: '#8a5b44',
};

function r(x, y, w, h, c) {
  rects.push({ x, y, w, h, c });
}
const one = (x, y, c) => r(x, y, 1, 1, c);
function fill(x, y, w, h, c) { r(x, y, w, h, c); }

// ---------------- HEAD (8x8x8) ----------------
fill(8, 0, 8, 8, C.hair);            // top
fill(9, 1, 3, 1, C.hairLight);       // top shine
fill(16, 0, 8, 8, C.skinDark);       // bottom
fill(0, 8, 8, 8, C.skinMid);         // right side
fill(16, 8, 8, 8, C.skinMid);        // left side
fill(0, 8, 8, 3, C.hair);            // right hair band
fill(16, 8, 8, 3, C.hair);           // left hair band
fill(24, 8, 8, 8, C.hair);           // back
fill(24, 9, 5, 1, C.hairLight);      // back shine

// face
fill(8, 8, 8, 8, C.skin);
fill(8, 8, 8, 2, C.hair);            // fringe
fill(8, 10, 1, 1, C.hair);
fill(15, 10, 1, 1, C.hair);
one(9, 11, C.hair); one(10, 11, C.hair);
one(13, 11, C.hair); one(14, 11, C.hair);
one(9, 12, C.white); one(10, 12, C.iris);
one(13, 12, C.iris); one(14, 12, C.white);
one(9, 13, C.skinMid); one(10, 13, C.skinMid);
one(13, 13, C.skinMid); one(14, 13, C.skinMid);
one(11, 13, C.skinMid); one(12, 13, C.skinDark);
fill(10, 14, 4, 1, C.mouth);
fill(9, 15, 6, 1, C.skinDark);

// ---------------- BODY (8x12x4) ----------------
fill(20, 16, 8, 4, C.hoodieDark);
fill(28, 16, 8, 4, C.hoodieDeep);
fill(16, 20, 4, 12, C.hoodieMid);
fill(28, 20, 4, 12, C.hoodieMid);
fill(32, 20, 8, 12, C.hoodieMid);
fill(20, 20, 8, 12, C.hoodie);
fill(20, 20, 8, 1, C.hoodieDeep);   // collar
fill(20, 21, 3, 1, C.hoodieDark);
fill(25, 21, 3, 1, C.hoodieDark);
fill(21, 26, 6, 3, C.hoodieMid);    // pocket
fill(23, 21, 1, 4, C.accent);       // drawstring
fill(24, 21, 1, 3, C.accent);
fill(23, 24, 2, 1, C.emblem);       // emblem
one(23, 24, C.emblem); one(24, 25, C.emblem);
fill(20, 30, 8, 2, C.hoodieDeep);   // hem

// ---------------- RIGHT ARM (4x12x4 @ 40,16) ----------------
fill(44, 16, 4, 4, C.hoodieDark);
fill(48, 16, 4, 4, C.hoodieDeep);
fill(40, 20, 4, 12, C.hoodieMid);
fill(48, 20, 4, 12, C.hoodieMid);
fill(52, 20, 4, 12, C.hoodieMid);
fill(44, 20, 4, 12, C.hoodie);
fill(44, 20, 4, 1, C.hoodieDeep);
fill(44, 27, 4, 1, C.hoodieDeep);   // cuff
fill(44, 28, 4, 4, C.skin);
fill(40, 28, 4, 4, C.skinDark);     // side hand
fill(48, 28, 4, 4, C.skinDark);
fill(52, 28, 4, 4, C.skinMid);
fill(48, 16, 4, 4, C.hoodieDeep);

// ---------------- RIGHT LEG (4x12x4 @ 0,16) ----------------
fill(4, 16, 4, 4, C.pantsMid);
fill(8, 16, 4, 4, C.pantsDark);
fill(0, 20, 4, 12, C.pantsMid);
fill(8, 20, 4, 12, C.pantsMid);
fill(12, 20, 4, 12, C.pantsDark);
fill(4, 20, 4, 12, C.pants);
fill(4, 20, 4, 1, C.pantsDark);
fill(0, 29, 4, 3, C.shoeMid);
fill(8, 29, 4, 3, C.shoeMid);
fill(12, 29, 4, 3, C.shoe);
fill(4, 29, 4, 3, C.shoe);
fill(4, 31, 4, 1, C.sole);
fill(0, 31, 4, 1, C.sole);
fill(8, 31, 4, 1, C.sole);

// ---------------- LEFT LEG (4x12x4 @ 16,48) ----------------
fill(20, 48, 4, 4, C.pantsMid);
fill(24, 48, 4, 4, C.pantsDark);
fill(16, 52, 4, 12, C.pantsMid);
fill(24, 52, 4, 12, C.pantsMid);
fill(28, 52, 4, 12, C.pantsDark);
fill(20, 52, 4, 12, C.pants);
fill(20, 52, 4, 1, C.pantsDark);
fill(16, 61, 4, 3, C.shoeMid);
fill(24, 61, 4, 3, C.shoeMid);
fill(28, 61, 4, 3, C.shoe);
fill(20, 61, 4, 3, C.shoe);
fill(20, 63, 4, 1, C.sole);
fill(16, 63, 4, 1, C.sole);
fill(24, 63, 4, 1, C.sole);

// ---------------- LEFT ARM (4x12x4 @ 32,48) ----------------
fill(36, 48, 4, 4, C.hoodieDark);
fill(40, 48, 4, 4, C.hoodieDeep);
fill(32, 52, 4, 12, C.hoodieMid);
fill(40, 52, 4, 12, C.hoodieMid);
fill(44, 52, 4, 12, C.hoodieMid);
fill(36, 52, 4, 12, C.hoodie);
fill(36, 52, 4, 1, C.hoodieDeep);
fill(36, 59, 4, 1, C.hoodieDeep);
fill(36, 60, 4, 4, C.skin);
fill(32, 60, 4, 4, C.skinDark);
fill(40, 60, 4, 4, C.skinDark);
fill(44, 60, 4, 4, C.skinMid);

// ---- overlay (jacket) layer: mirror the base layer onto the outer shell -------
const lighten = (hex, f) => {
  const h = hex.replace('#', '');
  const rgb = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  return '#' + rgb.map(v => Math.round(v + (255 - v) * f).toString(16).padStart(2, '0')).join('');
};
const inBox = (r, x0, y0, x1, y1) => r.x >= x0 && r.y >= y0 && r.x < x1 && r.y < y1;

const overlay = [];
for (const rect of rects) {
  let dx = 0, dy = 0;
  if (inBox(rect, 0, 0, 32, 16)) continue;                       // hat left transparent
  else if (inBox(rect, 16, 16, 40, 32)) { dy = 16; }             // body
  else if (inBox(rect, 40, 16, 56, 32)) { dy = 16; }             // right arm
  else if (inBox(rect, 0, 16, 16, 32)) { dy = 16; }              // right leg
  else if (inBox(rect, 16, 48, 32, 64)) { dx = -16; }            // left leg
  else if (inBox(rect, 32, 48, 48, 64)) { dx = 16; }             // left arm
  else continue;
  overlay.push({ x: rect.x + dx, y: rect.y + dy, w: rect.w, h: rect.h, c: lighten(rect.c, 0.06) });
}

const allRects = [...rects, ...overlay];
const px = allRects.map(rr => `<rect x="${rr.x}" y="${rr.y}" width="${rr.w}" height="${rr.h}" fill="${rr.c}"/>`);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 64 64" shape-rendering="crispEdges">
${px.join('\n')}
</svg>`;

writeFileSync('.tmp-assets/skin.svg', svg);
console.log('skin svg', svg.length, 'base rects', rects.length, 'overlay rects', overlay.length);
