import * as THREE from 'three'

export function enableShadowsForModel(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.SkinnedMesh) {
      const oldMat = obj.material as THREE.MeshStandardMaterial;
    
      const newMat = new THREE.MeshStandardMaterial({
        map: oldMat.map,
        color: oldMat.color,  
        transparent: oldMat.transparent || false,
        alphaTest: oldMat.transparent ? 0.5 : 0, // fixes shadows for transparent meshes
        side: oldMat.side,
        roughness: oldMat.roughness,
        metalness: oldMat.metalness,
      });

      obj.material = newMat;

      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
}


export function changeColors(root: THREE.Object3D, color: THREE.Color, receiveShadow = false, castShadow = false, emissiveIntensity = 0, emissiveColor?: THREE.Color) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.SkinnedMesh) {
      const oldMat = obj.material as THREE.MeshStandardMaterial;    
      oldMat.color.set(color);
      
      const newMat = new THREE.MeshStandardMaterial({
        map: oldMat.map,
        color: oldMat.color,
        transparent: oldMat.transparent || false,
        alphaTest: oldMat.transparent ? 0.5 : 0, // fixes shadows for transparent meshes
        side: oldMat.side,
        roughness: oldMat.roughness,
        metalness: oldMat.metalness,
        aoMapIntensity: oldMat.aoMapIntensity,
        lightMapIntensity: 0.5,     
        emissive: emissiveColor || new THREE.Color(0x000000),
        emissiveIntensity: emissiveIntensity
      });

      obj.material = newMat;
      obj.castShadow = castShadow;
      obj.receiveShadow = receiveShadow;
   
    }
  });
}


export  const setOpacityRecursive = (obj: THREE.Object3D, opacity: number) => {
        obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        mat.transparent = true;
                        mat.opacity = opacity;
                        mat.depthWrite = opacity === 1;
                    });
                } else if (child.material) {
                    child.material.transparent = true;
                    child.material.opacity = opacity;
                    child.material.depthWrite = opacity === 1;
                }
            }
        });
    };


    export const applyColorToMesh = (object: THREE.Object3D | undefined, hexColor: string) => {
    if (!object) {
        console.warn('Object is undefined, cannot apply color');
        return;
    }

    // If it's a mesh, apply color directly
    if (object instanceof THREE.Mesh) {
        const material = object.material as THREE.MeshStandardMaterial;
        material.color.set(hexColor);
    } else {
        // If it's a group/object, traverse and apply to all meshes
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const material = child.material as THREE.MeshStandardMaterial;
                material.color.set(hexColor);
            }
        });
    }
};

export const setObjectOpacity = (object: THREE.Object3D, opacity: number) => {
    object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => {
                    mat.transparent = true;
                    mat.opacity = opacity;
                });
            } else if (mesh.material) {
                mesh.material.transparent = true;
                mesh.material.opacity = opacity;
            }
        }
    });
};