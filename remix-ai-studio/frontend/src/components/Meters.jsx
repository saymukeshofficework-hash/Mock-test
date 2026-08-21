import { useEffect, useRef } from 'react';
import { drawMeter } from '../lib/audioEngine';

export default function Meters({ analyser, running }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!running) return undefined;
    let frame;
    const loop = () => {
      const canvas = canvasRef.current;
      if (canvas && analyser) {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (canvas.width !== Math.round(w * dpr)) { canvas.width = w * dpr; canvas.height = h * dpr; }
        drawMeter(canvas, analyser);
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [analyser, running]);

  return <canvas ref={canvasRef} className="meter" />;
}
