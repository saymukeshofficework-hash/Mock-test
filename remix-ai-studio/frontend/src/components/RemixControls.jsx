import { useState } from 'react';

const STAGES = ['ANALYZING', 'BEAT_MATCHING', 'VOCAL_PROCESSING', 'BUILDING_DROP', 'MIXING', 'MASTERING', 'READY'];
const STAGE_LABELS = {
  ANALYZING: 'Analyzing', BEAT_MATCHING: 'Beat Matching', VOCAL_PROCESSING: 'Vocal Processing',
  BUILDING_DROP: 'Building Drop', MIXING: 'Mixing', MASTERING: 'Mastering', READY: 'Ready',
};
const ENERGY_ORDER = ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'];
const TEMPO_BUTTONS = [
  { id: 'minus10', label: '-10%' }, { id: 'minus5', label: '-5%' },
  { id: 'original', label: 'Original' },
  { id: 'plus5', label: '+5%' }, { id: 'plus10', label: '+10%' },
];

export default function RemixControls({ options, settings, setSettings, onRemix, remixJob, onCancel, isProcessing, disabled }) {
  const [customBpmOpen, setCustomBpmOpen] = useState(false);
  if (!options) return null;

  function update(patch) { setSettings((s) => ({ ...s, ...patch })); }
  function toggleEffect(name) {
    setSettings((s) => {
      const has = s.extra_effects.includes(name);
      return { ...s, extra_effects: has ? s.extra_effects.filter((e) => e !== name) : [...s.extra_effects, name] };
    });
  }

  const stage = remixJob?.stage;
  const stageIndex = STAGES.indexOf(stage);

  return (
    <div className="panel">
      <h2>2. Choose Remix Style</h2>
      <div className="preset-grid">
        {options.styles.map((style) => (
          <button
            key={style.id}
            className={`preset-card${settings.style_id === style.id ? ' selected' : ''}`}
            onClick={() => update({ style_id: style.id })}
            disabled={disabled}
          >
            <div className="title">{style.label}</div>
            <div className="desc">{style.description}</div>
            <span className="bpm">{style.bpm_range[0]}–{style.bpm_range[1]} BPM</span>
          </button>
        ))}
      </div>

      <h2 style={{ marginTop: 22 }}>3. Energy</h2>
      <input
        type="range" min={0} max={3} step={1}
        value={ENERGY_ORDER.indexOf(settings.energy_level)}
        onChange={(e) => update({ energy_level: ENERGY_ORDER[+e.target.value] })}
      />
      <div className="energy-scale">{ENERGY_ORDER.map((e) => <span key={e}>{e}</span>)}</div>

      <h2 style={{ marginTop: 22 }}>Tempo</h2>
      <div className="chip-row">
        {TEMPO_BUTTONS.map((t) => (
          <button key={t.id} className={`chip${settings.tempo_mode === t.id ? ' active' : ''}`}
            onClick={() => { update({ tempo_mode: t.id }); setCustomBpmOpen(false); }} disabled={disabled}>
            {t.label}
          </button>
        ))}
        <button className={`chip${settings.tempo_mode === 'custom' ? ' active' : ''}`}
          onClick={() => { update({ tempo_mode: 'custom' }); setCustomBpmOpen(true); }} disabled={disabled}>
          Custom
        </button>
        {customBpmOpen && (
          <input type="number" min={40} max={200} style={{ width: 80 }}
            placeholder="BPM" value={settings.custom_bpm || ''}
            onChange={(e) => update({ custom_bpm: +e.target.value })} />
        )}
      </div>

      <div className="control-grid" style={{ marginTop: 20 }}>
        <div className="control-block">
          <label className="title">Vocal Treatment</label>
          <select value={settings.vocal_treatment} disabled={disabled}
            onChange={(e) => update({ vocal_treatment: e.target.value })}>
            {options.vocal_treatments.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="control-block">
          <label className="title">Bass</label>
          <select value={settings.bass_intensity} disabled={disabled}
            onChange={(e) => update({ bass_intensity: e.target.value })}>
            {options.bass_intensities.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="control-block">
          <label className="title">Drums</label>
          <select value={settings.drum_intensity} disabled={disabled}
            onChange={(e) => update({ drum_intensity: e.target.value })}>
            {options.drum_intensities.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <h2 style={{ marginTop: 22 }}>Effects</h2>
      <div className="chip-row">
        {options.effects.map((fx) => (
          <button key={fx} className={`chip${settings.extra_effects.includes(fx) ? ' active' : ''}`}
            onClick={() => toggleEffect(fx)} disabled={disabled}>
            {fx.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="mobile-ai-remix-wrap" style={{ marginTop: 26 }}>
        <button className="ai-remix-btn" onClick={onRemix} disabled={disabled || !settings.style_id || isProcessing}>
          {stage && !remixJob?.done ? `${STAGE_LABELS[stage] || stage}…` : '⚡ AI REMIX'}
        </button>
        {isProcessing && (
          <button className="ghost" style={{ marginTop: 8, width: '100%' }} onClick={onCancel}>✕ Cancel Processing</button>
        )}
        <div className="stage-list">
          {STAGES.map((s, i) => (
            <span key={s} className={`stage-pill${
              remixJob?.error ? (i <= stageIndex ? ' error' : '') :
              i < stageIndex || (remixJob?.done) ? ' complete' : i === stageIndex ? ' active' : ''
            }`}>
              {STAGE_LABELS[s]}
            </span>
          ))}
        </div>
        {remixJob?.error && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{remixJob.error}</div>}
      </div>
    </div>
  );
}
