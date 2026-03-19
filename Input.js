// js/input.js — camera, face tracking, gyroscope, touch drag

import { CFG, isMobile, isFileProtocol, headRaw, tracking, countTrack, setStatus, fadeStatus } from './state.js';

// ── Webcam video element (created here, not in HTML)
const videoEl = document.createElement('video');
videoEl.setAttribute('playsinline', '');
videoEl.muted = true;
videoEl.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;';
document.body.appendChild(videoEl);

// ── Camera preview canvas references (populated after DOM ready)
let previewCtx = null;

export function initPreview() {
  const cv = document.getElementById('preview-canvas');
  previewCtx = cv ? cv.getContext('2d') : null;
}

export function drawPreview() {
  const previewEl = document.getElementById('preview');
  if (!previewEl || !previewEl.classList.contains('vis')) return;
  if (!previewCtx || videoEl.readyState < 2) return;
  try {
    // Mirror horizontally so it looks like a selfie camera
    previewCtx.save();
    previewCtx.scale(-1, 1);
    previewCtx.drawImage(videoEl, -160, 0, 160, 120);
    previewCtx.restore();
  } catch (_) {}
  // Draw nose-tip dot
  if (tracking.latestNose) {
    const { x, y } = tracking.latestNose;
    previewCtx.beginPath();
    previewCtx.arc(x * 160, y * 120, 5, 0, Math.PI * 2);
    previewCtx.fillStyle = '#00ff88';
    previewCtx.shadowColor = '#00ff88';
    previewCtx.shadowBlur = 10;
    previewCtx.fill();
    previewCtx.shadowBlur = 0;
  }
}

// ── Camera management
let currentStream = null;
let faceMeshInst  = null;
let trackInterval = null;

export async function populateCams() {
  const fail = '<option value="">Camera unavailable</option>';
  try {
    const devs = await navigator.mediaDevices.enumerateDevices();
    const cams = devs.filter(d => d.kind === 'videoinput');
    const html = cams.length
      ? cams.map((c, i) => `<option value="${c.deviceId}">${c.label || 'Camera ' + (i + 1)}</option>`).join('')
      : '<option value="">No cameras found</option>';
    const d = document.getElementById('cam-select-d');
    const m = document.getElementById('cam-select-m');
    if (d) d.innerHTML = html;
    if (m) m.innerHTML = html;
  } catch(e) {
    const d = document.getElementById('cam-select-d');
    const m = document.getElementById('cam-select-m');
    if (d) d.innerHTML = fail;
    if (m) m.innerHTML = fail;
  }
}

export async function startCam(deviceId) {
  // On file:// getUserMedia is blocked — skip straight to demo
  if (isFileProtocol) {
    setStatus('FILE:// — TOUCH / DEMO');
    const req = '<option value="">Requires HTTPS</option>';
    const d = document.getElementById('cam-select-d');
    const m = document.getElementById('cam-select-m');
    if (d) d.innerHTML = req;
    if (m) m.innerHTML = req;
    startDemo();
    return;
  }

  if (currentStream) { currentStream.getTracks().forEach(t => t.stop()); currentStream = null; }
  if (trackInterval) { clearInterval(trackInterval); trackInterval = null; }

  setStatus('STARTING CAM...');
  try {
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 30 },
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      }
    });
    videoEl.srcObject = currentStream;
    await new Promise((res, rej) => {
      videoEl.onloadeddata = res;
      videoEl.onerror = rej;
      videoEl.play().catch(rej);
    });
    await populateCams();
    const aid = currentStream.getVideoTracks()[0]?.getSettings()?.deviceId;
    if (aid) {
      const d = document.getElementById('cam-select-d');
      const m = document.getElementById('cam-select-m');
      if (d) d.value = aid;
      if (m) m.value = aid;
    }
    setStatus('INIT TRACKING...');
    await _startFaceMesh();
  } catch(err) {
    console.error('Camera error:', err);
    setStatus('NO CAM — DEMO MODE');
    startDemo();
  }
}

export async function switchCam(deviceId) {
  faceMeshInst = null; // force re-init for new device
  await startCam(deviceId);
}

