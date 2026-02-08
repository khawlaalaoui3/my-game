let nbVehicules = 20;
let target;
let vehicle;
let vehicles = [];
let vehiclesWander = []; 
let snake; 
let obstacles = [];
let stars = [];
let foods = [];
let enemies = []; 
let score = 0;
let lives = 3; 
let invincible = false; 
let invincibleTimer = 0; 

// Texte
let font;
let points = [];
// mode (snake ou text)
let mode = "snake";
let gameOver = false; // État du jeu pour la collision avec soi-même

// État du jeu : "menu", "playing", "paused"
let gameState = "menu";

// Niveau de difficulté
let difficulty = "normal"; // "easy", "normal", "hard"
let difficultySettings = {
  easy: {
    name: "Easy",
    description: "Perfect for beginners",
    enemySpeed: 2,
    enemyCount: 3,
    lives: 5,
    detectionRadius: 100, // Rayon de détection réduit
    pursueForce: 0.5, // Force de poursuite réduite
    colorR: 100,
    colorG: 255,
    colorB: 150
  },
  normal: {
    name: "Normal",
    description: "Balanced challenge",
    enemySpeed: 3,
    enemyCount: 5,
    lives: 3,
    detectionRadius: 150, // Rayon de détection normal
    pursueForce: 0.8, // Force de poursuite normale
    colorR: 255,
    colorG: 200,
    colorB: 100
  },
  hard: {
    name: "Hard",
    description: "For experienced players",
    enemySpeed: 4,
    enemyCount: 7,
    lives: 2,
    detectionRadius: 200, // Rayon de détection augmenté
    pursueForce: 1.0, // Force de poursuite maximale
    colorR: 255,
    colorG: 100,
    colorB: 100
  }
};

// Sons
let bgMusic;
let bgMusicBass; // Basse pour la musique
let bgMusicMelody; // Mélodie pour la musique
let eatSound;
let gameOverSound;
let enemyAlertSound;
let soundsInitialized = false; // Flag pour savoir si les sons sont initialisés

// Effets visuels
let particles = []; // Particules pour effets
let screenShake = 0; // Intensité du screen shake
let glowIntensity = 0; // Intensité du glow global

// Fonts
let orbitronFont, exoFont, poppinsFont, spaceMonoFont;

// Appelée avant de démarrer l'animation
function preload() {
  // Charger la fonte de caractères
  font = loadFont('./assets/inconsolata.otf');
  
  // Les Google Fonts seront chargées via HTML
  // On utilisera textFont() avec les noms de famille dans draw()
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  pixelDensity(1);

  
  // Crée le véhicule principal
  vehicle = new Vehicle(100, 100);

  // La cible, ce sera la position de la souris
  target = createVector(random(width), random(height));

  // Texte qu'on affiche avec textToPoint
  updateTextPoints();

  // on ne crée qu'UN SEUL véhicule au départ
  // Création du snake avec 10 segments - couleur rose/magenta
  snake = new Snake(width / 2, height / 2, 10, 8, color(255, 20, 147)); // Deep Pink

  // Initialisation du fond "Universe" (étoiles avec parallax)
  for (let i = 0; i < 400; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      brightness: random(100, 255),
      speed: random(0.1, 0.5), // Vitesse pour effet parallax
      layer: random(0.3, 1) // Couche de profondeur
    });
  }

  // Génération initiale de nourriture
  for (let i = 0; i < 10; i++) {
    spawnFood();
  }
  
  // Génération initiale d'ennemis (snakes rouges)
  for (let i = 0; i < 5; i++) {
    spawnEnemy();
  }

  // Écouteur pour l'input de texte
  let textInput = document.getElementById('textInput');
  if (textInput) {
    textInput.addEventListener('input', updateTextPoints);
    // Cacher le champ de texte au démarrage
    textInput.parentElement.style.display = 'none';
  }
}

