import * as THREE from 'three';
import { enableShadowsForModel } from './fixShadows';
import { getParticles, type ParticleGroups } from './setupParticle';
import { setupScientist } from './setupScientist';
import { createBottlePyramid } from './createBottlePiramides';
import { setBottleGlass } from './bottleGlassEffect';


export interface PlainSetupNew {
    plain: THREE.Group;
    bottleGlass: THREE.Object3D<THREE.Object3DEventMap> | undefined
    bottleGlassMixer: THREE.AnimationMixer | undefined;
    bottleGlassActions: THREE.AnimationAction[] | undefined;
    particlePla: THREE.Object3D<THREE.Object3DEventMap> | undefined
    particleMixers: THREE.AnimationMixer [] | undefined;
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
    // bottlePyramid:  THREE.Group;
}

export function setupPlainModelNew(plain: THREE.Group, animations: THREE.AnimationClip[]): PlainSetupNew {
    plain.name = 'plainNew';
    plain.castShadow = true;
    plain.receiveShadow = true;
    plain.position.set(-128, -0.603, 25.12);

    enableShadowsForModel(plain, 'New Plain Color');

    const river = plain.getObjectByName('river');
    enableShadowsForModel(river!, 'RIVER2');

    plain.updateMatrixWorld(true);

    setupScientist(plain, 'Scientist_2');
    const bottleGlass = plain.getObjectByName('bottle_glas'); 

    let bottleGlassActions;
    let bottleGlassMixer;  

    let bodyActions;
    let bodyMixer;  


    if (bottleGlass) {      
    bottleGlass.visible = false; // hide the object

    const bottle = bottleGlass.getObjectByName("bottle_pla_with_label_off__on")
   
    if(bottle){        
        bottle.visible = false;
    }
     

    const result = bottleGlassAnimation(animations, bottleGlass);
    bottleGlassMixer = result.bottleGlassMixer;
    bottleGlassActions = result.bottleGlassActions;
}


    const body = plain.getObjectByName('Silhuette');
    if (body) {
        body.visible = false; // hide the object

        const result = bodyAnimation(animations, body);
        bodyMixer = result.bodyMixer;
        bodyActions = result.bodyActions;

    }

    let particleMixers: THREE.AnimationMixer[] = [];
let particleActions: THREE.AnimationAction[] = [];
    // Setup particles
    const particlePla = plain.getObjectByName('particle_pla');
    let particleGroups: ParticleGroups = {
        particle1: [] as THREE.Object3D[],
        particle2: [] as THREE.Object3D[],
        particle3: [] as THREE.Object3D[],
        particle4: [] as THREE.Object3D[],
    };
    
    
if (particlePla) {
        const result = getParticles(particlePla,
            particleGroups, 
            particleMixers, 
            particleActions,
            animations
        )

        particleGroups = { ...result.particleGroups };
        particleActions = result.particleActions;
        particleMixers = result.particleMixers
    }

    //  const bottlePyramid = createBottlePyramid(7);
    // plain.add(bottlePyramid);

    return {
        plain,
        bottleGlass,
        bottleGlassMixer,
        bottleGlassActions,
        particlePla,
        particleMixers,
        particleActions,
        particleGroups,        
        body,
        bodyMixer,
        bodyActions,
    };
}


function bottleGlassAnimation(
    animations: THREE.AnimationClip[],
    bottleGlass: THREE.Object3D
): {
    bottleGlassMixer?: THREE.AnimationMixer;
    bottleGlassActions: THREE.AnimationAction[];
} {
    if (!bottleGlass) {
        return { bottleGlassActions: [] };
    }

    const bottleGlassMixer = new THREE.AnimationMixer(bottleGlass);
    const bottleGlassActions: THREE.AnimationAction[] = [];    

    const clips = animations;

    clips.forEach(clip => {
        const action = bottleGlassMixer.clipAction(clip);

        action.time = 0;                 // start at beginning
        action.paused = false;
        action.loop = THREE.LoopOnce;  
        action.clampWhenFinished = true; // prevents disappearing if it stops

        action.play();
        bottleGlassActions.push(action); // store action for later control
    });

    return { bottleGlassMixer, bottleGlassActions };
}

function bodyAnimation(
    animations: THREE.AnimationClip[],
    body: THREE.Object3D
): {
    bodyMixer?: THREE.AnimationMixer;
    bodyActions: THREE.AnimationAction[];
} {
    if (!body) {
        return { bodyActions: [] };
    }

    const bodyMixer = new THREE.AnimationMixer(body);
    const bodyActions: THREE.AnimationAction[] = [];    

    const clips = animations;

    clips.forEach(clip => {
        // Only process the clip named "Anim.003"
        if (clip.name === 'Anim.003') {
            const action = bodyMixer.clipAction(clip);

            action.time = 0;                 // start at beginning
            action.paused = false;
            action.loop = THREE.LoopRepeat;  // Changed to loop infinitely
            action.clampWhenFinished = true; // prevents disappearing if it stops

            action.play();
            bodyActions.push(action); // store action for later control
        }
    });

    return { bodyMixer, bodyActions };
}


