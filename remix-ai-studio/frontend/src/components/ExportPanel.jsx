import { useState } from 'react';
import { startExport, pollJob, previewUrl } from '../lib/api';

const BITRATES = [128, 192, 256, 320];
const BIT_DEPTHS = [16, 24];

export default function ExportPanel({ resultId, disabled }) {
  const [format, setFormat] = useState('mp3');
  const [bitrate, setBitrate] = useState(256);
  const [bitDepth, setBitDepth] = useState(16);
  const [state, setState] = useState('idle'); // idle | working | done | error
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  async function runExport() {
    setState('working');
    setError(null);
    setProgress(0.2);
    try {
      const { job_id } = await startExport(resultId, {
        format, bitrate_kbps: bitrate, bit_depth: bitDepth,
      });
      const result = await pollJob(job_id, { onStage: () => setProgress((p) => Math.min(0.9, p + 0.15)) });
      setProgress(1);
      setDownloadUrl(result.download_url);
      setState('done');
    } catch (e) {
      setError(e.message);
      setState('error');
    }
  }

  return (
    <div className="panel">
      <h2>4. Export</h2>
      <div className="export-row">
        <select value={format} onChange={(e) => setFormat(e.target.value)} disabled={disabled}>
          <option value="mp3">MP3</option>
          <option value="wav">WAV</option>
        </select>
        {format === 'mp3' && (
          <select value={bitrate} onChange={(e) => setBitrate(+e.target.value)} disabled={disabled}>
            {BITRATES.map((b) => <option key={b} value={b}>{b} kbps</option>)}
          </select>
        )}
        {format === 'wav' && (
          <select value={bitDepth} onChange={(e) => setBitDepth(+e.target.value)} disabled={disabled}>
            {BIT_DEPTHS.map((b) => <option key={b} value={b}>{b}-bit</option>)}
          </select>
        )}
        <button className="primary" onClick={runExport} disabled={disabled || state === 'working'}>
          ⬇ Export Full Remix
        </button>
        {resultId && (
          <a href={previewUrl(resultId)} download="remix-preview.wav">
            <button className="ghost" disabled={disabled}>Quick Preview WAV</button>
          </a>
        )}
      </div>

      {state === 'working' && <div className="progress-bar"><div style={{ width: `${progress * 100}%` }} /></div>}
      {state === 'error' && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{error}</div>}
      {state === 'done' && downloadUrl && (
        <div style={{ marginTop: 10 }}>
          <a href={downloadUrl} download>
            <button className="primary">✅ Download {format.toUpperCase()}</button>
          </a>
        </div>
      )}
      <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 10 }}>
        Vocal/instrumental stem downloads are available in the Stems panel above.
      </div>
    </div>
  );
}
