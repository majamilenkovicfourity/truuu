import * as THREE from 'three'

import { types } from '@theatre/core';
import { sheet } from '../main';

export function enableShadowsForModel(
  root: THREE.Object3D, 
  autoControls?: string
) {
  const materials: THREE.MeshStandardMaterial[] = [];
  
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.SkinnedMesh) {
      const oldMat = obj.material as THREE.MeshStandardMaterial;
    
      const newMat = new THREE.MeshStandardMaterial({
        map: oldMat.map,
        aoMap: oldMat.aoMap, // Preserve AO map if it exists
        aoMapIntensity: oldMat.aoMapIntensity || 1.0,
        color: oldMat.color.clone(),  
        transparent: oldMat.transparent || false,
        alphaTest: oldMat.transparent ? 0.5 : 0,
        side: oldMat.side,
        roughness: oldMat.roughness,
        metalness: oldMat.metalness,
      });

      obj.material = newMat;
      obj.castShadow = true;
      obj.receiveShadow = true;
      
      if (autoControls) {
        newMat.userData.originalColor = oldMat.color.clone();
        materials.push(newMat);
      }
    }
  });

  if (autoControls) {
    const theatreObject = sheet.object(autoControls, {
      // Brightness/Darkness
      brightness: types.number(1.0, { range: [0, 3], label: 'Brightness' }),
      
      // Contrast
      contrast: types.number(1.0, { range: [0, 2], label: 'Contrast' }),
      
      // Hue shift
      hueShift: types.number(0, { range: [-180, 180], label: 'Hue Shift' }),
      
      // Saturation
      saturation: types.number(1.0, { range: [0, 2], label: 'Saturation' }),
      
      // Vibrance
      vibrance: types.number(0, { range: [-1, 1], label: 'Vibrance' }),
      
      // Lightness
      lightness: types.number(0, { range: [-0.5, 0.5], label: 'Lightness' }),
      
      // Temperature
      temperature: types.number(0, { range: [-1, 1], label: 'Temperature (Warm/Cool)' }),
      
      // Tint
      tint: types.rgba({ r: 1, g: 1, b: 1, a: 1 }, { label: 'Color Tint' }),
      
      // Ambient Occlusion Intensity (only works if model has AO map)
      aoIntensity: types.number(1.0, { range: [0, 2], label: 'AO Intensity' }),
    });

    theatreObject.onValuesChange((values) => {
      materials.forEach((mat) => {
        const original = mat.userData.originalColor;
        
        // AO Intensity control
        if (mat.aoMap) {
          mat.aoMapIntensity = values.aoIntensity;
        }
        
        // Start with original color in HSL
        const hsl = { h: 0, s: 0, l: 0 };
        original.getHSL(hsl);
        
        // Apply hue shift
        hsl.h = ((hsl.h * 360 + values.hueShift) % 360) / 360;
        if (hsl.h < 0) hsl.h += 1;
        
        // Apply saturation
        hsl.s = Math.max(0, Math.min(1, hsl.s * values.saturation));
        
        // Apply vibrance
        if (values.vibrance !== 0) {
          const vibranceAmount = values.vibrance * (1 - hsl.s);
          hsl.s = Math.max(0, Math.min(1, hsl.s + vibranceAmount));
        }
        
        // Apply lightness
        hsl.l = Math.max(0, Math.min(1, hsl.l + values.lightness));
        
        // Apply contrast
        if (values.contrast !== 1.0) {
          hsl.l = Math.max(0, Math.min(1, (hsl.l - 0.5) * values.contrast + 0.5));
        }
        
        // Set the adjusted HSL color
        mat.color.setHSL(hsl.h, hsl.s, hsl.l);
        
        // Apply brightness
        mat.color.multiplyScalar(values.brightness);
        
        // Apply temperature
        if (values.temperature !== 0) {
          const tempColor = new THREE.Color();
          if (values.temperature > 0) {
            tempColor.setRGB(1, 0.8, 0.6);
          } else {
            tempColor.setRGB(0.6, 0.8, 1);
          }
          mat.color.lerp(tempColor, Math.abs(values.temperature) * 0.3);
        }
        
        // Apply color tint
        mat.color.multiply(new THREE.Color(values.tint.r, values.tint.g, values.tint.b));
      });
    });
    
    return theatreObject;
  }
}

export function changeColors(root: THREE.Object3D, color: THREE.Color, receiveShadow = false, castShadow = false, emissiveIntensity = 0, emissiveColor?: THREE.Color) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.SkinnedMesh) {
      const oldMat = obj.material as THREE.MeshStandardMaterial;    
      oldMat.color.set(color);
      
      const newMat = new THREE.MeshStandardMaterial({
        map: oldMat.map,
        color: oldMat.color,
        transparent: oldMat.transparent || false,
        alphaTest: oldMat.transparent ? 0.5 : 0, // fixes shadows for transparent meshes
        side: oldMat.side,
        roughness: oldMat.roughness,
        metalness: oldMat.metalness,
        aoMapIntensity: oldMat.aoMapIntensity,
        lightMapIntensity: 0.5,     
        emissive: emissiveColor || new THREE.Color(0x000000),
        emissiveIntensity: emissiveIntensity
      });

      obj.material = newMat;
      obj.castShadow = castShadow;
      obj.receiveShadow = receiveShadow;
   
    }
  });
}


export  const setOpacityRecursive = (obj: THREE.Object3D, opacity: number) => {
        obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        mat.transparent = true;
                        mat.opacity = opacity;
                        mat.depthWrite = opacity === 1;
                    });
                } else if (child.material) {
                    child.material.transparent = true;
                    child.material.opacity = opacity;
                    child.material.depthWrite = opacity === 1;
                }
            }
        });
    };


    export const applyColorToMesh = (object: THREE.Object3D | undefined, hexColor: string) => {
    if (!object) {
        console.warn('Object is undefined, cannot apply color');
        return;
    }

    // If it's a mesh, apply color directly
    if (object instanceof THREE.Mesh) {
        const material = object.material as THREE.MeshStandardMaterial;
        material.color.set(hexColor);
    } else {
        // If it's a group/object, traverse and apply to all meshes
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const material = child.material as THREE.MeshStandardMaterial;
                material.color.set(hexColor);
            }
        });
    }
};

export const setObjectOpacity = (object: THREE.Object3D, opacity: number) => {
    object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => {
                    mat.transparent = true;
                    mat.opacity = opacity;
                });
            } else if (mesh.material) {
                mesh.material.transparent = true;
                mesh.material.opacity = opacity;
            }
        }
    });
};