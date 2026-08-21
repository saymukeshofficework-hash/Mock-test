const SAVE_KEY = 'ludo3d.save.v1';
const SETTINGS_KEY = 'ludo3d.settings.v1';

export const DEFAULT_SETTINGS = {
  sound: true,
  music: true,
  animationQuality: 'high', // 'high' | 'medium' | 'low'
  cameraMovement: true
};

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function loadSettings() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...safeParse(raw, {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* localStorage unavailable (private mode / quota) — settings just won't persist */
  }
}

export function saveGame(stateJSON) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ savedAt: Date.now(), state: stateJSON }));
    return true;
  } catch {
    return false;
  }
}

/** Returns the saved game payload, or null if none exists / it's corrupted. */
export function loadGame() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = safeParse(raw, null);
    if (!parsed || !parsed.state || !Array.isArray(parsed.state.players)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSavedGame() {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

export function hasSavedGame() {
  return !!loadGame();
}