// appelée 60 fois par seconde
function draw() {
  // Musique de fond
  playBackgroundMusic();
  
  // Screen shake effect
  if (screenShake > 0) {
    translate(random(-screenShake, screenShake), random(-screenShake, screenShake));
    screenShake *= 0.9; // Diminuer progressivement
  }
  
  // Fond avec effet de profondeur et gradient spatial rose/violet amélioré
  drawSpaceBackground();
  
  // Afficher le menu si on est dans l'état "menu"
  if (gameState === "menu") {
    // Cacher le champ de texte dans le menu
    let textInput = document.getElementById('textInput');
    if (textInput && textInput.parentElement) {
      textInput.parentElement.style.display = 'none';
    }
    drawMenu();
    return; // Ne pas exécuter le reste du code
  }
  
  // Afficher le champ de texte quand on joue
  let textInput = document.getElementById('textInput');
  if (textInput && textInput.parentElement) {
    textInput.parentElement.style.display = 'block';
  }

  // Le reste du code du jeu continue ici...

  // Affichage du mode actuel avec style futuriste
  drawModeDisplay();

  // Affichage du score avec style digital
  drawScoreDisplay();

  // Affichage des vies (cœurs) avec glow
  drawLivesDisplay();

  // Affichage du message GAME OVER si nécessaire
  if (gameOver) {
    // Cacher le champ de texte en cas de game over
    let textInput = document.getElementById('textInput');
    if (textInput && textInput.parentElement) {
      textInput.parentElement.style.display = 'none';
    }
    drawGameOver();
    return; // Arrête le jeu si game over
  }
  
  // Affichage des instructions avec style moderne
  drawInstructions();

  // Affichage de la cible en mode snake avec effet amélioré
  if (mode === "snake") {
    target.x = mouseX;
    target.y = mouseY;
    drawTarget();
  }

  // Affichage des points du texte avec effet brillant
  points.forEach(pt => {
    push();
    let col1 = color(255, 20, 147); // Deep Pink
    let col2 = color(255, 182, 193); // Light Pink
    let lerpVal = (sin(frameCount * 0.1 + pt.x * 0.01) + 1) / 2;
    let shinyCol = lerpColor(col1, col2, lerpVal);
    
    // Glow effect
    for (let i = 3; i > 0; i--) {
      fill(shinyCol.levels[0], shinyCol.levels[1], shinyCol.levels[2], 30);
      noStroke();
      circle(pt.x, pt.y, 6 + i * 3);
    }
    
    fill(shinyCol);
    noStroke();
    circle(pt.x, pt.y, 6);
    pop();
  });

  // Affichage de la nourriture avec particules
  drawFood();



  // On affiche les snakes, qui suivent la souris
  // Calcul de positions derrière la souris, comme si on faisait 
  // une "formation d'avions" derrière la souris. Par exemple
  // formation en V avec un certain espacement. On va définir 7 cibles
  // derrière la souris, la souris étant la tête de la formation
  // la cible 0 est 30 pixels derrière la souris, les cibles 1 et 2 sont derrière et à gauche et à droite
  // par rapport à la direction du mouvement de la souris, etc.
  // les cibles sont DERRIERE la souris quand elle se déplace
  // Lorsque la souris est immobile (previousMouseX == mouseX et previousMouseY == mouseY avec une certaine
  // tolérance), les cibles restent à leur position précédente
  let formationTargets = [];
  let numFormationTargets = 7;
  let spacing = 30;

  // Calcul de la direction du mouvement de la souris
  let mouseVel = createVector(mouseX - pmouseX, mouseY - pmouseY);
  if (mouseVel.mag() < 0.1) {
    mouseVel.set(0, -1); // si la souris est immobile, on considère qu'elle regarde vers le haut
  } else {
    mouseVel.normalize();
  }

  // Vecteur perpendiculaire à la direction du mouvement de la souris
  let perp = createVector(-mouseVel.y, mouseVel.x);

  for (let i = 0; i < numFormationTargets; i++) {
    let targetPos = createVector(mouseX, mouseY);
    targetPos.sub(p5.Vector.mult(mouseVel, spacing * (floor(i / 2) + 1))); // derrière la souris
    if (i % 2 == 1) {
      targetPos.add(p5.Vector.mult(perp, spacing * (floor(i / 2) + 1))); // à gauche  
    } else if (i % 2 == 0 && i != 0) {
      targetPos.sub(p5.Vector.mult(perp, spacing * (floor(i / 2)))); // à droite
    }
    formationTargets.push(targetPos);
  }

  // Dessin sous forme de cercles de rayon 10 des formationTargets
  if (Vehicle.debug) {
    formationTargets.forEach(target => {
      push();
      fill("grey");
      noStroke();
      circle(target.x, target.y, 15);
      pop();
    });
  }


  // Affichage des obstacles
  obstacles.forEach(o => {
    o.show();
  });

  // Affichage de la nourriture
  foods.forEach(f => f.show());


  switch (mode) {
    case "snake":
      // Cible qui suit la souris, cercle rouge de rayon 32
      target.x = mouseX;
      target.y = mouseY;

      // dessin de la cible
      push();
      fill(255, 0, 0);
      noStroke();
      ellipse(target.x, target.y, 32);
      pop();

      // Mise à jour et affichage du snake
      if (snake) {
        snake.update(target, obstacles);
        snake.edges();
        
        // Effet visuel d'invincibilité (clignotement)
        if (!invincible || frameCount % 10 < 5) {
          snake.show();
        }
        
        // Cercle de protection pendant l'invincibilité
        if (invincible) {
          push();
          noFill();
          stroke(255, 255, 255, 150);
          strokeWeight(3);
          let pulseSize = 40 + sin(frameCount * 0.2) * 10;
          circle(snake.head.pos.x, snake.head.pos.y, pulseSize);
          pop();
        }
        
        // Vérification de collision avec la nourriture
        for (let i = foods.length - 1; i >= 0; i--) {
          let food = foods[i];
          let distance = p5.Vector.dist(snake.anneaux[0].pos, food.pos);
          
          // Si la tête du snake touche la nourriture (rayon de collision)
          if (distance < snake.anneaux[0].r + food.r) {
            // Le snake mange la nourriture
            foods.splice(i, 1); // Retirer la nourriture
            snake.grow(); // Faire grandir le snake
            score += 1; // Augmenter le score
            playEatSound(); // Jouer le son de manger
            
            // Créer des particules
            createFoodParticles(food.pos.x, food.pos.y);
            
            // Respawner de la nourriture
            spawnFood();
          }
        }
        
        
        
        
        // Vérification de collision avec les ennemis (seulement si activés)
        let enemiesToggle = document.getElementById('enemiesToggle');
        let enemiesActive = enemiesToggle ? enemiesToggle.checked : true;
        
        if (enemiesActive && !invincible) {
          for (let enemy of enemies) {
            if (enemy.checkCollision(snake)) {
              // Perdre une vie
              lives--;
              
              if (lives <= 0) {
                // Game Over si plus de vies
                gameOver = true;
                playGameOverSound();
                console.log("Game Over - No more lives!");
              } else {
                // Activer l'invincibilité temporaire
                invincible = true;
                invincibleTimer = 120; // 2 secondes d'invincibilité (60 fps * 2)
                screenShake = 10; // Ajouter screen shake
                console.log("Hit by enemy! Lives remaining: " + lives);
              }
              break;
            }
          }
        }
      }
      break;
    case "text":
      // Pour former le texte, chaque anneau vise un point spécifique du texte
      if (snake && snake.anneaux && points.length > 0) {
        for (let i = 0; i < Math.min(snake.anneaux.length, points.length); i++) {
          let anneau = snake.anneaux[i];
          let pt = points[i];
          target = createVector(pt.x, pt.y);
          let steeringForce = anneau.arrive(target);
          anneau.applyForce(steeringForce);
          anneau.update();
          anneau.edges();
        }
        
        // Afficher le snake
        snake.show();
      }
      break;
    case "wander":
      // Mode wander - les véhicules wander sont déjà affichés avant le switch
      break;
  }

  // Affichage des obstacles
  obstacles.forEach(obstacle => {
    obstacle.show();
  });

  // Affichage des wanders dans tous les modes
  vehiclesWander.forEach(vehicle => {
    vehicle.update(null, obstacles);
    vehicle.show();
    vehicle.edges();
  });
  
  // Affichage et mise à jour des ennemis
  // Vérifier si les ennemis sont activés via la checkbox
  let enemiesToggle = document.getElementById('enemiesToggle');
  let enemiesActive = enemiesToggle ? enemiesToggle.checked : true;
  
  if (enemiesActive) {
    enemies.forEach(enemy => {
      if (snake && snake.head) {
        enemy.update(snake.head, obstacles);
        enemy.show();
        enemy.edges();
        
        // Jouer le son d'alerte si un ennemi poursuit
        if (enemy.mode === "pursue") {
          playEnemyAlertSound();
        }
      }
    });
  } else {
    // Si les ennemis sont désactivés, les afficher mais sans les mettre à jour
    enemies.forEach(enemy => {
      enemy.show();
    });
  }

  // Gestion du timer d'invincibilité
  if (invincible) {
    invincibleTimer--;
    if (invincibleTimer <= 0) {
      invincible = false;
    }
  }

  // Gestion des touches pour changer de mode et activer le debug
  if (keyIsPressed) {
    // Vérifier si l'utilisateur est en train de taper dans le champ de texte
    let textInput = document.getElementById('textInput');
    let isTypingInTextInput = textInput && document.activeElement === textInput;
    
    if (!isTypingInTextInput) {
      if (key === 's' || key === 'S') {
        mode = "snake";
      } else if (key === 't' || key === 'T') {
        mode = "text";
        updateTextPoints();
        // Pas besoin de créer des véhicules séparés, on utilise les anneaux du snake
      } else if (key === 'd' || key === 'D') {
        // Toggle debug pour les véhicules
        Vehicle.debug = !Vehicle.debug;
      }
    }
  }

}


