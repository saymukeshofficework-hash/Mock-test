import { useState, useEffect } from 'react';
import Logo from './components/Logo';
import UploadPanel from './components/UploadPanel';
import PlaybackBar from './components/PlaybackBar';
import RegionEditor from './components/RegionEditor';
import RemixControls from './components/RemixControls';
import StemsPanel from './components/StemsPanel';
import ExportPanel from './components/ExportPanel';
import DJDeck from './components/DJDeck';
import ProjectBar from './components/ProjectBar';
import { useIsMobile, usePreviewPlayer } from './lib/hooks';
import { startAnalysis, startRemix, pollJob, getOptions, originalAudioUrl, previewUrl, cancelJob } from './lib/api';

const DEFAULT_SETTINGS = {
  style_id: null,
  energy_level: 'MEDIUM',
  tempo_mode: 'original',
  custom_bpm: null,
  vocal_treatment: 'original',
  bass_intensity: 'normal',
  drum_intensity: 'standard',
  extra_effects: [],
};

export default function App() {
  const isMobile = useIsMobile();
  const player = usePreviewPlayer();

  const [options, setOptions] = useState(null);
  const [fileMeta, setFileMeta] = useState(null); // {file_id, filename, duration, size}
  const [analysisJob, setAnalysisJob] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [remixJob, setRemixJob] = useState(null);
  const [remixJobId, setRemixJobId] = useState(null);
  const [remixResult, setRemixResult] = useState(null);

  const [region, setRegion] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showDjDeck, setShowDjDeck] = useState(false);

  useEffect(() => { getOptions().then(setOptions).catch(() => {}); }, []);

  async function handleUploaded(meta) {
    setFileMeta(meta);
    setAnalysis(null);
    setRemixResult(null);
    setRegion(null);
    setCurrentProjectId(null);
    await player.loadOriginal(originalAudioUrl(meta.file_id));
    player.setMode('original');
    runAnalysis(meta.file_id);
  }

  async function runAnalysis(fileId) {
    setAnalysisError(null);
    try {
      const { job_id } = await startAnalysis(fileId);
      setAnalysisJob({ stage: 'ANALYZING', done: false });
      const result = await pollJob(job_id, { onStage: setAnalysisJob });
      setAnalysis(result);
      if (!settings.style_id && options) setSettings((s) => ({ ...s, style_id: options.styles[0].id }));
    } catch (e) {
      setAnalysisError(e.message);
    }
  }

  async function handleRemix() {
    if (!fileMeta || !settings.style_id) return;
    setRemixResult(null);
    try {
      const { job_id } = await startRemix(fileMeta.file_id, settings);
      setRemixJobId(job_id);
      setRemixJob({ stage: 'ANALYZING', done: false });
      const result = await pollJob(job_id, { onStage: setRemixJob });
      setRemixResult(result);
      await player.loadRemix(previewUrl(result.result_id));
      player.setMode('remix');
      player.stop();
    } catch (e) {
      setRemixJob({ stage: 'ERROR', done: true, error: e.message });
    } finally {
      setRemixJobId(null);
    }
  }

  async function handleCancelRemix() {
    if (!remixJobId) return;
    try { await cancelJob(remixJobId); } catch { /* job may have already finished */ }
  }

  function getSnapshot() {
    return {
      file_id: fileMeta?.file_id || null,
      filename: fileMeta?.filename || null,
      analysis,
      settings,
      result_id: remixResult?.result_id || null,
      arrangement: remixResult?.arrangement || null,
      metrics: remixResult?.metrics || null,
      suggestedName: fileMeta ? `${fileMeta.filename.replace(/\.[^.]+$/, '')} — ${settings.style_id || ''}` : 'My Remix',
    };
  }

  async function handleLoadProject(project) {
    setFileMeta(project.file_id ? { file_id: project.file_id, filename: project.filename, duration: project.analysis?.duration } : null);
    setAnalysis(project.analysis || null);
    setSettings({ ...DEFAULT_SETTINGS, ...(project.settings || {}) });
    setRemixResult(project.result_id ? {
      result_id: project.result_id, arrangement: project.arrangement, metrics: project.metrics,
    } : null);
    try {
      if (project.file_id) await player.loadOriginal(originalAudioUrl(project.file_id));
      if (project.result_id) await player.loadRemix(previewUrl(project.result_id));
      player.setMode(project.result_id ? 'remix' : 'original');
    } catch {
      // Referenced server files may have expired (temp-file cleanup) — that's fine,
      // the project's settings/analysis still restore for a fresh remix run.
    }
  }

  const hasSong = !!fileMeta;
  const hasAnalysis = !!analysis;
  const hasRemix = !!remixResult?.result_id;

  return (
    <div className="app-shell">
      <header className="topbar">
        <Logo />
        <ProjectBar getSnapshot={getSnapshot} onLoad={handleLoadProject} currentProjectId={currentProjectId} setCurrentProjectId={setCurrentProjectId} />
      </header>

      <UploadPanel onUploaded={handleUploaded} />

      {hasSong && !hasAnalysis && !analysisError && (
        <div className="panel">🔄 Analyzing “{fileMeta.filename}”… ({analysisJob?.stage || 'ANALYZING'})</div>
      )}
      {analysisError && (
        <div className="panel">
          <div style={{ color: 'var(--danger)' }}>{analysisError}</div>
          <button onClick={() => runAnalysis(fileMeta.file_id)}>Retry Analysis</button>
        </div>
      )}

      {hasSong && hasAnalysis && (
        <>
          <PlaybackBar
            analysis={analysis}
            peaks={analysis.waveform_peaks}
            player={player}
            region={region}
            setRegion={setRegion}
            zoom={zoom}
            setZoom={setZoom}
            hasRemix={hasRemix}
          />

          <RegionEditor player={player} region={region} setRegion={setRegion} resultId={remixResult?.result_id}
            onRebuiltBuffer={player.refreshDuration} />

          <RemixControls
            options={options}
            settings={settings}
            setSettings={setSettings}
            onRemix={handleRemix}
            remixJob={remixJob}
            onCancel={handleCancelRemix}
            isProcessing={!!remixJobId}
            disabled={!options}
          />

          {hasRemix && remixResult.metrics && (
            <div className="panel">
              <h2>Mastering Report</h2>
              <div className="chip-row">
                <div className="badge"><span className="label">LUFS</span><span className="value">{remixResult.metrics.lufs}</span></div>
                <div className="badge"><span className="label">Peak dB</span><span className="value">{remixResult.metrics.peak_db}</span></div>
                <div className="badge"><span className="label">RMS dB</span><span className="value">{remixResult.metrics.rms_db}</span></div>
                <div className="badge"><span className="label">Dyn. Range</span><span className="value">{remixResult.metrics.dynamic_range_db}</span></div>
              </div>
            </div>
          )}

          <StemsPanel fileId={fileMeta.file_id} disabled={false} />

          <ExportPanel resultId={remixResult?.result_id} disabled={!hasRemix} />

          <div className="panel">
            <h2>DJ Deck <span className="hint">optional two-deck live mixer</span></h2>
            {!showDjDeck ? (
              <button onClick={() => setShowDjDeck(true)}>Open DJ Deck</button>
            ) : (
              <DJDeck originalUrl={originalAudioUrl(fileMeta.file_id)} remixUrl={hasRemix ? previewUrl(remixResult.result_id) : null} />
            )}
          </div>
        </>
      )}

      <div className="copyright-banner">
        Upload only music you own or have permission to remix. REMiX AI processes your audio locally in this
        session and does not bypass DRM or download audio from streaming services.
      </div>

      {isMobile && hasSong && (
        <div className="mobile-bottom-bar">
          <button className="play-big primary" onClick={player.toggle}>{player.playing ? '⏸' : '▶'}</button>
          <input type="range" min={0} max={player.duration || 1} step={0.01} value={Math.min(player.currentTime, player.duration || 1)}
            onChange={(e) => player.seek(+e.target.value)} style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{player.mode === 'original' ? 'ORIG' : 'REMIX'}</span>
        </div>
      )}
    </div>
  );
}
