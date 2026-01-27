import * as THREE from 'three';

type PyramidValues = {
    position: { x: number; y: number; z: number };
    scale: number;
    visible: boolean;
    layers: number;
    spacing: { x: number; y: number; z: number };
};

export function setBottlePyramid(
    bottleObject: THREE.Object3D,
    scene: THREE.Scene,
    sheet: any
) {
    if (!bottleObject) {
        console.error('ERROR: bottleObject is null or undefined!');
        return;
    }


    // Find the mesh inside the bottle object
    let bottleMesh: THREE.Mesh | null = null;
    bottleObject.traverse((child) => {
    if (child instanceof THREE.Mesh && child.name === "BottlePiramides") {
        bottleMesh = child;
        
        // Set the color to #e8efee
        if (child.material instanceof THREE.Material) {
            if (child.material instanceof THREE.MeshStandardMaterial || 
                child.material instanceof THREE.MeshPhysicalMaterial) {
                child.material.color.set(0xdbf7ff);
            }
        }
    }
});

    if (!bottleMesh) {
        console.error('ERROR: Could not find mesh in bottle object');
        return;
    }

    // Create a group to hold all pyramid bottles
    const pyramidGroup = new THREE.Group();
    pyramidGroup.name = "BottlePyramidGroup";
    scene.add(pyramidGroup);


    // Store bottles with their layer/position info
    const bottleMap = new Map<string, THREE.Mesh>();
    
    // Animation state
    const animatingBottles = new Set<THREE.Mesh>();

    // Function to create a unique key for a bottle position
    const getBottleKey = (layer: number, row: number, col: number) => {
        return `${layer}-${row}-${col}`;
    };

    // Function to animate bottle in from below
    // Function to animate bottle in from left-back corner
const animateBottleIn = (bottle: THREE.Mesh, targetScale: number, targetX: number, targetZ: number) => {
    // Start from left-back with scale 0
    bottle.scale.set(0, 0, 0);
    const startX = targetX - 3; // Start 3 units to the left
    const startZ = targetZ - 3; // Start 3 units back
    bottle.position.x = startX;
    bottle.position.z = startZ;
    
    animatingBottles.add(bottle);
    
    const duration = 500; // ms
    const startTime = Date.now();
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        // Animate scale and position
        const currentScale = easeProgress * targetScale;
        bottle.scale.set(currentScale, currentScale, currentScale);
        
        const currentX = startX + (targetX - startX) * easeProgress;
        const currentZ = startZ + (targetZ - startZ) * easeProgress;
        bottle.position.x = currentX;
        bottle.position.z = currentZ;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animatingBottles.delete(bottle);
        }
    };
    
    animate();
};
    // Function to animate bottle out (slide down and scale down)
    const animateBottleOut = (bottle: THREE.Mesh, callback: () => void) => {
    const startScale = bottle.scale.x;
    const startX = bottle.position.x;
    const startZ = bottle.position.z;
    animatingBottles.add(bottle);
    
    const duration = 400; // ms
    const startTime = Date.now();
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        // Scale down and move to left-back
        const currentScale = startScale * (1 - easeProgress);
        bottle.scale.set(currentScale, currentScale, currentScale);
        
        const currentX = startX - (3 * easeProgress); // Move 3 units left
        const currentZ = startZ - (3 * easeProgress); // Move 3 units back
        bottle.position.x = currentX;
        bottle.position.z = currentZ;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animatingBottles.delete(bottle);
            callback();
        }
    };
    
    animate();
};

    // Function to create bottles in 3D pyramid shape
    const createPyramid = (layers: number, spacing: { x: number; y: number; z: number }, scale: number) => {
       
        
        const newBottleKeys = new Set<string>();

        // Create 3D pyramid
        for (let layer = 0; layer < layers; layer++) {
            const bottlesPerSide = layers - layer;
            
            for (let row = 0; row < bottlesPerSide; row++) {
                for (let col = 0; col < bottlesPerSide; col++) {
                    const key = getBottleKey(layer, row, col);
                    newBottleKeys.add(key);
                    
                    // Calculate position
                    const layerWidth = (bottlesPerSide - 1) * spacing.x;
                    const layerDepth = (bottlesPerSide - 1) * spacing.z;
                    
                    const xOffset = -layerWidth / 2 + (col * spacing.x);
                    const yOffset = layer * spacing.y;
                    const zOffset = -layerDepth / 2 + (row * spacing.z);
                    
                    if (bottleMap.has(key)) {
                        // Bottle already exists, just update position and scale
                        const bottle = bottleMap.get(key)!;
                        bottle.position.set(xOffset, yOffset, zOffset);
                        
                        // Only update scale if not animating
                        if (!animatingBottles.has(bottle)) {
                            bottle.scale.set(scale, scale, scale);
                        }
                    } else {
                        // Create new bottle
                        const bottle = bottleMesh!.clone();
                        
                        bottle.geometry = bottle.geometry.clone();
                        bottle.geometry.center();
                        
                        bottle.material = new THREE.MeshStandardMaterial({ 
                            color:  0xdbf7ff,
                            metalness: 0.3,
                            roughness: 0.7,
                            side: THREE.DoubleSide
                        });
                        
                        bottle.position.set(xOffset, yOffset, zOffset);
                        bottle.visible = true;
                        
                        pyramidGroup.add(bottle);
                        bottleMap.set(key, bottle);
                        
                        // Animate in from below
                        animateBottleIn(bottle, scale, xOffset, zOffset);
                    }
                }
            }
        }

        // Remove bottles that are no longer needed
        bottleMap.forEach((bottle, key) => {
            if (!newBottleKeys.has(key)) {
                animateBottleOut(bottle, () => {
                    pyramidGroup.remove(bottle);
                    bottle.geometry.dispose();
                    if (Array.isArray(bottle.material)) {
                        bottle.material.forEach(mat => mat.dispose());
                    } else {
                        bottle.material.dispose();
                    }
                    bottleMap.delete(key);
                });
            }
        });

    };

    // Create Theatre.js object
    const pyramidObj = sheet.object("Bottle Pyramid", {
    position: {
        x: 0.387,
        y: -0.552,
        z: 18.9951
    },
    scale: 0.00008,
    layers: 5,
    spacing: {
        x: 0.0005,
        y: 0.0005,
        z: -0.0005
    },
    visible: true
});
    // Listen to Theatre.js changes
    pyramidObj.onValuesChange((v: PyramidValues) => {
        pyramidGroup.position.set(v.position.x, v.position.y, v.position.z);
        pyramidGroup.visible = v.visible;
        
        createPyramid(
            Math.max(1, Math.round(v.layers)),
            v.spacing,
            v.scale
        );
    });

    // Initial creation
    const initialValues = pyramidObj.value as PyramidValues;
    
    createPyramid(
        Math.max(1, Math.round(initialValues.layers)),
        initialValues.spacing,
        initialValues.scale
    );
    pyramidGroup.position.set(initialValues.position.x, initialValues.position.y, initialValues.position.z);
    pyramidGroup.visible = initialValues.visible;
    
}