function keyPressed() {
  // Vérifier si l'utilisateur est en train de taper dans le champ de texte
  let textInput = document.getElementById('textInput');
  if (textInput && document.activeElement === textInput) {
    // Si le champ de texte est actif, ne pas traiter les touches de jeu
    return;
  }
  
  if (key === 'd') {
    Vehicle.debug = !Vehicle.debug;
  } else if (key === 'r') {
    // Redémarrer le même niveau si game over
    if (gameOver) {
      resetGame();
      gameState = "playing";
    }
  } else if (key === 'w') {
    // Créer un wander avec design de snake
    let v = new VehicleWander(random(width), random(height), false);
    vehiclesWander.push(v);
    console.log("Wander added, total:", vehiclesWander.length);
  } else if (key === 's') {
    // Mode = Snake
    mode = "snake";
  } else if (key === 't') {
    // Mode = Text
    mode = "text";
  } else if (key === 'a') {
    lvehicles.push(new Vehicle(random(width), random(height), color(255, 165, 0), 12)); // Un seul véhicule au départ
    console.log("Current obstacles count:", obstacles.length);
  } else if (key === 'o') {
    console.log("Adding obstacle at", mouseX, mouseY);
    // On ajoute un obstacle
    let x = mouseX;
    let y = mouseY;
    let r = random(20, 50);
    let couleur = color(random(255), random(255), random(255));
    obstacles.push(new Obstacle(x, y, r, couleur));
    console.log("Current obstacles count:", obstacles.length);
  } else if (key === 'e') {
    // Ajouter un ennemi
    spawnEnemy();
    console.log("Enemy added, total:", enemies.length);
  }
}

/**
 * Fonction pour réinitialiser le jeu
 * Remet à zéro le snake, le score et l'état du jeu
 */
function resetGame() {
  // Réinitialiser TOUTES les variables du jeu
  gameOver = false;
  score = 0;
  invincible = false; // Désactiver l'invincibilité
  invincibleTimer = 0;
  foods = [];
  obstacles = []; // Supprimer tous les obstacles
  vehiclesWander = []; // Supprimer tous les wanders
  enemies = []; // Supprimer tous les ennemis
  vehicles = []; // Supprimer tous les véhicules
  points = []; // Supprimer les points du texte
  
  // Réinitialiser le mode au mode snake
  mode = "snake";
  
  // Désactiver le debug
  Vehicle.debug = false;
  
  // Vider le champ de texte et le réafficher
  let textInput = document.getElementById('textInput');
  if (textInput) {
    textInput.value = '';
    if (textInput.parentElement) {
      textInput.parentElement.style.display = 'block';
    }
  }
  
  // Recréer le snake initial - couleur rose/magenta Deep Pink
  snake = new Snake(width / 2, height / 2, 10, 8, color(255, 20, 147));
  
  // Regénérer la nourriture
  for (let i = 0; i < 10; i++) {
    spawnFood();
  }
  
  // Appliquer les paramètres de difficulté (vies et ennemis)
  applyDifficulty();
  
  console.log("Game completely reset - Back to initial state");
}

function spawnFood() {
  // On crée une nouvelle nourriture à une position aléatoire
  let x = random(50, width - 50);
  let y = random(50, height - 50);
  let r = random(4, 8); // Taille réduite de 8-15 à 4-8
  let couleur = color(255, random(100, 255), 0);
  foods.push(new Food(x, y, r, couleur));
}

function growVehicleSnake() {
  // On ajoute un SnakeVehicle à la fin de la chaîne existante
  if (vehicles.length === 0) return;
  let last = vehicles[vehicles.length - 1];
  // Nouveau véhicule placé près du dernier
  let offset = last.vel.copy();
  if (offset.mag() === 0) {
    offset = createVector(-1, 0);
  }
  offset.setMag(15); // Réduit de 20 à 15 pour des segments plus proches
  let newPos = p5.Vector.sub(last.pos, offset);
  let v = new SnakeVehicle(newPos.x, newPos.y, last.couleur, 8); // Utilise SnakeVehicle
  vehicles.push(v);
}

function updateTextPoints() {
  let currentText = document.getElementById('textInput') ? document.getElementById('textInput').value : '';
  
  // Si le texte est vide, ne pas générer de points
  if (currentText.trim() === '') {
    points = [];
    return;
  }
  
  // Centrer le texte et améliorer l'espacement
  let textWidth = currentText.length * 60; // estimation largeur
  let x = (width - textWidth) / 2;
  let y = height / 2;
  points = font.textToPoints(currentText, x, y, 150, { sampleFactor: 0.05, simplifyThreshold: 0 });
}

// Fonction pour créer de la nourriture
function spawnFood() {
  // Créer une nouvelle nourriture à une position aléatoire
  let food = {
    pos: createVector(random(50, width - 50), random(50, height - 50)),
    r: 8, // Rayon de la nourriture
    couleur: color(0, 255, 0), // Couleur verte pour la nourriture
    
    show() {
      push();
      fill(this.couleur);
      stroke(0);
      strokeWeight(1);
      circle(this.pos.x, this.pos.y, this.r * 2);
      pop();
    }
  };
  
  foods.push(food);
}


