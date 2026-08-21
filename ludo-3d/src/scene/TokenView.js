import * as THREE from 'three';
import { PLAYER_COLOR_HEX, BASE_SLOTS, FINISH_REL, relStepToGrid } from '../game/BoardData.js';
import { gridToWorld, TOKEN_REST_Y } from './BoardMetrics.js';
import { easeOutCubic, easeOutBack, Tweener } from '../utils/helpers.js';

const TOKEN_BASE_Y = TOKEN_REST_Y + 0.02;
const HOP_DURATION = 0.22; // seconds per cell
const HOP_ARC = 0.34;

let sharedGeometry = null;
function getPawnGeometry() {
  if (sharedGeometry) return sharedGeometry;
  const group = [];

  const base = new THREE.CylinderGeometry(0.24, 0.27, 0.09, 20);
  base.translate(0, 0.045, 0);
  group.push(base);

  const stem = new THREE.CylinderGeometry(0.09, 0.19, 0.24, 16);
  stem.translate(0, 0.09 + 0.12, 0);
  group.push(stem);

  const head = new THREE.SphereGeometry(0.145, 20, 16);
  head.translate(0, 0.09 + 0.24 + 0.1, 0);
  group.push(head);

  // Merge manually (positions only) to avoid an extra addons import — a
  // Group of three small meshes renders just as well for 16 tokens total.
  sharedGeometry = { base, stem, head };
  return sharedGeometry;
}

function buildPawnMesh(colorHex) {
  const geo = getPawnGeometry();
  const material = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.32, metalness: 0.22 });
  const pawn = new THREE.Group();
  for (const g of [geo.base, geo.stem, geo.head]) {
    const m = new THREE.Mesh(g, material);
    m.castShadow = true;
    m.receiveShadow = true;
    pawn.add(m);
  }
  pawn.userData.isPawnBody = true;
  return { pawn, material };
}

const RING_GEOMETRY = new THREE.TorusGeometry(0.34, 0.028, 10, 32);
const RING_MATERIAL_BASE = new THREE.MeshStandardMaterial({
  color: '#ffe08a',
  emissive: '#f2c14e',
  emissiveIntensity: 0.7,
  roughness: 0.3,
  metalness: 0.2,
  transparent: true,
  opacity: 0.95
});

function homeSlotWorld(color, indexInPlayer) {
  const [row, col] = BASE_SLOTS[color][indexInPlayer];
  return gridToWorld(row, col);
}

