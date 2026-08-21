import { useEffect, useRef, useState, useCallback } from 'react';

// Renders server-computed peak envelope with zoom/scroll, click-drag region
// selection, beat-grid markers and a live playhead — all client-side canvas,
// no re-fetching needed as the user interacts.
export default function Waveform({
  peaks, duration, currentTime, onSeek, beatTimes = [], sections = [],
  region, onRegionChange, zoom, onZoomChange,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dragStart, setDragStart] = useState(null);
  const [viewStart, setViewStart] = useState(0);

  const visibleSpan = duration / Math.max(1, zoom);
  const clampedViewStart = Math.max(0, Math.min(viewStart, Math.max(0, duration - visibleSpan)));

  const timeToX = useCallback((t, width) => ((t - clampedViewStart) / visibleSpan) * width, [clampedViewStart, visibleSpan]);
  const xToTime = useCallback((x, width) => clampedViewStart + (x / width) * visibleSpan, [clampedViewStart, visibleSpan]);

  useEffect(() => {
    // keep the playhead in view while zoomed in
    if (currentTime < clampedViewStart || currentTime > clampedViewStart + visibleSpan) {
      setViewStart(Math.max(0, currentTime - visibleSpan / 2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.floor(currentTime)]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = 130;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#12141f';
    ctx.fillRect(0, 0, width, height);

    const sectionColors = {
      intro: '#3a3f5c', outro: '#3a3f5c', verse: '#22263a', chorus: '#402848',
      drop: '#5c1f45', buildup: '#4a2f1a', breakdown: '#1c2f3a', bridge: '#2a2440',
    };
    sections.forEach((s) => {
      const x1 = timeToX(s.start, width), x2 = timeToX(s.end, width);
      if (x2 < 0 || x1 > width) return;
      ctx.fillStyle = sectionColors[s.type || s.label] || '#22263a';
      ctx.fillRect(Math.max(0, x1), 0, Math.min(width, x2) - Math.max(0, x1), height);
    });

    if (peaks && peaks.length) {
      const mid = height / 2;
      const samplesInView = Math.max(1, Math.floor((visibleSpan / duration) * peaks.length));
      const startIdx = Math.floor((clampedViewStart / duration) * peaks.length);
      ctx.fillStyle = '#29e0d4';
      for (let x = 0; x < width; x++) {
        const idx = startIdx + Math.floor((x / width) * samplesInView);
        if (idx < 0 || idx >= peaks.length) continue;
        const [mn, mx] = peaks[idx];
        const y1 = mid + mn * mid * 0.92;
        const y2 = mid + mx * mid * 0.92;
        ctx.fillRect(x, y1, 1, Math.max(1, y2 - y1));
      }
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    beatTimes.forEach((t) => {
      if (t < clampedViewStart || t > clampedViewStart + visibleSpan) return;
      const x = timeToX(t, width);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    });

    if (region && region.start != null && region.end != null) {
      const x1 = timeToX(Math.min(region.start, region.end), width);
      const x2 = timeToX(Math.max(region.start, region.end), width);
      ctx.fillStyle = 'rgba(255, 61, 129, 0.18)';
      ctx.fillRect(x1, 0, x2 - x1, height);
      ctx.strokeStyle = '#ff3d81';
      ctx.strokeRect(x1, 0, x2 - x1, height);
    }

    if (currentTime >= clampedViewStart && currentTime <= clampedViewStart + visibleSpan) {
      const x = timeToX(currentTime, width);
      ctx.strokeStyle = '#ffb347';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      ctx.lineWidth = 1;
    }
  }, [peaks, duration, currentTime, beatTimes, sections, region, clampedViewStart, visibleSpan, timeToX]);

  function handleDown(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = xToTime(e.clientX - rect.left, rect.width);
    setDragStart(t);
    onRegionChange?.({ start: t, end: t });
  }
  function handleMove(e) {
    if (dragStart == null) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const t = xToTime(e.clientX - rect.left, rect.width);
    onRegionChange?.({ start: dragStart, end: t });
  }
  function handleUp(e) {
    if (dragStart == null) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const t = xToTime(e.clientX - rect.left, rect.width);
    if (Math.abs(t - dragStart) < 0.15) {
      onSeek(t);
      onRegionChange?.(null);
    }
    setDragStart(null);
  }

  function handleWheel(e) {
    e.preventDefault();
    setViewStart((v) => Math.max(0, Math.min(v + e.deltaY * (visibleSpan / 400), Math.max(0, duration - visibleSpan))));
  }

  return (
    <div className="waveform-wrap" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="waveform"
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={() => dragStart != null && setDragStart(null)}
        onWheel={handleWheel}
      />
      <div className="waveform-toolbar">
        <button className="ghost" onClick={() => onZoomChange(Math.max(1, zoom / 1.6))}>🔍−</button>
        <button className="ghost" onClick={() => onZoomChange(Math.min(40, zoom * 1.6))}>🔍+</button>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{zoom.toFixed(1)}x — scroll to pan when zoomed</span>
        <div className="spacer" />
        {region && region.start != null && (
          <button className="ghost" onClick={() => onRegionChange(null)}>✕ Clear selection</button>
        )}
      </div>
    </div>
  );
}
