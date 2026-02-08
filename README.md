# Auteur : Khawla ALAOUI

# Snake Game - Space Edition

---

## Écrans du Jeu

### Menu Principal (Rampage)
Écran d'accueil avec sélection de difficulté (Easy, Normal, Hard), description des paramètres selon le mode, et bouton START GAME pour lancer la partie. Design glassmorphism avec effets néon et typographie futuriste (Orbitron, Exo 2, Poppins, Space Mono).
<img width="1470" height="925" alt="Screenshot 2026-02-08 at 4 41 11 AM" src="https://github.com/user-attachments/assets/26519560-c565-4892-a986-bc690adf552b" />


### Écran de Jeu (Game)
Le joueur contrôle un serpent spatial à la souris (comportement arrive), collecte de la nourriture pour grandir et augmenter le score, évite les ennemis (poursuite intelligente avec pursue / wander) et les obstacles cristallins. Barre de cœurs (vies), score et mode affichés en haut. Déplacement et IA reposent uniquement sur les comportements de steering (arrive, seek, pursue, wander, avoid).
<img width="1468" height="771" alt="Screenshot 2026-02-08 at 5 07 46 AM" src="https://github.com/user-attachments/assets/d4d7b581-7513-4ab9-aa73-2f832263a5d3" />



### Écran Debug
Mode Debug activé avec touche D, permettant de visualiser :

- Activation avec **D**  
- Visualisation :  
  - Cercles de collision  
  - Flèches vecteurs vitesse  
  - Rayons de détection des ennemis  
  - Trails lumineux (historique des positions)  
  - Lignes de cible et labels type d’ennemi
<img width="1470" height="765" alt="image" src="https://github.com/user-attachments/assets/16446c0e-dc61-41b2-b90d-5c466fc5e8e2" />


### Écran Game Over
Message « GAME OVER » avec effet glitch, score final, statistiques, et boutons RESTART / BACK TO MENU.
<img width="1466" height="953" alt="Screenshot 2026-02-08 at 4 44 16 AM" src="https://github.com/user-attachments/assets/bb5febd3-4eda-4e9c-adbc-f64581585b2f" />


---

## Objectif du Projet

Créer un Snake Game spatial **conforme aux concepts de steering behaviors de Craig Reynolds**, où toutes les entités (serpent, ennemis, obstacles, segments) sont des sous-classes de **Vehicle** et utilisent uniquement les méthodes de steering de la classe de base.

---

## Concept du Jeu

Snake Game - Space Edition est un jeu de survie spatial top-down développé avec p5.js. Le joueur contrôle un serpent, collecte de la nourriture, évite ennemis intelligents et obstacles, avec tous les mouvements pilotés par des comportements de steering : **seek, arrive, pursue, wander, avoid**.

---
## Comment Jouer

| Contrôle | Action |
|----------|--------|
| **Souris** | Déplacer le serpent (comportement arrive vers la souris) |
| **S** | Mode Snake (classique) |
| **T** | Mode Text (le serpent forme un texte personnalisé) |
| **W** | Ajouter un wander neutre |
| **O** | Ajouter un obstacle |
| **E** | Ajouter un ennemi |
| **D** | Activer / désactiver le mode Debug |
| **R** | Restart (si game over) |
| **Menu** | Choisir une difficulté (Easy, Normal, Hard), puis cliquer START GAME pour lancer |

---

## Contrôles Interactifs et Expérience Personnalisable

Le jeu offre une expérience personnalisable grâce à des contrôles interactifs :

### Ajout de Wanders (Touche W)
- Appuyez sur **W** pour ajouter un wander neutre (serpent orange) qui se déplace de manière erratique  
- Les wanders utilisent le comportement **wander** (mouvement aléatoire naturel)  
- Ils évitent automatiquement les obstacles avec le comportement **avoid**  
- Ils ne sont pas hostiles et ne poursuivent pas le joueur  
- Utile pour rendre l'environnement plus vivant et dynamique  

### Ajout d'Obstacles (Touche O)
- Appuyez sur **O** pour ajouter un obstacle cristallin à la position de la souris  
- Les obstacles sont des octogones verts avec rotation et pulsation  
- Tous les véhicules (serpent, ennemis, wanders) les évitent automatiquement  
- Permet de créer des parcours personnalisés et d'augmenter la difficulté  

### Mode Text (Touche T)
- Appuyez sur **T** pour activer le mode Text  
- Saisissez un texte dans le champ en bas de l'écran  
- Le serpent forme le texte saisi : chaque segment arrive vers un point du texte  
- Le texte est converti en points avec `font.textToPoints()` (police Inconsolata)  
- Taille du texte : 150px, centré à l'écran  
- Permet de créer des formes artistiques et des messages personnalisés


---

## Difficulté

| Mode | Vies | Ennemis | Vitesse | Rayon Détection | Force Poursuite |
|------|------|---------|---------|-----------------|-----------------|
| Easy | 5 | 3 | 2 | 100 px | 0.5 |
| Normal | 3 | 5 | 3 | 150 px | 0.8 |
| Hard | 2 | 7 | 4 | 200 px | 1.0 |

