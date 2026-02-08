class Food {
  constructor(x, y, r, couleur) {
    this.pos = createVector(x, y);
    this.r = r;
    this.couleur = couleur;
  }

  show() {
    push();
    noStroke();
    fill(this.couleur);
    ellipse(this.pos.x, this.pos.y, this.r * 2);
    // petit highlight pour la rendre plus visible
    fill(255, 255, 255, 100);
    ellipse(this.pos.x - this.r / 3, this.pos.y - this.r / 3, this.r);
    pop();
  }
}
