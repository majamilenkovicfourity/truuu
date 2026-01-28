import * as THREE from 'three';
import { applyColorToMesh, setOpacityRecursive } from '../utils/fixShadows';


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

let renderer: THREE.WebGLRenderer | undefined = undefined;

const animStart = 0.6125082558553067;
const animEnd = 0.673999559687717

const animProgress = (scrollProgress: number) => {
    return Math.min(
        Math.max((scrollProgress - animStart) / (animEnd - animStart), 0),
        1
    );
}

const applyLiquidFill = (bodyPart: THREE.Object3D | undefined, currentFillHeight: number) => {
    if (!bodyPart) return;
    
    const bbox = new THREE.Box3().setFromObject(bodyPart);
    
    if (currentFillHeight < bbox.min.y) {
        bodyPart.visible = false;
        return;
    }
    
    bodyPart.visible = true;

    bodyPart.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            const clippingPlane = new THREE.Plane(
                new THREE.Vector3(0, -1, 0), 
                currentFillHeight
            );

            if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                    mat.clippingPlanes = [clippingPlane];
                    mat.clipShadows = true;
                    mat.needsUpdate = true;
                });
            } else {
                child.material.clippingPlanes = [clippingPlane];
                child.material.clipShadows = true;
                child.material.needsUpdate = true;
            }
        }
    });
}


export const foodBodyAnimation = (scrollProgress: number, plainNew: THREE.Object3D, webGLRenderer?: THREE.WebGLRenderer) => {
    if (webGLRenderer && !renderer) {
        renderer = webGLRenderer;
        renderer.localClippingEnabled = true;
    }

    if (!cachedBody) {
        cachedBody = plainNew.getObjectByName('Silhuette001');

        if (!cachedBody) {
            console.warn('Body object not found');
            return;
        }

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

                const currentColor = material.color;
                const isGray = Math.abs(currentColor.r - currentColor.g) < 0.1 &&
                    Math.abs(currentColor.g - currentColor.b) < 0.1;

                if (isGray) {
                    material.color.set('#00D5FF');
                    material.opacity = 0.1;
                }
            }
        });

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
        
        const progress = animProgress(scrollProgress);
                
        const legsProgress = Math.min(progress / 0.25, 1);
        const upperLegsProgress = Math.min(Math.max((progress - 0.25) / 0.25, 0), 1);
        const bellyProgress = Math.min(Math.max((progress - 0.5) / 0.25, 0), 1);
        const headProgress = Math.min(Math.max((progress - 0.75) / 0.25, 0), 1);

        if(cachedBodyLegs) {
            const legsBbox = new THREE.Box3().setFromObject(cachedBodyLegs);
            const legsHeight = legsBbox.max.y - legsBbox.min.y;
            const currentFillHeight = legsBbox.min.y + (legsHeight * legsProgress);
            applyLiquidFill(cachedBodyLegs, currentFillHeight);
        }

        if(cachedBodyUpperLegs) {
            const upperLegsBbox = new THREE.Box3().setFromObject(cachedBodyUpperLegs);
            const upperLegsHeight = upperLegsBbox.max.y - upperLegsBbox.min.y;
            const currentFillHeight = upperLegsBbox.min.y + (upperLegsHeight * upperLegsProgress);
            applyLiquidFill(cachedBodyUpperLegs, currentFillHeight);
        }

        if(cachedBelly) {
            const bellyBbox = new THREE.Box3().setFromObject(cachedBelly);
            const bellyHeight = bellyBbox.max.y - bellyBbox.min.y;
            const currentFillHeight = bellyBbox.min.y + (bellyHeight * bellyProgress);
            applyLiquidFill(cachedBelly, currentFillHeight);
        }

        if(cachedHead) {
            const headBbox = new THREE.Box3().setFromObject(cachedHead);
            const headHeight = headBbox.max.y - headBbox.min.y;
            const currentFillHeight = headBbox.min.y + (headHeight * headProgress);
            applyLiquidFill(cachedHead, currentFillHeight);
        }

        if(cachedFood01 && cachedFood02 && cachedFood03 && cachedFood04) {
            const food01Progress = progress < 0.25 
                ? 1  // Fully visible
                : progress < 0.3 
                    ? (0.3 - progress) / 0.05  // Quick fade out
                    : 0;
            cachedFood01.visible = food01Progress > 0;
            setOpacityRecursive(cachedFood01, food01Progress);

            const food02Progress = progress < 0.25 
                ? 0
                : progress < 0.5 
                    ? 1  // Fully visible
                    : progress < 0.55 
                        ? (0.55 - progress) / 0.05  // Quick fade out
                        : 0;
            cachedFood02.visible = food02Progress > 0;
            setOpacityRecursive(cachedFood02, food02Progress);

            const food03Progress = progress < 0.5 
                ? 0
                : progress < 0.75 
                    ? 1  // Fully visible
                    : progress < 0.8 
                        ? (0.8 - progress) / 0.05  // Quick fade out
                        : 0;
            cachedFood03.visible = food03Progress > 0;
            setOpacityRecursive(cachedFood03, food03Progress);

            const food04Progress = progress < 0.75 
                ? 0
                : 1;  // Fully visible until end
            cachedFood04.visible = food04Progress > 0;
            setOpacityRecursive(cachedFood04, food04Progress);
        }

    } else {
        cachedBody.visible = false;
        
        if(cachedFood01) cachedFood01.visible = false;
        if(cachedFood02) cachedFood02.visible = false;
        if(cachedFood03) cachedFood03.visible = false;
        if(cachedFood04) cachedFood04.visible = false;
        
        if(cachedBodyLegs) cachedBodyLegs.visible = false;
        if(cachedBodyUpperLegs) cachedBodyUpperLegs.visible = false;
        if(cachedBelly) cachedBelly.visible = false;
        if(cachedHead) cachedHead.visible = false;
    } 
}