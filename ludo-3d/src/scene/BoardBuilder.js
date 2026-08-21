import * as THREE from 'three';
import {
  COLORS,
  PLAYER_COLOR_HEX,
  PATH,
  START_INDEX,
  SAFE_INDICES,
  HOME_COLUMNS,
  BASE_REGION,
  BASE_SLOTS
} from '../game/BoardData.js';
import {
  BOARD_WORLD_SIZE,
  HALF_BOARD,
  CELL_SIZE,
  BOARD_SURFACE_Y,
  CELL_PLATE_TOP_Y,
  BASE_PLATE_TOP_Y,
  gridToWorld
} from './BoardMetrics.js';

const START_INDEX_LOOKUP = new Map(Object.entries(START_INDEX).map(([color, idx]) => [idx, color]));
const CREAM = new THREE.Color('#f4ecd8');
const CREAM_DARK = new THREE.Color('#e6dcc2');

const dummy = new THREE.Object3D();

function colorFor(hex) {
  return new THREE.Color(hex);
}

/** Builds the full static 3D board (platform + surface + cells + center) as one Group. */
export function buildBoard() {
  const board = new THREE.Group();
  board.name = 'LudoBoard';

  board.add(buildPlatform());
  board.add(buildSurface());
  board.add(buildBaseQuadrants());
  board.add(buildCenterWedges());
  board.add(buildCellPlates());
  board.add(buildSafeMarkers());
  board.add(buildBaseSlotMarkers());

  return board;
}

function buildPlatform() {
  const pad = 1.6;
  const geo = new THREE.BoxGeometry(BOARD_WORLD_SIZE + pad, 0.9, BOARD_WORLD_SIZE + pad, 1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ color: '#7a4a2b', roughness: 0.75, metalness: 0.05 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = -0.45;
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  mesh.name = 'platform';

  // Thin lighter rim near the top edge for a subtle bevel highlight.
  const rimGeo = new THREE.BoxGeometry(BOARD_WORLD_SIZE + pad - 0.14, 0.1, BOARD_WORLD_SIZE + pad - 0.14);
  const rimMat = new THREE.MeshStandardMaterial({ color: '#9c6a3f', roughness: 0.6 });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.position.y = 0.05;
  rim.receiveShadow = true;
  mesh.add(rim);

  return mesh;
}

function buildSurface() {
  const geo = new THREE.BoxGeometry(BOARD_WORLD_SIZE, 0.12, BOARD_WORLD_SIZE);
  const mat = new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.85, metalness: 0 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = BOARD_SURFACE_Y - 0.06;
  mesh.receiveShadow = true;
  mesh.name = 'surface';
  return mesh;
}

function buildBaseQuadrants() {
  const group = new THREE.Group();
  group.name = 'baseQuadrants';

  for (const color of COLORS) {
    const region = BASE_REGION[color];
    const w = (region.colMax - region.colMin + 1) * CELL_SIZE;
    const d = (region.rowMax - region.rowMin + 1) * CELL_SIZE;
    const centerRow = (region.rowMin + region.rowMax + 1) / 2;
    const centerCol = (region.colMin + region.colMax + 1) / 2;
    const { x, z } = gridToWorld(centerRow - 0.5, centerCol - 0.5);

    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.08, d),
      new THREE.MeshStandardMaterial({ color: PLAYER_COLOR_HEX[color], roughness: 0.7 })
    );
    plate.position.set(x, BOARD_SURFACE_Y + 0.02, z);
    plate.receiveShadow = true;
    plate.castShadow = false;
    group.add(plate);

    const innerSize = w - 1.6;
    const inner = new THREE.Mesh(
      new THREE.BoxGeometry(innerSize, 0.06, innerSize),
      new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.85 })
    );
    inner.position.set(x, BASE_PLATE_TOP_Y - 0.03, z);
    inner.receiveShadow = true;
    group.add(inner);
  }

  return group;
}

