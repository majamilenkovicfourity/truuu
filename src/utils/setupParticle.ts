import * as THREE from 'three';

export interface ParticleGroups {
    particle1: THREE.Object3D[],
    particle2: THREE.Object3D[],
    particle3: THREE.Object3D[],
    particle4: THREE.Object3D[],
};

export const getParticles = (particle: THREE.Object3D, particleGroups: ParticleGroups, particleMixers: THREE.AnimationMixer[], particleActions: THREE.AnimationAction[], animations: THREE.AnimationClip[]) => {

    particle.visible = false;
    //Group Particle 1

    const particle1 = particle.getObjectByName('particle_1');
    const particle1_2 = particle.getObjectByName('particle_1_2');

    if (particle1) {
        particle1.visible = false;
        particleGroups.particle1.push(particle1);

        const result = createParticleAnimation(animations, particle1);
        if (result.mixer) particleMixers.push(result.mixer);
        if (result.action) particleActions.push(result.action);
    } 

    if (particle1_2) {
        particle1_2.visible = false;
        particleGroups.particle1.push(particle1_2);

        const result = createParticleAnimation(animations, particle1_2);
        if (result.mixer) particleMixers.push(result.mixer);
        if (result.action) particleActions.push(result.action);      
    }    

    //Group Particle 2

    const particle2 = particle.getObjectByName('particle_2');
    const particle2_2 = particle.getObjectByName('particle_2_2');

    if (particle2) {
        particle2.visible = false;
        particleGroups.particle2.push(particle2);

        const result = createParticleAnimation(animations, particle2);
        if (result.mixer) particleMixers.push(result.mixer);
        if (result.action) particleActions.push(result.action);
    } 

    if (particle2_2) {
        particle2_2.visible = false;
        particleGroups.particle2.push(particle2_2);

        const result = createParticleAnimation(animations, particle2_2);
        if (result.mixer) particleMixers.push(result.mixer);
        if (result.action) particleActions.push(result.action);      
    }

    //Group Particle 3

    const particle3poison = particle.getObjectByName('particle_3_poisson');
    const particle3poison_2 = particle.getObjectByName('particle_3_poisson_2');

    if (particle3poison) {
        particle3poison.visible = false;
        particleGroups.particle3.push(particle3poison);

        const result = createParticleAnimation(animations, particle3poison);
        if (result.mixer) particleMixers.push(result.mixer);
        if (result.action) particleActions.push(result.action);
    } 

    if (particle3poison_2) {
        particle3poison_2.visible = false;
        particleGroups.particle3.push(particle3poison_2);

        const result = createParticleAnimation(animations, particle3poison_2);
        if (result.mixer) particleMixers.push(result.mixer);
        if (result.action) particleActions.push(result.action);      
    }


    //Group Particle 4

    const particle4radio = particle.getObjectByName('particle_4_radio');
    const particle4radio2 = particle.getObjectByName('particle_4_radio_2');

    if (particle4radio) {
        particle4radio.visible = false;
        particleGroups.particle4.push(particle4radio);

        const result = createParticleAnimation(animations, particle4radio);
        if (result.mixer) particleMixers.push(result.mixer);
        if (result.action) particleActions.push(result.action);
    } 

    if (particle4radio2) {
        particle4radio2.visible = false;
        particleGroups.particle4.push(particle4radio2);

        const result = createParticleAnimation(animations, particle4radio2);
        if (result.mixer) particleMixers.push(result.mixer);
        if (result.action) particleActions.push(result.action);      
    }

    

return { particleGroups, particleActions, particleMixers}


}





// Helper function to create animation for a single particle
function createParticleAnimation(
    animations: THREE.AnimationClip[],
    particle: THREE.Object3D
): {
    mixer?: THREE.AnimationMixer;
    action?: THREE.AnimationAction;
} {

    const mixer = new THREE.AnimationMixer(particle);

    const particleClip = animations.find(clip => clip.name === 'Cinema_4D_Basis.003');

    if (!particleClip) {
        return {};
    }

    const action = mixer.clipAction(particleClip);
    action.time = 0;
    action.paused = false;  // Start playing immediately for testing
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.play();

    return { mixer, action };
}
