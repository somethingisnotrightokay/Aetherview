// js/state.js — shared state across all modules

export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints > 1 && !/Macintosh/i.test(navigator.userAgent));

export const isFileProtocol = location.protocol === 'file:';

export const CFG = {
  sensitivity : 0.8,
  depthScale  : 1.0,
  smoothing   : 0.08,
  flipY       : false,
  fov         : 60,
  targetFPS   : 0,   // set below
  touchDrag   : true,
};
CFG.targetFPS = isMobile ? 24 : 30;

// Head tracking state — objects so mutations are visible across modules
export const headRaw    = { x: 0, y: 0 };
export const headSmooth = { x: 0, y: 0 };

export const tracking = {
  calibrated : false,
  latestNose : null,   // { x, y } in normalised webcam space
  refNoseX   : 0.5,
  refNoseY   : 0.5,
  gyroBaseG  : null,
  gyroBaseB  : null,
  gyroActive : false,
};

// ── FPS counters
const _fps = { rFrames: 0, tFrames: 0, rFPS: 0, tFPS: 0, last: performance.now() };

export function countRender() {
  _fps.rFrames++;
  const now = performance.now();
  if (now - _fps.last < 1000) return;
  _fps.rFPS = _fps.rFrames;
  _fps.tFPS = _fps.tFrames;
  _fps.rFrames = _fps.tFrames = 0;
  _fps.last = now;
  const s = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  s('d-fps-page',  _fps.rFPS + ' fps');
  s('d-fps-track', _fps.tFPS + ' fps');
  s('p-fps-r', 'render: ' + _fps.rFPS);
  s('p-fps-t', 'track: '  + _fps.tFPS);
  s('m-fps-page',  _fps.rFPS);
  s('m-fps-track', _fps.tFPS);
}
export function countTrack() { _fps.tFrames++; }

// ── Status helpers
export function setStatus(msg) {
  const e = document.getElementById('status');
  if (e) { e.style.opacity = '1'; e.textContent = msg; }
}
export function fadeStatus(delay = 2000) {
  setTimeout(() => {
    const e = document.getElementById('status');
    if (e) e.style.opacity = '0';
  }, delay);
}