// Fonction pour dessiner le menu principal
function drawMenu() {
  push();
  
  // Titre du jeu avec effet néon glow - style Orbitron
  textFont('Orbitron');
  textAlign(CENTER, CENTER);
  
  // Animation de pulsation pour le glow
  let glowPulse = sin(frameCount * 0.05) * 15 + 30;
  
  // Effet de glow néon rose/magenta
  for (let i = 8; i > 0; i--) {
    fill(255, 20, 147, glowPulse / i); // Deep Pink
    textSize(64 + i * 3);
    noStroke();
    text("SNAKE GAME", width / 2, height / 4 - 10);
  }
  
  // Titre principal avec gradient simulé
  fill(255, 105, 180); // Hot Pink
  stroke(255, 20, 147);
  strokeWeight(3);
  textSize(64);
  text("SNAKE GAME", width / 2, height / 4 - 10);
  
  // Sous-titre "Space Edition" - police élégante Exo 2
  textFont('Exo 2');
  textStyle(NORMAL);
  
  // Glow cyan pour le sous-titre
  for (let i = 4; i > 0; i--) {
    fill(0, 206, 209, 25); // Dark Turquoise
    noStroke();
    textSize(20 + i * 1.5);
    text("Space Edition", width / 2, height / 4 + 38);
  }
  
  fill(135, 206, 235); // Sky Blue
  noStroke();
  textSize(20);
  text("Space Edition", width / 2, height / 4 + 38);
  
  // Section de sélection de difficulté
  textFont('Poppins');
  textSize(22);
  textStyle(BOLD);
  
  // Glow pour le titre de section
  for (let i = 2; i > 0; i--) {
    fill(255, 182, 193, 35);
    textSize(22 + i * 1.5);
    noStroke();
    text("SELECT DIFFICULTY", width / 2, height / 2 - 110);
  }
  
  fill(255, 182, 193);
  noStroke();
  textSize(22);
  text("SELECT DIFFICULTY", width / 2, height / 2 - 110);
  
  // Dessiner les 3 cartes de difficulté avec glassmorphism
  let difficulties = ["easy", "normal", "hard"];
  let cardWidth = 220;
  let cardHeight = 140;
  let spacing = 250;
  let startX = width / 2 - spacing;
  let cardY = height / 2;
  
  for (let i = 0; i < difficulties.length; i++) {
    let diff = difficulties[i];
    let settings = difficultySettings[diff];
    let cardX = startX + (i * spacing);
    
    // Vérifier si la souris est sur cette carte
    let isHover = mouseX > cardX - cardWidth / 2 && 
                  mouseX < cardX + cardWidth / 2 && 
                  mouseY > cardY - cardHeight / 2 && 
                  mouseY < cardY + cardHeight / 2;
    
    // Vérifier si c'est le niveau sélectionné
    let isSelected = difficulty === diff;
    
    // Dessiner la carte avec effet glassmorphism
    push();
    rectMode(CENTER);
    
    // Glow animé qui pulse
    let cardGlow = sin(frameCount * 0.08 + i) * 15 + 25;
    
    if (isSelected) {
      // Carte sélectionnée - glow intense
      for (let j = 8; j > 0; j--) {
        fill(settings.colorR, settings.colorG, settings.colorB, cardGlow / j);
        noStroke();
        rect(cardX, cardY, cardWidth + j * 12, cardHeight + j * 12, 20);
      }
      
      // Fond glassmorphism
      fill(settings.colorR, settings.colorG, settings.colorB, 60);
      stroke(settings.colorR, settings.colorG, settings.colorB, 200);
      strokeWeight(3);
      rect(cardX, cardY, cardWidth, cardHeight, 20);
      
      // Bordure intérieure brillante
      noFill();
      stroke(255, 255, 255, 150);
      strokeWeight(1);
      rect(cardX, cardY, cardWidth - 6, cardHeight - 6, 18);
      
    } else if (isHover) {
      // Carte survolée
      for (let j = 5; j > 0; j--) {
        fill(settings.colorR, settings.colorG, settings.colorB, 35);
        noStroke();
        rect(cardX, cardY, cardWidth + j * 10, cardHeight + j * 10, 20);
      }
      
      // Fond glassmorphism
      fill(settings.colorR, settings.colorG, settings.colorB, 45);
      stroke(settings.colorR, settings.colorG, settings.colorB, 180);
      strokeWeight(2.5);
      rect(cardX, cardY, cardWidth, cardHeight, 20);
      
    } else {
      // Carte normale
      // Fond glassmorphism
      fill(settings.colorR, settings.colorG, settings.colorB, 30);
      stroke(settings.colorR, settings.colorG, settings.colorB, 120);
      strokeWeight(2);
      rect(cardX, cardY, cardWidth, cardHeight, 20);
    }
    
    // Nom du niveau avec glow
    textFont('Poppins');
    textStyle(BOLD);
    
    if (isSelected || isHover) {
      for (let j = 2; j > 0; j--) {
        fill(255, 255, 255, 40);
        noStroke();
        textSize(26 + j * 1.5);
        text(settings.name, cardX, cardY - 35);
      }
    }
    
    fill(255, 255, 255);
    noStroke();
    textSize(26);
    text(settings.name, cardX, cardY - 35);
    
    // Description
    textStyle(NORMAL);
    textSize(12);
    fill(255, 255, 255, 220);
    text(settings.description, cardX, cardY - 5);
    
    // Statistiques avec icônes stylisées
    textFont('Space Mono');
    textSize(12);
    fill(255, 182, 193, 230);
    text(settings.lives + " Lives", cardX, cardY + 20);
    
    fill(255, 100, 100, 230);
    text(settings.enemyCount + " Enemies", cardX, cardY + 38);
    
    pop();
  }
  
  // Bouton START GAME avec animation de glow pulsant
  let playButtonX = width / 2;
  let playButtonY = height / 2 + 170;
  let playButtonWidth = 260;
  let playButtonHeight = 65;
  
  let isPlayHover = mouseX > playButtonX - playButtonWidth / 2 && 
                    mouseX < playButtonX + playButtonWidth / 2 && 
                    mouseY > playButtonY - playButtonHeight / 2 && 
                    mouseY < playButtonY + playButtonHeight / 2;
  
  // Glow pulsant pour le bouton
  let playGlow = sin(frameCount * 0.1) * 20 + 40;
  
  // Dessiner le bouton START GAME
  push();
  rectMode(CENTER);
  
  if (isPlayHover) {
    // Glow intense au survol
    for (let i = 8; i > 0; i--) {
      fill(255, 20, 147, playGlow / i);
      noStroke();
      rect(playButtonX, playButtonY, playButtonWidth + i * 12, playButtonHeight + i * 12, 25);
    }
    
    // Fond glassmorphism
    fill(255, 20, 147, 80);
    stroke(255, 105, 180, 255);
    strokeWeight(4);
    rect(playButtonX, playButtonY, playButtonWidth, playButtonHeight, 25);
    
    // Bordure intérieure
    noFill();
    stroke(255, 255, 255, 180);
    strokeWeight(2);
    rect(playButtonX, playButtonY, playButtonWidth - 8, playButtonHeight - 8, 23);
    
  } else {
    // Glow normal
    for (let i = 6; i > 0; i--) {
      fill(255, 20, 147, playGlow / (i * 1.5));
      noStroke();
      rect(playButtonX, playButtonY, playButtonWidth + i * 10, playButtonHeight + i * 10, 25);
    }
    
    // Fond glassmorphism
    fill(255, 20, 147, 60);
    stroke(255, 105, 180, 200);
    strokeWeight(3);
    rect(playButtonX, playButtonY, playButtonWidth, playButtonHeight, 25);
  }
  
  // Texte du bouton
  textFont('Orbitron');
  textStyle(BOLD);
  
  // Glow pour le texte
  for (let i = 2; i > 0; i--) {
    fill(255, 255, 255, 50);
    noStroke();
    textSize(28 + i * 1.5);
    text("START GAME", playButtonX, playButtonY);
  }
  
  fill(255, 255, 255);
  noStroke();
  textSize(28);
  text("START GAME", playButtonX, playButtonY);
  
  pop();
  
  // Contrôles en bas avec style moderne
  push();
  textFont('Poppins');
  textSize(13);
  textStyle(NORMAL);
  fill(135, 206, 235, 180);
  noStroke();
  textAlign(CENTER);
  text("Move your mouse to direct the snake", width / 2, height - 90);
  
  textFont('Space Mono');
  textSize(11);
  fill(255, 182, 193, 150);
  text("S: Snake | T: Text | W: Wander | E: Enemy | D: Debug", width / 2, height - 70);
  pop();
}




