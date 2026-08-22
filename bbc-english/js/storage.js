/* localStorage wrapper — never throws, even in private browsing where
   localStorage can be unavailable or full. */
const STORAGE_PREFIX = "bbceng_";

const Storage = {
  _memory: {},
  _available: (() => {
    try {
      const k = "__bbceng_test__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  })(),

  get(key, fallback = null) {
    const fullKey = STORAGE_PREFIX + key;
    try {
      if (this._available) {
        const raw = window.localStorage.getItem(fullKey);
        return raw === null ? fallback : JSON.parse(raw);
      }
      return Object.prototype.hasOwnProperty.call(this._memory, fullKey) ? this._memory[fullKey] : fallback;
    } catch (e) {
      return fallback;
    }
  },

  set(key, value) {
    const fullKey = STORAGE_PREFIX + key;
    try {
      if (this._available) {
        window.localStorage.setItem(fullKey, JSON.stringify(value));
      } else {
        this._memory[fullKey] = value;
      }
    } catch (e) {
      this._memory[fullKey] = value;
    }
  },

  remove(key) {
    const fullKey = STORAGE_PREFIX + key;
    try {
      if (this._available) window.localStorage.removeItem(fullKey);
    } catch (e) {
      /* ignore */
    }
    delete this._memory[fullKey];
  }
};