---

## IA et Steering Behaviors

| Comportement | Quand | Comment | Pourquoi |
|--------------|-------|--------|----------|
| **Arrive** | Serpent vers souris, segments vers segment précédent, mode Text vers points | Vitesse réduite progressivement dans rayon de ralentissement (`slowRadius: 50px`) | Mouvement fluide sans dépassement, évite effet "accordéon" |
| **Seek** | Base pour Arrive et Pursue | Vecteur désiré = `normalize(target - position) × maxSpeed - velocity` | Force de base pour tous mouvements dirigés |
| **Pursue** | Ennemi détecte joueur dans rayon (100-200px selon difficulté) | Prédit position future (`position + velocity × 5 frames`) puis seek vers prédiction | IA anticipe mouvements, interception réaliste |
| **Wander** | Ennemis hors détection, wanders neutres (orange) | Cercle projeté devant (100px), point aléatoire sur cercle (rayon 50px), angle ±0.3 rad | Mouvement erratique naturel, exploration |
| **Avoid** | Tous véhicules face aux obstacles | Détection dans rayon 100px, force répulsion inversement proportionnelle à distance (×2) | Évite collisions, sécurité des véhicules |

---

## Difficultés Rencontrées
- Ajuster les vecteurs de steering pour un déplacement fluide  
- Synchronisation pursue / wander des ennemis avec collisions  
- Conversion texte en points (mode Text) sans chevauchement  
- Optimisation performance avec plusieurs entités sur l’écran  


## Outils IA Utilisés

### Antigravity (avec ChatGPT)
**Rôle** : Développement et assistance dans la mise en œuvre des comportements, résolution de bugs et documentation.

**Utilisation** :
- Implémentation des steering behaviors
- Architecture des classes (Snake, SnakeVehicle, VehicleWander, Obstacle)
- Optimisation des performances (particules, trails)
- Design visuel (glassmorphism, néon, glow)
- Audio synthétique avec p5.sound
- Génération de documentation et vérification du respect des règles

---

## Méthode de Travail avec Antigravity

1. **Définition des règles strictes** pour guider l’IA
2. **Développement itératif** : ajout progressif des fonctionnalités
3. **Validation continue** : comportement correct et respect des règles
4. **Documentation complète** : traçabilité des choix et explications
5. **Avantages** : clarté, cohérence, apprentissage, qualité et rapidité

---

## Partie Technique

### Architecture du projet

| Fichier / Dossier       | Rôle / Classe                 | Description |
|------------------------|-------------------------------|-------------|
| index.html             | Point d'entrée HTML           | Charge le jeu dans le navigateur |
| style.css              | Styles                        | Glassmorphism, typographie, couleurs, HUD |
| sketch.js              | Fichier principal             | Boucle 60FPS, gestion états (menu, jeu, gameOver), UI, audio, particules, collisions, contrôles clavier/souris |
| vehicle.js             | Classe Vehicle (base)         | Position, vélocité, accélération, forces (seek, arrive, wander, avoid), mise à jour et affichage (INTOUCHABLE) |
| snake.js               | Classe Snake                  | Gère le serpent principal : segments, suivi fluide, croissance, collision avec soi-même, wrap around |
| snakeVehicle.js        | Segment du serpent            | Affichage des segments et tête avec gradient, glow et yeux expressifs |
| vehicleWander.js       | Ennemi ou Wander              | Comportements wander/pursue, détection joueur, avoid obstacles, trail pour effet de mouvement, wrap around |
| obstacle.js            | Classe Obstacle               | Octogone vert statique, rotation et pulsation, évité par tous véhicules |
| food.js                | Classe Food                   | Hexagone cyan, rotation et glow, collectée par le serpent |
| assets/                | Dossier assets                | inconsolata.otf : police pour le mode Text (texte converti en points pour le serpent) |
| libraries/             | Bibliothèques externes        | p5.min.js : dessin et animation, p5.sound.min.js : sons et musiques |

---

## Améliorations Futures

### Gameplay
- Système de niveaux progressifs (difficulté augmente avec score)
- Power-ups : vitesse temporaire, invincibilité, ralentissement ennemis
- Boss fights : Ennemis spéciaux plus gros avec patterns complexes

### Steering Behaviors
- Flee : Wanders fuient les ennemis
- Separation : Ennemis se séparent entre eux
- Flocking : Ennemis en groupe (cohesion + alignment + separation)

### Technique
- Optimisation conversion texte → points (cache des résultats)
- Quadtree pour détection collisions (performance avec 50+ entités)
- WebGL pour effets visuels avancés

### Visuel
- Effets de collision (explosion de particules)
- Trail plus long pour ennemis (50 positions au lieu de 25)
- Thèmes visuels sélectionnables (spatial, cyberpunk, rétro)

---

## Démonstration du jeu

Vidéo de démonstration YouTube : https://www.youtube.com/watch?v=BjmyPvC_V68

Jeu en ligne (déployé) : https://khawlatoun.itch.io/snakenova