// Fonction pour créer un ennemi
function spawnEnemy() {
  // Créer un ennemi avec design de snake
  let x, y;
  let minDistance = 200;
  
  do {
    x = random(50, width - 50);
    y = random(50, height - 50);
  } while (snake && p5.Vector.dist(createVector(x, y), snake.head.pos) < minDistance);
  
  let enemy = new VehicleWander(x, y, true); // true = isEnemy
  enemies.push(enemy);
}


// Fonction pour dessiner l'écran de Game Over
function drawGameOver() {
  push();
  
  // Effet de fondu sombre avec teinte violette
  fill(5, 2, 15, 220);
  noStroke();
  rect(0, 0, width, height);
  
  // Animation de fade in basée sur le temps depuis game over
  let fadeIn = constrain((frameCount % 120) / 60, 0, 1);
  
  // Titre GAME OVER avec effet glitch et néon
  textFont('Orbitron');
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  
  // Effet glitch (décalage aléatoire)
  let glitchX = 0;
  let glitchY = 0;
  if (frameCount % 10 < 3) {
    glitchX = random(-5, 5);
    glitchY = random(-3, 3);
  }
  
  // Couches de glitch en rouge et cyan
  if (frameCount % 10 < 2) {
    fill(255, 0, 0, 100);
    textSize(90);
    text("GAME OVER", width / 2 - 5 + glitchX, height / 2 - 120 + glitchY);
    
    fill(0, 255, 255, 100);
    textSize(90);
    text("GAME OVER", width / 2 + 5 + glitchX, height / 2 - 120 - glitchY);
  }
  
  // Glow néon rose/rouge massif
  for (let i = 15; i > 0; i--) {
    fill(255, 20, 60, (40 * fadeIn) / i);
    textSize(90 + i * 4);
    text("GAME OVER", width / 2, height / 2 - 120);
  }
  
  // Texte principal
  fill(255, 50, 100);
  stroke(255, 20, 60);
  strokeWeight(4);
  textSize(90);
  text("GAME OVER", width / 2, height / 2 - 120);
  
  // Animation de scale pour le score
  let scaleAnim = 0.8 + (fadeIn * 0.2);
  push();
  translate(width / 2, height / 2 - 40);
  scale(scaleAnim);
  
  // Afficher le score final avec glow
  textFont('Orbitron');
  textStyle(NORMAL);
  
  for (let i = 5; i > 0; i--) {
    fill(255, 105, 180, (50 * fadeIn) / i);
    noStroke();
    textSize(38 + i * 3);
    text("FINAL SCORE: " + score, 0, 0);
  }
  
  fill(255, 182, 193);
  stroke(255, 105, 180);
  strokeWeight(2);
  textSize(38);
  text("FINAL SCORE: " + score, 0, 0);
  pop();
  
  // Statistiques du jeu avec meilleure lisibilité
  textFont('Poppins');
  textStyle(NORMAL);
  
  // Fond semi-transparent pour les stats
  fill(10, 5, 25, 180);
  noStroke();
  rectMode(CENTER);
  rect(width / 2, height / 2 + 10, 400, 60, 15);
  
  // Bordure
  noFill();
  stroke(135, 206, 235, 150);
  strokeWeight(2);
  rect(width / 2, height / 2 + 10, 400, 60, 15);
  
  // Texte des stats
  fill(135, 206, 235, 230);
  noStroke();
  textSize(16);
  text("Snake Length: " + (snake ? snake.anneaux.length : 0), width / 2, height / 2 - 5);
  text("Difficulty: " + difficultySettings[difficulty].name, width / 2, height / 2 + 20);
  
  // BOUTON 1: RESTART (même niveau) - Vert
  let restartButtonX = width / 2 - 150;
  let restartButtonY = height / 2 + 90;
  let buttonWidth = 240;
  let buttonHeight = 70;
  
  let isRestartHover = mouseX > restartButtonX - buttonWidth / 2 && 
                       mouseX < restartButtonX + buttonWidth / 2 && 
                       mouseY > restartButtonY - buttonHeight / 2 && 
                       mouseY < restartButtonY + buttonHeight / 2;
  
  // Dessiner le bouton RESTART
  push();
  rectMode(CENTER);
  
  if (isRestartHover) {
    // Glow vert intense
    for (let i = 8; i > 0; i--) {
      fill(0, 255, 150, 40 / i);
      noStroke();
      rect(restartButtonX, restartButtonY, buttonWidth + i * 12, buttonHeight + i * 12, 25);
    }
    
    fill(0, 255, 150, 80);
    stroke(100, 255, 200, 255);
    strokeWeight(4);
  } else {
    // Glow vert normal
    for (let i = 5; i > 0; i--) {
      fill(0, 255, 150, 30 / i);
      noStroke();
      rect(restartButtonX, restartButtonY, buttonWidth + i * 8, buttonHeight + i * 8, 25);
    }
    
    fill(0, 200, 120, 70);
    stroke(0, 255, 150, 200);
    strokeWeight(3);
  }
  
  rect(restartButtonX, restartButtonY, buttonWidth, buttonHeight, 25);
  
  // Texte du bouton
  textFont('Poppins');
  textStyle(BOLD);
  
  if (isRestartHover) {
    for (let i = 2; i > 0; i--) {
      fill(255, 255, 255, 60);
      noStroke();
      textSize(30 + i * 2);
      text("RESTART", restartButtonX, restartButtonY);
    }
  }
  
  fill(255, 255, 255);
  noStroke();
  textSize(30);
  text("RESTART", restartButtonX, restartButtonY);
  pop();
  
  // BOUTON 2: BACK TO MENU - Rose
  let menuButtonX = width / 2 + 150;
  let menuButtonY = height / 2 + 90;
  
  let isMenuHover = mouseX > menuButtonX - buttonWidth / 2 && 
                    mouseX < menuButtonX + buttonWidth / 2 && 
                    mouseY > menuButtonY - buttonHeight / 2 && 
                    mouseY < menuButtonY + buttonHeight / 2;
  
  // Dessiner le bouton BACK TO MENU
  push();
  rectMode(CENTER);
  
  if (isMenuHover) {
    // Glow rose intense
    for (let i = 8; i > 0; i--) {
      fill(255, 20, 147, 40 / i);
      noStroke();
      rect(menuButtonX, menuButtonY, buttonWidth + i * 12, buttonHeight + i * 12, 25);
    }
    
    fill(255, 20, 147, 80);
    stroke(255, 105, 180, 255);
    strokeWeight(4);
  } else {
    // Glow rose normal
    for (let i = 5; i > 0; i--) {
      fill(255, 20, 147, 30 / i);
      noStroke();
      rect(menuButtonX, menuButtonY, buttonWidth + i * 8, buttonHeight + i * 8, 25);
    }
    
    fill(255, 20, 147, 70);
    stroke(255, 105, 180, 200);
    strokeWeight(3);
  }
  
  rect(menuButtonX, menuButtonY, buttonWidth, buttonHeight, 25);
  
  // Texte du bouton
  textFont('Poppins');
  textStyle(BOLD);
  
  if (isMenuHover) {
    for (let i = 2; i > 0; i--) {
      fill(255, 255, 255, 60);
      noStroke();
      textSize(26 + i * 2);
      text("BACK TO", menuButtonX, menuButtonY - 10);
      text("MENU", menuButtonX, menuButtonY + 12);
    }
  }
  
  fill(255, 255, 255);
  noStroke();
  textSize(26);
  text("BACK TO", menuButtonX, menuButtonY - 10);
  text("MENU", menuButtonX, menuButtonY + 12);
  pop();
  
  // Instructions
  textFont('Space Mono');
  textSize(13);
  textStyle(NORMAL);
  fill(135, 206, 235, 200);
  noStroke();
  textAlign(CENTER);
  text("Press 'R' to restart same level", width / 2, height / 2 + 180);
  
  pop();
}

