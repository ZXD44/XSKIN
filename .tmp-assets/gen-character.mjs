import { writeFileSync } from 'node:fs';

// ---- isometric voxel renderer -------------------------------------------------
const S = 6.6;
const COS = 0.8660254;

const project = (x, y, z) => [(x - z) * COS * S, ((x + z) * 0.5 - y) * S];

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const rgbToHex = (rgb) => '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const shade = (hex, f) => (f >= 0
  ? rgbToHex(hexToRgb(hex).map(v => v + (255 - v) * f))
  : rgbToHex(hexToRgb(hex).map(v => v * (1 + f))));

const parts = [];
const allPts = [];

function poly(pts, fill, extra = '') {
  pts.forEach(p => allPts.push(p));
  parts.push(`<polygon points="${pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')}" fill="${fill}"${extra}/>`);
}

function box(x0, x1, y0, y1, z0, z1, color, opts = {}) {
  const front = opts.front ?? color;
  const side = opts.side ?? shade(color, -0.26);
  const top = opts.top ?? shade(color, 0.14);
  poly([project(x0, y0, z1), project(x1, y0, z1), project(x1, y1, z1), project(x0, y1, z1)], front);
  poly([project(x1, y0, z0), project(x1, y0, z1), project(x1, y1, z1), project(x1, y1, z0)], side);
  poly([project(x0, y1, z0), project(x1, y1, z0), project(x1, y1, z1), project(x0, y1, z1)], top);
}

const face = (x0, x1, y0, y1, z, fill) =>
  poly([project(x0, y0, z), project(x1, y0, z), project(x1, y1, z), project(x0, y1, z)], fill);

// ---- palette ------------------------------------------------------------------
const P = {
  hair: '#2a2237',
  hairLight: '#443a5e',
  hairStrand: '#221b2e',
  skin: '#e3ac7d',
  hoodie: '#175a48',
  hoodieDark: '#0d3b2f',
  sleeve: '#134c3e',
  cuff: '#0a2b23',
  pants: '#363d55',
  pantsLeft: '#242942',
  shoe: '#15171f',
  sole: '#2e3242',
  accent: '#57f287',
  emblem: '#6d79ff',
};

// ---- build (painter order: back → front) --------------------------------------

// ground shadow
const [shX, shY] = project(4, 0, 2);
parts.push(
  `<ellipse cx="${shX.toFixed(1)}" cy="${(shY + 3).toFixed(1)}" rx="${(7.4 * S).toFixed(1)}" ry="${(2.3 * S).toFixed(1)}" fill="url(#groundShadow)"/>`
);

// hood lump behind neck
box(1.0, 7.0, 20.4, 25.2, -2.1, -0.3, P.hoodieDark);

// left arm (behind the torso in isometric view)
box(-4, 0, 12.2, 24, 0, 4, P.sleeve, { side: shade(P.sleeve, -0.2) });
box(-4, 0, 11.3, 12.4, -0.05, 4.05, P.cuff);
box(-3.85, -0.15, 8.5, 11.3, 0.12, 3.88, P.skin, { side: shade(P.skin, -0.22) });

// legs (slight stance gap keeps both legs readable)
box(4.25, 8.2, 0, 12.4, 0, 4, P.pants);
box(-0.2, 3.75, 0, 12.4, 0, 4, P.pantsLeft);

// shoes
box(4.25, 8.35, 0, 2.2, -0.1, 5.0, P.shoe);
box(-0.35, 3.9, 0, 2.2, -0.1, 5.0, shade(P.shoe, 0.1));
box(4.25, 8.35, 0, 0.5, 4.98, 5.08, P.sole);
box(-0.35, 3.9, 0, 0.5, 4.98, 5.08, shade(P.sole, 0.08));

// torso
box(0, 8, 12.4, 24, 0, 4, P.hoodie, { side: P.hoodieDark });

// right arm (in front of the torso in isometric view)
box(8, 12, 12.2, 24, 0, 4, P.sleeve, { side: shade(P.sleeve, -0.2) });
box(8, 12, 11.3, 12.4, -0.05, 4.05, P.cuff);
box(8.15, 11.85, 8.5, 11.3, 0.12, 3.88, P.skin, { side: shade(P.skin, -0.22) });

// belt
box(-0.02, 8.02, 11.8, 12.3, -0.02, 4.02, '#141722');

