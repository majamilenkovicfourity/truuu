import * as THREE from "three";

export function setBottleGlass(
    plain: THREE.Object3D, 
    sheet: any,
) {
    const bottle = plain.getObjectByName("bottle_pla_on__off");
    const bottleWithEtiket = plain.getObjectByName("bottle_pla_with_label_off__on");
    const glass = plain.getObjectByName("glass_pla");
    if (!bottle || !glass || !bottleWithEtiket) {
        console.warn("Bottle or glass object not found");
        return;
    }
    
    
    // Glass material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        transparent: true,
        side: THREE.DoubleSide
    });

    // Liquid material
    const liquidMaterial = new THREE.MeshPhysicalMaterial({
        transparent: true,
        side: THREE.DoubleSide
    });

    // Apply glass material to first child (glass)
    if (bottle.children[0] instanceof THREE.Mesh) {
        bottle.children[0].material = glassMaterial;
    }

    // Apply liquid material to second child (liquid)
    if (bottle.children[1] instanceof THREE.Mesh) {
        bottle.children[1].material = liquidMaterial;
    }

    if(glass.children[0] instanceof THREE.Mesh){
        glass.children[0].material = glassMaterial;
    }
    if(glass.children[1] instanceof THREE.Mesh){
        glass.children[1].material = liquidMaterial;
    }

     if (bottleWithEtiket.children[0] instanceof THREE.Mesh) {
        bottleWithEtiket.children[0].material = glassMaterial;
    }

    // Apply liquid material to second child (liquid)
    if (bottleWithEtiket.children[2] instanceof THREE.Mesh) {
        bottleWithEtiket.children[2].material = liquidMaterial;
    }

    // Theatre.js object for glass
    const glassObj = sheet.object("Bottle Glass", {
        color: "#e8efee",
        metalness: 0.1,
        roughness: 0.05,
        opacity: 0.25,
        transmission: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
    });

    // Theatre.js object for liquid
    const liquidObj = sheet.object("Bottle Liquid", {
        color: "#b1e8f1", // Blue water color
        metalness: 0.0,
        roughness: 0.2,
        opacity: 0.8,
        transmission: 0.5,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3,
    });

    // Apply initial glass values
    const vGlass = glassObj.value;
    if (bottle.children[0] instanceof THREE.Mesh) {
        const material = bottle.children[0].material as THREE.MeshPhysicalMaterial;
        material.color.set(vGlass.color);
        material.metalness = vGlass.metalness;
        material.roughness = vGlass.roughness;
        material.opacity = vGlass.opacity;
        material.transmission = vGlass.transmission;
        material.clearcoat = vGlass.clearcoat;
        material.clearcoatRoughness = vGlass.clearcoatRoughness;
    }

    // Apply initial liquid values
    const vLiquid = liquidObj.value;
    if (bottle.children[1] instanceof THREE.Mesh) {
        const material = bottle.children[1].material as THREE.MeshPhysicalMaterial;
        material.color.set(vLiquid.color);
        material.metalness = vLiquid.metalness;
        material.roughness = vLiquid.roughness;
        material.opacity = vLiquid.opacity;
        material.transmission = vLiquid.transmission;
        material.clearcoat = vLiquid.clearcoat;
        material.clearcoatRoughness = vLiquid.clearcoatRoughness;
    }

    // Update glass material from Theatre.js
    glassObj.onValuesChange((v: any) => {
        if (bottle.children[0] instanceof THREE.Mesh) {
            const material = bottle.children[0].material as THREE.MeshPhysicalMaterial;
            material.color.set(v.color);
            material.metalness = v.metalness;
            material.roughness = v.roughness;
            material.opacity = v.opacity;
            material.transmission = v.transmission;
            material.clearcoat = v.clearcoat;
            material.clearcoatRoughness = v.clearcoatRoughness;
        }
    });

    // Update liquid material from Theatre.js
    liquidObj.onValuesChange((v: any) => {
        if (bottle.children[1] instanceof THREE.Mesh) {
            const material = bottle.children[1].material as THREE.MeshPhysicalMaterial;
            material.color.set(v.color);
            material.metalness = v.metalness;
            material.roughness = v.roughness;
            material.opacity = v.opacity;
            material.transmission = v.transmission;
            material.clearcoat = v.clearcoat;
            material.clearcoatRoughness = v.clearcoatRoughness;
        }
    });
}