// Modifier mousePressed pour gérer le clic sur le bouton Restart
function mousePressed() {
  // Si on est dans le menu
  if (gameState === "menu") {
    // Vérifier les clics sur les boutons de difficulté
    let difficulties = ["easy", "normal", "hard"];
    let buttonWidth = 200;
    let buttonHeight = 120;
    let spacing = 230;
    let startX = width / 2 - spacing;
    let buttonY = height / 2;
    
    for (let i = 0; i < difficulties.length; i++) {
      let buttonX = startX + (i * spacing);
      
      if (mouseX > buttonX - buttonWidth / 2 && 
          mouseX < buttonX + buttonWidth / 2 && 
          mouseY > buttonY - buttonHeight / 2 && 
          mouseY < buttonY + buttonHeight / 2) {
        // Sélectionner cette difficulté
        difficulty = difficulties[i];
        console.log("Difficulty selected:", difficulty);
        return;
      }
    }
    
    // Vérifier le clic sur le bouton START GAME
    let playButtonX = width / 2;
    let playButtonY = height / 2 + 150;
    let playButtonWidth = 250;
    let playButtonHeight = 60;
    
    if (mouseX > playButtonX - playButtonWidth / 2 && 
        mouseX < playButtonX + playButtonWidth / 2 && 
        mouseY > playButtonY - playButtonHeight / 2 && 
        mouseY < playButtonY + playButtonHeight / 2) {
      
      // Initialiser les sons au premier clic (requis par les navigateurs)
      if (!soundsInitialized) {
        initSounds();
        soundsInitialized = true;
      }
      
      // Appliquer les paramètres de difficulté
      applyDifficulty();
      
      // Démarrer le jeu
      gameState = "playing";
      
      // Jouer un son de démarrage
      if (eatSound) {
        eatSound.amp(0.3, 0.05);
        eatSound.freq(600);
        setTimeout(() => {
          eatSound.freq(800, 0.1);
          setTimeout(() => {
            eatSound.amp(0, 0.2);
          }, 100);
        }, 100);
      }
    }
  }
  
  // Si on est en game over et qu'on clique sur les boutons
  if (gameOver) {
    let buttonWidth = 220;
    let buttonHeight = 60;
    let restartButtonX = width / 2 - 140;
    let menuButtonX = width / 2 + 140;
    let buttonY = height / 2 + 80;
    
    // Vérifier le clic sur le bouton RESTART (même niveau)
    if (mouseX > restartButtonX - buttonWidth / 2 && 
        mouseX < restartButtonX + buttonWidth / 2 && 
        mouseY > buttonY - buttonHeight / 2 && 
        mouseY < buttonY + buttonHeight / 2) {
      // Redémarrer le jeu avec le même niveau de difficulté
      resetGame();
      gameState = "playing";
      console.log("Restarting game with difficulty:", difficulty);
      return;
    }
    
    // Vérifier le clic sur le bouton BACK TO MENU
    if (mouseX > menuButtonX - buttonWidth / 2 && 
        mouseX < menuButtonX + buttonWidth / 2 && 
        mouseY > buttonY - buttonHeight / 2 && 
        mouseY < buttonY + buttonHeight / 2) {
      // Retourner au menu pour choisir la difficulté
      resetGame();
      gameState = "menu";
      console.log("Returning to menu");
      return;
    }
  }
}


// ============================================
// FONCTIONS D'AFFICHAGE AMÉLIORÉES
// ============================================

/**
 * Dessine le fond spatial avec étoiles et effet parallax
 */
function drawSpaceBackground() {
  // Gradient du fond : violet foncé vers bleu-violet profond
  for (let y = 0; y < height; y += 2) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(10, 5, 25), color(20, 10, 40), inter);
    stroke(c);
    line(0, y, width, y);
  }
  
  // Dessin des étoiles avec effet parallax
  push();
  stars.forEach(star => {
    // Effet parallax basé sur la position de la souris
    let parallaxX = (mouseX - width / 2) * star.speed * star.layer * 0.01;
    let parallaxY = (mouseY - height / 2) * star.speed * star.layer * 0.01;
    
    let starX = star.x + parallaxX;
    let starY = star.y + parallaxY;
    
    // Wrap around
    if (starX < 0) starX += width;
    if (starX > width) starX -= width;
    if (starY < 0) starY += height;
    if (starY > height) starY -= height;
    
    let b = star.brightness + sin(frameCount * 0.05 + star.x) * 50;
    
    // Grandes étoiles avec glow
    if (star.size > 2) {
      // Glow cyan/rose
      fill(135, 206, 235, b * 0.3); // Sky Blue
      noStroke();
      circle(starX, starY, star.size * 4);
      
      fill(255, 105, 180, b * 0.4); // Hot Pink
      circle(starX, starY, star.size * 2);
    }
    
    // Étoile principale
    let starColor = lerpColor(
      color(135, 206, 235), // Cyan
      color(255, 182, 193), // Light Pink
      noise(star.x * 0.01, star.y * 0.01)
    );
    stroke(starColor.levels[0] * (b / 255), starColor.levels[1] * (b / 255), starColor.levels[2] * (b / 255));
    strokeWeight(star.size);
    point(starX, starY);
  });
  pop();
  
  // Mise à jour et affichage des particules
  updateParticles();
}

