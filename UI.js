// js/ui.js — entry point: UI bindings, keyboard, mobile sheet, boot

import { CFG, isMobile, isFileProtocol, setStatus, fadeStatus } from './state.js';
import { startRenderLoop, onFrame } from './scene.js';
import { startCam, switchCam, enableGyro, recalibrate, initPreview, drawPreview, setSheetOpen } from './input.js';
import { loadBgImage, loadBgVideo, clearMedia } from './media.js';

// ── Apply body class so CSS hides/shows desktop vs mobile elements
document.body.classList.add(isMobile ? 'is-mobile' : 'is-desktop');
if (isMobile) document.getElementById('mobile-sheet').style.display = 'block';

// ── Register per-frame callbacks
initPreview();
onFrame(drawPreview);

// ── Helper
function el(id) { return document.getElementById(id); }

// ── Settings sliders — synced desktop ↔ mobile
function bindSliders(dId, mId, dVId, mVId, key, dec) {
  const dEl=el(dId), mEl=el(mId), dV=el(dVId), mV=el(mVId);
  const set = v => {
    CFG[key] = v;
    const s = v.toFixed(dec);
    if (dEl) dEl.value = v;
    if (mEl) mEl.value = v;
    if (dV)  dV.textContent = s;
    if (mV)  mV.textContent = s;
  };
  set(CFG[key]);
  const h = e => set(parseFloat(e.target.value));
  if (dEl) dEl.addEventListener('input', h);
  if (mEl) mEl.addEventListener('input', h);
}
bindSliders('d-sens',  'm-sens',  'd-sens-v',  'm-sens-v',  'sensitivity', 2);
bindSliders('d-depth', 'm-depth', 'd-depth-v', 'm-depth-v', 'depthScale',  2);
bindSliders('d-smooth','m-smooth','d-smooth-v','m-smooth-v','smoothing',    3);

function bindChecks(dId, mId, key) {
  const dEl=el(dId), mEl=el(mId);
  const h = e => {
    CFG[key] = e.target.checked;
    if (dEl) dEl.checked = CFG[key];
    if (mEl) mEl.checked = CFG[key];
  };
  if (dEl) dEl.addEventListener('change', h);
  if (mEl) mEl.addEventListener('change', h);
}
bindChecks('d-flipy', 'm-flipy', 'flipY');

// ── Camera selectors
function onCamChange(e) {
  if (!e.target.value) return;
  setStatus('SWITCHING CAM...');
  switchCam(e.target.value);
}
el('cam-select-d')?.addEventListener('change', onCamChange);
el('cam-select-m')?.addEventListener('change', onCamChange);

// ── Touch drag toggle (mobile)
el('m-touch')?.addEventListener('change', e => {
  CFG.touchDrag = e.target.checked;
  const badge = el('touch-badge');
  if (badge) badge.textContent = CFG.touchDrag ? 'ON' : 'OFF';
});

// ── File inputs
el('file-img')?.addEventListener('change', e => {
  const f = e.target.files[0];
  if (f) loadBgImage(URL.createObjectURL(f));
  e.target.value = ''; // allow re-selecting same file
});

el('file-vid')?.addEventListener('change', e => {
  const f = e.target.files[0];
  if (f) loadBgVideo(f);
  e.target.value = '';
});

// ── Mobile bottom sheet
let sheetOpen = false;
const mSheet  = el('mobile-sheet');
const mHandle = el('sheet-handle');

function toggleSheet() {
  sheetOpen = !sheetOpen;
  mSheet?.classList.toggle('open', sheetOpen);
  setSheetOpen(sheetOpen); // tell input.js so touch drag yields
}

mHandle?.addEventListener('click', toggleSheet);

// Swipe down to close (> 60px threshold)
let swipeStartY = 0;
mSheet?.addEventListener('touchstart', e => { swipeStartY = e.touches[0].clientY; }, { passive: true });
mSheet?.addEventListener('touchend',   e => {
  if (e.changedTouches[0].clientY - swipeStartY > 60 && sheetOpen) toggleSheet();
}, { passive: true });

// Mobile buttons
el('m-gyro')?.addEventListener('click',  enableGyro);
el('m-recal')?.addEventListener('click', recalibrate);
el('m-img')?.addEventListener('click',   () => { el('file-img')?.click(); if (sheetOpen) toggleSheet(); });
el('m-vid')?.addEventListener('click',   () => { el('file-vid')?.click(); if (sheetOpen) toggleSheet(); });
el('m-clear')?.addEventListener('click', () => { clearMedia(true); if (sheetOpen) toggleSheet(); });
el('file-warning-close')?.addEventListener('click', () => el('file-warning')?.classList.remove('show'));

// ── Desktop keyboard shortcuts
const settingsEl = el('settings');
const hintEl     = el('hint');

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
  switch (e.key.toLowerCase()) {
    case 's': settingsEl.style.display = settingsEl.style.display === 'block' ? 'none' : 'block'; break;
    case 'c': el('preview')?.classList.toggle('vis'); break;
    case 'i': el('file-img')?.click(); break;
    case 'v': el('file-vid')?.click(); break;
    case 'x': clearMedia(true); break;
    case 'r': recalibrate(); break;
  }
});

// ── Drag & drop (accepts images AND videos)
const dragOv = el('drag-overlay');
let dTimer;
document.addEventListener('dragenter', e => { e.preventDefault(); dragOv?.classList.add('on'); });
document.addEventListener('dragover',  e => { e.preventDefault(); clearTimeout(dTimer); });
document.addEventListener('dragleave', () => { dTimer = setTimeout(() => dragOv?.classList.remove('on'), 100); });
document.addEventListener('drop', e => {
  e.preventDefault();
  dragOv?.classList.remove('on');
  const f = e.dataTransfer?.files?.[0];
  if (!f) return;
  if      (f.type.startsWith('image/')) loadBgImage(URL.createObjectURL(f));
  else if (f.type.startsWith('video/')) loadBgVideo(f);
});

// ── Fade hint
setTimeout(() => { if (hintEl) hintEl.style.opacity = '0'; }, 9000);

// ── Boot
function boot() {
  if (isFileProtocol && isMobile) {
    setStatus('FILE:// — TOUCH ACTIVE');
    setTimeout(() => el('file-warning')?.classList.add('show'), 1500);
  }
  startCam(null);
}

startRenderLoop();
boot();
