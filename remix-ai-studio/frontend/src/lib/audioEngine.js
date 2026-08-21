// Thin Web Audio wrapper shared by the A/B preview player and the DJ decks.
// Everything here runs 100% client-side — no server round trip needed to
// play, loop, EQ or crossfade audio that has already been fetched once.

let sharedCtx = null;
export function getAudioContext() {
  if (!sharedCtx) sharedCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (sharedCtx.state === 'suspended') sharedCtx.resume();
  return sharedCtx;
}

const bufferCache = new Map();
export async function loadBuffer(url) {
  if (bufferCache.has(url)) return bufferCache.get(url);
  const ctx = getAudioContext();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load audio (${res.status})`);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  bufferCache.set(url, audioBuffer);
  return audioBuffer;
}

export class AudioDeck {
  constructor(label = 'deck') {
    this.label = label;
    this.ctx = getAudioContext();
    this.buffer = null;
    this.source = null;
    this.startedAtCtx = 0;
    this.startedAtOffset = 0;
    this.playing = false;
    this.rate = 1.0;
    this.onEnded = null;

    this.gain = this.ctx.createGain();
    this.low = this.ctx.createBiquadFilter();
    this.low.type = 'lowshelf'; this.low.frequency.value = 200;
    this.mid = this.ctx.createBiquadFilter();
    this.mid.type = 'peaking'; this.mid.frequency.value = 1000; this.mid.Q.value = 0.9;
    this.high = this.ctx.createBiquadFilter();
    this.high.type = 'highshelf'; this.high.frequency.value = 5000;
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'allpass';
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;

    this.gain.connect(this.low);
    this.low.connect(this.mid);
    this.mid.connect(this.high);
    this.high.connect(this.filter);
    this.filter.connect(this.analyser);
  }

  connect(node) {
    this.analyser.connect(node);
    return this;
  }

  async loadUrl(url) {
    this.stop();
    this.buffer = await loadBuffer(url);
    return this.buffer;
  }

  get duration() {
    return this.buffer ? this.buffer.duration / this.rate : 0;
  }

  get currentTime() {
    if (!this.buffer) return 0;
    if (!this.playing) return this.startedAtOffset;
    return this.startedAtOffset + (this.ctx.currentTime - this.startedAtCtx) * this.rate;
  }

  play(offset = null) {
    if (!this.buffer) return;
    this.stopSourceOnly();
    const startOffset = offset != null ? offset : this.startedAtOffset;
    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.playbackRate.value = this.rate;
    this.source.connect(this.gain);
    this.source.onended = () => {
      if (this.playing) {
        this.playing = false;
        if (this.onEnded) this.onEnded();
      }
    };
    this.source.start(this.ctx.currentTime, Math.max(0, Math.min(startOffset, this.buffer.duration - 0.01)));
    this.startedAtCtx = this.ctx.currentTime;
    this.startedAtOffset = startOffset;
    this.playing = true;
  }

  pause() {
    if (!this.playing) return;
    this.startedAtOffset = this.currentTime;
    this.stopSourceOnly();
    this.playing = false;
  }

  stopSourceOnly() {
    if (this.source) {
      try { this.source.onended = null; this.source.stop(); } catch { /* already stopped */ }
      this.source.disconnect();
      this.source = null;
    }
  }

  stop() {
    this.stopSourceOnly();
    this.playing = false;
    this.startedAtOffset = 0;
  }

  seek(time) {
    const wasPlaying = this.playing;
    this.startedAtOffset = Math.max(0, Math.min(time, this.duration));
    if (wasPlaying) this.play(this.startedAtOffset);
  }

  setVolume(v) { this.gain.gain.value = v; }
  setRate(r) {
    this.rate = r;
    if (this.source) this.source.playbackRate.value = r;
  }
  setEQ({ low, mid, high }) {
    if (low != null) this.low.gain.value = low;
    if (mid != null) this.mid.gain.value = mid;
    if (high != null) this.high.gain.value = high;
  }
  setFilter(cutoff) {
    if (cutoff >= 20000) { this.filter.type = 'allpass'; return; }
    this.filter.type = cutoff > 1000 ? 'lowpass' : 'highpass';
    this.filter.frequency.value = cutoff;
  }
}

export function makeEqualPowerCrossfade(x) {
  // x in [0,1], 0 = full A, 1 = full B
  const a = Math.cos(x * 0.5 * Math.PI);
  const b = Math.sin(x * 0.5 * Math.PI);
  return [a, b];
}

export function drawMeter(canvas, analyser) {
  if (!canvas || !analyser) return;
  const ctx2d = canvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const data = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(data);
  const w = canvas.width, h = canvas.height;
  ctx2d.clearRect(0, 0, w, h);
  const barCount = 40;
  const step = Math.floor(bufferLength / barCount);
  const barWidth = w / barCount;
  for (let i = 0; i < barCount; i++) {
    let sum = 0;
    for (let j = 0; j < step; j++) sum += data[i * step + j];
    const value = sum / step / 255;
    const barHeight = value * h;
    const hue = 320 - value * 140;
    ctx2d.fillStyle = `hsl(${hue}, 85%, 60%)`;
    ctx2d.fillRect(i * barWidth + 1, h - barHeight, barWidth - 2, barHeight);
  }
}