/**
 * Affiche le mode actuel avec style futuriste
 */
function drawModeDisplay() {
  push();
  textFont('Space Mono');
  textAlign(LEFT, TOP);
  textSize(18);
  
  // Fond semi-transparent
  fill(10, 5, 25, 180);
  noStroke();
  rect(10, 10, 250, mode === "snake" ? 100 : 40, 10);
  
  // Bordure avec glow
  stroke(0, 206, 209, 150); // Dark Turquoise
  strokeWeight(2);
  noFill();
  rect(10, 10, 250, mode === "snake" ? 100 : 40, 10);
  
  // Texte du mode
  fill(0, 206, 209); // Dark Turquoise
  noStroke();
  text("MODE: " + mode.toUpperCase(), 20, 20);
  
  // Debug info
  if (mode === "snake") {
    textSize(14);
    fill(135, 206, 235, 200);
    text("Target: " + Math.round(target.x) + ", " + Math.round(target.y), 20, 45);
    text("Segments: " + (snake ? snake.anneaux.length : 0), 20, 65);
  }
  pop();
}

/**
 * Affiche le score avec style digital
 */
function drawScoreDisplay() {
  push();
  textFont('Orbitron');
  textAlign(RIGHT, TOP);
  textSize(32);
  
  // Glow effect
  for (let i = 4; i > 0; i--) {
    if (gameOver) {
      fill(255, 20, 147, 40); // Deep Pink
    } else {
      fill(0, 206, 209, 40); // Dark Turquoise
    }
    noStroke();
    text("SCORE: " + score, width - 20 - i, 20 - i);
  }
  
  // Texte principal
  if (gameOver) {
    fill(255, 105, 180); // Hot Pink
  } else {
    fill(0, 255, 255); // Cyan
  }
  noStroke();
  text("SCORE: " + score, width - 20, 20);
  pop();
}

/**
 * Affiche les vies avec cœurs et glow
 */
function drawLivesDisplay() {
  push();
  textAlign(RIGHT, TOP);
  let heartSize = 32;
  let heartSpacing = 40;
  let maxLives = difficultySettings[difficulty].lives;
  let startX = width - 20;
  let startY = 65;
  
  for (let i = 0; i < maxLives; i++) {
    let x = startX - (i * heartSpacing);
    let y = startY;
    
    push();
    translate(x, y);
    
    if (i < lives) {
      // Cœur plein avec glow
      if (invincible && frameCount % 20 < 10) {
        // Clignotement pendant l'invincibilité
        for (let j = 3; j > 0; j--) {
          fill(255, 255, 255, 30);
          noStroke();
          drawHeartShape(0, 0, heartSize + j * 4);
        }
        fill(255, 255, 255, 200);
      } else {
        // Glow rose
        for (let j = 3; j > 0; j--) {
          fill(255, 20, 147, 40);
          noStroke();
          drawHeartShape(0, 0, heartSize + j * 4);
        }
        fill(255, 105, 180); // Hot Pink
      }
      stroke(255, 182, 193);
      strokeWeight(2);
    } else {
      // Cœur vide
      noFill();
      stroke(100, 50, 80, 150);
      strokeWeight(2);
    }
    
    drawHeartShape(0, 0, heartSize);
    pop();
  }
  pop();
}

/**
 * Affiche les instructions avec style moderne
 */
function drawInstructions() {
  push();
  textFont('Poppins');
  textAlign(CENTER, TOP);
  textSize(13);
  
  // Fond semi-transparent
  fill(10, 5, 25, 150);
  noStroke();
  rectMode(CENTER);
  rect(width / 2, 20, 600, 30, 15);
  
  // Texte
  fill(135, 206, 235, 200);
  noStroke();
  text("S: Snake | T: Text | W: Wander | O: Obstacle | D: Debug", width / 2, 20);
  pop();
}

/**
 * Dessine la cible avec effet amélioré
 */
function drawTarget() {
  push();
  // Cible avec effet de pulsation et glow
  let pulseSize = 32 + sin(frameCount * 0.15) * 10;
  
  // Glow externe
  for (let i = 4; i > 0; i--) {
    fill(255, 20, 147, 25); // Deep Pink
    noStroke();
    circle(target.x, target.y, pulseSize * 2.5 + i * 8);
  }
  
  // Cercles concentriques
  fill(255, 20, 147, 150);
  noStroke();
  circle(target.x, target.y, pulseSize * 1.5);
  
  fill(255, 105, 180);
  circle(target.x, target.y, pulseSize);
  
  fill(255, 182, 193);
  circle(target.x, target.y, pulseSize / 2);
  
  fill(255, 255, 255);
  circle(target.x, target.y, pulseSize / 4);
  
  // Croix au centre
  stroke(255, 255, 255, 200);
  strokeWeight(2);
  line(target.x - 10, target.y, target.x + 10, target.y);
  line(target.x, target.y - 10, target.x, target.y + 10);
  
  pop();
}

/**
 * Dessine la nourriture avec particules et rotation
 */
function drawFood() {
  foods.forEach(food => {
    push();
    translate(food.pos.x, food.pos.y);
    
    // Rotation
    rotate(frameCount * 0.02);
    
    // Animation de pulsation
    let pulse = sin(frameCount * 0.1 + food.pos.x * 0.1) * 0.2 + 1;
    
    // Glow externe cyan
    for (let i = 4; i > 0; i--) {
      fill(0, 206, 209, 30); // Dark Turquoise
      noStroke();
      circle(0, 0, food.r * 4 * pulse + i * 6);
    }
    
    // Forme cristalline (hexagone)
    fill(0, 255, 255, 200); // Cyan
    stroke(135, 206, 235);
    strokeWeight(2);
    beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = TWO_PI / 6 * i;
      let x = cos(angle) * food.r * 2 * pulse;
      let y = sin(angle) * food.r * 2 * pulse;
      vertex(x, y);
    }
    endShape(CLOSE);
    
    // Centre brillant
    fill(255, 255, 255);
    noStroke();
    circle(0, 0, food.r * pulse);
    
    // Point de lumière
    fill(255, 255, 255, 220);
    circle(-food.r * 0.4, -food.r * 0.4, food.r * 0.6);
    
    pop();
  });
}

/**
 * Crée des particules lors de la collecte de nourriture
 */
function createFoodParticles(x, y) {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: x,
      y: y,
      vx: random(-3, 3),
      vy: random(-3, 3),
      life: 60,
      maxLife: 60,
      size: random(3, 8),
      color: color(random([0, 255]), random([206, 255]), random([209, 255]))
    });
  }
}

