import * as THREE from 'three';

/** Premium three-point-ish lighting rig: ambient fill, key sun, soft rim. */
export function buildLighting(scene, { shadows = true } = {}) {
  const group = new THREE.Group();
  group.name = 'lighting';

  const ambient = new THREE.AmbientLight('#8fa3d1', 0.55);
  group.add(ambient);

  const hemi = new THREE.HemisphereLight('#cfe0ff', '#3a2c1a', 0.45);
  group.add(hemi);

  const key = new THREE.DirectionalLight('#fff3d6', 1.35);
  key.position.set(6, 10, 5);
  key.castShadow = shadows;
  if (shadows) {
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -11;
    key.shadow.camera.right = 11;
    key.shadow.camera.top = 11;
    key.shadow.camera.bottom = -11;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 30;
    key.shadow.bias = -0.0018;
    key.shadow.radius = 3;
  }
  group.add(key);
  group.add(key.target);

  const rim = new THREE.DirectionalLight('#8fc4ff', 0.5);
  rim.position.set(-8, 6, -6);
  group.add(rim);

  const fill = new THREE.PointLight('#ffd9a0', 0.35, 22, 2);
  fill.position.set(-4, 5, 6);
  group.add(fill);

  scene.add(group);
  return { group, key, ambient, hemi, rim, fill };
}

export function setShadowQuality(key, enabled, mapSize = 2048) {
  key.castShadow = enabled;
  if (enabled) key.shadow.mapSize.set(mapSize, mapSize);
}
