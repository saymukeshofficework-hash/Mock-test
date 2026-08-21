/**
 * All sound in Ludo 3D is synthesized live with the Web Audio API — no
 * external audio files, so there is nothing to license or ship as an
 * asset. Effects are short, layered oscillator envelopes; the optional
 * background "music" is a very soft, slow ambient pad built the same way.
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this._musicNodes = null;
    this._unlocked = false;
  }

  /** Must be called from within a user gesture (click/tap) to satisfy autoplay policies. */
  unlock() {
    if (this._unlocked) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.85;
      this.master.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0;
      this.musicGain.connect(this.master);

      this._unlocked = true;
      if (this.musicEnabled) this.startMusic();
    } catch {
      this.ctx = null;
    }
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!this.ctx) return;
    if (enabled) this.startMusic();
    else this.stopMusic();
  }

  _now() {
    return this.ctx.currentTime;
  }

  _tone({ freq, duration = 0.18, type = 'sine', gain = 0.22, delay = 0, glideTo = null, detune = 0 }) {
    if (!this.soundEnabled || !this.ctx) return;
    const t0 = this._now() + delay;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
    osc.detune.value = detune;
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(amp).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  _noiseBurst({ duration = 0.12, gain = 0.14, delay = 0, filterFreq = 1800 }) {
    if (!this.soundEnabled || !this.ctx) return;
    const t0 = this._now() + delay;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const amp = this.ctx.createGain();
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter).connect(amp).connect(this.master);
    src.start(t0);
  }

  playClick() {
    this._tone({ freq: 720, duration: 0.07, type: 'triangle', gain: 0.14 });
  }

  playDiceRoll() {
    if (!this.soundEnabled || !this.ctx) return;
    for (let i = 0; i < 6; i++) {
      this._noiseBurst({ duration: 0.05, gain: 0.1, delay: i * 0.07, filterFreq: 2600 });
    }
  }

  playMoveStep() {
    this._tone({ freq: 380, duration: 0.09, type: 'square', gain: 0.1, glideTo: 460 });
  }

  playCapture() {
    this._tone({ freq: 520, duration: 0.22, type: 'sawtooth', gain: 0.18, glideTo: 120 });
    this._noiseBurst({ duration: 0.18, gain: 0.12, delay: 0.02 });
  }

  playHomeEntry() {
    this._tone({ freq: 523.25, duration: 0.14, type: 'sine', gain: 0.2 });
    this._tone({ freq: 659.25, duration: 0.16, type: 'sine', gain: 0.18, delay: 0.09 });
    this._tone({ freq: 783.99, duration: 0.22, type: 'sine', gain: 0.16, delay: 0.18 });
  }

  playTurnChange() {
    this._tone({ freq: 440, duration: 0.1, type: 'triangle', gain: 0.14 });
    this._tone({ freq: 554.37, duration: 0.14, type: 'triangle', gain: 0.12, delay: 0.08 });
  }

  playWin() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this._tone({ freq: f, duration: 0.35, type: 'sine', gain: 0.22, delay: i * 0.14 }));
  }

  startMusic() {
    if (!this.ctx || this._musicNodes) return;
    const now = this._now();
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc3.type = 'triangle';
    osc1.frequency.value = 196.0; // G3
    osc2.frequency.value = 246.94; // B3
    osc3.frequency.value = 293.66; // D4
    osc2.detune.value = 4;

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.015;
    lfo.connect(lfoGain).connect(this.musicGain.gain);
    lfo.start(now);

    const merge = this.ctx.createGain();
    merge.gain.value = 0.5;
    [osc1, osc2, osc3].forEach((o) => { o.connect(merge); o.start(now); });
    merge.connect(this.musicGain);

    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(0, now);
    this.musicGain.gain.linearRampToValueAtTime(0.05, now + 2.5);

    this._musicNodes = { osc1, osc2, osc3, lfo, merge };
  }

  stopMusic() {
    if (!this.ctx || !this._musicNodes) return;
    const now = this._now();
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(0, now + 0.8);
    const nodes = this._musicNodes;
    window.setTimeout(() => {
      Object.values(nodes).forEach((n) => { try { n.stop?.(); n.disconnect?.(); } catch { /* already stopped */ } });
    }, 900);
    this._musicNodes = null;
  }
}
