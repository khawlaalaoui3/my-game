
class SnakeVehicle extends Vehicle {
  /**
   * Constructeur de SnakeVehicle
   * @param {number} x - Position X initiale
   * @param {number} y - Position Y initiale  
   * @param {p5.Color} couleur - Couleur du véhicule
   * @param {number} r - Rayon du véhicule
   */
  constructor(x, y, couleur = color(255, 165, 0), r = 8) {
    super(x, y);
    this.couleur = couleur;
    this.r = r;
  }

  
  show() {
    push();
    
    
    for (let i = 4; i > 0; i--) {
      fill(255, 20, 147, 30); // Deep Pink
      noStroke();
      circle(this.pos.x, this.pos.y, this.r * 2 * (1 + i * 0.35));
    }
    
   
    fill(255, 20, 147); // Deep Pink
    noStroke();
    circle(this.pos.x, this.pos.y, this.r * 2);
    
    // Couche intermédiaire
    fill(255, 105, 180); // Hot Pink
    circle(this.pos.x, this.pos.y, this.r * 1.6);
    
    // Centre plus clair
    fill(255, 182, 193); // Light Pink
    circle(this.pos.x, this.pos.y, this.r * 1.2);
    
    // Bordure brillante
    noFill();
    stroke(255, 182, 193, 200);
    strokeWeight(1.5);
    circle(this.pos.x, this.pos.y, this.r * 2);

    // Effet de brillance (highlight) pour le côté sphérique
    noStroke();
    fill(255, 255, 255, 180);
    ellipse(this.pos.x - this.r * 0.4, this.pos.y - this.r * 0.4, this.r * 1.2, this.r * 1.2);
    
    // Petit point brillant supplémentaire
    fill(255, 255, 255, 240);
    circle(this.pos.x - this.r * 0.35, this.pos.y - this.r * 0.35, this.r * 0.4);

    // Debug information si activé
    if (Vehicle.debug) {
      // Cercle de debug autour du véhicule
      stroke(255, 0, 0, 150);
      noFill();
      circle(this.pos.x, this.pos.y, this.r * 3);
      
      // Vecteur vitesse
      stroke(0, 255, 0, 150);
      strokeWeight(3);
      let speedVector = this.vel.copy();
      speedVector.mult(15);
      line(this.pos.x, this.pos.y, this.pos.x + speedVector.x, this.pos.y + speedVector.y);
    }

    pop();
  }

  
  showHead() {
    push();
    
    // Effet de glow rose intense autour de la tête (trail lumineux)
    for (let i = 6; i > 0; i--) {
      fill(255, 20, 147, 35); // Deep Pink
      noStroke();
      circle(this.pos.x, this.pos.y, this.r * 2.5 * (1 + i * 0.45));
    }
    
    // Gradient pour la tête - plusieurs couches
    // Extérieur
    fill(255, 20, 147); // Deep Pink
    noStroke();
    circle(this.pos.x, this.pos.y, this.r * 2.4);
    
    // Couche intermédiaire
    fill(255, 105, 180); // Hot Pink
    circle(this.pos.x, this.pos.y, this.r * 2);
    
    // Centre
    fill(255, 182, 193); // Light Pink
    circle(this.pos.x, this.pos.y, this.r * 1.6);
    
    // Bordure brillante avec glow
    noFill();
    stroke(255, 182, 193, 255);
    strokeWeight(2.5);
    circle(this.pos.x, this.pos.y, this.r * 2.4);

    // Brillance sur la tête - effet cristal
    noStroke();
    fill(255, 255, 255, 200);
    ellipse(this.pos.x - this.r * 0.5, this.pos.y - this.r * 0.5, this.r * 1.5, this.r * 1.5);
    
    // Points brillants supplémentaires
    fill(255, 255, 255, 250);
    circle(this.pos.x - this.r * 0.4, this.pos.y - this.r * 0.4, this.r * 0.7);
    fill(255, 255, 255, 255);
    circle(this.pos.x - this.r * 0.45, this.pos.y - this.r * 0.45, this.r * 0.35);

    // Yeux avec effet brillant
    let eyeOffsetX = this.r * 0.35;
    let eyeOffsetY = this.r * 0.25;
    let eyeSize = this.r * 0.5;

    // Blanc des yeux avec glow
    fill(255, 240, 255);
    stroke(255, 182, 193);
    strokeWeight(2);
    ellipse(this.pos.x - eyeOffsetX, this.pos.y - eyeOffsetY, eyeSize, eyeSize * 1.3);
    ellipse(this.pos.x + eyeOffsetX, this.pos.y - eyeOffsetY, eyeSize, eyeSize * 1.3);

    // Pupilles avec reflet
    fill(80, 20, 60);
    noStroke();
    let pupilSize = eyeSize * 0.55;
    ellipse(this.pos.x - eyeOffsetX, this.pos.y - eyeOffsetY, pupilSize, pupilSize * 1.3);
    ellipse(this.pos.x + eyeOffsetX, this.pos.y - eyeOffsetY, pupilSize, pupilSize * 1.3);
    
    // Reflets dans les yeux
    fill(255, 255, 255, 230);
    circle(this.pos.x - eyeOffsetX - pupilSize * 0.25, this.pos.y - eyeOffsetY - pupilSize * 0.25, pupilSize * 0.45);
    circle(this.pos.x + eyeOffsetX - pupilSize * 0.25, this.pos.y - eyeOffsetY - pupilSize * 0.25, pupilSize * 0.45);

    // Debug information si activé
    if (Vehicle.debug) {
      // Cercle de debug autour de la tête
      stroke(255, 0, 0, 150);
      strokeWeight(2);
      noFill();
      circle(this.pos.x, this.pos.y, this.r * 3.5);
      
      // Vecteur vitesse pour la tête
      stroke(0, 255, 0, 150);
      strokeWeight(3);
      let speedVector = this.vel.copy();
      speedVector.mult(20); // Multiplier pour visibilité
      line(this.pos.x, this.pos.y, this.pos.x + speedVector.x, this.pos.y + speedVector.y);
    }

    pop();
  }

