import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as THREE from 'three';
import { changeColors, enableShadowsForModel } from "./fixShadows";
import { setupScientist } from "./setupScientist";
import { setupLiquid } from "./liquidSetup";
import { setupGrass } from "./setupGrass";
import { setupPlainModelNew } from "./setupNewPlain";
import { BillboardSetup } from "./billboardVideosImage";

interface LoadedModels {
    earth: THREE.Group;
    plain: THREE.Group;
    plainNew: THREE.Group | null; // Allow null initially
    bottlePyramid: THREE.Group;
    plainTreesMesh: THREE.Mesh[];
    dragonFly?: THREE.Object3D;
    dragonflyMixer?: THREE.AnimationMixer;
    screen?: any;
    plantsMixer?: THREE.AnimationMixer;
    plantsActions: THREE.AnimationAction[];
    liquidMaterial?: THREE.ShaderMaterial;
    bottleGlass: THREE.Object3D<THREE.Object3DEventMap> | undefined
    bottleGlassMixer: THREE.AnimationMixer | undefined;
    bottleGlassActions: THREE.AnimationAction[];
    particlePla: THREE.Object3D<THREE.Object3DEventMap> | undefined
    particleMixers: THREE.AnimationMixer[] | undefined;
    particleActions: THREE.AnimationAction[] | undefined;
    particleGroups: {
        particle1: THREE.Object3D<THREE.Object3DEventMap>[];
        particle2: THREE.Object3D[];
        particle3: THREE.Object3D[];
        particle4: THREE.Object3D[];
    }
    body: THREE.Object3D<THREE.Object3DEventMap> | undefined 
    bodyMixer: THREE.AnimationMixer | undefined;
    bodyActions: THREE.AnimationAction[] | undefined;
}

// Create separate loading managers for each stage
const primaryLoadingManager = new THREE.LoadingManager();
const secondaryLoadingManager = new THREE.LoadingManager();

// Primary loading (first two models)
primaryLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = (itemsLoaded / itemsTotal) * 100;    
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    if (progressText) {
        progressText.textContent = `${Math.round(progress)}%`;
    }
};

primaryLoadingManager.onLoad = () => {        
    console.log('Primary models loaded');
    // Hide loading screen after first two models are loaded
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
};

// Secondary loading (third model)
secondaryLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = (itemsLoaded / itemsTotal) * 100;
    console.log(`Loading additional content: ${Math.round(progress)}%`);
    
    // Optional: Show a small loading indicator for the third model
    const secondaryProgress = document.getElementById('secondary-progress');
    if (secondaryProgress) {
        secondaryProgress.textContent = `Loading additional content: ${Math.round(progress)}%`;
    }
};

secondaryLoadingManager.onLoad = () => {
    console.log('All models loaded');
    const secondaryProgress = document.getElementById('secondary-progress');
    if (secondaryProgress) {
        secondaryProgress.style.display = 'none';
    }
};

primaryLoadingManager.onError = (url) => {
    console.error('Error loading primary model:', url);
};

secondaryLoadingManager.onError = (url) => {
    console.error('Error loading secondary model:', url);
};

// Setup loader with Draco compression support
function createOptimizedLoader(manager: THREE.LoadingManager): GLTFLoader {
    const loader = new GLTFLoader(manager);
    
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
    
    return loader;
}

