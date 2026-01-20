import * as THREE from "three";

export const BillboardSetup = (plain: THREE.Object3D) => {
    const billboard = plain.getObjectByName('billboard');

    if (billboard && billboard.children.length >= 2) {
        const secondChild = billboard.children[1] as THREE.Mesh;
        const geometry = secondChild.geometry as THREE.BufferGeometry;
        
        // First, let's see what material it originally had
        
        // Check and create UVs if needed
        let uvAttribute = geometry.getAttribute('uv');
        
        if (!uvAttribute) {
            
            const position = geometry.getAttribute('position');
            const uvs = [];
            
            geometry.computeBoundingBox();
            const bbox = geometry.boundingBox!;
            const sizeX = bbox.max.x - bbox.min.x;
            const sizeY = bbox.max.y - bbox.min.y;
            const sizeZ = bbox.max.z - bbox.min.z;
            
            // Determine which plane to use (XY, XZ, or YZ)
            
            for (let i = 0; i < position.count; i++) {
                const x = position.getX(i);
                const y = position.getY(i);
                const z = position.getZ(i);
                
                let u, v;
                
                // Use the plane with the largest area
                if (sizeX >= sizeY && sizeX >= sizeZ) {
                    // XZ plane
                    u = (x - bbox.min.x) / sizeX;
                    v = (z - bbox.min.z) / sizeZ;
                } else if (sizeY >= sizeX && sizeY >= sizeZ) {
                    // YZ plane
                    u = (y - bbox.min.y) / sizeY;
                    v = (z - bbox.min.z) / sizeZ;
                } else {
                    // XY plane (most common for billboards)
                    u = (x - bbox.min.x) / sizeX;
                    v = (y - bbox.min.y) / sizeY;
                }
                
                uvs.push(u, v);
            }
            
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        }
        
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            '/images/Video1ScreenShot.png',
            (texture) => {
                
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.flipY = false; // Try flipping this to true if image is upside down
                texture.needsUpdate = true;
                
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    transparent: false, // Try without transparency first
                    color: 0xffffff // Ensure no color tint
                });
                
                secondChild.material = material;
                
            },
            undefined,
            (error) => {
                console.error("Error loading texture:", error);
            }
        );
    }
}