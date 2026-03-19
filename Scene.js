// js/scene.js — THREE scene setup, scene objects, render loop

import * as THREE from 'three';
import { CFG, isMobile, headRaw, headSmooth, countRender } from './state.js';

// ── Renderer
export const renderer = new THREE.WebGLRenderer({
  antialias: !isMobile,
  powerPreference: 'high-performance',
  stencil: false,
});
renderer.domElement.id = 'three';
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setClearColor(0x020010, 1);
document.body.appendChild(renderer.domElement);

// ── Scene & Camera
export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020010, isMobile ? 0.007 : 0.009);

export const cam3 = new THREE.PerspectiveCamera(
  CFG.fov, window.innerWidth / window.innerHeight, 0.1, 800
);
cam3.position.set(0, 0, 5);

// ── Off-axis projection — the core window-into-another-world illusion
export function applyOffAxis(hx, hy) {
  const asp   = window.innerWidth / window.innerHeight;
  const fovR  = THREE.MathUtils.degToRad(cam3.fov);
  const halfH = Math.tan(fovR * 0.5) * cam3.near;
  const halfW = halfH * asp;
  const k     = CFG.sensitivity * CFG.depthScale;
  const sx    =  hx * halfW * k;
  const sy    = (CFG.flipY ? -hy : hy) * halfH * k;
  // makePerspective(left, right, top, bottom, near, far)
  cam3.projectionMatrix.makePerspective(
    -halfW - sx,  halfW - sx,
     halfH - sy, -halfH - sy,
    cam3.near, cam3.far
  );
  cam3.projectionMatrixInverse.copy(cam3.projectionMatrix).invert();
}

// ── Radial gradient canvas texture helper
function radialTex(size, stops) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(size*.5, size*.5, 0, size*.5, size*.5, size*.5);
  stops.forEach(([t, c]) => g.addColorStop(t, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(cv);
}

// Warmer star glyph with soft outer halo
const starTex = radialTex(48, [
  [0,    'rgba(255,255,255,1)'],
  [0.15, 'rgba(255,255,255,0.90)'],
  [0.40, 'rgba(255,250,245,0.30)'],
  [1,    'rgba(255,255,255,0)'],
]);

// ── Stars — 3 depth layers on desktop, 1 merged on mobile
const COLD         = [[0.70,0.80,1],[0.80,0.85,1],[0.90,0.95,1],[1,1,1]];
const WARM         = [[1,0.92,0.75],[1,0.85,0.70],[0.95,0.75,1],[1,0.95,0.85]];
const ACCENT_STARS = [[0.60,0.90,1],[1,0.60,0.80],[0.80,0.60,1]];

function mkStars(n, zMin, zMax, sz, tints) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    // 15% chance of tight cluster → natural grouping like real starfields
    const cluster = Math.random() > 0.85;
    const spread  = cluster ? 30 : 100;
    pos[i*3]   = (Math.random() - 0.5) * spread + (cluster ? (Math.random() - 0.5) * 20 : 0);
    pos[i*3+1] = (Math.random() - 0.5) * (spread * 0.65);
    pos[i*3+2] = zMin + Math.random() * (zMax - zMin);
    const bright = 0.55 + Math.random() * 0.45;
    const t = tints[Math.floor(Math.random() * tints.length)];
    col[i*3]   = t[0] * bright;
    col[i*3+1] = t[1] * bright;
    col[i*3+2] = t[2] * bright;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    size: sz, map: starTex, vertexColors: true,
    transparent: true, alphaTest: 0.003,
    depthWrite: false, blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  }));
  scene.add(pts);
  return pts;
}

export const starLayers = isMobile
  ? [mkStars(600, -250, -4, 0.16, [...COLD, ...WARM])]
  : [
      mkStars(1000, -350, -70, 0.10, COLD),
      mkStars( 400,  -70, -20, 0.18, [...COLD, ...WARM]),
      mkStars(  80,  -20,  -4, 0.35, [...WARM, ...ACCENT_STARS]),
    ];

// ── Nebulae — faux bloom: outer glow plane + brighter core plane
export const nebulae  = [];
export const nebGlows = [];

function addNeb(r, g, b, a, x, y, z, rz, w, h) {
  const ph = Math.random() * Math.PI * 2;

  // Outer glow — large, soft
  const glowTex = radialTex(128, [
    [0,    `rgba(${r},${g},${b},${(a * 0.35).toFixed(2)})`],
    [0.30, `rgba(${r},${g},${b},${(a * 0.14).toFixed(2)})`],
    [0.65, `rgba(${r},${g},${b},${(a * 0.04).toFixed(2)})`],
    [1,    'rgba(0,0,0,0)'],
  ]);
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 1.8, h * 1.8),
    new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
  );
  glow.position.set(x, y, z - 0.5);
  glow.rotation.z = rz;
  glow.userData.ox = x; glow.userData.oy = y; glow.userData.ph = ph;
  scene.add(glow);
  nebGlows.push(glow);

  // Brighter core — boosted channel values
  const rc = Math.min(255, r + 40), gc = Math.min(255, g + 40), bc = Math.min(255, b + 40);
  const coreTex = radialTex(64, [
    [0,    `rgba(${rc},${gc},${bc},${a.toFixed(2)})`],
    [0.35, `rgba(${r},${g},${b},${(a * 0.50).toFixed(2)})`],
    [0.70, `rgba(${r},${g},${b},${(a * 0.10).toFixed(2)})`],
    [1,    'rgba(0,0,0,0)'],
  ]);
  const core = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: coreTex, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
  );
  core.position.set(x, y, z);
  core.rotation.z = rz;
  core.userData.cx = x; core.userData.cy = y; core.userData.ph = ph;
  scene.add(core);
  nebulae.push(core);
}

