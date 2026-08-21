import { useState } from 'react';
import { getAudioContext } from '../lib/audioEngine';

// Client-side waveform region editing (loop / cut / duplicate / reverse /
// fade) applied directly to the decoded remix AudioBuffer via the Web
// Audio API's buffer primitives — no server round trip needed for these
// quick edits, and "Reset" reloads the original render from the server.
export default function RegionEditor({ player, region, setRegion, resultId, onRebuiltBuffer }) {
  const [looping, setLooping] = useState(false);
  const hasRegion = region && region.start != null && region.end != null && Math.abs(region.end - region.start) > 0.05;

  function withRegionSamples(fn) {
    const deck = player.remixDeck;
    if (!deck || !deck.buffer || !hasRegion) return;
    const ctx = getAudioContext();
    const buffer = deck.buffer;
    const sr = buffer.sampleRate;
    const start = Math.max(0, Math.min(region.start, region.end));
    const end = Math.min(buffer.duration, Math.max(region.start, region.end));
    const startSample = Math.floor(start * sr);
    const endSample = Math.floor(end * sr);
    const channels = [];
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) channels.push(buffer.getChannelData(ch));
    const newChannels = fn(channels, startSample, endSample, buffer.length);
    const newBuffer = ctx.createBuffer(buffer.numberOfChannels, newChannels[0].length, sr);
    newChannels.forEach((data, ch) => newBuffer.copyToChannel(data, ch));
    deck.buffer = newBuffer;
    onRebuiltBuffer?.(newBuffer);
  }

  function reverseRegion() {
    withRegionSamples((channels, s, e) => channels.map((data) => {
      const out = data.slice();
      const seg = out.slice(s, e);
      seg.reverse();
      out.set(seg, s);
      return out;
    }));
  }

  function cutRegion() {
    withRegionSamples((channels, s, e) => channels.map((data) => {
      const out = new Float32Array(data.length - (e - s));
      out.set(data.subarray(0, s), 0);
      out.set(data.subarray(e), s);
      return out;
    }));
    setRegion(null);
  }

  function duplicateRegion() {
    withRegionSamples((channels, s, e) => channels.map((data) => {
      const seg = data.subarray(s, e);
      const out = new Float32Array(data.length + seg.length);
      out.set(data.subarray(0, e), 0);
      out.set(seg, e);
      out.set(data.subarray(e), e + seg.length);
      return out;
    }));
  }

  function fade(kind) {
    withRegionSamples((channels, s, e) => channels.map((data) => {
      const out = data.slice();
      const len = e - s;
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const mult = kind === 'in' ? t : 1 - t;
        out[s + i] *= mult;
      }
      return out;
    }));
  }

  function toggleLoopRegion() {
    const deck = player.remixDeck;
    if (!deck || !hasRegion) return;
    if (!looping) {
      player.setMode('remix');
      deck.seek(Math.min(region.start, region.end));
      deck.play();
      setLooping(true);
    } else {
      deck.pause();
      setLooping(false);
    }
  }

  return (
    <div className="panel">
      <h2>Waveform Editor <span className="hint">select a region above, then apply an edit to the remix</span></h2>
      <div className="chip-row">
        <button disabled={!hasRegion} onClick={toggleLoopRegion}>{looping ? '⏹ Stop Loop' : '🔁 Loop Region'}</button>
        <button disabled={!hasRegion} onClick={cutRegion}>✂ Cut</button>
        <button disabled={!hasRegion} onClick={duplicateRegion}>⧉ Duplicate</button>
        <button disabled={!hasRegion} onClick={reverseRegion}>⏪ Reverse</button>
        <button disabled={!hasRegion} onClick={() => fade('in')}>Fade In</button>
        <button disabled={!hasRegion} onClick={() => fade('out')}>Fade Out</button>
      </div>
      {!hasRegion && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>Drag on the waveform above to select a region first.</div>}
      <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 8 }}>
        Edits apply to the in-browser remix buffer for quick auditioning. Export always renders the full server-side mastering chain fresh — use Export once you're happy with the arrangement.
      </div>
    </div>
  );
}
