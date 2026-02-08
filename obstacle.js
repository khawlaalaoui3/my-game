class Obstacle {
    constructor(x, y, r, couleur) {
        this.pos = createVector(x, y);
        this.r = r;
        // Couleur verte cristalline par défaut
        this.color = couleur || color(0, 255, 150);
        this.active = true;
        this.rotationAngle = random(TWO_PI);
        this.rotationSpeed = random(-0.015, 0.015);
        this.pulseOffset = random(TWO_PI);
    }

    show() {
        if (!this.active) return;
        
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotationAngle);
        
        // Animation de pulsation
        let pulse = sin(frameCount * 0.05 + this.pulseOffset) * 0.1 + 1;
        
        // Glow externe vert cristallin
        for (let i = 5; i > 0; i--) {
            fill(0, 255, 150, 25);
            noStroke();
            drawCrystalShape(0, 0, this.r * pulse * (1 + i * 0.15));
        }
        
        // Forme cristalline principale (octogone)
        fill(0, 200, 120, 180);
        stroke(0, 255, 150);
        strokeWeight(2);
        drawCrystalShape(0, 0, this.r * pulse);
        
        // Couche intérieure plus claire
        fill(100, 255, 200, 150);
        stroke(150, 255, 220);
        strokeWeight(1.5);
        drawCrystalShape(0, 0, this.r * 0.7 * pulse);
        
        // Motif géométrique interne
        stroke(0, 255, 150, 180);
        strokeWeight(1);
        noFill();
        for (let i = 0; i < 8; i++) {
            let angle = (TWO_PI / 8) * i;
            let x1 = cos(angle) * this.r * 0.3;
            let y1 = sin(angle) * this.r * 0.3;
            let x2 = cos(angle) * this.r * 0.6 * pulse;
            let y2 = sin(angle) * this.r * 0.6 * pulse;
            line(x1, y1, x2, y2);
        }
        
        // Centre brillant
        fill(200, 255, 230);
        noStroke();
        circle(0, 0, this.r * 0.3);
        
        // Point de lumière
        fill(255, 255, 255, 230);
        circle(-this.r * 0.1, -this.r * 0.1, this.r * 0.15);
        
        pop();
        
        // Animation de rotation
        this.rotationAngle += this.rotationSpeed;
    }
}

/**
 * Dessine une forme cristalline (octogone)
 */
function drawCrystalShape(x, y, size) {
    beginShape();
    for (let i = 0; i < 8; i++) {
        let angle = (TWO_PI / 8) * i;
        let px = x + cos(angle) * size;
        let py = y + sin(angle) * size;
        vertex(px, py);
    }
    endShape(CLOSE);
}
