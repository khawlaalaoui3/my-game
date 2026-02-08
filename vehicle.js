class Vehicle {
  static debug = false;

  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 6; // Réduit pour mouvement plus fluide
    this.maxForce = 0.8; // Augmenté pour accélération plus responsive
    this.r = 16;
    this.rayonZoneDeFreinage = 100;
    this.couleur = color(255);

    // pour comportement wander
    this.distanceCercle = 150;
    this.wanderRadius = 50;
    this.wanderTheta = -Math.PI / 2;
    this.displaceRange = 0.3;

    // Pour évitement d'obstacle
    this.largeurZoneEvitementDevantVaisseau = this.r * 2;

    // Pour comportement flocking (Boids)
    this.perceptionRadius = 50;
    this.alignWeight = 1.5;
    this.cohesionWeight = 1;
    this.separationWeight = 2;
  }

  wander() {
    // point devant le véhicule, centre du cercle
    let pointDevant = this.vel.copy();
    pointDevant.setMag(this.distanceCercle);
    pointDevant.add(this.pos);

    push();
    if (Vehicle.debug) {
      // on dessine le cercle en rouge
      // on le dessine sous la forme d'une petit cercle rouge
      fill("red");
      noStroke();
      circle(pointDevant.x, pointDevant.y, 8);

      // on dessine le cercle autour
      // Cercle autour du point
      noFill();
      stroke(255);
      circle(pointDevant.x, pointDevant.y, this.wanderRadius * 2);

      // on dessine une ligne qui relie le vaisseau à ce point
      // c'est la ligne blanche en face du vaisseau
      strokeWeight(2);
      // ligne en pointillés
      stroke(255, 255, 255, 80);
      drawingContext.setLineDash([5, 15]);
      stroke(255, 255, 255, 80);
      line(this.pos.x, this.pos.y, pointDevant.x, pointDevant.y);

    }

    // On va s'occuper de calculer le point vert SUR LE CERCLE
    // il fait un angle wanderTheta avec le centre du cercle
    // l'angle final par rapport à l'axe des X c'est l'angle du vaisseau
    // + cet angle
    let theta = this.wanderTheta + this.vel.heading();
    let pointSurLeCercle = createVector(0, 0);
    pointSurLeCercle.x = this.wanderRadius * cos(theta);
    pointSurLeCercle.y = this.wanderRadius * sin(theta);

    // on rajoute ces distances au point rouge au centre du cercle
    pointSurLeCercle.add(pointDevant);

    if (Vehicle.debug) {
      // on le dessine sous la forme d'un cercle vert
      fill("green");
      noStroke();
      circle(pointSurLeCercle.x, pointSurLeCercle.y, 16);

      // on dessine le vecteur qui va du centre du vaisseau
      // à ce point vert sur le cercle
      stroke("yellow");
      strokeWeight(1);
      // pas en pointillés mais une ligne pleine
      drawingContext.setLineDash([]);
      line(this.pos.x, this.pos.y, pointSurLeCercle.x, pointSurLeCercle.y);
    }

    // entre chaque image on va déplacer aléatoirement
    // le point vert en changeant un peu son angle...
    this.wanderTheta += random(-this.displaceRange, this.displaceRange);

    // D'après l'article, la force est égale au vecteur qui va du
    // centre du vaisseau, à ce point vert. On va aussi la limiter
    // à this.maxForce
    // REMPLACER LA LIGNE SUIVANTE !
    let force = p5.Vector.sub(pointSurLeCercle, this.pos);
    // On met la force à maxForce
    force.setMag(this.maxForce);
    // on applique la force
    pop();

    // et on la renvoie au cas où....
    return force;
  }

  evade(vehicle) {
    let pursuit = this.pursue(vehicle);
    pursuit.mult(-1);
    return pursuit;
  }

  pursue(vehicle) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);
    fill(0, 255, 0);
    circle(target.x, target.y, 16);
    return this.seek(target);
  }

  seek(target) {
    // 1. Calculer le vecteur désiré
    let desired = p5.Vector.sub(target, this.pos);

    // 2. Normaliser le vecteur désiré et le multiplier par maxSpeed
    desired.setMag(this.maxSpeed);

    // 3. Calculer la force de direction (steering force)
    // steering = desired - velocity
    let steer = p5.Vector.sub(desired, this.vel);

    // 4. Limiter la force de direction à maxForce
    steer.limit(this.maxForce);

    // 5. Retourner la force de direction
    return steer;
  }

  // Méthode flee : le véhicule fuit une cible
  // La cible est un vecteur position
  // Retourne un vecteur force (steering force)
  flee(target) {
    // 1. Calculer le vecteur désiré
    let desired = p5.Vector.sub(target, this.pos);

    // 2. Normaliser le vecteur désiré et le multiplier par maxSpeed
    desired.setMag(this.maxSpeed);

    // 3. Calculer la force de direction (steering force)
    // steering = desired - velocity
    let steer = p5.Vector.sub(desired, this.vel);

    // 4. Limiter la force de direction à maxForce
    steer.limit(this.maxForce);

    // 5. Retourner la force de direction
    return steer;
  }

  // Méthode arrive : le véhicule se dirige vers une cible et ralentit à l'approche
  // La cible est un vecteur position
  // Le rayon est la distance à laquelle le véhicule commence à ralentir
  // Retourne un vecteur force (steering force)
  arrive(target, rayon = this.rayonZoneDeFreinage) {
    // 1. Calculer le vecteur désiré
    let desired = p5.Vector.sub(target, this.pos);

    // 2. Calculer la distance à la cible
    let d = desired.mag();

    // 3. Si on est dans la zone de freinage
    if (d < rayon) {
      // 4. Calculer la vitesse désirée en fonction de la distance
      // map(value, start1, stop1, start2, stop2)
      let m = map(d, 0, rayon, 0, this.maxSpeed);
      desired.setMag(m);
    } else {
      // 5. Sinon, on va à vitesse maximale
      desired.setMag(this.maxSpeed);
    }

    // 6. Calculer la force de direction (steering force)
    let steer = p5.Vector.sub(desired, this.vel);

    // 7. Limiter la force de direction à maxForce
    steer.limit(this.maxForce);

    // 8. Retourner la force de direction
    return steer;
  }

  // Méthode pour éviter les obstacles
  // obstacles : tableau d'obstacles
  // retourne une force d'évitement
  avoid(obstacles) {
    push();

    // Filtrer seulement les obstacles actifs
    let activeObstacles = obstacles.filter(obstacle => obstacle.active);

    // Distance à regarder devant le véhicule
    let distanceAhead = 50;
    // Point ahead (regarde 50 unités devant)
    let ahead = this.vel.copy();
    ahead.normalize();
    ahead.mult(distanceAhead);
    let pointAuBoutDeAhead = p5.Vector.add(this.pos, ahead);

    // Second point ahead2 à mi-distance
    let ahead2 = this.vel.copy();
    ahead2.normalize();
    ahead2.mult(distanceAhead * 0.5);
    let pointAuBoutDeAhead2 = p5.Vector.add(this.pos, ahead2);

    if (Vehicle.debug) {
      // Dessiner les points ahead pour le debug
      fill("red");
      noStroke();
      circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, 8);
      fill("orange");
      circle(pointAuBoutDeAhead2.x, pointAuBoutDeAhead2.y, 8);
    }

    // Trouver l'obstacle le plus proche pour chaque point ahead
    let obstacleLePlusProche = this.getClosestObstacle(pointAuBoutDeAhead, activeObstacles);
    let obstacleLePlusProche2 = this.getClosestObstacle(pointAuBoutDeAhead2, activeObstacles);
    let obstaceLePlusProche3 = this.getClosestObstacle(this.pos, activeObstacles);

    // Calculer les distances
    let distance = pointAuBoutDeAhead.dist(obstacleLePlusProche.pos);
    let distance2 = pointAuBoutDeAhead2.dist(obstacleLePlusProche2.pos);
    let distance3 = this.pos.dist(obstaceLePlusProche3.pos);

    // Déterminer quel point utiliser
    let pointUtilise;
    let obstacleLePlusProcheFinal;

    if (distance <= distance2 && distance <= distance3) {
      // Utiliser ahead
      pointUtilise = pointAuBoutDeAhead;
      obstacleLePlusProcheFinal = obstacleLePlusProche;
    } else if (distance2 <= distance && distance2 <= distance3) {
      // Utiliser ahead2
      pointUtilise = pointAuBoutDeAhead2;
      obstacleLePlusProcheFinal = obstacleLePlusProche2;
    } else {
      // Utiliser la position du véhicule
      pointUtilise = this.pos;
      obstacleLePlusProcheFinal = obstaceLePlusProche3;
      distance = distance3;
    }

    if (Vehicle.debug) {
      // Dessiner le point utilisé
      fill("yellow");
      circle(pointUtilise.x, pointUtilise.y, 10);
    }

    let force;

    if (distance < obstacleLePlusProcheFinal.r + this.largeurZoneEvitementDevantVaisseau) {
      // Il y a collision possible
      // Calculer la force d'évitement
      force = p5.Vector.sub(pointUtilise, obstacleLePlusProcheFinal.pos);
      force.normalize();
      force.mult(this.maxForce);
    } else {
      // Pas de collision possible
      force = createVector(0, 0);
    }

    pop();
    return force;
  }

  // Méthode auxiliaire pour trouver l'obstacle le plus proche d'un point
  getClosestObstacle(point, obstacles) {
    if (obstacles.length === 0) {
      // Retourner un obstacle factice si aucun obstacle
      return { pos: createVector(9999, 9999), r: 0 };
    }

    let closest = obstacles[0];
    let closestDist = p5.Vector.dist(point, closest.pos);

    for (let obstacle of obstacles) {
      let d = p5.Vector.dist(point, obstacle.pos);
      if (d < closestDist) {
        closest = obstacle;
        closestDist = d;
      }
    }

    return closest;
  }

  // Méthode pour le flocking (Boids)
  // vehicles : tableau de véhicules
  flock(vehicles) {
    let alignment = this.align(vehicles);
    let cohesion = this.cohesion(vehicles);
    let separation = this.separation(vehicles);

    // On applique les poids
    alignment.mult(this.alignWeight);
    cohesion.mult(this.cohesionWeight);
    separation.mult(this.separationWeight);

    // On applique les forces
    this.applyForce(alignment);
    this.applyForce(cohesion);
    this.applyForce(separation);
  }

  // Alignement : le véhicule s'aligne avec les véhicules voisins
  align(vehicles) {
    let perceptionRadius = this.perceptionRadius;
    let steering = createVector(0, 0);
    let total = 0;

    for (let other of vehicles) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (other != this && d < perceptionRadius) {
        steering.add(other.vel);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.vel);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  // Cohésion : le véhicule se dirige vers le centre de masse des véhicules voisins
  cohesion(vehicles) {
    let perceptionRadius = this.perceptionRadius;
    let steering = createVector(0, 0);
    let total = 0;

    for (let other of vehicles) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (other != this && d < perceptionRadius) {
        steering.add(other.pos);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering = this.seek(steering);
    }
    return steering;
  }

  // Séparation : le véhicule évite les véhicules trop proches
  separation(vehicles) {
    let perceptionRadius = this.perceptionRadius;
    let steering = createVector(0, 0);
    let total = 0;

    for (let other of vehicles) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (other != this && d < perceptionRadius && d > 0) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.div(d * d); // Plus on est proche, plus la force est grande
        steering.add(diff);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.vel);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  // Appliquer une force au véhicule
  applyForce(force) {
    this.acc.add(force);
  }

  // Mettre à jour la position du véhicule
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  // Afficher le véhicule
  show() {
    push();
    stroke(255);
    strokeWeight(2);
    fill(this.couleur);
    stroke(0);
    strokeWeight(2);
    push();
    translate(this.pos.x, this.pos.y);
    if (this.vel.mag() > 0)
      rotate(this.vel.heading());

    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
    pop();
    /*
   push();
   // on dessine le vehicule comme un cercle
   fill("blue");
   stroke("white");
   strokeWeight(2);
   translate(this.pos.x, this.pos.y);
   circle(0, 0, this.r * 2);  
   pop();
   */
  }

  // Méthode d'affichage basique avec debug
  show() {
    push();
    
    // Cercle de base pour le véhicule
    fill(this.couleur);
    stroke(0);
    strokeWeight(2);
    circle(this.pos.x, this.pos.y, this.r * 2);
    
    // Debug information
    if (Vehicle.debug) {
      // Cercle de debug autour du véhicule
      stroke(255, 0, 0, 150);
      noFill();
      circle(this.pos.x, this.pos.y, this.r * 3);
      
      // Vecteur vitesse
      stroke(0, 255, 0, 150);
      strokeWeight(3);
      let speedVector = this.vel.copy();
      speedVector.mult(20); // Multiplier pour visibilité
      line(this.pos.x, this.pos.y, this.pos.x + speedVector.x, this.pos.y + speedVector.y);
      
      // Point d'arrivée ahead pour wander (si applicable)
      if (this.distanceCercle && this.wanderRadius) {
        let pointDevant = this.vel.copy();
        pointDevant.setMag(this.distanceCercle);
        pointDevant.add(this.pos);
        
        fill(255, 255, 0, 150);
        noStroke();
        circle(pointDevant.x, pointDevant.y, 6);
      }
    }
    
    pop();
  }

  // Gérer les bords de l'écran
  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}