async function loadObjects(): Promise<LoadedModels | undefined> {
    const primaryLoader = createOptimizedLoader(primaryLoadingManager);
    const secondaryLoader = createOptimizedLoader(secondaryLoadingManager);

    try {   
        // STAGE 1: Load first two models
        const [earthGLTF, flatEarthGLTF, bottlePyramidGLTG] = await Promise.all([
            primaryLoader.loadAsync('compressedModels/earthSphere.glb'),
            primaryLoader.loadAsync('models/plainModelWithoutBG.glb'),
            primaryLoader.loadAsync('models/BottlePyramides.glb'),

        ]);

        const earth = setupEarthModel(earthGLTF.scene);
        const plainSetup = setupPlainModel(flatEarthGLTF.scene, flatEarthGLTF.animations);
        const bottlePiramid = bottlePyramidGLTG.scene;
        
        // Create initial result with null plainNew
        const result: LoadedModels = {
            earth,
            plain: plainSetup.plain,
            bottlePyramid: bottlePiramid as THREE.Group,
            plainTreesMesh: plainSetup.plainTreesMesh,
            dragonFly: plainSetup.dragonFly,
            dragonflyMixer: plainSetup.dragonflyMixer,
            screen: undefined,
            plantsMixer: plainSetup.plantsMixer,
            plantsActions: plainSetup.plantsActions,
            liquidMaterial: plainSetup.liquidMaterial,
            plainNew: null as any, // Will be populated later
            bottleGlass: undefined,
            bottleGlassMixer: undefined,
            bottleGlassActions: [],
            particlePla: undefined,
            particleActions: undefined,
            particleMixers: undefined,
            particleGroups: {
                particle1: [],
                particle2: [],
                particle3: [],
                particle4: []
            },
            body: undefined,
            bodyActions: undefined,
            bodyMixer: undefined,
        };

        // STAGE 2: Load third model in background (don't await)
        loadThirdModel(secondaryLoader, result);
        
        return result;
    } catch (error) {
        console.error('Error loading models:', error);
        
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div style="text-align: center; color: white;">
                    <h2>Error Loading Models</h2>
                    <p>Please refresh the page</p>
                </div>
            `;
        }
        
        return undefined;
    }
}

// Load the third model separately
async function loadThirdModel(loader: GLTFLoader, result: LoadedModels): Promise<void> {
    try {
        const plainNewGLTF = await loader.loadAsync('models/PlainLatest.glb');
        const plainNewSetup = setupPlainModelNew(plainNewGLTF.scene, plainNewGLTF.animations);
        
        // Update the result object with the third model
        result.plainNew = plainNewSetup.plain;
        result.bottleGlass = plainNewSetup.bottleGlass;
        result.bottleGlassMixer = plainNewSetup.bottleGlassMixer;
        result.bottleGlassActions = plainNewSetup.bottleGlassActions!;
        result.particlePla = plainNewSetup.particlePla;
        result.particleActions = plainNewSetup.particleActions;
        result.particleMixers = plainNewSetup.particleMixers;
        result.particleGroups = plainNewSetup.particleGroups;
        result.body = plainNewSetup.body;
        result.bodyActions = plainNewSetup.bodyActions;
        result.bodyMixer = plainNewSetup.bodyMixer;        
        
        // Dispatch custom event when third model is ready
        window.dispatchEvent(new CustomEvent('thirdModelLoaded', { detail: plainNewSetup }));
        
    } catch (error) {
        console.error('Error loading third model:', error);
    }
}

function setupEarthModel(earth: THREE.Group): THREE.Group {
    earth.name = 'earth';
    earth.receiveShadow = true;

    enableShadowsForModel(earth);

    const earthLogo = earth.getObjectByName('logo');
    const earthSphere = earth.getObjectByName('sphere');
    const earthLake = earth.getObjectByName('lake___river');

    if (earthLogo) {
        earthLogo.castShadow = false;
        earthLogo.receiveShadow = false;
    }

    if (earthSphere) {
        earthSphere.castShadow = false;
        earthSphere.receiveShadow = true;
    }

    if (earthLake) {
        earthLake.castShadow = false;
        earthLake.receiveShadow = true;

        if (earthLake instanceof THREE.Mesh) {
            changeColors(
                earthLake,
                new THREE.Color(0x224455),
                true,
                false,
                1,
                new THREE.Color(0x558196)
            );
        }
    }

    return earth;
}

interface PlainSetup {
    plain: THREE.Group;
    plainTreesMesh: THREE.Mesh[];
    dragonFly?: THREE.Object3D;
    dragonflyMixer?: THREE.AnimationMixer;
    plantsMixer?: THREE.AnimationMixer;
    plantsActions: THREE.AnimationAction[];
    liquidMaterial?: THREE.ShaderMaterial;
}

function setupPlainModel(plain: THREE.Group, animations: THREE.AnimationClip[]): PlainSetup {
    plain.name = 'plain';
    plain.castShadow = true;
    plain.receiveShadow = true;
    plain.position.set(-128, -21.6, 78);

    enableShadowsForModel(plain, 'First Plain Color');

    const river = plain.getObjectByName('river');
    enableShadowsForModel(river!, 'RIVER');

    setupPlainMesh(plain);
    const plainTreesMesh = setupPlainTrees(plain);
    const { dragonFly, dragonflyMixer } = setupDragonfly(plain, animations);

    BillboardSetup(plain);

    const { plantsMixer, plantsActions } = setupPlants(plain, animations);
    setupGrass(plain);

    setupScientist(plain, 'scientist');
    const liquidMaterial = setupLiquid(plain);
    plain.updateMatrixWorld(true);

    return {
        plain,
        plainTreesMesh,
        dragonFly,
        dragonflyMixer,
        plantsMixer,
        plantsActions,
        liquidMaterial,
    };
}

function setupPlainMesh(plain: THREE.Group): void {
    const meshPlain = plain.getObjectByName('plane');
    if (meshPlain instanceof THREE.Mesh) {
        // meshPlain.castShadow = true;
        // meshPlain.receiveShadow = true;
    }
}

function setupPlainTrees(plain: THREE.Group): THREE.Mesh[] {
    const plainTreesMesh: THREE.Mesh[] = [];

    plain.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.name.endsWith("_stems")) {
            plainTreesMesh.push(obj);
            obj.castShadow = true;
        }
    });

    return plainTreesMesh;
}

function setupDragonfly(plain: THREE.Group, animations: THREE.AnimationClip[]): {
    dragonFly?: THREE.Object3D;
    dragonflyMixer?: THREE.AnimationMixer;
} {
    const dragonFly = plain.getObjectByName('dragonfly_pla');

    if (!dragonFly) {
        return {};
    }

    dragonFly.castShadow = true;
    dragonFly.receiveShadow = true;

    const dragonflyMixer = new THREE.AnimationMixer(dragonFly);

    animations.forEach(clip => {
        const action = dragonflyMixer.clipAction(clip);
        action.play();
    });

    return { dragonFly, dragonflyMixer };
}

function setupPlants(plain: THREE.Group, animations: THREE.AnimationClip[]): {
    plantsMixer?: THREE.AnimationMixer;
    plantsActions: THREE.AnimationAction[];
} {
    const plantsGrowing = plain.getObjectByName('plants_grow_pla');

    if (!plantsGrowing) {
        return { plantsActions: [] };
    }

    plantsGrowing.receiveShadow = true;
    plantsGrowing.castShadow = true;

    configurePlantShadows(plantsGrowing);

    const plantsMixer = new THREE.AnimationMixer(plantsGrowing);
    const plantsActions: THREE.AnimationAction[] = [];

    const plantClips = animations.filter(
        clip => clip.name.includes('Grass_') || clip.name.includes('catteil_')
    );

    plantClips.forEach(clip => {
        const action = plantsMixer.clipAction(clip);
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.paused = true;
        action.reset();
        plantsActions.push(action);
    });

    return { plantsMixer, plantsActions };
}

function configurePlantShadows(plant: THREE.Object3D): void {
    plant.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;

            if (obj.material) {
                const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
                materials.forEach(mat => {
                    mat.shadowSide = THREE.DoubleSide;
                });
            }
        }
    });
}

export default loadObjects;