// ---- head ---------------------------------------------------------------------
box(0, 8, 24, 32, -2, 6, P.skin, { side: shade(P.skin, -0.2), top: shade(P.skin, 0.1) });

// collar shadow under the chin
face(0.2, 7.8, 23.5, 24.4, 6.01, shade(P.skin, -0.34));

// hair: crown block, back mass, sideburns, swept fringe
box(-0.15, 8.15, 31.0, 32.5, -2.15, 6.15, P.hair, { top: P.hairLight, side: shade(P.hair, -0.12) });
box(-0.15, 8.15, 24.9, 31.2, -2.15, -1.05, P.hair);
box(-0.15, 0.15, 26.2, 31.2, -1.05, 5.55, P.hair);
box(7.85, 8.15, 26.2, 31.2, -1.05, 5.55, P.hair);
// fringe: covers the forehead, sweeps to the right
box(0.15, 7.85, 29.6, 30.95, 5.55, 6.22, P.hair, { top: P.hairLight });
box(4.9, 7.85, 27.4, 29.7, 5.55, 6.22, P.hair);
box(0.15, 1.9, 27.9, 29.7, 5.55, 6.22, P.hair);
// single light highlight across the crown
box(1.0, 3.4, 32.52, 32.6, 0.2, 4.4, shade(P.hair, 0.16));
// back-of-head shine
box(1.2, 2.2, 27.0, 30.6, -2.2, -2.12, shade(P.hair, 0.22));

// brows
face(1.5, 3.2, 29.2, 29.62, 6.03, shade(P.hair, 0.1));
face(4.8, 6.5, 29.2, 29.62, 6.03, shade(P.hair, 0.1));

// wrist shadows
face(-3.9, -0.1, 11.15, 11.5, 4.02, shade(P.skin, -0.42));
face(8.1, 11.9, 11.15, 11.5, 4.02, shade(P.skin, -0.42));

// eyes
face(1.6, 3.1, 27.5, 29.0, 6.02, '#f2f6ff');
face(4.9, 6.4, 27.5, 29.0, 6.02, '#f2f6ff');
face(2.15, 3.05, 27.6, 28.9, 6.04, '#2f3ba8');
face(5.05, 5.95, 27.6, 28.9, 6.04, '#2f3ba8');
face(2.2, 2.75, 28.2, 28.85, 6.06, '#9fe6ff');
face(5.1, 5.65, 28.2, 28.85, 6.06, '#9fe6ff');

// nose + mouth
face(3.5, 4.5, 26.2, 27.4, 6.02, shade(P.skin, -0.16));
face(3.3, 4.7, 25.4, 25.85, 6.03, shade(P.skin, -0.44));

// ---- hoodie details -----------------------------------------------------------
face(-3.98, 0.0, 21.8, 22.2, 4.02, shade(P.sleeve, -0.28));
face(8.0, 11.98, 21.8, 22.2, 4.02, shade(P.sleeve, -0.28));
face(3.9, 4.1, 13.6, 22.6, 4.02, shade(P.hoodie, -0.13));
face(2.3, 5.7, 13.4, 15.3, 4.02, shade(P.hoodie, -0.09));
face(2.5, 2.95, 20.0, 23.0, 4.03, P.accent);
face(5.05, 5.5, 20.0, 23.0, 4.03, P.accent);
face(3.5, 4.5, 17.8, 18.9, 4.04, P.emblem);
face(3.85, 4.15, 18.9, 19.9, 4.04, shade(P.emblem, 0.4));

// ---- compose ------------------------------------------------------------------
const minX = Math.min(...allPts.map(p => p[0])) - 12;
const maxX = Math.max(...allPts.map(p => p[0])) + 12;
const minY = Math.min(...allPts.map(p => p[1])) - 12;
const maxY = Math.max(...allPts.map(p => p[1])) + 16;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX.toFixed(1)} ${minY.toFixed(1)} ${(maxX - minX).toFixed(1)} ${(maxY - minY).toFixed(1)}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Minecraft character in a ZirconX hoodie">
  <defs>
    <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#5865f2" stop-opacity="0.42"/>
      <stop offset="60%" stop-color="#5865f2" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#5865f2" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <g stroke-linejoin="round">
    ${parts.join('\n    ')}
  </g>
</svg>
`;

writeFileSync('public/showcase/character.svg', svg);
console.log('written', svg.length, 'bytes, viewBox', (maxX - minX).toFixed(0), (maxY - minY).toFixed(0));