/** Manages the 16 3D pawns: placement, idle motion, movement + capture animation, selection glow. */
export class TokenManager {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.name = 'tokens';
    scene.add(this.group);
    this.entries = new Map();
    this._tweener = new Tweener();
    this._clock = new THREE.Clock();
    this.qualityScale = 1;
  }

  initTokens(players) {
    this.group.clear();
    this.entries.clear();
    this._tweener = new Tweener();

    for (const player of players) {
      for (const token of player.tokens) {
        const { pawn, material } = buildPawnMesh(PLAYER_COLOR_HEX[player.color]);
        const ring = new THREE.Mesh(RING_GEOMETRY, RING_MATERIAL_BASE.clone());
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.015;
        ring.visible = false;
        ring.scale.setScalar(1);

        const pivot = new THREE.Group();
        pivot.add(pawn);
        pivot.add(ring);
        pivot.userData.tokenId = token.id;
        pawn.userData.tokenId = token.id;
        pawn.traverse((child) => { child.userData.tokenId = token.id; });

        this.group.add(pivot);
        this.entries.set(token.id, {
          pivot,
          pawn,
          ring,
          material,
          color: player.color,
          indexInPlayer: token.indexInPlayer,
          highlighted: false,
          idlePhase: Math.random() * Math.PI * 2,
          baseScale: 1
        });
      }
    }

    this.syncAllPositions(players);
  }

  /** Instantly place every token according to current logical state (no animation). */
  syncAllPositions(players) {
    for (const player of players) {
      for (const token of player.tokens) {
        const entry = this.entries.get(token.id);
        if (!entry) continue;
        const { x, z } = this._worldForToken(player.color, token);
        entry.pivot.position.set(x, TOKEN_BASE_Y, z);
      }
    }
  }

  _worldForToken(color, token) {
    if (token.isHome) return homeSlotWorld(color, token.indexInPlayer);
    if (token.isFinished) {
      // Fan finished tokens out slightly around their color's home wedge tip.
      const dir = FINISH_DIRECTION[color];
      const spread = 0.16 * token.indexInPlayer - 0.24;
      return { x: dir.x * 0.55 + dir.perpX * spread, z: dir.z * 0.55 + dir.perpZ * spread };
    }
    const [row, col] = relStepToGrid(color, token.relStep);
    return gridToWorld(row, col);
  }

  setHighlighted(tokenIds) {
    const set = new Set(tokenIds);
    for (const [id, entry] of this.entries) {
      entry.highlighted = set.has(id);
      entry.ring.visible = entry.highlighted;
      if (!entry.highlighted) entry.ring.scale.setScalar(1);
    }
  }

  clearHighlight() {
    this.setHighlighted([]);
  }

  /** Raycast-friendly list of clickable meshes -> tokenId. */
  raycastTargets() {
    const list = [];
    for (const [id, entry] of this.entries) list.push(entry.pawn);
    return list;
  }

  tokenIdForObject(obj) {
    let cur = obj;
    while (cur) {
      if (cur.userData?.tokenId) return cur.userData.tokenId;
      cur = cur.parent;
    }
    return null;
  }

  update(dt) {
    const now = this._clock.getElapsedTime();
    for (const entry of this.entries.values()) {
      const idleBob = Math.sin(now * 1.6 + entry.idlePhase) * 0.012;
      let scale = entry.baseScale;
      let extraY = idleBob;

      if (entry.highlighted) {
        extraY += Math.sin(now * 4.2 + entry.idlePhase) * 0.05 + 0.05;
        scale = entry.baseScale * (1.12 + Math.sin(now * 4.2) * 0.02);
        entry.ring.rotation.z += dt * 1.1;
        entry.ring.scale.setScalar(1 + Math.sin(now * 3.4) * 0.08);
      }

      entry.pivot.position.y = entry._baseY != null ? entry._baseY + extraY : TOKEN_BASE_Y + extraY;
      entry.pawn.scale.setScalar(scale);
    }
    this._tweener.update(dt);
  }

  async _hopTo(entry, x, z, duration) {
    const start = { x: entry.pivot.position.x, z: entry.pivot.position.z, y: entry._baseY ?? TOKEN_BASE_Y };
    const targetY = TOKEN_BASE_Y;
    await this._tweener.run({
      duration,
      ease: easeOutCubic,
      onUpdate: (t) => {
        entry.pivot.position.x = start.x + (x - start.x) * t;
        entry.pivot.position.z = start.z + (z - start.z) * t;
        entry._baseY = start.y + (targetY - start.y) * t + Math.sin(Math.PI * t) * HOP_ARC;
        entry.pivot.rotation.y = t * Math.PI * 0.6;
      },
      onComplete: () => {
        entry._baseY = targetY;
        entry.pivot.rotation.y = 0;
      }
    });
  }

  /** Smoothly hop a token from its previous cell to its new one, one cell at a time. */
  async animateMove({ tokenId, color, wasHome, fromRelStep, toRelStep }) {
    const entry = this.entries.get(tokenId);
    if (!entry) return;

    const waypoints = [];
    if (wasHome) {
      waypoints.push(relStepToGrid(color, 0));
    } else {
      const end = Math.min(toRelStep, FINISH_REL);
      for (let s = fromRelStep + 1; s <= end; s++) {
        waypoints.push(relStepToGrid(color, Math.min(s, FINISH_REL)));
      }
    }

    for (const [row, col] of waypoints) {
      const { x, z } = gridToWorld(row, col);
      await this._hopTo(entry, x, z, HOP_DURATION / this.qualityScale);
    }

    if (toRelStep >= FINISH_REL) {
      const dir = FINISH_DIRECTION[color];
      const spread = 0.16 * entry.indexInPlayer - 0.24;
      await this._hopTo(entry, dir.x * 0.55 + dir.perpX * spread, dir.z * 0.55 + dir.perpZ * spread, HOP_DURATION);
      await this._popCelebrate(entry);
    }
  }

  async _popCelebrate(entry) {
    await this._tweener.run({
      duration: 0.35,
      ease: easeOutBack,
      onUpdate: (t) => { entry.baseScale = 1 + Math.sin(t * Math.PI) * 0.35; },
      onComplete: () => { entry.baseScale = 1; }
    });
  }

  /** Lift, spin, shrink, and fly a captured token back to its base slot. */
  async animateCapture(tokenId, color) {
    const entry = this.entries.get(tokenId);
    if (!entry) return;
    const homePos = homeSlotWorld(color, entry.indexInPlayer);
    const startX = entry.pivot.position.x;
    const startZ = entry.pivot.position.z;
    const startY = entry._baseY ?? TOKEN_BASE_Y;

    await this._tweener.run({
      duration: 0.28,
      ease: easeOutBack,
      onUpdate: (t) => {
        entry._baseY = startY + t * 0.55;
        entry.pivot.rotation.y = t * Math.PI * 2.2;
        entry.baseScale = 1 - t * 0.35;
      }
    });

    await this._tweener.run({
      duration: 0.42,
      ease: easeOutCubic,
      onUpdate: (t) => {
        entry.pivot.position.x = startX + (homePos.x - startX) * t;
        entry.pivot.position.z = startZ + (homePos.z - startZ) * t;
        entry._baseY = (startY + 0.55) + Math.sin(Math.PI * t) * 0.5 - t * 0.55;
      }
    });

    await this._tweener.run({
      duration: 0.22,
      ease: easeOutBack,
      onUpdate: (t) => { entry.baseScale = 0.65 + t * 0.35; },
      onComplete: () => { entry.baseScale = 1; entry._baseY = TOKEN_BASE_Y; entry.pivot.rotation.y = 0; }
    });
  }
}

const FINISH_DIRECTION = {
  RED: { x: -1, z: 0, perpX: 0, perpZ: 1 },
  GREEN: { x: 0, z: -1, perpX: 1, perpZ: 0 },
  YELLOW: { x: 1, z: 0, perpX: 0, perpZ: 1 },
  BLUE: { x: 0, z: 1, perpX: 1, perpZ: 0 }
};
