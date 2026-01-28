import * as THREE from 'three';

export const ipadSliderSettings = (plain: THREE.Object3D) => {

    const ipadScreen = plain.getObjectByName('ipad');
    
    if (ipadScreen && ipadScreen.children.length >= 2) {
        const screenChild = ipadScreen.children[1];
        
        
        // Load the PNG texture
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            '/images/picture1.png',
            (texture) => {
                
                // Configure texture for PNG
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.flipY = false;
                
                // Fix texture wrapping and repeat to prevent cutting
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.repeat.set(1, 1);
                texture.offset.set(0, 0);
                
                texture.needsUpdate = true;
                
                // Apply texture to the screen child
                if (screenChild instanceof THREE.Mesh) {
                    
                    // Generate UV coordinates if missing
                    if (!screenChild.geometry.attributes.uv) {
                        generatePlanarUV(screenChild.geometry);
                    }
                    
                    // Create a new material that properly displays the PNG
                    const newMat = new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        side: THREE.DoubleSide,
                        toneMapped: false
                    });
                    
                    screenChild.material = newMat;
                } else {
                    
                    // Traverse to find meshes
                    let meshCount = 0;
                    screenChild.traverse((subChild) => {
                        if (subChild instanceof THREE.Mesh) {
                            meshCount++;
                            
                            // Generate UV coordinates if missing
                            if (!subChild.geometry.attributes.uv) {
                                generatePlanarUV(subChild.geometry);
                            }
                            
                            // Create a new material that properly displays the PNG
                            const newMat = new THREE.MeshBasicMaterial({
                                map: texture,
                                transparent: true,
                                side: THREE.DoubleSide,
                                toneMapped: false
                            });
                            
                            subChild.material = newMat;
                        }
                    });
                    
                }
            },
            (progress) => {
                if (progress.total > 0) {
                }
            },
            (error) => {
                console.error("Error loading texture:", error);
                console.error("Make sure the file exists at /images/picture1.png");
            }
        );   
        
    } 
}

// Helper function to generate planar UV coordinates with proper fitting
function generatePlanarUV(geometry: THREE.BufferGeometry) {
    const positions = geometry.attributes.position;
    const uvs: number[] = [];
    
    // Calculate bounding box to normalize UVs
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox!;
    
    const width = bbox.max.x - bbox.min.x;
    const height = bbox.max.y - bbox.min.y;
    const depth = bbox.max.z - bbox.min.z;
    
    // Determine which plane to project on (use the largest two dimensions)
    let useXY = false;
    let useXZ = false;
    let useYZ = false;
    
    // Choose the plane that's most "screen-like" (flat surface)
    const minDim = Math.min(width, height, depth);
    
    if (minDim === depth) {
        useXY = true; // Screen facing Z direction
    } else if (minDim === width) {
        useYZ = true; // Screen facing X direction
    } else {
        useXZ = true; // Screen facing Y direction
    }
    
   
    // Generate UV coordinates - fill the entire 0-1 range
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        let u, v;
        
        if (useXY) {
            u = (x - bbox.min.x) / width;
            v = (y - bbox.min.y) / height;
        } else if (useXZ) {
            u = (x - bbox.min.x) / width;
            v = (z - bbox.min.z) / depth;
        } else { // useYZ
            u = (y - bbox.min.y) / height;
            v = (z - bbox.min.z) / depth;
        }
        
        uvs.push(u, v);
    }
    
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    
    // Log UV range for debugging
    const uvAttr = geometry.attributes.uv;
    let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
    for (let i = 0; i < uvAttr.count; i++) {
        const u = uvAttr.getX(i);
        const v = uvAttr.getY(i);
        minU = Math.min(minU, u);
        maxU = Math.max(maxU, u);
        minV = Math.min(minV, v);
        maxV = Math.max(maxV, v);
    }
}