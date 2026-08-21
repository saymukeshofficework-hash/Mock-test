import * as THREE from 'three';
import { buildLighting, setShadowQuality } from './Lighting.js';
import { buildEnvironment, updateParticles } from './Environment.js';
import { buildBoard } from './BoardBuilder.js';
import { TokenManager } from './TokenView.js';
import { DiceView } from './DiceView.js';
import { CameraRig } from './Camera.js';
import { EventEmitter, clamp } from '../utils/helpers.js';

const QUALITY = {
  high: { pixelRatio: Math.min(window.devicePixelRatio || 1, 2), shadows: true, shadowMapSize: 2048, particles: true },
  medium: { pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5), shadows: true, shadowMapSize: 1024, particles: true },
  low: { pixelRatio: 1, shadows: false, shadowMapSize: 512, particles: false }
};

export class SceneManager extends EventEmitter {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.cameraRig = new CameraRig(canvas, this._aspect());
    const { key } = buildLighting(this.scene, { shadows: true });
    this._keyLight = key;

    const { particles } = buildEnvironment(this.scene);
    this._particles = particles;

    this.board = buildBoard();
    this.scene.add(this.board);

    this.tokens = new TokenManager(this.scene);
    this.dice = new DiceView(this.scene);

    this._raycaster = new THREE.Raycaster();
    this._pointer = new THREE.Vector2();
    this._clock = new THREE.Clock();
    this._quality = 'high';
    this._running = false;

    this._onResize = this._onResize.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    window.addEventListener('resize', this._onResize);
    canvas.addEventListener('pointerdown', this._onPointerDown);

    this._onResize();
  }

  _aspect() {
    return window.innerWidth / Math.max(1, window.innerHeight);
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setPixelRatio(QUALITY[this._quality].pixelRatio);
    this.renderer.setSize(w, h, false);
    this.cameraRig.setAspect(w / Math.max(1, h));
  }

  setQuality(level) {
    if (!QUALITY[level]) return;
    this._quality = level;
    const q = QUALITY[level];
    this.renderer.shadowMap.enabled = q.shadows;
    setShadowQuality(this._keyLight, q.shadows, q.shadowMapSize);
    this._particles.visible = q.particles;
    this.tokens.qualityScale = level === 'low' ? 1.4 : level === 'medium' ? 1.15 : 1;
    this._onResize();
  }

  setAutoRotate(enabled) {
    this.cameraRig.setAutoRotate(enabled);
  }

  initGame(players) {
    this.tokens.initTokens(players);
  }

  syncPositions(players) {
    this.tokens.syncAllPositions(players);
  }

  highlightTokens(ids) {
    this.tokens.setHighlighted(ids);
  }

  clearHighlight() {
    this.tokens.clearHighlight();
  }

  resetCamera() {
    return this.cameraRig.reset();
  }

  async rollDice(value, quality = 'high') {
    return this.dice.roll(value, { quality });
  }

  async animateMove(payload) {
    return this.tokens.animateMove(payload);
  }

  async animateCapture(tokenId, color) {
    return this.tokens.animateCapture(tokenId, color);
  }

  async focusOnWinner(color) {
    const dir = { RED: [-1, 0], GREEN: [0, -1], YELLOW: [1, 0], BLUE: [0, 1] }[color];
    const pos = new THREE.Vector3(dir[0] * 3, 0.3, dir[1] * 3);
    return this.cameraRig.focusOn(pos, 6.5);
  }

  _onPointerDown(event) {
    if (!this._clickEnabled) return;
    const rect = this.canvas.getBoundingClientRect();
    this._pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this._pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this._raycaster.setFromCamera(this._pointer, this.cameraRig.camera);
    const targets = this.tokens.raycastTargets();
    const hits = this._raycaster.intersectObjects(targets, true);
    if (hits.length === 0) return;
    const tokenId = this.tokens.tokenIdForObject(hits[0].object);
    if (tokenId) this.emit('tokenClicked', tokenId);
  }

  setClickEnabled(enabled) {
    this._clickEnabled = enabled;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._clock.start();
    const tick = () => {
      if (!this._running) return;
      const dt = Math.min(0.05, this._clock.getDelta());
      this.cameraRig.update(dt);
      this.tokens.update(dt);
      this.dice.update(dt);
      updateParticles(this._particles, this._clock.getElapsedTime());
      this.renderer.render(this.scene, this.cameraRig.camera);
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  stop() {
    this._running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this.renderer.dispose();
  }
}
