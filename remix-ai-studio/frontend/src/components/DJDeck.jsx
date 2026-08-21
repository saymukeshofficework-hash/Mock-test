import { useEffect, useMemo, useRef, useState } from 'react';
import { AudioDeck, getAudioContext, makeEqualPowerCrossfade } from '../lib/audioEngine';
import Meters from './Meters';

function Deck({ label, sources, deck, state, setState }) {
  async function loadSource(key) {
    const url = sources[key];
    if (!url) return;
    setState((s) => ({ ...s, source: key, loaded: false, playing: false }));
    await deck.loadUrl(url);
    setState((s) => ({ ...s, loaded: true }));
  }

  function togglePlay() {
    if (!state.loaded) return;
    if (state.playing) { deck.pause(); setState((s) => ({ ...s, playing: false })); }
    else { deck.play(); setState((s) => ({ ...s, playing: true })); }
  }
  function cue() {
    deck.stop();
    deck.play(0);
    deck.pause();
    setState((s) => ({ ...s, playing: false }));
  }
  function setPitch(v) {
    deck.setRate(v);
    setState((s) => ({ ...s, pitch: v }));
  }
  function toggleLoop() {
    setState((s) => ({ ...s, loop: !s.loop }));
  }

  useEffect(() => {
    deck.source && (deck.source.loop = !!state.loop);
  }, [state.loop, deck]);

  return (
    <div className="deck">
      <h3>{label}</h3>
      <select value={state.source || ''} onChange={(e) => loadSource(e.target.value)}>
        <option value="" disabled>Load track…</option>
        {sources.original && <option value="original">Original Song</option>}
        {sources.remix && <option value="remix">Remix</option>}
      </select>

      <div className={`jog-wheel${state.playing ? ' spinning' : ''}`} onClick={togglePlay} role="button" tabIndex={0} />

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 10 }}>
        <button onClick={togglePlay} disabled={!state.loaded}>{state.playing ? '⏸' : '▶'}</button>
        <button onClick={cue} disabled={!state.loaded}>CUE</button>
        <button className={state.loop ? 'active' : ''} onClick={toggleLoop} disabled={!state.loaded}>LOOP</button>
      </div>

      <label className="title">Pitch {(state.pitch * 100 - 100).toFixed(0)}%</label>
      <input type="range" min={0.92} max={1.08} step={0.001} value={state.pitch}
        onChange={(e) => setPitch(+e.target.value)} disabled={!state.loaded} />

      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8 }}>
        {state.loaded ? `Loaded: ${label === 'Deck A' ? sources.originalLabel : sources.remixLabel}` : 'No track loaded'}
      </div>
    </div>
  );
}

export default function DJDeck({ originalUrl, remixUrl }) {
  const ctx = getAudioContext();
  const deckA = useMemo(() => new AudioDeck('A'), []);
  const deckB = useMemo(() => new AudioDeck('B'), []);
  const gainA = useMemo(() => ctx.createGain(), [ctx]);
  const gainB = useMemo(() => ctx.createGain(), [ctx]);
  const master = useMemo(() => ctx.createGain(), [ctx]);
  const analyser = useMemo(() => ctx.createAnalyser(), [ctx]);

  const [stateA, setStateA] = useState({ source: null, loaded: false, playing: false, pitch: 1, loop: false });
  const [stateB, setStateB] = useState({ source: null, loaded: false, playing: false, pitch: 1, loop: false });
  const [crossfade, setCrossfade] = useState(0.5);
  const [volA, setVolA] = useState(1);
  const [volB, setVolB] = useState(1);
  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(false);
  const [eqA, setEqA] = useState({ low: 0, mid: 0, high: 0 });
  const [eqB, setEqB] = useState({ low: 0, mid: 0, high: 0 });

  useEffect(() => {
    deckA.connect(gainA); gainA.connect(master);
    deckB.connect(gainB); gainB.connect(master);
    master.connect(analyser); analyser.connect(ctx.destination);
    return () => {
      deckA.stop(); deckB.stop();
      try { gainA.disconnect(); gainB.disconnect(); master.disconnect(); analyser.disconnect(); } catch { /* gone */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const [a, b] = makeEqualPowerCrossfade(crossfade);
    gainA.gain.value = (cueB ? 0 : a * volA);
    gainB.gain.value = (cueA ? 0 : b * volB);
  }, [crossfade, volA, volB, cueA, cueB, gainA, gainB]);

  useEffect(() => { deckA.setEQ(eqA); }, [eqA, deckA]);
  useEffect(() => { deckB.setEQ(eqB); }, [eqB, deckB]);

  const sourcesA = { original: originalUrl, remix: remixUrl, originalLabel: 'Original Song', remixLabel: 'Remix' };
  const sourcesB = sourcesA;

  return (
    <div className="panel">
      <h2>DJ Deck <span className="hint">two-deck mixer — fully live in your browser</span></h2>
      <div className="dj-decks">
        <Deck label="Deck A" sources={sourcesA} deck={deckA} state={stateA} setState={setStateA} />

        <div className="mixer">
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)' }}>MIXER</div>
          <label className="title" style={{ marginTop: 10 }}>Ch. A Volume</label>
          <input type="range" min={0} max={1.2} step={0.01} value={volA} onChange={(e) => setVolA(+e.target.value)} />
          <label className="title">Ch. B Volume</label>
          <input type="range" min={0} max={1.2} step={0.01} value={volB} onChange={(e) => setVolB(+e.target.value)} />

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 10 }}>
            <div className="eq-col">
              <span style={{ fontSize: 10 }}>HI</span>
              <input type="range" min={-12} max={12} value={eqA.high} onChange={(e) => setEqA((s) => ({ ...s, high: +e.target.value }))} />
              <span style={{ fontSize: 10 }}>MID</span>
              <input type="range" min={-12} max={12} value={eqA.mid} onChange={(e) => setEqA((s) => ({ ...s, mid: +e.target.value }))} />
              <span style={{ fontSize: 10 }}>LOW</span>
              <input type="range" min={-12} max={12} value={eqA.low} onChange={(e) => setEqA((s) => ({ ...s, low: +e.target.value }))} />
            </div>
            <div className="eq-col">
              <span style={{ fontSize: 10 }}>HI</span>
              <input type="range" min={-12} max={12} value={eqB.high} onChange={(e) => setEqB((s) => ({ ...s, high: +e.target.value }))} />
              <span style={{ fontSize: 10 }}>MID</span>
              <input type="range" min={-12} max={12} value={eqB.mid} onChange={(e) => setEqB((s) => ({ ...s, mid: +e.target.value }))} />
              <span style={{ fontSize: 10 }}>LOW</span>
              <input type="range" min={-12} max={12} value={eqB.low} onChange={(e) => setEqB((s) => ({ ...s, low: +e.target.value }))} />
            </div>
          </div>

          <div className="crossfader-track">
            <label className="title">Crossfader</label>
            <input type="range" min={0} max={1} step={0.01} value={crossfade} onChange={(e) => setCrossfade(+e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)' }}>
              <span>A</span><span>B</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'center' }}>
            <button className={cueA ? 'active' : 'ghost'} onClick={() => setCueA((v) => !v)}>Cue A</button>
            <button className={cueB ? 'active' : 'ghost'} onClick={() => setCueB((v) => !v)}>Cue B</button>
          </div>
          <div style={{ marginTop: 10 }}>
            <Meters analyser={analyser} running={stateA.playing || stateB.playing} />
          </div>
        </div>

        <Deck label="Deck B" sources={sourcesB} deck={deckB} state={stateB} setState={setStateB} />
      </div>
    </div>
  );
}
