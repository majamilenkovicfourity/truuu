import * as THREE from 'three';

export const setupLiquid = (plain: THREE.Group): THREE.ShaderMaterial | undefined => {
    const objectLiquid = plain.getObjectByName('liquid');   
    
    if (!objectLiquid) {
        console.warn('Liquid object not found in plain model.');
        return undefined;
    }
    
    if (objectLiquid instanceof THREE.Mesh) {
        const liquidMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                uniform float time;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    
                    vec3 pos = position;
                    
                    // Even faster wave movement
                    float wave = sin(pos.x * 5.0 + time * 4.5) * 0.05;
                    wave += sin(pos.z * 3.0 + time * 5.0) * 0.03;
                    pos.y += wave;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
                }
                
                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    
                    float a = hash(i);
                    float b = hash(i + vec2(1.0, 0.0));
                    float c = hash(i + vec2(0.0, 1.0));
                    float d = hash(i + vec2(1.0, 1.0));
                    
                    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
                }
                
                void main() {
                    vec2 flowUv = vUv;
                    flowUv.y -= time * 0.6;
                    flowUv.x += sin(vUv.y * 10.0 + time * 1.5) * 0.02;
                    
                    float n1 = noise(flowUv * 8.0);
                    float n2 = noise(flowUv * 15.0 + time * 0.9);
                    float n3 = noise(flowUv * 25.0 - time * 0.7);
                    
                    vec3 brownDark = vec3(0.28, 0.24, 0.15);
                    vec3 brownGreen = vec3(0.32, 0.30, 0.18);
                    vec3 mudGreen = vec3(0.30, 0.35, 0.20);
                    vec3 yellowFoam = vec3(0.55, 0.50, 0.30);
                    vec3 yellowStrip = vec3(0.50, 0.48, 0.28);
                    vec3 darkSpot = vec3(0.15, 0.14, 0.10);
                    
                    vec3 color = mix(brownDark, brownGreen, n1);
                    color = mix(color, mudGreen, n2 * 0.5);
                    
                    // Dark spots
                    float darkPattern = noise(flowUv * 10.0 + time * 0.3);
                    darkPattern *= noise(flowUv * 18.0 - time * 0.4);
                    darkPattern = smoothstep(0.3, 0.6, darkPattern);
                    color = mix(color, darkSpot, darkPattern * 0.6);
                    
                    // Yellow strips
                    float stripPattern = sin(flowUv.y * 15.0 + time * 0.5) * 0.5 + 0.5;
                    stripPattern *= noise(flowUv * 12.0);
                    stripPattern = smoothstep(0.4, 0.7, stripPattern);
                    color = mix(color, yellowStrip, stripPattern * 0.5);
                    
                    // Foam at top
                    float foamMask = smoothstep(0.7, 0.95, vUv.y);
                    float foamNoise = noise(flowUv * 20.0) * noise(flowUv * 35.0);
                    foamMask *= foamNoise;
                    color = mix(color, yellowFoam, foamMask * 0.7);
                    
                    // Shadow at bottom
                    float shadowMask = smoothstep(0.15, 0.0, vUv.y);
                    vec3 shadowColor = vec3(0.08, 0.07, 0.05);
                    color = mix(color, shadowColor, shadowMask * 0.8);
                    
                    color += vec3(0.02, 0.03, 0.01) * sin(flowUv.y * 20.0 + time);
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
            },
        });
        
        objectLiquid.material = liquidMaterial;
        objectLiquid.material.needsUpdate = true;
                
        return liquidMaterial;
    } else {
        console.warn('Liquid object is not a mesh.');
        return undefined;
    }
}