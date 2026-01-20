import * as THREE from 'three';
import { applyColorToMesh, setOpacityRecursive } from '../utils/fixShadows';

const startingPoint = 0.609256718996088;

// Cache multiple objects
let cachedBody: THREE.Object3D | undefined = undefined;
let cachedBodyWater: THREE.Object3D | undefined = undefined;
let cachedBodyLegs: THREE.Object3D | undefined = undefined;
let cachedBodyUpperLegs: THREE.Object3D | undefined = undefined;
let cachedBelly: THREE.Object3D | undefined = undefined;
let cachedHead: THREE.Object3D | undefined = undefined;

let cachedFood01: THREE.Object3D | undefined = undefined;
let cachedFood02: THREE.Object3D | undefined = undefined;
let cachedFood03: THREE.Object3D | undefined = undefined;
let cachedFood04: THREE.Object3D | undefined = undefined;

const animStart = 0.6125082558553067;
const animEnd = 0.673999559687717

const animProgress = (scrollProgress: number) => {
    return Math.min(
        Math.max((scrollProgress - animStart) / (animEnd - animStart), 0),
        1
    );
}



export const foodBodyAnimation = (scrollProgress: number, plainNew: THREE.Object3D) => {
    // Initialize all cached objects once
    if (!cachedBody) {
        cachedBody = plainNew.getObjectByName('Silhuette001');

        if (!cachedBody) {
            console.warn('Body object not found');
            return;
        }

        // cachedBody.visible = false;
        cachedBody.visible = false;
        cachedBodyWater = cachedBody.getObjectByName('silhoutte_outside')
        if(cachedBodyWater)  cachedBodyWater.visible = false;
        // Cache body parts
        cachedBodyLegs = cachedBody.getObjectByName('silhoutte_1_4001');
        applyColorToMesh(cachedBodyLegs, '#60FF00FF');
        
        cachedBodyUpperLegs = cachedBody.getObjectByName('silhoutte_2_4001');
        applyColorToMesh(cachedBodyUpperLegs, '#FFF500FF');

        cachedBelly = cachedBody.getObjectByName('silhoutte_3_4001');
        applyColorToMesh(cachedBelly, '#FEBDFFFF');

        cachedHead = cachedBody.getObjectByName('silhoutte_4_4001');
        applyColorToMesh(cachedHead, '#FFBC00FF');


        // Traverse to find all meshes and apply color only to gray ones
        cachedBody.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const material = child.material as THREE.MeshStandardMaterial;

                // Check if the mesh is gray (R ≈ G ≈ B)
                const currentColor = material.color;
                const isGray = Math.abs(currentColor.r - currentColor.g) < 0.1 &&
                    Math.abs(currentColor.g - currentColor.b) < 0.1;

                if (isGray) {
                    material.color.set('#00D5FF');
                    material.opacity = 0.1;
                }
            }
        });

        // Cache food objects
        cachedFood01 = plainNew.getObjectByName('food_01');
        cachedFood02 = plainNew.getObjectByName('food_02');
        cachedFood03 = plainNew.getObjectByName('food_03');
        cachedFood04 = plainNew.getObjectByName('food_04');
        if( cachedFood01 && cachedFood02 && cachedFood03 && cachedFood04){        
        cachedFood01.visible = false;
        cachedFood03.visible = false;
        cachedFood02.visible = false;
        cachedFood04.visible = false;

        }
    }
 
   if(scrollProgress >= 0.6092905891717049) {
        cachedBody.visible = true;
        
        const legsProgress = Math.min(animProgress(scrollProgress) / 0.25, 1);
        const upperLegsProgress = Math.min(Math.max((animProgress(scrollProgress) - 0.25) / 0.25, 0), 1);
        const bellyProgress = Math.min(Math.max((animProgress(scrollProgress) - 0.5) / 0.25, 0), 1);
        const headProgress = Math.min(Math.max((animProgress(scrollProgress) - 0.75) / 0.25, 0), 1);

        // Body parts
        if(cachedBodyLegs && cachedBodyUpperLegs && cachedBelly && cachedHead) {
    // Make opacity reach 1 faster by multiplying progress
    cachedBodyLegs.visible = legsProgress > 0;
    setOpacityRecursive(cachedBodyLegs, Math.min(legsProgress * 2, 1));

    cachedBodyUpperLegs.visible = upperLegsProgress > 0;
    setOpacityRecursive(cachedBodyUpperLegs, Math.min(upperLegsProgress * 2, 1));

    cachedBelly.visible = bellyProgress > 0;
    setOpacityRecursive(cachedBelly, Math.min(bellyProgress * 2, 1));

    cachedHead.visible = headProgress > 0;
    setOpacityRecursive(cachedHead, Math.min(headProgress * 2, 1));
}


if(cachedFood01 && cachedFood02 && cachedFood03 && cachedFood04) {
    const progress = animProgress(scrollProgress);
    
    // Food01: shows from start (0) until upperLegs start (0.25), then fades out quickly
    const food01Progress = progress < 0.25 
        ? 1  // Fully visible
        : progress < 0.3 
            ? (0.3 - progress) / 0.05  // Quick fade out
            : 0;
    cachedFood01.visible = food01Progress > 0;
    setOpacityRecursive(cachedFood01, food01Progress);

    // Food02: shows when upperLegs start (0.25) until belly starts (0.5)
    const food02Progress = progress < 0.25 
        ? 0
        : progress < 0.5 
            ? 1  // Fully visible
            : progress < 0.55 
                ? (0.55 - progress) / 0.05  // Quick fade out
                : 0;
    cachedFood02.visible = food02Progress > 0;
    setOpacityRecursive(cachedFood02, food02Progress);

    // Food03: shows when belly starts (0.5) until head starts (0.75)
    const food03Progress = progress < 0.5 
        ? 0
        : progress < 0.75 
            ? 1  // Fully visible
            : progress < 0.8 
                ? (0.8 - progress) / 0.05  // Quick fade out
                : 0;
    cachedFood03.visible = food03Progress > 0;
    setOpacityRecursive(cachedFood03, food03Progress);

    // Food04: shows when head starts (0.75) until end
    const food04Progress = progress < 0.75 
        ? 0
        : 1;  // Fully visible until end
    cachedFood04.visible = food04Progress > 0;
    setOpacityRecursive(cachedFood04, food04Progress);
}

    } else {
        cachedBody.visible = false;
        
        // Hide food items when not in view
        if(cachedFood01) cachedFood01.visible = false;
        if(cachedFood02) cachedFood02.visible = false;
        if(cachedFood03) cachedFood03.visible = false;
        if(cachedFood04) cachedFood04.visible = false;
    } 
}