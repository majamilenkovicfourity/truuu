import * as THREE from 'three';
// Create this as a separate function (e.g., in a utils file or at the top of your file)
export function createBottlePyramid(rows: number = 7): THREE.Group {
    const bottlePyramid = new THREE.Group();
    bottlePyramid.name = 'bottlePyramid';
    
    // Create a pyramid of bottles
    const bottleSize = 20000; // Large to compensate for small scale
    const spacing = 25000;
    
    for (let row = 0; row < rows; row++) {
        const bottlesInRow = rows - row; // 7, 6, 5, 4, 3, 2, 1
        
        for (let col = 0; col < bottlesInRow; col++) {
            const bottleGroup = new THREE.Group();
            bottleGroup.name = `bottle_row${row}_col${col}`;
            
            // Bottle body
            const bodyGeometry = new THREE.CylinderGeometry(
                bottleSize * 0.4, 
                bottleSize * 0.4, 
                bottleSize * 2, 
                8
            );
            const bodyMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x444444,
                transparent: true,
                opacity: 1
            });
            const bottleBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
            
            // Bottle neck
            const neckGeometry = new THREE.CylinderGeometry(
                bottleSize * 0.2, 
                bottleSize * 0.4, 
                bottleSize * 0.8, 
                8
            );
            const neckMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x444444,
                transparent: true,
                opacity: 1
            });
            const bottleNeck = new THREE.Mesh(neckGeometry, neckMaterial);
            bottleNeck.position.y = bottleSize * 1.4;
            
            bottleGroup.add(bottleBody);
            bottleGroup.add(bottleNeck);
            
            // Position in pyramid
            const xOffset = (col - (bottlesInRow - 1) / 2) * spacing;
            const yOffset = row * spacing * 1.2;
            
            bottleGroup.position.set(xOffset, yOffset, 0);
            bottleGroup.userData.row = row; // Store row for animation
            
            bottlePyramid.add(bottleGroup);
        }
    }
    
    bottlePyramid.visible = false; // Start hidden   
    
    return bottlePyramid;
}