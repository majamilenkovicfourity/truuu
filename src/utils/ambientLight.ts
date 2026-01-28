
import { types } from "@theatre/core";
import * as THREE from "three";

export const setupAmbientLight = (scene: THREE.Scene, sheet: any) => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const theatreObject = sheet.object('ambientLight', {
    visible: types.boolean(true),
    intensity: types.number(0.5, { range: [0, 5], label: 'Intensity' }),
    color: types.rgba({ r: 1, g: 1, b: 1, a: 1 }),
  });

  theatreObject.onValuesChange((values: any) => {
    ambientLight.visible = values.visible;
    ambientLight.intensity = values.intensity;
    ambientLight.color.setRGB(values.color.r, values.color.g, values.color.b);
  });

  return { ambientLight, theatreObject };
};