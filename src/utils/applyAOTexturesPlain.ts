import * as THREE from 'three';

interface AOTextureOptions {
    texturePath: string;
    aoMapIntensity?: number;
    color?: number;
    metalness?: number;
    roughness?: number;
    flipY?: boolean;
    disableShadows?: boolean;
    emissive?: THREE.Color;
    emissiveIntensity?: number;
    // NEW: Texture transform options
    rotation?: number; // in degrees
    offsetX?: number;
    offsetY?: number;
    repeatX?: number;
    repeatY?: number;
}

export function applyAOTexture(
    object: THREE.Object3D,
    options: AOTextureOptions
): void {
    const {
        texturePath,
        aoMapIntensity = 1.5,
        color = 0xffffff,
        metalness = 0.0,
        roughness = 1.0,
        disableShadows = true,      
        offsetX = 0,
        offsetY = 0,
        repeatX = 1,
        repeatY = 1,
    } = options;

    // Disable shadows if requested
    if (disableShadows) {
        object.traverse((child) => {
            child.castShadow = false;
            child.receiveShadow = false;
        });
    }

    const textureLoader = new THREE.TextureLoader();
    const aoTexture = textureLoader.load(
        texturePath,
        (texture) => {

            // Set texture properties
            texture.colorSpace = THREE.NoColorSpace;
            // texture.flipY = false;
             texture.wrapS = THREE.RepeatWrapping;
             texture.wrapT = THREE.RepeatWrapping;
            
            // Apply transformations
            texture.center.set(0.5, 0.5);
            // texture.rotation = (rotation * Math.PI) / 180;
            texture.offset.set(offsetX, offsetY);
            texture.repeat.set(repeatX, repeatY);

            // Apply to all meshes
            object.traverse((child) => {
                if (child instanceof THREE.Mesh) {

                    const geometry = child.geometry;

                    // Generate UVs if they don't exist
                    if (!geometry.attributes.uv) {
                        generatePlaneUVs(geometry);
                    }

                    // Set UV2 for AO map
                    geometry.setAttribute(
                        'uv2',
                        new THREE.BufferAttribute(
                            new Float32Array(geometry.attributes.uv.array),
                            2
                        )
                    );

                    // Apply material
                    const materialOptions: THREE.MeshStandardMaterialParameters = {
                        color,
                        metalness,
                        roughness,
                        map: aoTexture,
                        aoMap: aoTexture,
                        aoMapIntensity,
                        side: THREE.DoubleSide,
                    };

                    child.material = new THREE.MeshStandardMaterial(materialOptions);
                    child.material.needsUpdate = true;
                }
            });
        },
        undefined,
        (error) => {
            console.error(`✗ Failed to load AO texture: ${texturePath}`, error);
        }
    );
}

function generatePlaneUVs(geometry: THREE.BufferGeometry): void {
    const positions = geometry.attributes.position;
    const uvs: number[] = [];

    // Compute bounding box
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox!;
    const sizeX = bbox.max.x - bbox.min.x;
    const sizeZ = bbox.max.z - bbox.min.z;

    // Generate UVs based on position
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);

        // Normalize to 0-1 range
        const u = (x - bbox.min.x) / sizeX;
        const v = (z - bbox.min.z) / sizeZ;

        uvs.push(u, v);
    }

    geometry.setAttribute(
        'uv',
        new THREE.BufferAttribute(new Float32Array(uvs), 2)
    );

}