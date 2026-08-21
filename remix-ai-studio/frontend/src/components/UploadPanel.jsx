import { useRef, useState } from 'react';
import { uploadSong } from '../lib/api';

const ACCEPTED = '.mp3,.wav,.m4a,.aac,.flac,.ogg';

export default function UploadPanel({ onUploaded, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    setFileName(file.name);
    setProgress(0);
    try {
      const result = await uploadSong(file, setProgress);
      setProgress(1);
      onUploaded(result);
    } catch (e) {
      setError(e.message);
      setProgress(null);
    }
  }

  return (
    <div className="panel">
      <h2>1. Upload Song <span className="hint">MP3, WAV, M4A, AAC, FLAC, OGG</span></h2>
      <div
        className={`dropzone${dragging ? ' drag' : ''}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {fileName ? (
          <div>🎵 <b>{fileName}</b>{progress != null && progress < 1 ? ' — uploading…' : ' — loaded. Drop another file to replace it.'}</div>
        ) : (
          <div>🎧 <b>Tap or drag a song here</b><br /><span style={{ color: 'var(--text-dim)', fontSize: 12 }}>Upload only music you own or have permission to remix.</span></div>
        )}
      </div>
      {progress != null && progress < 1 && (
        <div className="progress-bar"><div style={{ width: `${Math.round(progress * 100)}%` }} /></div>
      )}
      {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{error}</div>}
    </div>
  );
}
