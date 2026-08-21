import * as THREE from 'three';
import { PLATFORM_TOP_Y } from './BoardMetrics.js';
import { Tweener, easeOutCubic, easeOutBounce, clamp } from '../utils/helpers.js';

const DIE_SIZE = 0.62;
const DICE_REST_POS = new THREE.Vector3(0, PLATFORM_TOP_Y + 0.6, 3.2);

// Standard die: opposite faces sum to 7. Local face normal -> pip value.
const FACE_VALUE = [
  { normal: new THREE.Vector3(0, 1, 0), value: 1 },
  { normal: new THREE.Vector3(0, -1, 0), value: 6 },
  { normal: new THREE.Vector3(1, 0, 0), value: 2 },
  { normal: new THREE.Vector3(-1, 0, 0), value: 5 },
  { normal: new THREE.Vector3(0, 0, 1), value: 3 },
  { normal: new THREE.Vector3(0, 0, -1), value: 4 }
];

const PIP_LAYOUTS = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]
};

function buildPipTexture(value, faceColor = '#f6f2e9', pipColor = '#20242f') {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = faceColor;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = pipColor;
  const r = size * 0.09;
  const spacing = size * 0.26;
  const cx = size / 2;
  const cy = size / 2;
  for (const [gx, gy] of PIP_LAYOUTS[value]) {
    ctx.beginPath();
    ctx.arc(cx + gx * spacing, cy + gy * spacing, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A rolling, glowing 3D die whose logical result is supplied externally (see game/Dice.js). */
export class DiceView {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.name = 'dice';

    const geo = new THREE.BoxGeometry(DIE_SIZE, DIE_SIZE, DIE_SIZE, 1, 1, 1);
    // BoxGeometry material order: +X, -X, +Y, -Y, +Z, -Z
    const materials = [2, 5, 1, 6, 3, 4].map(
      (value) => new THREE.MeshStandardMaterial({ map: buildPipTexture(value), roughness: 0.35, metalness: 0.08 })
    );
    this.mesh = new THREE.Mesh(geo, materials);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.group.add(this.mesh);

    this.glow = new THREE.PointLight('#ffd76a', 0, 2.4, 2);
    this.glow.position.set(0, 0.4, 0);
    this.group.add(this.glow);

    this.group.position.copy(DICE_REST_POS);
    scene.add(this.group);

    this._tweener = new Tweener();
    this._rolling = false;
  }

  update(dt) {
    this._tweener.update(dt);
    if (!this._rolling) {
      const t = performance.now() / 1000;
      this.mesh.position.y = Math.sin(t * 1.4) * 0.015;
    }
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  _quaternionForValue(value) {
    const face = FACE_VALUE.find((f) => f.value === value);
    const q = new THREE.Quaternion().setFromUnitVectors(face.normal, new THREE.Vector3(0, 1, 0));
    const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
    return yaw.multiply(q);
  }

  /** Plays a tumbling roll animation and settles exactly on `value`. Resolves when finished. */
  async roll(value, { quality = 'high' } = {}) {
    this._rolling = true;
    this.glow.intensity = 0;

    const startQuat = this.mesh.quaternion.clone();
    const spinAxis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    const spins = quality === 'low' ? 2 : quality === 'medium' ? 3 : 4;
    const tumbleQuat = new THREE.Quaternion().setFromAxisAngle(spinAxis, Math.PI * 2 * spins);
    const airborneQuat = startQuat.clone().premultiply(tumbleQuat);
    const finalQuat = this._quaternionForValue(value);

    const baseY = DICE_REST_POS.y;
    const upDuration = quality === 'low' ? 0.28 : 0.42;

    // Toss upward while tumbling fast.
    await this._tweener.run({
      duration: upDuration,
      ease: easeOutCubic,
      onUpdate: (t) => {
        this.mesh.position.y = baseY + Math.sin(t * Math.PI) * 0.9;
        this.mesh.quaternion.slerpQuaternions(startQuat, airborneQuat, t);
      }
    });

    // Fall + bounce, slerping into the exact final orientation.
    const fallDuration = quality === 'low' ? 0.32 : 0.5;
    await this._tweener.run({
      duration: fallDuration,
      ease: easeOutBounce,
      onUpdate: (t) => {
        this.mesh.position.y = baseY + (1 - t) * 0.35 * Math.sin((1 - t) * Math.PI);
        this.mesh.quaternion.slerpQuaternions(airborneQuat, finalQuat, clamp(t * 1.15, 0, 1));
      },
      onComplete: () => {
        this.mesh.position.y = baseY;
        this.mesh.quaternion.copy(finalQuat);
      }
    });

    this._rolling = false;

    // Little settle glow so the result reads clearly.
    await this._tweener.run({
      duration: 0.4,
      ease: easeOutCubic,
      onUpdate: (t) => { this.glow.intensity = Math.sin(t * Math.PI) * 1.4; },
      onComplete: () => { this.glow.intensity = 0; }
    });
  }
}
