import * as THREE from 'three';

/** A soft game-room table environment: wooden table, gradient backdrop, gentle ambient dust motes. */
export function buildEnvironment(scene) {
  const group = new THREE.Group();
  group.name = 'environment';

  scene.background = buildBackdropTexture();
  scene.fog = new THREE.Fog(0x0c1020, 22, 46);

  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(17, 18, 2.2, 48),
    new THREE.MeshStandardMaterial({ color: '#3c2a1c', roughness: 0.85, metalness: 0.05 })
  );
  table.position.y = -2.5;
  table.receiveShadow = true;
  group.add(table);

  const tableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(17, 17, 0.1, 48),
    new THREE.MeshStandardMaterial({ color: '#4a3423', roughness: 0.65, metalness: 0.08 })
  );
  tableTop.position.y = -1.4;
  tableTop.receiveShadow = true;
  group.add(tableTop);

  const particles = buildParticles();
  group.add(particles);

  scene.add(group);
  return { group, particles };
}

function buildBackdropTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size * 0.35, size * 0.08, size / 2, size / 2, size * 0.75);
  gradient.addColorStop(0, '#233258');
  gradient.addColorStop(0.55, '#141b31');
  gradient.addColorStop(1, '#0a0d18');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildParticles(count = 90) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 10 + 1;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: '#f2c14e',
    size: 0.035,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true
  });
  const points = new THREE.Points(geo, mat);
  points.name = 'ambientParticles';
  points.userData.basePositions = positions.slice();
  return points;
}

export function updateParticles(points, elapsed) {
  if (!points || !points.visible) return;
  const pos = points.geometry.attributes.position;
  const base = points.userData.basePositions;
  for (let i = 0; i < pos.count; i++) {
    const idx = i * 3;
    pos.array[idx + 1] = base[idx + 1] + Math.sin(elapsed * 0.4 + i) * 0.6;
    pos.array[idx] = base[idx] + Math.sin(elapsed * 0.15 + i * 2) * 0.4;
  }
  pos.needsUpdate = true;
}
