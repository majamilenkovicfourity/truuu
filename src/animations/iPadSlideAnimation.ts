import * as THREE from 'three';

const startSlide = 0.22062265177295096;
const endSlide = 0.2560437197181495;

// Cache textures to avoid reloading
const textureCache: Map<string, THREE.Texture> = new Map();
let currentImageIndex = -1;

export const ipadSliderAnimation = (plain: THREE.Object3D, scrollProgress: number) => {

    const ipadScreen = plain.getObjectByName('ipad');

    if (ipadScreen && ipadScreen.children.length >= 2) {
        const screenChild = ipadScreen.children[1];
        
        // Only apply slider logic within the scroll range
        if (scrollProgress >= startSlide && scrollProgress <= endSlide) {
            
            // Calculate which image to show (0-5 for 6 images)
            const slideProgress = (scrollProgress - startSlide) / (endSlide - startSlide);
            const imageIndex = Math.floor(slideProgress * 6);
            const clampedIndex = Math.min(Math.max(imageIndex, 0), 5);
            
            // Only update if image index changed
            if (clampedIndex !== currentImageIndex) {
                currentImageIndex = clampedIndex;
                
                // Array of image paths
                const imagePaths = [
                    '/images/picture1.png',
                    '/images/picture2.png',
                    '/images/picture3.png',
                    '/images/picture4.png',
                    '/images/picture5.png',
                    '/images/picture6.png'
                ];
                
                const currentImagePath = imagePaths[clampedIndex];
                
                // Load or get cached texture
                if (textureCache.has(currentImagePath)) {
                    // Use cached texture
                    const texture = textureCache.get(currentImagePath)!;
                    applyTextureToScreen(screenChild, texture);
                } else {
                    // Load new texture
                    const textureLoader = new THREE.TextureLoader();
                    textureLoader.load(
                        currentImagePath,
                        (texture) => {
                            
                            // Configure texture
                            texture.colorSpace = THREE.SRGBColorSpace;
                            texture.flipY = false;
                            texture.wrapS = THREE.ClampToEdgeWrapping;
                            texture.wrapT = THREE.ClampToEdgeWrapping;
                            texture.repeat.set(1, 1);
                            texture.offset.set(0, 0);
                            texture.needsUpdate = true;
                            
                            // Cache the texture
                            textureCache.set(currentImagePath, texture);
                            
                            // Apply to screen
                            applyTextureToScreen(screenChild, texture);
                        },
                        undefined,
                        (error) => {
                            console.error("Error loading texture:", currentImagePath, error);
                        }
                    );
                }
            }
        }
    }
}

function applyTextureToScreen(screenChild: THREE.Object3D, texture: THREE.Texture) {
    if (screenChild instanceof THREE.Mesh) {
        // Update or create material
        if (screenChild.material instanceof THREE.MeshBasicMaterial && screenChild.material.map) {
            // Just update the texture
            screenChild.material.map = texture;
            screenChild.material.needsUpdate = true;
        } else {
            // Create new material
            const newMat = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide,
                toneMapped: false
            });
            screenChild.material = newMat;
        }
    } else {
        // Traverse to find meshes
        screenChild.traverse((subChild) => {
            if (subChild instanceof THREE.Mesh) {
                // Update or create material
                if (subChild.material instanceof THREE.MeshBasicMaterial && subChild.material.map) {
                    // Just update the texture
                    subChild.material.map = texture;
                    subChild.material.needsUpdate = true;
                } else {
                    // Create new material
                    const newMat = new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        side: THREE.DoubleSide,
                        toneMapped: false
                    });
                    subChild.material = newMat;
                }
            }
        });
    }
}