/**
 * Met à jour et affiche les particules
 */
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    
    // Mise à jour
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1; // Gravité
    p.life--;
    
    // Affichage
    push();
    let alpha = map(p.life, 0, p.maxLife, 0, 255);
    fill(p.color.levels[0], p.color.levels[1], p.color.levels[2], alpha);
    noStroke();
    circle(p.x, p.y, p.size * (p.life / p.maxLife));
    pop();
    
    // Suppression
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

/**
 * Dessine une forme de cœur
 */
function drawHeartShape(x, y, size) {
  let s = size / 20;
  beginShape();
  vertex(x, y - 5 * s);
  bezierVertex(x - 5 * s, y - 10 * s, x - 10 * s, y - 5 * s, x - 10 * s, y);
  bezierVertex(x - 10 * s, y + 5 * s, x - 5 * s, y + 8 * s, x, y + 12 * s);
  bezierVertex(x + 5 * s, y + 8 * s, x + 10 * s, y + 5 * s, x + 10 * s, y);
  bezierVertex(x + 10 * s, y - 5 * s, x + 5 * s, y - 10 * s, x, y - 5 * s);
  endShape(CLOSE);
}


// ============================================
// FONCTIONS AUDIO
// ============================================

/**
 * Initialise tous les sons du jeu avec des synthétiseurs
 */
function initSounds() {
  // Musique de fond - mélodie ambient spatiale
  // Pad ambient (fond)
  bgMusic = new p5.Oscillator('sine');
  bgMusic.amp(0);
  bgMusic.freq(220);
  bgMusic.start();
  
  // Basse douce
  bgMusicBass = new p5.Oscillator('triangle');
  bgMusicBass.amp(0);
  bgMusicBass.freq(110);
  bgMusicBass.start();
  
  // Mélodie principale
  bgMusicMelody = new p5.Oscillator('sine');
  bgMusicMelody.amp(0);
  bgMusicMelody.freq(440);
  bgMusicMelody.start();
  
  // Son de manger - bip court et aigu
  eatSound = new p5.Oscillator('triangle');
  eatSound.amp(0);
  eatSound.freq(800);
  eatSound.start();
  
  // Son de game over - son grave descendant
  gameOverSound = new p5.Oscillator('sawtooth');
  gameOverSound.amp(0);
  gameOverSound.freq(200);
  gameOverSound.start();
  
  // Son d'alerte ennemi - oscillation rapide
  enemyAlertSound = new p5.Oscillator('square');
  enemyAlertSound.amp(0);
  enemyAlertSound.freq(400);
  enemyAlertSound.start();
}

/**
 * Joue la musique de fond en boucle - mélodie arcade amusante
 */
function playBackgroundMusic() {
  if (!soundsInitialized) return; // Ne rien faire si les sons ne sont pas initialisés
  
  if (bgMusic && bgMusicBass && bgMusicMelody && gameState === "playing" && !gameOver) {
    // Mélodie arcade amusante - style jeu rétro
    // Séquence de notes joyeuses: Do, Ré, Mi, Sol, La, Sol, Mi, Do
    let melodyNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 783.99, 659.25, 523.25]; // C5, D5, E5, G5, A5, G5, E5, C5
    let noteIndex = floor((frameCount / 30) % melodyNotes.length); // Change toutes les 0.5 secondes
    let melodyFreq = melodyNotes[noteIndex];
    
    // Mélodie principale - plus forte et claire
    bgMusicMelody.amp(0.08, 0.05);
    bgMusicMelody.freq(melodyFreq, 0.05);
    
    // Basse rythmique - style arcade
    let bassNotes = [130.81, 130.81, 164.81, 164.81]; // C3, C3, E3, E3
    let bassIndex = floor((frameCount / 60) % bassNotes.length);
    bgMusicBass.amp(0.06, 0.1);
    bgMusicBass.freq(bassNotes[bassIndex], 0.1);
    
    // Pad harmonique doux en arrière-plan
    bgMusic.amp(0.02, 0.3);
    let padFreq = 261.63; // C4
    bgMusic.freq(padFreq, 0.2);
    
  } else if (bgMusic && bgMusicBass && bgMusicMelody) {
    // Arrêter la musique si pas en jeu
    bgMusic.amp(0, 0.5);
    bgMusicBass.amp(0, 0.5);
    bgMusicMelody.amp(0, 0.5);
  }
}

/**
 * Joue le son quand le snake mange - son amusant
 */
function playEatSound() {
  if (!soundsInitialized || !eatSound) return;
  
  // Son "miam" amusant qui monte
  eatSound.amp(0.25, 0.02);
  eatSound.freq(600);
  setTimeout(() => {
    eatSound.freq(800, 0.03);
    setTimeout(() => {
      eatSound.freq(1000, 0.03);
      setTimeout(() => {
        eatSound.amp(0, 0.05);
      }, 30);
    }, 30);
  }, 30);
}

/**
 * Joue le son de game over
 */
function playGameOverSound() {
  if (!soundsInitialized || !gameOverSound) return;
  
  gameOverSound.amp(0.3, 0.1);
  gameOverSound.freq(200);
  // Descente de fréquence pour effet dramatique
  setTimeout(() => {
    gameOverSound.freq(150, 0.3);
    setTimeout(() => {
      gameOverSound.freq(100, 0.5);
      setTimeout(() => {
        gameOverSound.amp(0, 0.5);
      }, 500);
    }, 300);
  }, 100);
}

/**
 * Joue le son d'alerte quand un ennemi poursuit
 */
function playEnemyAlertSound() {
  if (!soundsInitialized || !enemyAlertSound) return;
  
  if (frameCount % 30 === 0) {
    enemyAlertSound.amp(0.1, 0.05);
    enemyAlertSound.freq(400);
    setTimeout(() => {
      enemyAlertSound.freq(500, 0.05);
      setTimeout(() => {
        enemyAlertSound.amp(0, 0.1);
      }, 50);
    }, 50);
  }
}


/**
 * Applique les paramètres de difficulté sélectionnée
 */
function applyDifficulty() {
  let settings = difficultySettings[difficulty];
  
  // Appliquer le nombre de vies
  lives = settings.lives;
  
  // Supprimer tous les ennemis existants
  enemies = [];
  
  // Créer le nombre d'ennemis selon la difficulté avec agressivité ajustée
  for (let i = 0; i < settings.enemyCount; i++) {
    let enemy = new VehicleWander(random(width), random(height), true);
    enemy.maxSpeed = settings.enemySpeed;
    enemy.detectionRadius = settings.detectionRadius; // Rayon de détection
    enemy.loseInterestRadius = settings.detectionRadius + 100; // Rayon de perte d'intérêt
    enemy.pursueForce = settings.pursueForce; // Force de poursuite
    enemies.push(enemy);
  }
  
  console.log("Difficulty applied:", difficulty, 
              "- Lives:", lives, 
              "- Enemies:", enemies.length,
              "- Detection:", settings.detectionRadius,
              "- Pursue force:", settings.pursueForce);
}
