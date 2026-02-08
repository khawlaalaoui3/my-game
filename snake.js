class Snake extends Vehicle {
    constructor(x, y, length, taille, couleur) {
        super(x, y);
        this.anneaux = [];
        this.couleur = couleur;
        this.r = taille;
        this.voirLangue = false;

        // Poids pour les comportements
        this.seekWeight = 0.2;
        this.avoidWeight = 2;
        
        // On crée la tête du snake avec SnakeVehicle
        this.head = new SnakeVehicle(x, y, couleur, taille);
        this.anneaux.push(this.head);

        // Distance fixe entre les segments
        this.segmentDistance = 20;

        // On crée les anneaux suivants avec SnakeVehicle
        for (let i = 1; i < length; i++) {
            let anneau = new SnakeVehicle(x - i * this.segmentDistance, y, couleur, taille);
            this.anneaux.push(anneau);
        }

        // Il tire la langue toutes les 3 secondes
        setInterval(() => {
            this.voirLangue = true;
        }, 3000);
    }
    show() {
        if (this.voirLangue) {
            this.dessineLangue();
            // on remet voirLangue à false après un court instant
            setTimeout(() => {
                this.voirLangue = false;
            }, 2000);
        }

        // On dessine les anneaux du corps (sauf la tête)
        for (let i = 1; i < this.anneaux.length; i++) {
            this.anneaux[i].show();
        }

        // On dessine la tête en dernier pour qu'elle soit au dessus
        this.anneaux[0].showHead();
    }

    dessineTete() {
        
        push();
        fill(this.couleur);
        noStroke();
        circle(this.head.pos.x, this.head.pos.y, this.r);

        
        let eyeOffsetX = this.r / 6;
        let eyeOffsetY = this.r / 6;
        let eyeSize = this.r / 5;
        fill(255); 
        circle(this.head.pos.x - eyeOffsetX, this.head.pos.y - eyeOffsetY, eyeSize);
        circle(this.head.pos.x + eyeOffsetX, this.head.pos.y - eyeOffsetY, eyeSize);

        fill(0); // pupilles
        let pupilSize = eyeSize / 2;
        circle(this.head.pos.x - eyeOffsetX, this.head.pos.y - eyeOffsetY, pupilSize);
        circle(this.head.pos.x + eyeOffsetX, this.head.pos.y - eyeOffsetY, pupilSize);

        pop();

    }

    dessineAnneaux() {
        
        for (let i = 1; i < this.anneaux.length; i++) {
            let anneau = this.anneaux[i];
            let anneauPrecedent = this.anneaux[i - 1];
            let rAnneau = this.r * (1 - i / (this.anneaux.length + 1));
            // ligne entre anneauPrecedent et anneau
            push();
            stroke(this.couleur);
            let alpha = map(i, 1, this.anneaux.length, 200, 50);
            strokeWeight(rAnneau * 0.8);
            stroke(this.couleur.levels[0], this.couleur.levels[1], this.couleur.levels[2], alpha);
            line(anneauPrecedent.pos.x, anneauPrecedent.pos.y, anneau.pos.x, anneau.pos.y);
            pop();
        }

       
        for (let i = 1; i < this.anneaux.length; i++) {
            let anneau = this.anneaux[i];
            let rAnneau = this.r * (1 - i / (this.anneaux.length + 1));
            push();
            let time = frameCount * 0.05;
            let lerpFactor = (sin(time + i) + 1) / 2 * 0.5; // entre 0 et 0.5
            let couleurClair = color(
                min(this.couleur.levels[0] + 100, 255),
                min(this.couleur.levels[1] + 100, 255),
                min(this.couleur.levels[2] + 100, 255)
            );
            let couleurAnimee = lerpColor(this.couleur, couleurClair, lerpFactor);

            fill(couleurAnimee);
            noStroke();
            circle(anneau.pos.x, anneau.pos.y, rAnneau);

           
            stroke(0);
            strokeWeight(2);
            noFill();
            circle(anneau.pos.x, anneau.pos.y, rAnneau);
            pop();
        }
    }

    dessineLangue() {
       
        let time = frameCount * 0.2;
        let longueurLangue = 10 + 10 * sin(time); 

        let direction = this.head.vel.copy();
        direction.normalize();
        direction.mult(this.r / 2); 

        let baseLangue = p5.Vector.add(this.head.pos, direction);

        let langueEnd = p5.Vector.add(baseLangue, p5.Vector.mult(direction, longueurLangue / (this.r / 2)));

        // Dessin de la langue
        push();
        stroke(255, 0, 0);
        strokeWeight(4);
        line(baseLangue.x, baseLangue.y, langueEnd.x, langueEnd.y);

        // Dessin des deux fourches au bout de la langue
        let perp = createVector(-direction.y, direction.x);
        perp.normalize();
        perp.mult(5);

        line(langueEnd.x, langueEnd.y, langueEnd.x + perp.x, langueEnd.y + perp.y);
        line(langueEnd.x, langueEnd.y, langueEnd.x - perp.x, langueEnd.y - perp.y);
        pop();
    }

    update(target, obstacles=[]) {
        // La tête suit la cible
        let forceSuivi = this.head.arrive(target, 50);
        forceSuivi.mult(this.seekWeight);

        // Évitement d'obstacles
        let forceAvoid = this.head.avoid(obstacles);
        forceAvoid.mult(this.avoidWeight);

        this.head.applyForce(forceSuivi);
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
        // Appliquer edges() à tous les anneaux pour gérer les traversées de bords
        for (let anneau of this.anneaux) {
            anneau.edges();
        }
    }

    checkSelfCollision() {
        // Vérification de collision de la tête avec les autres segments
        if (this.anneaux.length > 5) {
            let head = this.anneaux[0];
            // Vérifier la collision avec les segments du corps (ignorer les 4 premiers)
            for (let i = 4; i < this.anneaux.length; i++) {
                let segment = this.anneaux[i];
                let d = p5.Vector.dist(head.pos, segment.pos);
                // Collision si les centres sont très proches
                if (d < (head.r + segment.r) * 0.5) {
                    return true;
                }
            }
        }
        return false;
    }

    grow() {
        // On ajoute un nouvel anneau à la fin du snake
        let last = this.anneaux[this.anneaux.length - 1];
        
        // Positionner le nouvel anneau derrière le dernier
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
}