  /**
   * Vérifie la collision avec d'autres segments du snake
   * @param {SnakeVehicle[]} otherSegments - Autres segments du snake
   * @returns {boolean} - True si collision détectée
   */
  checkSelfCollision(otherSegments) {
    for (let segment of otherSegments) {
      if (segment !== this) {
        let d = p5.Vector.dist(this.pos, segment.pos);
        // Collision seulement si les centres sont très proches (moins de la moitié du rayon combiné)
        if (d < (this.r + segment.r) * 0.5) {
          return true; // Collision détectée
        }
      }
    }
    return false; // Pas de collision
  }

  /**
   * Applique les comportements de steering selon les principes des Steering Behaviors
   * @param {p5.Vector} target - Cible pour la tête du snake (position de la souris)
   * @param {number} index - Index du véhicule dans le tableau (0 = tête)
   * @param {SnakeVehicle[]} vehicles - Tableau de tous les véhicules
   * @param {Obstacle[]} obstacles - Tableau des obstacles à éviter
   */
  applyBehaviors(target, index, vehicles, obstacles) {
    let steeringForce;
    
    if (index === 0) {
      // La tête suit la souris avec comportement arrive
      steeringForce = this.arrive(target);
    } else {
      // Les segments suivants suivent le segment précédent avec arrive
      let vehiculePrecedent = vehicles[index - 1];
      steeringForce = this.arrive(vehiculePrecedent.pos, 15);
      steeringForce.mult(2); // Force de suivi augmentée comme dans snake.js
    }
    
    this.applyForce(steeringForce);

    // Évitement d'obstacles (prioritaire)
    let avoidForce = this.avoid(obstacles);
    avoidForce.mult(3); // Multiplicateur de 3 comme dans sketch.js
    this.applyForce(avoidForce);
  }
}
