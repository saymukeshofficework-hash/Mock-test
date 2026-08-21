import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Tweener, easeOutCubic } from '../utils/helpers.js';

const DEFAULT_POS = new THREE.Vector3(0, 12.5, 12.5);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

export class CameraRig {
  constructor(canvas, aspect) {
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
    this.camera.position.copy(DEFAULT_POS);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.copy(DEFAULT_TARGET);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 22;
    this.controls.minPolarAngle = Math.PI * 0.12;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.enablePan = false;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.35;
    this.controls.update();

    this._tweener = new Tweener();
    this.autoRotateEnabled = true;
    this._idleTimer = 0;
    this._userInteracting = false;

    this.controls.addEventListener('start', () => { this._userInteracting = true; this._idleTimer = 0; });
    this.controls.addEventListener('end', () => { this._userInteracting = false; });
  }

  setAspect(aspect) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  setAutoRotate(enabled) {
    this.autoRotateEnabled = enabled;
    if (!enabled) this.controls.autoRotate = false;
  }

  update(dt) {
    this._tweener.update(dt);

    if (this.autoRotateEnabled && !this._userInteracting) {
      this._idleTimer += dt;
      this.controls.autoRotate = this._idleTimer > 4.5;
    } else {
      this.controls.autoRotate = false;
    }

    this.controls.update();
  }

  async reset() {
    this.controls.autoRotate = false;
    this._idleTimer = 0;
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    await this._tweener.run({
      duration: 0.8,
      ease: easeOutCubic,
      onUpdate: (t) => {
        this.camera.position.lerpVectors(startPos, DEFAULT_POS, t);
        this.controls.target.lerpVectors(startTarget, DEFAULT_TARGET, t);
      },
      onComplete: () => {
        this.camera.position.copy(DEFAULT_POS);
        this.controls.target.copy(DEFAULT_TARGET);
      }
    });
  }

  async focusOn(position, distance = 7) {
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    const targetPos = position.clone().add(dir.multiplyScalar(distance));
    await this._tweener.run({
      duration: 1.4,
      ease: easeOutCubic,
      onUpdate: (t) => {
        this.camera.position.lerpVectors(startPos, targetPos, t);
        this.controls.target.lerpVectors(startTarget, position, t);
      }
    });
  }
}
