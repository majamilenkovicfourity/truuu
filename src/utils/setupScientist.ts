
import * as THREE from 'three';

export const setupScientist = (plain: THREE.Group, name: string) => {
    const scientist = plain.getObjectByName(name);
    
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/textures/Scientist_Diffuse.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false; // Try both true and false
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;

    if (scientist) {
        scientist.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshStandardMaterial({
                    map: texture,
                    color: 0xffffff, // Make sure this is white, not colored
                    metalness: 0.0,
                    roughness: 1.0
                });                
  }
});
    } else {
        console.warn('Scientist object not found in plain model.');
    }
};