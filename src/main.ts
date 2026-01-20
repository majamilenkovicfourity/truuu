import './style.css'

import * as THREE from "three";
import studio from "@theatre/studio";
import loadObjects from './utils/loadModels';
import { getProject } from '@theatre/core';
import { setupDirectionalLight } from './utils/directionLightsSetup';

import projectState from '../public/states/TruuStates5.json'
import { updatePlantAnimation } from './animations/grassAnimation';
import { updateBottleGlassAnimation } from './animations/bottleGlassAnimation';
import { updateParticleAnimation } from './animations/particleAnimation';
import { updateSilhouetteAnimation } from './animations/silhouetteAnimation';
import { foodBodyAnimation } from './animations/foodBodyAnimation';
import { carTruckAnimations } from './animations/carTruckAnimations';
import { videos, type VideoConfig } from './utils/videoConfigs';
import { setObjectOpacity, setOpacityRecursive } from './utils/fixShadows';


let scrollProgress = 0;
let currentPosition = 0;
let targetPosition = 0;

// studio.initialize();

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const app = document.getElementById("app");

  // Fade out loader
  loader?.classList.add("hidden");

  // Small delay so transition looks nice
  setTimeout(() => {
    loader?.remove();
    app?.classList.remove("hidden");
    app?.classList.add("show");
  }, 2000);
});

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '-1';




//#region Scene
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);


//#region Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.001,
  1000
);
camera.position.set(0, 0, 30.6);


//#region Models
const object = await loadObjects();
if (!object) {
  throw new Error("Failed to load models");
}

// Add first two models immediately
scene.add(object.earth);
scene.add(object.plain);

// Flag to track if third model is loaded
let isPlainNewLoaded = false;

// Add third model when it's ready
if (object.plainNew) {
  // Already loaded (shouldn't happen with async loading, but just in case)
  scene.add(object.plainNew);
  isPlainNewLoaded = true;
}

// Listen for third model loading
window.addEventListener('thirdModelLoaded', (event) => {
  console.log('Third model ready, adding to scene');
  if (object.plainNew && !isPlainNewLoaded) {
    scene.add(object.plainNew);
    isPlainNewLoaded = true;
    
    // Setup animations for the third model
    if (object.plainNew) {
      carTruckAnimations(object.plainNew, sheet);
    }
    
    // Apply initial Theatre.js values to plainNew
    const vPlainNew = plainObjNew.value;
    object.plainNew.position.set(vPlainNew.position.x, vPlainNew.position.y, vPlainNew.position.z);
    object.plainNew.rotation.set(vPlainNew.rotation.x, vPlainNew.rotation.y, vPlainNew.rotation.z);
  }
});

  
  //#region Theatre.js
const project = getProject("Truu", { state: projectState });
const sheet = project.sheet("Scene");

const sequence = sheet.sequence;
const sceneSheet = projectState.sheetsById["Scene"];
const sequenceLength = sceneSheet.sequence.length;

const pixelsPerSecond = 8000; // Adjust this for scroll speed
const scrollHeight = sequenceLength * pixelsPerSecond;

document.body.style.height = `${scrollHeight}px`;

//#region Object Earth
const earthObj = sheet.object("Earth", {
  position: { x: 0, y: -2, z: 27 },
  rotation: { x: -0.2, y: 0, z: 0 },
  opacity: 1,
});

earthObj.onValuesChange((v) => {
  object?.earth.position.set(v.position.x, v.position.y, v.position.z);
  object?.earth.rotation.set(v.rotation.x, v.rotation.y, v.rotation.z);
  if(object?.earth){
    setObjectOpacity(object?.earth!, v.opacity);
    object.earth.visible = v.opacity > 0;
  }
});

//#region Object Plain
const plainObj = sheet.object("FlatEarth", {
  position: { x: -128, y: -2, z: -4 },
  rotation: { x: 0, y: 0, z: 0 },
});

// Sync cube to Theatre values
plainObj.onValuesChange((v) => {
  object?.plain.position.set(v.position.x, v.position.y, v.position.z);
  object?.plain.rotation.set(v.rotation.x, v.rotation.y, v.rotation.z);
  object?.plain.updateMatrixWorld(true);  
});

//#region Object Plain NEW
const plainObjNew = sheet.object("Plain New", {
  position: { x: -128, y: -2, z: 50 },
  rotation: { x: -0.2, y: 0, z: 0 },
});

