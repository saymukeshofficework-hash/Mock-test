import { useEffect, useMemo, useRef, useState } from 'react';
import { AudioDeck, getAudioContext } from './audioEngine';

export function useIsMobile(breakpoint = 860) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

// A/B preview player: two independent decks (original / remix), only one
// audible at a time (instant A/B switch), each with its own volume and a
// shared master volume + analyser for the spectrum meter.
export function usePreviewPlayer() {
  const originalDeck = useMemo(() => new AudioDeck('original'), []);
  const remixDeck = useMemo(() => new AudioDeck('remix'), []);
  const masterGain = useMemo(() => getAudioContext().createGain(), []);
  const analyser = useMemo(() => getAudioContext().createAnalyser(), []);

  const [mode, setModeState] = useState('remix');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState({ original: false, remix: false });
  const [volumes, setVolumes] = useState({ original: 1, remix: 1, master: 0.9 });

  useEffect(() => {
    originalDeck.connect(masterGain);
    remixDeck.connect(masterGain);
    masterGain.connect(analyser);
    analyser.connect(getAudioContext().destination);
    originalDeck.onEnded = () => setPlaying(false);
    remixDeck.onEnded = () => setPlaying(false);
    return () => {
      originalDeck.stop();
      remixDeck.stop();
      try { masterGain.disconnect(); analyser.disconnect(); } catch { /* already gone */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { originalDeck.setVolume(volumes.original); }, [originalDeck, volumes.original]);
  useEffect(() => { remixDeck.setVolume(volumes.remix); }, [remixDeck, volumes.remix]);
  useEffect(() => { masterGain.gain.value = volumes.master; }, [masterGain, volumes.master]);

  const activeDeck = mode === 'original' ? originalDeck : remixDeck;

  useEffect(() => {
    let frame;
    const tick = () => {
      setCurrentTime(activeDeck.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [activeDeck]);

  async function loadOriginal(url) {
    await originalDeck.loadUrl(url);
    setReady((r) => ({ ...r, original: true }));
    if (mode === 'original') setDuration(originalDeck.duration);
  }
  async function loadRemix(url) {
    await remixDeck.loadUrl(url);
    setReady((r) => ({ ...r, remix: true }));
    if (mode === 'remix') setDuration(remixDeck.duration);
  }

  function setMode(next) {
    const wasPlaying = playing;
    const otherDeck = next === 'original' ? originalDeck : remixDeck;
    originalDeck.pause();
    remixDeck.pause();
    setModeState(next);
    setDuration(otherDeck.duration);
    setCurrentTime(otherDeck.currentTime);
    if (wasPlaying) otherDeck.play();
  }

  function toggle() {
    if (playing) {
      activeDeck.pause();
      setPlaying(false);
    } else {
      activeDeck.play();
      setPlaying(true);
    }
  }
  function stop() {
    originalDeck.stop();
    remixDeck.stop();
    setPlaying(false);
    setCurrentTime(0);
  }
  function seek(t) {
    activeDeck.seek(t);
    setCurrentTime(t);
  }
  function setVolume(key, value) {
    setVolumes((v) => ({ ...v, [key]: value }));
  }
  function refreshDuration() {
    setDuration(activeDeck.duration);
  }

  return {
    refreshDuration,
    mode, setMode, playing, toggle, stop, seek, currentTime, duration,
    volumes, setVolume, analyser, ready, loadOriginal, loadRemix,
    originalDeck, remixDeck,
  };
}

export function useAnimationFrame(callback, running) {
  useEffect(() => {
    if (!running) return undefined;
    let frame;
    const loop = () => {
      callback();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [callback, running]);
}
