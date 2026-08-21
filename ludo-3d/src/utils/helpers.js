/** Minimal, dependency-free pub/sub used to decouple game logic from rendering/UI. */
export class EventEmitter {
  constructor() {
    this._listeners = new Map();
  }

  on(event, handler) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    this._listeners.get(event)?.delete(handler);
  }

  emit(event, payload) {
    this._listeners.get(event)?.forEach((handler) => handler(payload));
  }
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOutBounce = (t) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

/** Tiny promise-based tween scheduler shared by the token and dice animators. */
export class Tweener {
  constructor() {
    this._active = [];
  }

  run({ duration, ease = easeOutCubic, onUpdate, onComplete }) {
    return new Promise((resolve) => {
      this._active.push({ duration: Math.max(0.001, duration), elapsed: 0, ease, onUpdate, onComplete, resolve });
    });
  }

  update(dt) {
    if (!this._active.length) return;
    const remaining = [];
    for (const tween of this._active) {
      tween.elapsed += dt;
      const t = Math.min(1, tween.elapsed / tween.duration);
      tween.onUpdate(tween.ease(t));
      if (t >= 1) {
        tween.onComplete?.();
        tween.resolve();
      } else {
        remaining.push(tween);
      }
    }
    this._active = remaining;
  }
}

export const MAX_NAME_LENGTH = 14;

/** Validates a player name; returns an error string, or '' when valid. */
export function validatePlayerName(name, existingNames = []) {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'Enter a name';
  if (trimmed.length > MAX_NAME_LENGTH) return `Max ${MAX_NAME_LENGTH} characters`;
  const dupe = existingNames.some((n) => n.trim().toLowerCase() === trimmed.toLowerCase());
  if (dupe) return 'Name already used';
  return '';
}

export function sanitizeName(name, fallback) {
  const trimmed = (name || '').trim().slice(0, MAX_NAME_LENGTH);
  return trimmed || fallback;
}

let toastRoot = null;
export function toast(message, duration = 2600) {
  toastRoot = toastRoot || document.getElementById('toast-root');
  if (!toastRoot) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  toastRoot.appendChild(el);
  window.setTimeout(() => {
    el.classList.add('leaving');
    window.setTimeout(() => el.remove(), 320);
  }, duration);
}

export function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

export function isCoarsePointer() {
  return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
}

export function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
