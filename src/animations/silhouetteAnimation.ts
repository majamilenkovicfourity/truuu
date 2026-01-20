import * as THREE from 'three';
import { endOfBody } from '../constatns';
import { setOpacityRecursive } from '../utils/fixShadows';

const endOfAnim = 0.5302115596619245;
let background: THREE.Mesh | null = null;

export const updateSilhouetteAnimation = (
    bottle: THREE.Object3D, 
    plainNew: THREE.Object3D, 
    scrollProgress: number, 
    body: THREE.Object3D<THREE.Object3DEventMap> | undefined,    
) => {
     const bodyLegs = body?.getObjectByName('silhoutte_1_4');
    const bodyUpperLegs = body?.getObjectByName('silhoutte_2_4');
    const belly = body?.getObjectByName('silhoutte_3_4');
    const head = body?.getObjectByName('silhoutte_4_4');
    const ipad = plainNew.getObjectByName('ipad_cam_04');

    

    // Create background only once
    if (!background && bottle) {
        const bgGeometry = new THREE.PlaneGeometry(5, 8);
        const bgMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1
        });
        
        background = new THREE.Mesh(bgGeometry, bgMaterial);
        
        background.position.set(
            bottle.position.x,
            bottle.position.y,
            bottle.position.z + 0.003
        );
        
        if (bottle.parent) {
            bottle.parent.add(background);
        }
        
        background.visible = false;
    }

    if (body && ipad && background && bodyLegs && bodyUpperLegs && belly && head) {
    if (scrollProgress >= 0.432420532100458944 && scrollProgress <= endOfBody) {
        ipad.visible = false;
        
        body.position.set(0.3922, 0.0456, -5.638);
        
        background.visible = true;
        body.visible = true;

        const animStart = 0.43380920930075023;
        const animEnd = 0.49308201663025625;
        
        const animProgress = Math.min(
            Math.max((scrollProgress - animStart) / (animEnd - animStart), 0),
            1
        );
        
        const legsProgress = Math.min(animProgress / 0.25, 1);
        const upperLegsProgress = Math.min(Math.max((animProgress - 0.25) / 0.25, 0), 1);
        const bellyProgress = Math.min(Math.max((animProgress - 0.5) / 0.25, 0), 1);
        const headProgress = Math.min(Math.max((animProgress - 0.75) / 0.25, 0), 1);
        
        // Body parts
        bodyLegs.visible = legsProgress > 0;
        setOpacityRecursive(bodyLegs, legsProgress);
        
        bodyUpperLegs.visible = upperLegsProgress > 0;
        setOpacityRecursive(bodyUpperLegs, upperLegsProgress);
        
        belly.visible = bellyProgress > 0;
        setOpacityRecursive(belly, bellyProgress);
        
        head.visible = headProgress > 0;
        setOpacityRecursive(head, headProgress);
        
    } else {

        ipad.visible = true;
        body.visible = false;
        background.visible = false;        
       
    }
}
}