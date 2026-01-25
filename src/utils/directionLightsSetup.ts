import * as THREE from "three";

export const setupDirectionalLight = (scene: THREE.Scene, sheet: any) => {
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
    //#region Directional Light 1
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(0, 13, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.001;  // helps artifacts
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 40;
    directionalLight.shadow.camera.left = 10;
    directionalLight.shadow.camera.right = -1;
    directionalLight.shadow.camera.top = 1;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.camera.updateProjectionMatrix();
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;

    const directionalLightProps = sheet.object('DirectionalLight', {
        x: directionalLight.position.x,
        y: directionalLight.position.y,
        z: directionalLight.position.z,
        intensity: directionalLight.intensity,
        shadowLeft: directionalLight.shadow.camera.left,
        shadowRight: directionalLight.shadow.camera.right,
        shadowTop: directionalLight.shadow.camera.top,
        shadowBottom: directionalLight.shadow.camera.bottom,
        shadowNear: directionalLight.shadow.camera.near,
        shadowFar: directionalLight.shadow.camera.far,
        shadowBias: directionalLight.shadow.bias,
    });

    // scene.add(directionalLight.target);
    scene.add(directionalLight);


    directionalLightProps.onValuesChange((values :any) => {
        directionalLight.position.set(values.x, values.y, values.z);
        // pivot.rotation.set(values.rx, values.ry, values.rz);
        directionalLight.intensity = values.intensity;

        const cam = directionalLight.shadow.camera as THREE.OrthographicCamera;
        cam.left = values.shadowLeft;
        cam.right = values.shadowRight;
        cam.top = values.shadowTop;
        cam.bottom = values.shadowBottom;
        cam.near = values.shadowNear;
        cam.far = values.shadowFar;
        directionalLight.shadow.bias = values.shadowBias;

        cam.updateProjectionMatrix();

    });


    //#region Directional Light 2
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0);
    directionalLight2.position.set(0, 10, 9);
    directionalLight2.castShadow = true;
    directionalLight2.shadow.bias = -0.0005;  // helps artifacts
    directionalLight2.shadow.camera.near = -10;
    directionalLight2.shadow.camera.far = 40;
    directionalLight2.shadow.camera.left = 39;
    directionalLight2.shadow.camera.right = -2;
    directionalLight2.shadow.camera.top = 30;
    directionalLight2.shadow.camera.bottom = -39;
    directionalLight2.shadow.camera.updateProjectionMatrix();
    directionalLight2.shadow.mapSize.width = 1024;
    directionalLight2.shadow.mapSize.height = 1024;

    const directionalLight2Props = sheet.object('DirectionalLight2', {
        x: directionalLight2.position.x,
        y: directionalLight2.position.y,
        z: directionalLight2.position.z,
        intensity: directionalLight2.intensity,
        shadowLeft: directionalLight2.shadow.camera.left,
        shadowRight: directionalLight2.shadow.camera.right,
        shadowTop: directionalLight2.shadow.camera.top,
        shadowBottom: directionalLight2.shadow.camera.bottom,
        shadowNear: directionalLight2.shadow.camera.near,
        shadowFar: directionalLight2.shadow.camera.far,
        shadowBias: directionalLight2.shadow.bias,
    });

    // scene.add(directionalLight2.target);
    scene.add(directionalLight2)
    
    directionalLight2Props.onValuesChange((values: any) => {
        directionalLight2.position.set(values.x, values.y, values.z);
        // pivot.rotation.set(values.rx, values.ry, values.rz);
        directionalLight2.intensity = values.intensity;

        const cam = directionalLight2.shadow.camera as THREE.OrthographicCamera;
        cam.left = values.shadowLeft;
        cam.right = values.shadowRight;
        cam.top = values.shadowTop;
        cam.bottom = values.shadowBottom;
        cam.near = values.shadowNear;
        cam.far = values.shadowFar;
        directionalLight2.shadow.bias = values.shadowBias;
        
        cam.updateProjectionMatrix();
        
    });
    
}