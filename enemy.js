/**
 * Enemy - Ennemi qui poursuit le snake principal
 * Sous-classe de Vehicle avec comportement de poursuite
 */
class Enemy extends Vehicle {
    constructor(x, y) {
        super(x, y);
        this.r = 14; // Rayon de l'ennemi
        this.couleur = color(255, 50, 50); // Rouge pour l'ennemi
        this.maxSpeed = 3; // Réduit de 4 à 3 (plus lent que le snake)
        this.maxForce = 0.2; // Réduit pour des mouvements moins brusques
        this.trail = []; // Trail pour l'effet visuel
        this.maxTrailLength = 15;
        this.dangerRadius = 30; // Rayon de danger autour de l'ennemi
        
        // Comportement de patrouille
        this.mode = "wander"; // "wander" ou "pursue"
        this.detectionRadius = 150; // Distance à laquelle l'ennemi détecte le snake
        this.loseInterestRadius = 250; // Distance à laquelle l'ennemi perd le snake
        this.wanderTime = 0;
        this.pursueTime = 0;
    }

    /**
     * Mise à jour de l'ennemi
     * @param {p5.Vector} target - Position du snake à poursuivre
     * @param {Array} obstacles - Obstacles à éviter
     */
    update(target, obstacles = []) {
        // Sauvegarder la position avant edges()
        let posBeforeEdges = this.pos.copy();
        
        // Calculer la distance au snake
        let targetPos = target.pos || target;
        let distanceToTarget = p5.Vector.dist(this.pos, targetPos);
        
        // Changer de mode selon la distance
        if (this.mode === "wander" && distanceToTarget < this.detectionRadius) {
            this.mode = "pursue";
            this.pursueTime = frameCount;
        } else if (this.mode === "pursue" && distanceToTarget > this.loseInterestRadius) {
            this.mode = "wander";
            this.wanderTime = frameCount;
        }
        
        // Appliquer le comportement selon le mode
        if (this.mode === "pursue") {
            // Poursuivre le snake
            let pursueForce = this.pursue(target);
            pursueForce.mult(0.8); // Réduit la force de poursuite
            this.applyForce(pursueForce);
        } else {
            // Patrouiller aléatoirement
            let wanderForce = this.wander();
            wanderForce.mult(0.5);
            this.applyForce(wanderForce);
        }

        // Évitement d'obstacles
        let avoidForce = this.avoid(obstacles);
        avoidForce.mult(2);
        this.applyForce(avoidForce);

        // Appeler la méthode update du parent
        super.update();
        
        // Détecter si l'ennemi a traversé un bord
        let posAfterEdges = this.pos.copy();
        let wrappedX = Math.abs(posAfterEdges.x - posBeforeEdges.x) > width / 2;
        let wrappedY = Math.abs(posAfterEdges.y - posBeforeEdges.y) > height / 2;
        
        // Si traversée détectée, vider le trail
        if (wrappedX || wrappedY) {
            this.trail = [];
        }
        
        // Ajouter la position actuelle au trail
        this.trail.unshift(this.pos.copy());
        
        // Limiter la longueur du trail
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }
    }

    /**
     * Méthode pursue - poursuit une cible en prédisant sa position future
     */
    pursue(target) {
        // Si target est un objet avec pos et vel
        let targetPos = target.pos || target;
        let targetVel = target.vel || createVector(0, 0);
        
        // Prédire la position future de la cible (réduit de 10 à 5)
        let prediction = targetVel.copy();
        prediction.mult(5);
        let futurePos = p5.Vector.add(targetPos, prediction);
        
        // Chercher cette position future
        return this.seek(futurePos);
    }

    /**
     * Affichage de l'ennemi avec effet menaçant
     */
    show() {
        push();
        
        // Dessiner le trail (corps de l'ennemi)
        if (this.trail.length > 1) {
            noFill();
            strokeCap(ROUND);
            
            for (let i = 0; i < this.trail.length - 1; i++) {
                let distance = dist(this.trail[i].x, this.trail[i].y, this.trail[i + 1].x, this.trail[i + 1].y);
                
                if (distance < width / 2 && distance < height / 2) {
                    let alpha = map(i, 0, this.trail.length, 255, 50);
                    let thickness = map(i, 0, this.trail.length, this.r * 2, this.r * 0.5);
                    
                    // Couleur change selon le mode
                    if (this.mode === "pursue") {
                        stroke(255, 50, 50, alpha); // Rouge vif en poursuite
                    } else {
                        stroke(255, 100, 50, alpha); // Orange en patrouille
                    }
                    strokeWeight(thickness);
                    line(this.trail[i].x, this.trail[i].y, this.trail[i + 1].x, this.trail[i + 1].y);
                }
            }
        }
        
        // Effet de danger pulsant seulement en mode poursuite
        if (this.mode === "pursue") {
            let pulseSize = this.dangerRadius + sin(frameCount * 0.15) * 5;
            fill(255, 0, 0, 30);
            noStroke();
            circle(this.pos.x, this.pos.y, pulseSize * 2);
        }
        
        // Corps de l'ennemi (tête) - couleur change selon le mode
        if (this.mode === "pursue") {
            fill(255, 50, 50); // Rouge vif en poursuite
        } else {
            fill(255, 150, 50); // Orange en patrouille
        }
        stroke(150, 0, 0);
        strokeWeight(2);
        circle(this.pos.x, this.pos.y, this.r * 2.5);
        
        // Effet de brillance
        noStroke();
        if (this.mode === "pursue") {
            fill(255, 100, 100, 150);
        } else {
            fill(255, 200, 100, 150);
        }
        ellipse(this.pos.x - this.r * 0.4, this.pos.y - this.r * 0.4, this.r * 1.2, this.r * 1.2);
        
        // Yeux menaçants
        let eyeOffsetX = this.r * 0.4;
        let eyeOffsetY = this.r * 0.3;
        let eyeSize = this.r * 0.6;
        
        // Yeux rouges brillants
        if (this.mode === "pursue") {
            fill(255, 0, 0);
        } else {
            fill(255, 150, 0);
        }
        noStroke();
        ellipse(this.pos.x - eyeOffsetX, this.pos.y - eyeOffsetY, eyeSize, eyeSize * 1.3);
        ellipse(this.pos.x + eyeOffsetX, this.pos.y - eyeOffsetY, eyeSize, eyeSize * 1.3);
        
        // Pupilles noires
        fill(0);
        let pupilSize = eyeSize * 0.4;
        ellipse(this.pos.x - eyeOffsetX, this.pos.y - eyeOffsetY, pupilSize, pupilSize * 1.3);
        ellipse(this.pos.x + eyeOffsetX, this.pos.y - eyeOffsetY, pupilSize, pupilSize * 1.3);
        
        // Debug
        if (Vehicle.debug) {
            // Rayon de détection
            stroke(255, 255, 0, 100);
            strokeWeight(1);
            noFill();
            circle(this.pos.x, this.pos.y, this.detectionRadius * 2);
            
            // Rayon de danger
            stroke(255, 0, 0);
            strokeWeight(2);
            circle(this.pos.x, this.pos.y, this.dangerRadius * 2);
            
            // Ligne vers la cible
            stroke(255, 255, 0);
            strokeWeight(2);
            let vel = this.vel.copy();
            vel.mult(30);
            line(this.pos.x, this.pos.y, this.pos.x + vel.x, this.pos.y + vel.y);
            
            // Afficher le mode
            fill(255);
            noStroke();
            textSize(12);
            text(this.mode, this.pos.x, this.pos.y - 30);
        }
        
        pop();
    }

    /**
     * Vérifie si l'ennemi touche le snake
     * @param {Snake} snake - Le snake à vérifier
     * @returns {boolean} - True si collision
     */
    checkCollision(snake) {
        if (!snake || !snake.head) return false;
        
        let distance = p5.Vector.dist(this.pos, snake.head.pos);
        return distance < (this.r + snake.head.r);
    }
}