if (isMobile) {
  addNeb( 60, 40,200, 0.85, -5,  3,-55,  0.30, 38,26);
  addNeb(200, 50,120, 0.80,  6, -4,-40, -0.40, 30,22);
  addNeb( 40,170,210, 0.70, -2, -2,-70,  0.10, 45,32);
} else {
  addNeb( 60, 40,200, 0.85,-12,  5,-110,  0.30, 50,36);
  addNeb(200, 50,120, 0.80, 10, -6, -85, -0.40, 42,32);
  addNeb( 40, 90,220, 0.75, -8, -4,-130,  0.50, 55,40);
  addNeb(160, 40,200, 0.72,  6,  4, -70, -0.20, 38,28);
  addNeb( 40,170,210, 0.70, -4,  0,-150,  0.10, 65,46);
  addNeb(210, 70, 80, 0.55,  0, -2, -30,  1.00, 22,16);
}

// ── Polyhedra (desktop only)
export const floaters = [];
if (!isMobile) {
  const COLS  = [0x9b7dff,0xff7db0,0x7db8ff,0xffba7d,0x7dffc8,0xd07dff,0x7dffff,0xff7dff];
  const TYPES = ['ico','oct','tet','dod'];
  for (let i = 0; i < 10; i++) {
    const r = 0.25 + Math.random() * 0.50;
    let geo;
    switch (TYPES[i % 4]) {
      case 'ico': geo = new THREE.IcosahedronGeometry(r, 1); break;
      case 'oct': geo = new THREE.OctahedronGeometry(r);     break;
      case 'tet': geo = new THREE.TetrahedronGeometry(r);    break;
      default:    geo = new THREE.DodecahedronGeometry(r);   break;
    }
    const wf = Math.random() > 0.25;
    const m  = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: COLS[i % COLS.length], wireframe: wf, transparent: true,
      opacity: wf ? 0.14 : 0.07, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    m.position.set((Math.random()-0.5)*32, (Math.random()-0.5)*18, -3 - Math.random()*45);
    m.userData.rot = {
      x: (Math.random()-0.5)*0.005,
      y: (Math.random()-0.5)*0.008,
      z: (Math.random()-0.5)*0.003,
    };
    scene.add(m);
    floaters.push(m);
  }
}

// ── Frame callbacks registered from ui.js (drawPreview etc.)
const _frameCallbacks = [];
export function onFrame(fn) { _frameCallbacks.push(fn); }

// ── Render loop (started by ui.js after all callbacks are registered)
const clock    = new THREE.Clock();
let lastFrame  = 0;

export function startRenderLoop() {
  const FRAME_MS = 1000 / CFG.targetFPS;

  function tick(now) {
    requestAnimationFrame(tick);
    if (now - lastFrame < FRAME_MS) return;
    lastFrame = now;

    const t = clock.getElapsedTime();
    const a = CFG.smoothing;

    // Smooth head position
    headSmooth.x += (headRaw.x - headSmooth.x) * a;
    headSmooth.y += (headRaw.y - headSmooth.y) * a;

    applyOffAxis(headSmooth.x, headSmooth.y);

    // Polyhedra
    for (const f of floaters) {
      f.rotation.x += f.userData.rot.x;
      f.rotation.y += f.userData.rot.y;
      f.rotation.z += f.userData.rot.z;
    }

    // Star drift — assign (=) not accumulate (+=) to avoid infinite drift
    starLayers[0].rotation.y = t * 0.0008;
    if (starLayers[1]) starLayers[1].rotation.y = t * 0.0015;
    if (starLayers[2]) starLayers[2].rotation.y = t * 0.0030;

    // Nebula drift
    for (const n of nebulae) {
      n.position.x = n.userData.cx + Math.sin(t * 0.028 + n.userData.ph) * 0.05;
      n.position.y = n.userData.cy + Math.cos(t * 0.020 + n.userData.ph) * 0.03;
    }
    for (const g of nebGlows) {
      g.position.x = g.userData.ox + Math.sin(t * 0.028 + g.userData.ph) * 0.04;
      g.position.y = g.userData.oy + Math.cos(t * 0.020 + g.userData.ph) * 0.025;
    }

    // Per-frame callbacks (drawPreview etc.)
    _frameCallbacks.forEach(fn => fn());

    renderer.render(scene, cam3);
    countRender();
  }

  requestAnimationFrame(tick);
}

// ── Resize
window.addEventListener('resize', () => {
  cam3.aspect = window.innerWidth / window.innerHeight;
  cam3.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
