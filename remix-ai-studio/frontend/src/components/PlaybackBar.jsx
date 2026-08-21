import Waveform from './Waveform';
import Meters from './Meters';

function fmt(t) {
  if (!Number.isFinite(t)) return '0:00';
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function PlaybackBar({
  analysis, peaks, player, region, setRegion, zoom, setZoom, hasRemix,
}) {
  const duration = player.duration || analysis?.duration || 0;

  return (
    <div className="panel">
      <h2>Waveform &amp; Playback <span className="hint">click to seek · drag to select a region · scroll to pan when zoomed</span></h2>

      <Waveform
        peaks={peaks}
        duration={duration}
        currentTime={player.currentTime}
        onSeek={player.seek}
        beatTimes={[]}
        sections={(analysis?.sections || []).map((s) => ({ ...s, type: s.label }))}
        region={region}
        onRegionChange={setRegion}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      <div className="transport">
        <button className="jog-btn primary" onClick={player.toggle}>{player.playing ? '⏸' : '▶'}</button>
        <button onClick={player.stop}>■ Stop</button>
        <span className="time-label">{fmt(player.currentTime)}</span>
        <input
          type="range" min={0} max={duration || 1} step={0.01}
          value={Math.min(player.currentTime, duration || 1)}
          onChange={(e) => player.seek(+e.target.value)}
        />
        <span className="time-label">{fmt(duration)}</span>
      </div>

      <div className="chip-row" style={{ marginTop: 14 }}>
        <div className="badge">
          <span className="label">BPM</span>
          <span className="value">{analysis ? analysis.bpm : '—'}</span>
        </div>
        <div className="badge">
          <span className="label">Key</span>
          <span className="value">{analysis ? analysis.key.label : '—'}</span>
        </div>
        <div className={`badge${analysis?.vocal?.likely_vocals ? ' pulse' : ''}`}>
          <span className="label">Vocals</span>
          <span className="value">{analysis ? (analysis.vocal.likely_vocals ? 'Detected' : 'Low') : '—'}</span>
        </div>
        <div className="badge">
          <span className="label">Sections</span>
          <span className="value">{analysis ? analysis.sections.length : '—'}</span>
        </div>
      </div>

      <div className="control-grid" style={{ marginTop: 16 }}>
        <div className="control-block">
          <label className="title">A/B Preview</label>
          <div className="ab-toggle">
            <button className={player.mode === 'original' ? 'active' : ''} onClick={() => player.setMode('original')}>Original</button>
            <button className={player.mode === 'remix' ? 'active' : ''} disabled={!hasRemix} onClick={() => player.setMode('remix')}>Remix</button>
          </div>
        </div>
        <div className="control-block">
          <label className="title">Original Volume</label>
          <input type="range" min={0} max={1.3} step={0.01} value={player.volumes.original}
            onChange={(e) => player.setVolume('original', +e.target.value)} />
        </div>
        <div className="control-block">
          <label className="title">Remix Volume</label>
          <input type="range" min={0} max={1.3} step={0.01} value={player.volumes.remix}
            onChange={(e) => player.setVolume('remix', +e.target.value)} />
        </div>
        <div className="control-block">
          <label className="title">Master Volume</label>
          <input type="range" min={0} max={1.3} step={0.01} value={player.volumes.master}
            onChange={(e) => player.setVolume('master', +e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <Meters analyser={player.analyser} running={player.playing} />
      </div>
    </div>
  );
}
