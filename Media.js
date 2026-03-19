// js/media.js — background image/video loading, depth layering, panoramic sphere

import * as THREE from 'three';
import { isMobile, setStatus, fadeStatus } from './state.js';
import { scene, nebulae, nebGlows, floaters } from './scene.js';

// ── All bg meshes tracked here for clean disposal
const bgMeshes   = [];
let bgTexture    = null; // current texture ref (shared by depth layers)
let bgVideoEl    = null; // HTMLVideoElement for bg video

export function hasMedia() { return bgMeshes.length > 0; }

// ── Toggle scene object visibility (nebulae + floaters)
export function setSceneVisible(v) {
  nebulae.forEach(n  => { n.visible = v; });
  nebGlows.forEach(g => { g.visible = v; });
  floaters.forEach(f => { f.visible = v; });
}

// ── Restore scene fog (may be disabled during panoramic mode)
function restoreFog() {
  scene.fog = new THREE.FogExp2(0x020010, isMobile ? 0.007 : 0.009);
}

// ── Dispose all background meshes + textures + video
export function clearMedia(restoreScene = true) {
  // Dispose texture once (shared across depth layers)
  if (bgTexture) {
    bgTexture.dispose();
    bgTexture = null;
  }
  // Remove meshes
  bgMeshes.forEach(m => {
    scene.remove(m);
    if (m.geometry) m.geometry.dispose();
    if (m.material) m.material.dispose();
  });
  bgMeshes.length = 0;

  // Stop and clean video element
  if (bgVideoEl) {
    bgVideoEl.pause();
    bgVideoEl.removeAttribute('src');
    bgVideoEl.load();
    bgVideoEl.remove();
    bgVideoEl = null;
  }

  if (restoreScene) {
    setSceneVisible(true);
    restoreFog();
    document.getElementById('m-clear')?.classList.add('hidden');
    setStatus('MEDIA CLEARED');
    fadeStatus(1400);
  }
}

// ── 3-plane depth layering for flat images/video
//    Background (further, larger, semi-transparent) → Midground → Foreground (closer, smaller, transparent)
//    Off-axis projection shifts each plane by a different amount → convincing parallax depth illusion
//    Scale values chosen so all 3 planes fill the same apparent screen area at rest.
function buildDepthLayers(texture, asp) {
  const baseH = 18;
  const baseW = baseH * asp;
  const baseZ = -15; // midground Z

  // Mathematically correct scales: apparent_size ∝ 1/distance, cam at z=5
  // bg  distance = 5 - (baseZ-3) = 23  → scale = 23/20 ≈ 1.15
  // mid distance = 5 - baseZ     = 20  → scale = 1.00
  // fg  distance = 5 - (baseZ+3) = 17  → scale = 17/20 ≈ 0.85
  const LAYERS = [
    { dz: -3, scale: 1.15, opacity: 0.60, order: 0 }, // background
    { dz:  0, scale: 1.00, opacity: 1.00, order: 1 }, // midground  (main, fully opaque)
    { dz: +3, scale: 0.85, opacity: 0.30, order: 2 }, // foreground (subtle depth cue)
  ];

  LAYERS.forEach(({ dz, scale, opacity, order }) => {
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: opacity < 1.0,
      opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(baseW * scale, baseH * scale),
      mat
    );
    mesh.position.z = baseZ + dz;
    mesh.renderOrder = order;
    scene.add(mesh);
    bgMeshes.push(mesh);
  });
}

// ── Panoramic sphere (equirectangular 360° image or video)
//    geo.scale(-1,1,1) flips normals inward without BackSide UV mirroring issues
function buildPanoSphere(texture) {
  const geo = new THREE.SphereGeometry(250, isMobile ? 32 : 60, isMobile ? 16 : 40);
  geo.scale(-1, 1, 1); // flip normals inward for correct UV orientation

  const mat  = new THREE.MeshBasicMaterial({ map: texture, depthWrite: false });
  const mesh = new THREE.Mesh(geo, mat);
  // Sphere at origin, camera at (0,0,5) → camera is inside sphere ✓
  scene.add(mesh);
  bgMeshes.push(mesh);

  // Fog would nearly black-out a sphere at radius 250 — disable it
  scene.fog = null;
}

// ── After any media load: hide nebulae and show clear button
function _onMediaLoaded() {
  setSceneVisible(false);
  document.getElementById('m-clear')?.classList.remove('hidden');
  fadeStatus(1800);
}

// ── Load image from object URL
export function loadBgImage(src) {
  setStatus('LOADING IMAGE...');
  new THREE.TextureLoader().load(src, tex => {
    clearMedia(false); // remove old meshes, don't restore nebulae yet
    bgTexture = tex;
    const asp = tex.image.width / tex.image.height;
    if (asp >= 1.8) {
      buildPanoSphere(tex);
      setStatus('PANORAMA LOADED');
    } else {
      buildDepthLayers(tex, asp);
      setStatus('IMAGE LOADED');
    }
    _onMediaLoaded();
  }, undefined, () => {
    setStatus('IMAGE LOAD FAILED');
    fadeStatus(2000);
  });
}

// ── Load video file → VideoTexture
export async function loadBgVideo(file) {
  setStatus('LOADING VIDEO...');
  clearMedia(false);

  // Create hidden video element for bg playback
  bgVideoEl = document.createElement('video');
  bgVideoEl.loop       = true;
  bgVideoEl.muted      = true;
  bgVideoEl.playsInline = true;
  bgVideoEl.autoplay   = true;
  bgVideoEl.style.display = 'none';
  document.body.appendChild(bgVideoEl);

  bgVideoEl.src = URL.createObjectURL(file);

  try {
    // Wait for metadata to get dimensions
    await new Promise((res, rej) => {
      bgVideoEl.onloadedmetadata = res;
      bgVideoEl.onerror = () => rej(new Error('Video metadata failed'));
    });

    // Play — muted videos should autoplay on HTTPS without issue
    await bgVideoEl.play();

    // VideoTexture auto-updates each frame via Three.js renderer
    const tex = new THREE.VideoTexture(bgVideoEl);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    bgTexture = tex;

    const asp = bgVideoEl.videoWidth / bgVideoEl.videoHeight;
    if (asp >= 1.8) {
      buildPanoSphere(tex);
      setStatus('360° VIDEO LOADED');
    } else {
      buildDepthLayers(tex, asp);
      setStatus('VIDEO LOADED');
    }
    _onMediaLoaded();

  } catch(err) {
    console.error('Video load error:', err);
    setStatus('VIDEO LOAD FAILED');
    fadeStatus(2000);
    if (bgVideoEl) {
      bgVideoEl.remove();
      bgVideoEl = null;
    }
  }
}
