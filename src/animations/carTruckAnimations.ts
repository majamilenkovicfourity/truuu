import * as THREE from "three";
import type { ISheet } from "@theatre/core";
import { setObjectOpacity } from "../utils/fixShadows";

let car: THREE.Object3D | undefined = undefined;
let carFrontGlass: THREE.Object3D | undefined = undefined;
let truck08: THREE.Object3D | undefined = undefined;
let truck09: THREE.Object3D | undefined = undefined;
let truck10: THREE.Object3D | undefined = undefined;
let truck11: THREE.Object3D | undefined = undefined;

let truckGarbage: THREE.Object3D | undefined = undefined;
let scientistFrontal: THREE.Object3D | undefined = undefined;
let scientistSide: THREE.Object3D | undefined = undefined;

let isInitialized = false;

// Helper function to set opacity on an object


export const carTruckAnimations = (
    plainNew: THREE.Object3D,
    sheet: ISheet
) => {
    
    if (!car) {       

        car = plainNew.getObjectByName('Pickup001');
        truck08 = plainNew.getObjectByName('truck_08_driving');
        truck09 = plainNew.getObjectByName('truck_09_driving');
        truck11 = plainNew.getObjectByName('truck_11');
        truck10 = plainNew.getObjectByName('truck_10_driving');
        truckGarbage = plainNew.getObjectByName('truck_garbage001');
        carFrontGlass = plainNew.getObjectByName('FrontGlass');

        if (carFrontGlass instanceof THREE.Mesh) {
            // Create a glass material
             const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.1,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide  // Render both sides
  });

  carFrontGlass.material = glassMaterial;
        }
       

        const pickup2 = plainNew.getObjectByName('Pickup_2');
        if (pickup2) {
            scientistFrontal = pickup2.getObjectByName('Scientist_looking_frontal');
            scientistSide = pickup2.getObjectByName('Scientist_looking_side');

        }

    }

    // Initialize Theatre.js objects only once
    if (!isInitialized && car && truck08 && truck09 && truck10 && truck11 && truckGarbage && scientistSide && scientistFrontal) {
        // Car object      
        const carObj = sheet.object("Car", {
            position: {
                x: car.position.x,
                y: car.position.y,
                z: car.position.z
            },
            rotation: {
                x: car.rotation.x,
                y: car.rotation.y,
                z: car.rotation.z
            },
        });
        const vCar = carObj.value;
        car.position.set(vCar.position.x, vCar.position.y, vCar.position.z);
        car.rotation.set(vCar.rotation.x, vCar.rotation.y, vCar.rotation.z);

        carObj.onValuesChange((v) => {
            if (car) {
                car.position.set(v.position.x, v.position.y, v.position.z);
                car.rotation.set(v.rotation.x, v.rotation.y, v.rotation.z);
            }
        });

        // Truck 08 object
        const truck08Obj = sheet.object("Truck_08", {
            position: {
                x: truck08.position.x,
                y: truck08.position.y,
                z: truck08.position.z
            },
            rotation: {
                x: truck08.rotation.x,
                y: truck08.rotation.y,
                z: truck08.rotation.z
            },
            opacity: 1,
        });

        truck08Obj.onValuesChange((v) => {
            if (truck08) {
                truck08.position.set(v.position.x, v.position.y, v.position.z);
                truck08.rotation.set(v.rotation.x, v.rotation.y, v.rotation.z);
                setObjectOpacity(truck08, v.opacity);
                truck08.visible = v.opacity > 0;
            }
        });

        // Truck 09 object
        const truck09Obj = sheet.object("Truck_09", {
            position: {
                x: truck09.position.x,
                y: truck09.position.y,
                z: truck09.position.z
            },
            rotation: {
                x: truck09.rotation.x,
                y: truck09.rotation.y,
                z: truck09.rotation.z
            },
            opacity: 1,
        });

        truck09Obj.onValuesChange((v) => {
            if (truck09) {
                truck09.position.set(v.position.x, v.position.y, v.position.z);
                truck09.rotation.set(v.rotation.x, v.rotation.y, v.rotation.z);
                setObjectOpacity(truck09, v.opacity);
                truck09.visible = v.opacity > 0;
            }
        });

        const truck10Obj = sheet.object("Truck_10", {
            position: {
                x: truck10.position.x,
                y: truck10.position.y,
                z: truck10.position.z
            },
            rotation: {
                x: truck10.rotation.x,
                y: truck10.rotation.y,
                z: truck10.rotation.z
            },
            opacity: 1,
        });

        truck10Obj.onValuesChange((v) => {
            if (truck10) {
                setObjectOpacity(truck10, v.opacity);
                truck10.visible = v.opacity > 0;
            }
        });

        // Truck 10 object
        const truck11Obj = sheet.object("Truck_11", {
            position: {
                x: truck11.position.x,
                y: truck11.position.y,
                z: truck11.position.z
            },
            rotation: {
                x: truck11.rotation.x,
                y: truck11.rotation.y,
                z: truck11.rotation.z
            },
            opacity: 1,
        });

        truck11Obj.onValuesChange((v) => {
            if (truck11) {
                truck11.position.set(v.position.x, v.position.y, v.position.z);
                truck11.rotation.set(v.rotation.x, v.rotation.y, v.rotation.z);
                setObjectOpacity(truck11, v.opacity);
                truck11.visible = v.opacity > 0;
            }
        });

        // Garbage Truck object
        const truckGarbageObj = sheet.object("Truck_Garbage", {
            position: {
                x: truckGarbage.position.x,
                y: truckGarbage.position.y,
                z: truckGarbage.position.z
            },
            rotation: {
                x: truckGarbage.rotation.x,
                y: truckGarbage.rotation.y,
                z: truckGarbage.rotation.z
            },
            opacity: 1,
        });

        truckGarbageObj.onValuesChange((v) => {
            if (truckGarbage) {
                truckGarbage.position.set(v.position.x, v.position.y, v.position.z);
                truckGarbage.rotation.set(v.rotation.x, v.rotation.y, v.rotation.z);
                setObjectOpacity(truckGarbage, v.opacity);
                truckGarbage.visible = v.opacity > 0;
            }
        });

        // Scientist Frontal object
        const scientistFrontalObj = sheet.object("Scientist_Frontal", {
            opacity: 1,
        });

        scientistFrontalObj.onValuesChange((v) => {
            if (scientistFrontal) {
                setObjectOpacity(scientistFrontal, v.opacity);
                scientistFrontal.visible = v.opacity > 0;
            }
        });

        // Scientist Side object
        const scientistSideObj = sheet.object("Scientist_Side", {
            opacity: 1,
        });

        scientistSideObj.onValuesChange((v) => {
            if (scientistSide) {
                setObjectOpacity(scientistSide, v.opacity);
                scientistSide.visible = v.opacity > 0;
            }
        });

        isInitialized = true;
    }
};