async function _startFaceMesh() {
  if (!faceMeshInst) {
    // FaceMesh is a global loaded from the CDN <script> tag in index.html
    faceMeshInst = new FaceMesh({
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${f}`
    });
    faceMeshInst.setOptions({
      maxNumFaces: 1, refineLandmarks: false,
      minDetectionConfidence: 0.5, minTrackingConfidence: 0.5,
    });
    faceMeshInst.onResults(_onFace);
    try { await faceMeshInst.initialize(); }
    catch(e) { console.warn('FaceMesh init warning:', e); }
  }
  tracking.calibrated = false;
  // Track at ~10fps on mobile, ~15fps on desktop — decoupled from render loop
  const ms = isMobile ? 100 : 66;
  trackInterval = setInterval(async () => {
    if (videoEl.readyState < 2) return;
    try { await faceMeshInst.send({ image: videoEl }); countTrack(); } catch(_) {}
  }, ms);
  setStatus('TRACKING');
  fadeStatus(2500);
  // Update mode badge
  const badge = document.querySelector('.mode-badge');
  if (badge) { badge.className = 'mode-badge cam'; badge.textContent = 'CAM'; }
}

function _onFace(results) {
  if (!results.multiFaceLandmarks?.length) { tracking.latestNose = null; return; }
  const nose = results.multiFaceLandmarks[0][1]; // landmark index 1 = nose tip
  tracking.latestNose = { x: nose.x, y: nose.y };
  if (!tracking.calibrated) {
    tracking.refNoseX = nose.x;
    tracking.refNoseY = nose.y;
    tracking.calibrated = true;
    return;
  }
  // Invert x: webcam is mirrored, moving right → positive x
  headRaw.x = -(nose.x - tracking.refNoseX) * 2.5;
  headRaw.y = -(nose.y - tracking.refNoseY) * 2.5;
}

// ── Gyroscope
export async function enableGyro() {
  const btn = document.getElementById('m-gyro');

  // On file:// test if DeviceMotionEvent fires (sometimes works on Android)
  if (isFileProtocol) {
    if (typeof DeviceMotionEvent !== 'undefined') {
      let fired = false;
      const test = () => { fired = true; };
      window.addEventListener('devicemotion', test, { once: true });
      await new Promise(r => setTimeout(r, 500));
      window.removeEventListener('devicemotion', test);
      if (!fired) {
        setStatus('GYRO NEEDS HTTPS');
        if (btn) { btn.textContent = 'Requires HTTPS'; btn.style.opacity = '0.5'; }
        document.getElementById('file-warning')?.classList.add('show');
        return;
      }
    }
  }

  // iOS 13+ permission
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const perm = await DeviceOrientationEvent.requestPermission();
      if (perm !== 'granted') {
        setStatus('GYRO DENIED');
        if (btn) { btn.textContent = 'Permission Denied'; btn.style.opacity = '0.5'; }
        return;
      }
    } catch(e) {
      setStatus('GYRO ERROR');
      if (btn) { btn.textContent = 'Gyro Error'; btn.style.opacity = '0.5'; }
      return;
    }
  }

  tracking.gyroBaseG = null;
  tracking.gyroBaseB = null;
  tracking.gyroActive = true;

  window.addEventListener('deviceorientation', e => {
    if (e.gamma === null) return;
    if (tracking.gyroBaseG === null) {
      tracking.gyroBaseG = e.gamma || 0;
      tracking.gyroBaseB = e.beta  || 0;
      return;
    }
    headRaw.x = Math.max(-1.5, Math.min(1.5, (e.gamma - tracking.gyroBaseG) / 38));
    headRaw.y = Math.max(-1.5, Math.min(1.5, (e.beta  - tracking.gyroBaseB) / 38));
    countTrack();
  }, true);

  setStatus('GYRO ACTIVE');
  fadeStatus(2000);
  if (btn) { btn.textContent = 'Gyro Active'; btn.classList.add('pri'); }
  const badge = document.getElementById('touch-badge');
  if (badge) { badge.className = 'mode-badge gyro'; badge.textContent = 'GYRO'; }
}

// ── Touch drag parallax (mobile only)
// sheetOpen flag is set from ui.js via setSheetOpen() to avoid circular deps
let _sheetOpen = false;
export function setSheetOpen(v) { _sheetOpen = v; }

document.addEventListener('touchmove', e => {
  if (!isMobile || !CFG.touchDrag || _sheetOpen || tracking.gyroActive) return;
  const sheet = document.getElementById('mobile-sheet');
  if (sheet && sheet.contains(e.target)) return;
  e.preventDefault();
  const t = e.touches[0];
  // Map screen position to -1…+1 from center
  headRaw.x = ((t.clientX / window.innerWidth)  - 0.5) * 2 * CFG.sensitivity;
  headRaw.y = ((t.clientY / window.innerHeight) - 0.5) * 2 * CFG.sensitivity;
  countTrack();
}, { passive: false });

document.addEventListener('touchend', e => {
  if (!isMobile || !CFG.touchDrag || _sheetOpen || tracking.gyroActive) return;
  const sheet = document.getElementById('mobile-sheet');
  if (sheet && sheet.contains(e.target)) return;
  // Soft partial reset — smoothing handles the rest
  headRaw.x *= 0.4;
  headRaw.y *= 0.4;
}, { passive: true });

// ── Recalibrate
export function recalibrate() {
  tracking.calibrated = false;
  tracking.gyroBaseG  = null;
  tracking.gyroBaseB  = null;
  headRaw.x = 0;
  headRaw.y = 0;
  setStatus('RECALIBRATING...');
  fadeStatus(1500);
}

// ── Demo mode (when no camera available)
let demoInterval = null;
export function startDemo() {
  let t = 0;
  if (trackInterval) { clearInterval(trackInterval); trackInterval = null; }
  if (demoInterval)  { clearInterval(demoInterval);  demoInterval  = null; }
  demoInterval = setInterval(() => {
    t += 0.013;
    if (isMobile && CFG.touchDrag) return; // don't fight touch drag
    headRaw.x = Math.sin(t * 0.60) * 0.40;
    headRaw.y = Math.sin(t * 0.42) * 0.25;
  }, 16);
  fadeStatus(3000);
}
