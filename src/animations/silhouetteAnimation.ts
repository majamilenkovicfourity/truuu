import * as THREE from 'three';
import { endOfBody } from '../constatns';

let background: THREE.Mesh | null = null;

interface BodyParts {
    bodyLegs: THREE.Object3D;
    bodyUpperLegs: THREE.Object3D;
    belly: THREE.Object3D;
    head: THREE.Object3D;
}

export class SilhouetteAnimation {
    private bottleGlass: THREE.Object3D;
    private plainNew: THREE.Object3D;
    private body: THREE.Object3D;
    private silhouette: THREE.Object3D | null = null;
    private ipad: THREE.Object3D | null = null;
    private bodyParts: BodyParts | null = null;
    private renderer: THREE.WebGLRenderer;

    constructor(
        bottleGlass: THREE.Object3D,
        plainNew: THREE.Object3D,
        body: THREE.Object3D,
        renderer: THREE.WebGLRenderer
    ) {
        this.bottleGlass = bottleGlass;
        this.plainNew = plainNew;
        this.body = body;
        this.renderer = renderer;
        this.init();
    }

    private init() {
        this.renderer.localClippingEnabled = true;       
        this.silhouette = this.plainNew.getObjectByName('Silhuette_outside_pla') || null;
        this.ipad = this.plainNew.getObjectByName('ipad_cam_04') || null;

        const bodyLegs = this.body.getObjectByName('silhoutte_1_4');
        const bodyUpperLegs = this.body.getObjectByName('silhoutte_2_4');
        const belly = this.body.getObjectByName('silhoutte_3_4');
        const head = this.body.getObjectByName('silhoutte_4_4');

        if (bodyLegs && bodyUpperLegs && belly && head) {
            this.bodyParts = {
                bodyLegs: bodyLegs as THREE.Object3D,
                bodyUpperLegs: bodyUpperLegs as THREE.Object3D,
                belly: belly as THREE.Object3D,
                head: head as THREE.Object3D
            };

            this.bodyParts.bodyLegs.visible = false;
            this.bodyParts.bodyUpperLegs.visible = false;
            this.bodyParts.belly.visible = false;
            this.bodyParts.head.visible = false;
        }

        // Create background
        this.createBackground();

        // Setup silhouette
        if (this.silhouette) {
            this.silhouette.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const edges = new THREE.EdgesGeometry(child.geometry);
                    const lineMaterial = new THREE.LineBasicMaterial({ 
                        color: 0x000000,
                        linewidth: 2 
                    });
                    const outline = new THREE.LineSegments(edges, lineMaterial);
                    child.add(outline);

                    const material = child.material as THREE.Material;
                    if (material) {
                        material.transparent = true;
                        material.opacity = 0.2;
                    }
                }
            });
            this.silhouette.visible = false;
        }

        this.bottleGlass.visible = false;
    }

    private createBackground() {
        if (!background && this.bottleGlass) {
            const bgGeometry = new THREE.PlaneGeometry(5, 8);
            const bgMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 1
            });

            background = new THREE.Mesh(bgGeometry, bgMaterial);

            background.position.set(
                this.bottleGlass.position.x,
                this.bottleGlass.position.y,
                this.bottleGlass.position.z + 0.003
            );

            if (this.bottleGlass.parent) {
                this.bottleGlass.parent.add(background);
            }

            background.visible = false;
        }
    }

    public update(scrollProgress: number) {
        if (!this.bodyParts || !this.ipad || !background || !this.silhouette) {
            return;
        }

        const animStart = 0.432420532100458944;
        const animEnd = endOfBody;

        if (scrollProgress >= animStart && scrollProgress <= animEnd) {
            // Hide iPad, show silhouette and background
            this.ipad.visible = false;
            this.silhouette.visible = true;
            background.visible = true;
            this.body.visible = true;

            // Position body
            this.body.position.set(0.3922, 0.0456, -5.638);

            // Calculate fill animation progress
            const fillStart = 0.43380920930075023;
            const fillEnd = 0.49308201663025625;

            const fillProgress = Math.min(
                Math.max((scrollProgress - fillStart) / (fillEnd - fillStart), 0),
                1
            );

            // Get overall body bounding box to calculate total height
            const bodyBox = new THREE.Box3().setFromObject(this.body);
            const totalHeight = bodyBox.max.y - bodyBox.min.y;
            const bottomY = bodyBox.min.y;
            
            // Calculate current fill height (from bottom to top)
            const currentFillHeight = bottomY + (totalHeight * fillProgress);

            // Apply liquid-fill clipping to all body parts
            this.applyLiquidFill(this.bodyParts.bodyLegs, currentFillHeight);
            this.applyLiquidFill(this.bodyParts.bodyUpperLegs, currentFillHeight);
            this.applyLiquidFill(this.bodyParts.belly, currentFillHeight);
            this.applyLiquidFill(this.bodyParts.head, currentFillHeight);

        } else {
            // Reset state
            this.ipad.visible = true;
            this.silhouette.visible = false;
            this.body.visible = false;
            background.visible = false;
            
            // Hide all body parts
            if (this.bodyParts) {
                this.bodyParts.bodyLegs.visible = false;
                this.bodyParts.bodyUpperLegs.visible = false;
                this.bodyParts.belly.visible = false;
                this.bodyParts.head.visible = false;
            }
        }
    }

    private applyLiquidFill(bodyPart: THREE.Object3D, currentFillHeight: number) {
        const bbox = new THREE.Box3().setFromObject(bodyPart);
        
        if (currentFillHeight < bbox.min.y) {
            bodyPart.visible = false;
            return;
        }
        
        bodyPart.visible = true;

        bodyPart.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const clippingPlane = new THREE.Plane(
                    new THREE.Vector3(0, -1, 0), 
                    currentFillHeight
                );

                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        mat.clippingPlanes = [clippingPlane];
                        mat.clipShadows = true;
                        mat.needsUpdate = true;
                    });
                } else {
                    child.material.clippingPlanes = [clippingPlane];
                    child.material.clipShadows = true;
                    child.material.needsUpdate = true;
                }
            }
        });
    }

    public dispose() {
        if (background && background.parent) {
            background.parent.remove(background);
            background.geometry.dispose();
            (background.material as THREE.Material).dispose();
            background = null;
        }
    }
}