plainObjNew.onValuesChange((v) => {
  // Only update if plainNew is loaded
  if (object?.plainNew && isPlainNewLoaded) {
    object.plainNew.position.set(v.position.x, v.position.y, v.position.z);
    object.plainNew.rotation.set(v.rotation.x, v.rotation.y, v.rotation.z);
  }
});

//#region Camera Theatre.js
// Camera editable
const camObj = sheet.object("Camera", {
  position: { x: 0, y: 0, z: 30.6 },
  lookAt: { x: 0, y: 0, z: 0 },
});

camObj.onValuesChange((v) => {
  camera.position.set(v.position.x, v.position.y, v.position.z);
  camera.lookAt(v.lookAt.x, v.lookAt.y, v.lookAt.z);
});

// Setup car/truck animations when plainNew is available
// (This will also be called in the event listener for late loading)
if (object?.plainNew && isPlainNewLoaded) {   
  carTruckAnimations(object.plainNew, sheet);
}


// Immediately apply initial values
const vEarth = earthObj.value;
object?.earth.position.set(vEarth.position.x, vEarth.position.y, vEarth.position.z);
object?.earth.rotation.set(vEarth.rotation.x, vEarth.rotation.y, vEarth.rotation.z);

const vPlain = plainObj.value;
object?.plain.position.set(vPlain.position.x, vPlain.position.y, vPlain.position.z);
object?.plain.rotation.set(vPlain.rotation.x, vPlain.rotation.y, vPlain.rotation.z);

// Only apply if plainNew is already loaded
if (object?.plainNew && isPlainNewLoaded) {
  const vPlainNew = plainObjNew.value;
  object.plainNew.position.set(vPlainNew.position.x, vPlainNew.position.y, vPlainNew.position.z);
  object.plainNew.rotation.set(vPlainNew.rotation.x, vPlainNew.rotation.y, vPlainNew.rotation.z);
}

const vCam = camObj.value;
camera.position.set(vCam.position.x, vCam.position.y, vCam.position.z);
camera.lookAt(vCam.lookAt.x, vCam.lookAt.y, vCam.lookAt.z);


studio.ui.restore();

//#region Resize Handler
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();  
});


//#region Update Scroll
//#region Update Scroll

const initScrollDiv = document.getElementById("initScrollInfo");
const truuLogo = document.getElementById("truuLogo");

let scrollEnabled = true;

function disableScroll() {
  scrollEnabled = false;
  document.body.style.overflow = 'hidden';
}

function enableScroll() {
  scrollEnabled = true;
  document.body.style.overflow = '';
}

function closeVideoModal(videoId: string) {
  const modal = document.getElementById(`videoModal-${videoId}`);
  if (modal) modal.remove();
}

const video = document.getElementById("videoPlay") as HTMLIFrameElement;
let isVideoPlaying = false;
let videoWasClosed = false;

function showVideoModal(videoConfig: VideoConfig) {
  // Create a fresh container with inline styles
  const modal = document.createElement('div');
  modal.id = `videoModal-${videoConfig.id}`;
  modal.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.95) !important;
    z-index: 999999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  `;
  
  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    position: absolute !important;
    top: 20px !important;
    right: 20px !important;
    background: rgba(255, 255, 255, 0.3) !important;
    border: 2px solid white !important;
    color: white !important;
    font-size: 40px !important;
    cursor: pointer !important;
    width: 50px !important;
    height: 50px !important;
    border-radius: 50% !important;
    z-index: 1000000 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  `;
  
  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = `https://player.vimeo.com/video/${videoConfig.vimeoId}?autoplay=1&muted=1`;
  iframe.style.cssText = `
    width: 90vw !important;
    height: 90vh !important;
    border: none !important;
  `;
  iframe.setAttribute('allow', 'autoplay; fullscreen');
  iframe.setAttribute('allowfullscreen', 'true');
  
  // Close button click handler
  closeBtn.addEventListener('click', () => {
  modal.remove();
  videoConfig.isPlaying = false;
  videoConfig.wasClosed = true;
  enableScroll();
  
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const targetScroll = (videoConfig.endThreshold + 0.001) * maxScroll;
  
  // Immediately update scroll and animation position
  window.scrollTo({
    top: targetScroll,
    behavior: 'auto' // Changed to 'auto' for instant scroll
  });
  
  // Immediately sync targetPosition and currentPosition to prevent jump
  scrollProgress = (videoConfig.endThreshold + 0.001);
  targetPosition = scrollProgress * sequenceLength;
  currentPosition = targetPosition; // Sync immediately
});
  
  modal.appendChild(closeBtn);
  modal.appendChild(iframe);
  document.body.appendChild(modal);  
}

