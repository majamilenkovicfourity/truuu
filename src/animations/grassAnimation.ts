import * as THREE from 'three';

interface GrassAnimation {
    scrollProgress: number
    plantsActions: THREE.AnimationAction[]
}

let plantsStarted = false;

export function updatePlantAnimation(object: GrassAnimation) {
    if (!object?.plantsActions?.length) return;

    if (object.scrollProgress > 0.076 && !plantsStarted) {
        plantsStarted = true;
        object?.plantsActions.forEach(action => {
            action.timeScale = 1;      // play forward
            action.time = 7.0;         // start at your chosen frame
            action.paused = false;
            action.play();
        });
    }
    else if (object.scrollProgress <= 0.076 && plantsStarted) {
        plantsStarted = false;
        object?.plantsActions.forEach(action => {
            action.timeScale = -1;     // play backward
            action.paused = false;
            
            if (action.time <= 0) {
                action.time = action.getClip().duration;
            }

            action.play();
        });
    }
}
