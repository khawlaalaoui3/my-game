class VehicleWander extends Vehicle {
  constructor(x, y, isEnemy = false) {
    super(x, y);
    this.r = 12; // Rayon de la tête
    this.isEnemy = isEnemy;
    
    if (isEnemy) {
      this.couleur = color(255, 150, 50); // Orange au départ
      this.maxSpeed = 3;
      this.mode = "wander";
      this.detectionRadius = 150;
      this.loseInterestRadius = 250;
    } else {
      this.couleur = color(random(100, 255), random(100, 255), random(100, 255));
    }
    
    this.trail = [];
    this.maxTrailLength = 25; // Plus long pour un effet de serpent
  }

  update(target = null, obstacles = []) {
    // Sauvegarder position avant edges
    let posBeforeEdges = this.pos.copy();
    
    // Comportement ennemi
    if (this.isEnemy && target) {
      let targetPos = target.pos || target;
      let distanceToTarget = p5.Vector.dist(this.pos, targetPos);
      
      // Changer de mode
      if (this.mode === "wander" && distanceToTarget < this.detectionRadius) {
        this.mode = "pursue";
        this.couleur = color(255, 50, 50); // Rouge vif
      } else if (this.mode === "pursue" && distanceToTarget > this.loseInterestRadius) {
        this.mode = "wander";
        this.couleur = color(255, 150, 50); // Orange
      }
      
      if (this.mode === "pursue") {
        let targetVel = target.vel || createVector(0, 0);
        let prediction = targetVel.copy().mult(5);
        let futurePos = p5.Vector.add(targetPos, prediction);
        let pursueForce = this.seek(futurePos);
        // Utiliser pursueForce si défini, sinon 0.8 par défaut
        let forceMultiplier = this.pursueForce !== undefined ? this.pursueForce : 0.8;
        pursueForce.mult(forceMultiplier);
        this.applyForce(pursueForce);
      } else {
        let wanderForce = this.wander();
        wanderForce.mult(0.5);
        this.applyForce(wanderForce);
      }
    } else {
      // Wander normal
      let wanderForce = this.wander();
      wanderForce.mult(0.5);
      this.applyForce(wanderForce);
    }
    
    // Évitement d'obstacles
    let avoidForce = this.avoid(obstacles);
    avoidForce.mult(2);
    this.applyForce(avoidForce);
    
    super.update();
    
    // Détecter traversée de bord
    let posAfterEdges = this.pos.copy();
    let wrappedX = Math.abs(posAfterEdges.x - posBeforeEdges.x) > width / 2;
    let wrappedY = Math.abs(posAfterEdges.y - posBeforeEdges.y) > height / 2;
    
    if (wrappedX || wrappedY) {
      this.trail = [];
    }
    
    this.trail.unshift(this.pos.copy());
    
    if (this.trail.length > this.maxTrailLength) {
      this.trail.pop();
    }
  }

  show() {
    push();
    
    // Effet de danger pour ennemis en poursuite - glow rouge intense
    if (this.isEnemy && this.mode === "pursue") {
      let pulseSize = 40 + sin(frameCount * 0.2) * 8;
      // Glow rouge menaçant
      for (let i = 6; i > 0; i--) {
        fill(255, 0, 0, 35);
        noStroke();
        circle(this.pos.x, this.pos.y, pulseSize * (1 + i * 0.3));
      }
    }
    
    // Dessiner le corps (trail) avec segments circulaires
    if (this.trail.length > 1) {
      for (let i = 0; i < this.trail.length; i++) {
        let distance = i < this.trail.length - 1 ? 
          dist(this.trail[i].x, this.trail[i].y, this.trail[i + 1].x, this.trail[i + 1].y) : 0;
        
        // Ne pas dessiner si c'est une traversée de bord
        if (distance < width / 2 && distance < height / 2) {
          let alpha = map(i, 0, this.trail.length, 255, 100);
          let size = map(i, 0, this.trail.length, this.r * 2.2, this.r * 0.8);
          
          // Glow pour les ennemis
          if (this.isEnemy) {
            for (let j = 2; j > 0; j--) {
              fill(this.couleur.levels[0], this.couleur.levels[1], this.couleur.levels[2], alpha * 0.15);
              noStroke();
              circle(this.trail[i].x, this.trail[i].y, size + j * 6);
            }
          }
          
          // Dessiner segment circulaire
          fill(this.couleur.levels[0], this.couleur.levels[1], this.couleur.levels[2], alpha);
          noStroke();
          circle(this.trail[i].x, this.trail[i].y, size);
          
          // Contour sombre
          stroke(0, alpha * 0.5);
          strokeWeight(1);
          noFill();
          circle(this.trail[i].x, this.trail[i].y, size);
        }
      }
    }
    
    // Dessiner la tête (plus grande avec yeux)
    // Glow intense pour la tête
    if (this.isEnemy) {
      for (let i = 4; i > 0; i--) {
        fill(this.couleur.levels[0], this.couleur.levels[1], this.couleur.levels[2], 40);
        noStroke();
        circle(this.pos.x, this.pos.y, this.r * 2.8 + i * 10);
      }
    }
    
    fill(this.couleur);
    stroke(0);
    strokeWeight(2);
    circle(this.pos.x, this.pos.y, this.r * 2.8);
    
    // Brillance
    noStroke();
    fill(255, 255, 255, 150);
    ellipse(this.pos.x - this.r * 0.5, this.pos.y - this.r * 0.5, this.r * 1.5, this.r * 1.5);
    
    // Yeux
    let eyeOffsetX = this.r * 0.5;
    let eyeOffsetY = this.r * 0.4;
    let eyeSize = this.r * 0.7;
    
    // Blanc des yeux
    fill(255);
    stroke(0);
    strokeWeight(1.5);
    ellipse(this.pos.x - eyeOffsetX, this.pos.y - eyeOffsetY, eyeSize, eyeSize * 1.3);
    ellipse(this.pos.x + eyeOffsetX, this.pos.y - eyeOffsetY, eyeSize, eyeSize * 1.3);
    
    // Pupilles - rouges pour les ennemis en mode pursue
    if (this.isEnemy && this.mode === "pursue") {
      fill(255, 0, 0);
    } else {
      fill(0);
    }
    noStroke();
    let pupilSize = eyeSize * 0.5;
    ellipse(this.pos.x - eyeOffsetX, this.pos.y - eyeOffsetY, pupilSize, pupilSize * 1.3);
    ellipse(this.pos.x + eyeOffsetX, this.pos.y - eyeOffsetY, pupilSize, pupilSize * 1.3);
    
    // Reflets dans les yeux
    fill(255, 255, 255, 200);
    circle(this.pos.x - eyeOffsetX - pupilSize * 0.2, this.pos.y - eyeOffsetY - pupilSize * 0.2, pupilSize * 0.35);
    circle(this.pos.x + eyeOffsetX - pupilSize * 0.2, this.pos.y - eyeOffsetY - pupilSize * 0.2, pupilSize * 0.35);
    
    // Debug
    if (Vehicle.debug && this.isEnemy) {
      stroke(255, 255, 0, 100);
      strokeWeight(1);
      noFill();
      circle(this.pos.x, this.pos.y, this.detectionRadius * 2);
      
      fill(255);
      noStroke();
      textSize(12);
      text(this.mode, this.pos.x, this.pos.y - 30);
    }
    
    pop();
  }
  
  checkCollision(snake) {
    if (!snake || !snake.head) return false;
    let distance = p5.Vector.dist(this.pos, snake.head.pos);
    return distance < (this.r + snake.head.r);
  }
}
