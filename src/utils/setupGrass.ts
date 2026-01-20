import * as THREE from 'three';

export const setupGrass = (plain: THREE.Group): void => {
  const grass = plain.getObjectByName('grass');

  if (!grass) return;

  // Enable shadows on the grass mesh
  grass.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;

      if (obj.material) {
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        materials.forEach(mat => {
          mat.shadowSide = THREE.DoubleSide;
        });
      }
    }
  });

}