function buildCenterWedges() {
  const group = new THREE.Group();
  group.name = 'centerWedges';
  const half = 1.5;
  const depth = 0.1;

  // Base surface for the center square (slightly raised so wedges read as inset).
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(half * 2, 0.04, half * 2),
    new THREE.MeshStandardMaterial({ color: CREAM_DARK, roughness: 0.85 })
  );
  base.position.set(0, BOARD_SURFACE_Y + 0.01, 0);
  base.receiveShadow = true;
  group.add(base);

  const wedgeDefs = [
    { color: 'RED', points: [[-half, -half], [-half, half], [0, 0]] },
    { color: 'GREEN', points: [[-half, -half], [half, -half], [0, 0]] },
    { color: 'YELLOW', points: [[half, -half], [half, half], [0, 0]] },
    { color: 'BLUE', points: [[-half, half], [half, half], [0, 0]] }
  ];

  for (const def of wedgeDefs) {
    const shape = new THREE.Shape();
    shape.moveTo(def.points[0][0], def.points[0][1]);
    shape.lineTo(def.points[1][0], def.points[1][1]);
    shape.lineTo(def.points[2][0], def.points[2][1]);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({ color: PLAYER_COLOR_HEX[def.color], roughness: 0.65 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = BOARD_SURFACE_Y + 0.02;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    group.add(mesh);
  }

  return group;
}

function buildCellPlates() {
  const total = PATH.length + COLORS.length * HOME_COLUMNS.RED.length;
  const geo = new THREE.BoxGeometry(CELL_SIZE * 0.88, 0.06, CELL_SIZE * 0.88);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.8 });
  const mesh = new THREE.InstancedMesh(geo, mat, total);
  mesh.name = 'cellPlates';
  mesh.receiveShadow = true;
  mesh.castShadow = false;

  let i = 0;
  PATH.forEach(([row, col], idx) => {
    const { x, z } = gridToWorld(row, col);
    dummy.position.set(x, CELL_PLATE_TOP_Y - 0.03, z);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    const startColor = START_INDEX_LOOKUP.get(idx);
    const color = startColor ? colorFor(PLAYER_COLOR_HEX[startColor]) : CREAM;
    mesh.setColorAt(i, color);
    i++;
  });

  COLORS.forEach((color) => {
    HOME_COLUMNS[color].forEach(([row, col], step) => {
      const { x, z } = gridToWorld(row, col);
      dummy.position.set(x, CELL_PLATE_TOP_Y - 0.03, z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const base = new THREE.Color(PLAYER_COLOR_HEX[color]);
      const lightened = base.clone().lerp(new THREE.Color('#ffffff'), 0.12 * step);
      mesh.setColorAt(i, lightened);
      i++;
    });
  });

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}

function buildSafeMarkers() {
  const geo = new THREE.OctahedronGeometry(0.14, 0);
  geo.scale(1, 0.45, 1);
  const mat = new THREE.MeshStandardMaterial({ color: '#f2c14e', roughness: 0.35, metalness: 0.4, emissive: '#5c4409', emissiveIntensity: 0.25 });
  const mesh = new THREE.InstancedMesh(geo, mat, SAFE_INDICES.size);
  mesh.name = 'safeMarkers';
  mesh.castShadow = true;

  let i = 0;
  SAFE_INDICES.forEach((idx) => {
    const [row, col] = PATH[idx];
    const { x, z } = gridToWorld(row, col);
    dummy.position.set(x, CELL_PLATE_TOP_Y + 0.09, z);
    dummy.rotation.set(0, Math.PI / 4, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    i++;
  });
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function buildBaseSlotMarkers() {
  const geo = new THREE.CylinderGeometry(0.32, 0.32, 0.03, 24);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.9 });
  const total = COLORS.length * 4;
  const mesh = new THREE.InstancedMesh(geo, mat, total);
  mesh.name = 'baseSlotMarkers';
  mesh.receiveShadow = true;

  let i = 0;
  for (const color of COLORS) {
    const base = new THREE.Color(PLAYER_COLOR_HEX[color]).lerp(new THREE.Color('#000000'), 0.35);
    for (const [row, col] of BASE_SLOTS[color]) {
      const { x, z } = gridToWorld(row, col);
      dummy.position.set(x, BASE_PLATE_TOP_Y + 0.015, z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, base);
      i++;
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}

export { HALF_BOARD };
