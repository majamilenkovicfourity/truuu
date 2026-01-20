import * as THREE from 'three';

interface ParticleAnimation {
    scrollProgress: number;
    particlePla: THREE.Object3D;
    particleActions: THREE.AnimationAction[];
    particleGroups: {
        particle1: THREE.Object3D[];
        particle2: THREE.Object3D[];
        particle3: THREE.Object3D[];
        particle4: THREE.Object3D[];
    };
}

let particleStates = {
    group1: false,
    group2: false,
    group3: false,
    group4: false,
};

const PARTICLE_CONFIG = [
    { groupKey: 'particle1', stateKey: 'group1', threshold: 0.3315283456735551 },
    { groupKey: 'particle2', stateKey: 'group2', threshold: 0.3470 },
    { groupKey: 'particle3', stateKey: 'group3', threshold: 0.3657 },
    { groupKey: 'particle4', stateKey: 'group4', threshold: 0.3867 },
];

function handleParticleGroup(
    show: boolean,
    particles: THREE.Object3D[],
    particleActions: THREE.AnimationAction[],    
) {
    particles.forEach(particle => {
        particle.visible = show;
        
        const action = particleActions.find(action => action.getRoot() === particle);
        
        if (action) {
            if (show) {
                action.reset();
                action.paused = false;
                action.play();
            } else {
                action.stop();
            }
        }
    });
    
}

export function updateParticleAnimation({
    scrollProgress,
    particlePla,
    particleActions,
    particleGroups,
}: ParticleAnimation) {
    if (!particleActions?.length || !particleGroups) return;

    // All particle groups
    PARTICLE_CONFIG.forEach(config => {
        const particles = particleGroups[config.groupKey as keyof typeof particleGroups];
        const stateKey = config.stateKey as keyof typeof particleStates;
        const isActive = particleStates[stateKey];

        if (scrollProgress >= config.threshold && !isActive) {
            particleStates[stateKey] = true;
            particlePla.visible = true; // Show parent when any group is active
            handleParticleGroup(true, particles, particleActions);
        } else if (scrollProgress < config.threshold && isActive) {
            particleStates[stateKey] = false;
            handleParticleGroup(false, particles, particleActions);
            
            // Hide parent only if all groups are hidden
            const allHidden = Object.values(particleStates).every(state => !state);
            if (allHidden) {
                particlePla.visible = false;
            }
        }
    });
}