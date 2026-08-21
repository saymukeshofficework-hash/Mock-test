import { useEffect, useRef, useState } from 'react';
import { startStems, pollJob } from '../lib/api';
import { AudioDeck, getAudioContext } from '../lib/audioEngine';

export default function StemsPanel({ fileId, disabled }) {
  const [status, setStatus] = useState('idle'); // idle | working | ready | error
  const [stageLabel, setStageLabel] = useState('');
  const [stemData, setStemData] = useState(null);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [levels, setLevels] = useState({});
  const [muted, setMuted] = useState({});
  const [solo, setSolo] = useState(null);
  const decksRef = useRef({});

  useEffect(() => () => {
    Object.values(decksRef.current).forEach((d) => d.stop());
  }, []);

  async function runSeparation() {
    setStatus('working');
    setError(null);
    try {
      const { job_id } = await startStems(fileId);
      const result = await pollJob(job_id, { onStage: (s) => setStageLabel(s.stage) });
      setStemData(result);
      const initLevels = {}, initMuted = {};
      Object.keys(result.stems).forEach((name) => { initLevels[name] = 1; initMuted[name] = false; });
      setLevels(initLevels);
      setMuted(initMuted);
      for (const [name, url] of Object.entries(result.stems)) {
        const deck = new AudioDeck(name);
        await deck.loadUrl(url);
        deck.connect(getAudioContext().destination);
        decksRef.current[name] = deck;
      }
      setStatus('ready');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  }

  function applyGains(nextMuted = muted, nextSolo = solo, nextLevels = levels) {
    Object.entries(decksRef.current).forEach(([name, deck]) => {
      const isMuted = nextSolo ? name !== nextSolo : nextMuted[name];
      deck.setVolume(isMuted ? 0 : nextLevels[name] ?? 1);
    });
  }

  function toggleAll() {
    const decks = Object.values(decksRef.current);
    if (!decks.length) return;
    if (playing) {
      decks.forEach((d) => d.pause());
      setPlaying(false);
    } else {
      applyGains();
      decks.forEach((d) => d.play(0));
      setPlaying(true);
    }
  }

  return (
    <div className="panel">
      <h2>Stems <span className="hint">preview &amp; download individual tracks</span></h2>
      {status === 'idle' && (
        <button className="primary" onClick={runSeparation} disabled={disabled}>Separate Stems</button>
      )}
      {status === 'working' && <div>🔄 {stageLabel || 'Working'}…</div>}
      {status === 'error' && (
        <div>
          <div style={{ color: 'var(--danger)', marginBottom: 8 }}>{error}</div>
          <button onClick={runSeparation}>Retry</button>
        </div>
      )}
      {status === 'ready' && stemData && (
        <>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>
            Method: <b style={{ color: 'var(--text)' }}>{stemData.method}</b> — {stemData.note}
          </div>
          <button onClick={toggleAll} style={{ marginBottom: 10 }}>{playing ? '⏸ Pause Stems' : '▶ Play Stems'}</button>
          {Object.entries(stemData.stems).map(([name, url]) => (
            <div className="stem-row" key={name}>
              <span className="name">{name}</span>
              <button
                className={muted[name] ? 'danger' : 'ghost'}
                onClick={() => {
                  const next = { ...muted, [name]: !muted[name] };
                  setMuted(next); applyGains(next, solo, levels);
                }}
              >M</button>
              <button
                className={solo === name ? 'active' : 'ghost'}
                onClick={() => {
                  const next = solo === name ? null : name;
                  setSolo(next); applyGains(muted, next, levels);
                }}
              >S</button>
              <input
                type="range" min={0} max={1.3} step={0.01} value={levels[name] ?? 1}
                onChange={(e) => {
                  const next = { ...levels, [name]: +e.target.value };
                  setLevels(next); applyGains(muted, solo, next);
                }}
              />
              <a href={url} download={`${name}.wav`}><button className="ghost">⬇</button></a>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
