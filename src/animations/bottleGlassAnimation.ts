import * as THREE from 'three';
import { bottleLabelVisibilityFalse, labelVisibilityThreshold } from '../constatns';

interface BottleGlassAnimation {
    scrollProgress: number,
    bottleGlass: THREE.Object3D,
    bottleGlassActions: THREE.AnimationAction[];
}

let bottleGlassStarted = false;

const ANIMATION_CONFIG = {
    threshold: 0.29,
    startTime: 5,  
};

export function updateBottleGlassAnimation({
    scrollProgress,
    bottleGlass,
    bottleGlassActions
}: BottleGlassAnimation) {
    if (!bottleGlassActions?.length) return;

    const { threshold, startTime } = ANIMATION_CONFIG;

    const bottleLabel = bottleGlass.getObjectByName('bottle_pla_with_label_off__on');
    const bottle = bottleGlass.getObjectByName('bottle_pla_on__off');

     if (bottleLabel) {
        const shouldShowLabel = scrollProgress >= labelVisibilityThreshold;
        bottleLabel.visible = shouldShowLabel;
        
        // Stop all animations when label becomes visible
        if (shouldShowLabel) {
            bottleGlassActions.forEach(action => {
                action.paused = true;
                // Or use action.stop() if you want to completely stop them
            });
        }
    }

    if (scrollProgress >= threshold && !bottleGlassStarted) {
        bottleGlassStarted = true;
        bottleGlass.visible = true;
        
        const mainAnimation = bottleGlassActions[2]; 
        
        if (mainAnimation) {
            mainAnimation.reset();
            mainAnimation.time = startTime;
            mainAnimation.timeScale = 1;
            mainAnimation.play();            
        }
    }
    else if (scrollProgress < 0.2873245662504144 && bottleGlassStarted) {
        bottleGlassStarted = false;
        bottleGlass.visible = false;
        
        bottleGlassActions.forEach(action => {
            action.timeScale = -1;     
            action.paused = false;
            
            if (action.time <= 0) {
                action.time = action.getClip().duration;
            }

            action.play();
        });
      }

      if (scrollProgress >= bottleLabelVisibilityFalse) {
        // Hide the label
        if (bottleLabel) {
            bottleLabel.visible = false;
        }
        
        // Resume animations in reverse
        // bottleGlassActions.forEach(action => {
        //     action.paused = false;
        //     action.timeScale = -1; // Play backwards
        //     action.play();
        // });
    }
}