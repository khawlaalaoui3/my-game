
class SnakeWander {
    constructor(x, y, length = 5, taille = 8, couleur, isEnemy = false) {
        this.anneaux = [];
        this.couleur = couleur || color(random(100, 255), random(100, 255), random(100, 255));
        this.r = taille;
        this.isEnemy = isEnemy; // Si c'est un ennemi
        
        // Poids pour les comportements
        this.avoidWeight = 2;
        
        // Comportement ennemi
        if (isEnemy) {
            this.mode = "wander"; // "wander" ou "pursue"
            this.detectionRadius = 150;
            this.loseInterestRadius = 250;
        }
        
        // On crée la tête du snake
        this.head = new SnakeVehicle(x, y, this.couleur, taille);
        if (isEnemy) {
            this.head.maxSpeed = 3; // Plus lent pour les ennemis
        }
        this.anneaux.push(this.head);

        // Distance fixe entre les segments
        this.segmentDistance = 15;

        // On crée les anneaux suivants
        for (let i = 1; i < length; i++) {
            let anneau = new SnakeVehicle(x - i * this.segmentDistance, y, this.couleur, taille);
            this.anneaux.push(anneau);
        }
    }

    show() {
        // Effet de danger pulsant pour les ennemis en mode poursuite
        if (this.isEnemy && this.mode === "pursue") {
            push();
            let pulseSize = 30 + sin(frameCount * 0.15) * 5;
            fill(255, 0, 0, 30);
            noStroke();
            circle(this.head.pos.x, this.head.pos.y, pulseSize * 2);
            pop();
        }
        
        // On dessine les anneaux du corps (sauf la tête)
        for (let i = 1; i < this.anneaux.length; i++) {
            this.anneaux[i].show();
        }

        // On dessine la tête en dernier pour qu'elle soit au dessus
        this.anneaux[0].showHead();
        
        // Debug pour les ennemis
        if (this.isEnemy && Vehicle.debug) {
            push();
            // Rayon de détection
            stroke(255, 255, 0, 100);
            strokeWeight(1);
            noFill();
            circle(this.head.pos.x, this.head.pos.y, this.detectionRadius * 2);
            
            // Afficher le mode
            fill(255);
            noStroke();
            textSize(12);
            text(this.mode, this.head.pos.x, this.head.pos.y - 30);
            pop();
        }
    }

    update(target, obstacles = []) {
        if (this.isEnemy && target) {
            // Comportement ennemi avec détection
            let targetPos = target.pos || target;
            let distanceToTarget = p5.Vector.dist(this.head.pos, targetPos);
            
            // Changer de mode selon la distance
            if (this.mode === "wander" && distanceToTarget < this.detectionRadius) {
                this.mode = "pursue";
                // Changer la couleur en rouge vif
                this.couleur = color(255, 50, 50);
                this.anneaux.forEach(a => a.couleur = this.couleur);
            } else if (this.mode === "pursue" && distanceToTarget > this.loseInterestRadius) {
                this.mode = "wander";
                // Changer la couleur en orange
                this.couleur = color(255, 150, 50);
                this.anneaux.forEach(a => a.couleur = this.couleur);
            }
            
            // Appliquer le comportement
            if (this.mode === "pursue") {
                // Poursuivre avec pursue
                let targetVel = target.vel || createVector(0, 0);
                let prediction = targetVel.copy();
                prediction.mult(5);
                let futurePos = p5.Vector.add(targetPos, prediction);
                
                let pursueForce = this.head.seek(futurePos);
                pursueForce.mult(0.8);
                this.head.applyForce(pursueForce);
            } else {
                // Patrouiller avec wander
                let wanderForce = this.head.wander();
                wanderForce.mult(0.5);
                this.head.applyForce(wanderForce);
            }
        } else {
            // Comportement wander normal pour les non-ennemis
            let wanderForce = this.head.wander();
            wanderForce.mult(0.5);
            this.head.applyForce(wanderForce);
        }

        // Évitement d'obstacles
        let forceAvoid = this.head.avoid(obstacles);
        forceAvoid.mult(this.avoidWeight);
        this.head.applyForce(forceAvoid);

        this.head.update();
        this.head.edges();

        // Chaque anneau suit l'anneau précédent
        for (let i = 1; i < this.anneaux.length; i++) {
            let anneau = this.anneaux[i];
            let anneauPrecedent = this.anneaux[i - 1];
            
            // Calculer la distance actuelle
            let distance = p5.Vector.dist(anneau.pos, anneauPrecedent.pos);
            
            // Distance minimale et maximale à maintenir
            let distanceMin = this.segmentDistance * 0.7;
            let distanceMax = this.segmentDistance * 1.5;
            
            // Si trop proche, appliquer une force de répulsion
            if (distance < distanceMin && distance > 0) {
                let repulsion = p5.Vector.sub(anneau.pos, anneauPrecedent.pos);
                repulsion.normalize();
                repulsion.mult(0.8);
                anneau.applyForce(repulsion);
            } 
            // Si trop loin, se rapprocher
            else if (distance > distanceMax) {
                let forceSuivi = anneau.arrive(anneauPrecedent.pos, this.segmentDistance * 3);
                forceSuivi.mult(2);
                anneau.applyForce(forceSuivi);
            }
            // Sinon, suivre doucement pour maintenir la distance
            else {
                let forceSuivi = anneau.arrive(anneauPrecedent.pos, this.segmentDistance * 2);
                forceSuivi.mult(0.5);
                anneau.applyForce(forceSuivi);
            }
            
            // Évitement d'obstacles
            let forceAvoid = anneau.avoid(obstacles);
            forceAvoid.mult(this.avoidWeight);
            anneau.applyForce(forceAvoid);
            
            anneau.update();
            anneau.edges();
        }
    }

    edges() {
        // Appliquer edges() à tous les anneaux
        for (let anneau of this.anneaux) {
            anneau.edges();
        }
    }

    grow() {
        // Ajouter un nouvel anneau à la fin du snake
        let last = this.anneaux[this.anneaux.length - 1];
        
        let direction = last.vel.copy();
        if (direction.mag() === 0) {
            direction = createVector(-1, 0);
        }
        direction.normalize();
        direction.mult(-this.segmentDistance);

        let newPos = p5.Vector.add(last.pos, direction);
        let nouveau = new SnakeVehicle(newPos.x, newPos.y, this.couleur, this.r);
        this.anneaux.push(nouveau);
    }
    
    checkCollision(snake) {
        if (!snake || !snake.head) return false;
        
        let distance = p5.Vector.dist(this.head.pos, snake.head.pos);
        return distance < (this.head.r + snake.head.r);
    }
}