function updateScrollProgress() {
  if (!scrollEnabled) return; // Stop processing scroll when disabled
  
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));

  initScrollDiv!.style.opacity = scrollProgress > 0.01105094485578517 ? '0' : '1'; 
  truuLogo!.style.opacity = scrollProgress >= 0.01105094485578517 ? '1' : '0';

  
  targetPosition = scrollProgress * sequenceLength; 

  videos.forEach(video => {
    const inRange = scrollProgress >= video.startThreshold && 
                    scrollProgress < video.endThreshold;
    
    if (inRange && !video.wasClosed && !video.isPlaying) {
      showVideoModal(video);
      video.isPlaying = true;
      disableScroll();
    } 
    else if (scrollProgress < video.startThreshold) {
      // Reset if scrolling back before the video
      video.wasClosed = false;
      if (video.isPlaying) {
        closeVideoModal(video.id);
        video.isPlaying = false;
        enableScroll();
      }
    }
  });
}

// Prevent wheel scrolling when video is playing
window.addEventListener('wheel', (e) => {
  if (!scrollEnabled) {
    e.preventDefault();
    e.stopPropagation();
  }
}, { passive: false });

// Prevent touch scrolling when video is playing
window.addEventListener('touchmove', (e) => {
  if (!scrollEnabled) {
    e.preventDefault();
    e.stopPropagation();
  }
}, { passive: false });

// Prevent keyboard scrolling when video is playing
window.addEventListener('keydown', (e) => {
  if (!scrollEnabled) {
    const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
    }
  }
});

updateScrollProgress();
window.addEventListener("scroll", updateScrollProgress);

//#region Lights
setupDirectionalLight(scene, sheet);


//#region Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  
  // Safe updates - only update if mixer exists
  object?.dragonflyMixer?.update(delta);
  object?.plantsMixer?.update(delta);
  object?.bottleGlassMixer?.update(delta);
  
  object?.particleMixers?.forEach(mixer => {
    mixer?.update(delta);
  });

  if (object?.liquidMaterial) {
    object.liquidMaterial.uniforms.time.value += delta;
  }
  currentPosition += (targetPosition - currentPosition) * 0.1;
  //Only update if plantsActions exists and has items
  if(scrollProgress > 0.07112736879540721 && scrollProgress <= 0.09483649172720961){

    if (object?.plantsActions && object.plantsActions.length > 0) {
      updatePlantAnimation({
        scrollProgress: scrollProgress, 
        plantsActions: object.plantsActions
      });
    }
  }

  // Only update if all required objects exist AND plainNew is loaded
  if(scrollProgress > 0.2766177242629003 && scrollProgress < 0.534031058951040 && isPlainNewLoaded){

    if (object?.bottleGlass && object?.bottleGlassActions && object.bottleGlassActions.length > 0) {
      updateBottleGlassAnimation({
        scrollProgress,
        bottleGlass: object.bottleGlass,
        bottleGlassActions: object.bottleGlassActions
      });
    }
    
    
    
    // Only update particles if everything is loaded
    if (object?.particlePla && object?.particleMixers && object?.particleActions) {
      updateParticleAnimation({
        scrollProgress: scrollProgress,
        particlePla: object.particlePla,
        particleActions: object.particleActions,
        particleGroups: object.particleGroups,
      });
    }
    
    if(object?.body){
      updateSilhouetteAnimation(object.bottleGlass!,object?.plainNew!, scrollProgress,object?.body);
    }
  }
    
  if(scrollProgress >= 0.5729817609104303 && scrollProgress <= 0.6813663228843841 && isPlainNewLoaded){

    if (object?.plainNew) {
      foodBodyAnimation(scrollProgress, object.plainNew);
    }
  }
 
  // Set the sequence position
  sequence.position = currentPosition;
  console.log("[APP]: Scroll progress", scrollProgress);
  
  renderer.render(scene, camera);
}

animate();

//#region Scroll Event Listener