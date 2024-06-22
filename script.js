// Configuration initiale
let timer = 0; // Temps initial
let fluid;

const config = {
  FRAME_RATE: 10,
  VISCOSITY: 1000000000,
  SCALE: 4,
  N: 256, // taile de lagrille
  ITER: 6
};

// Converti une pos (x,y) en un indice à une dimension
let valConverter = (x, y) => x + y * config.N;

function setup() {
  // creation du fluide
  createCanvas(800, 600);
  frameRate(config.FRAME_RATE);
  console.log(config.VISCOSITY)
  fluid = new Fluid(8, 0, 1 / config.VISCOSITY);
}

function draw() {

  const centreX = int((0.5 * width) / config.SCALE);
  const centreY = int((0.5 * height) / config.SCALE);

  // Ajoute une densité aléatoire au point d'effusion
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      fluid.addDensity(centreX + i, centreY + j, random(0, 1000));
    }
  }

  // Ajouter de la vélocité centrée
  for (let i = 0; i < 2; i++) {
    const angle = noise(timer) * TWO_PI * 2; // Génére un angle aléatoire basé sur le bruit
    const vecteur = p5.Vector.fromAngle(angle); // Créer le vecteur à partir de l'angle calculé
    vecteur.mult(0.2); // Ajuste la magnétude
    fluid.addVelocity(centreX, centreY, vecteur.x, vecteur.y);

    timer += 0.01;
  }

  fluid.step();
  fluid.renderDensity(); // Rendre la densité sur le canevas
}


// Classe représentant un fluide
class Fluid {
  constructor(dt, diffusion, viscosity) {
    this.size = config.N;
    this.dt = dt;  // temps d'incrementation
    this.diff = diffusion;
    this.visc = viscosity;

    // Initialisation des tableaux pour la densité et les vitesses
    this.s = Array(config.N * config.N).fill(0); // Source de densité
    this.density = Array(config.N * config.N).fill(0); // Densité

    this.Vx = Array(config.N * config.N).fill(0); // Vitesse en x
    this.Vy = Array(config.N * config.N).fill(0); // Vitesse en y

    this.Vx0 = Array(config.N * config.N).fill(0); // Vitesse temporaire en x
    this.Vy0 = Array(config.N * config.N).fill(0); // Vitesse temporaire en y
  }

  // Méthode pour effectuer une étape de la simulation
  step() {
    const visc = this.visc;
    const diff = this.diff;
    const dt = this.dt;
    const { Vx, Vy, Vx0, Vy0, s, density } = this;

    // Diffusion de la vitesse
    diffuse(1, Vx0, Vx, visc, dt);
    diffuse(2, Vy0, Vy, visc, dt);

    // Projeter les vitesses pour assurer la conservation de la masse
    project(Vx0, Vy0, Vx, Vy);

    // Advection de la vitesse (transport de la quantité de mouvement)
    advect(1, Vx, Vx0, Vx0, Vy0, dt);
    advect(2, Vy, Vy0, Vx0, Vy0, dt);

    // Projeter de nouveau pour ajuster les vitesses
    project(Vx, Vy, Vx0, Vy0);

    // Diffusion de la densité
    diffuse(0, s, density, diff, dt);

    // Advection de la densité (transport de la masse)
    advect(0, density, s, Vx, Vy, dt);
  }

  // Ajouter de la densité à une position donnée
  addDensity(x, y, amount) {
    const index = valConverter(x, y);
    this.density[index] += amount;
  }

  // Ajouter de la vitesse à une position donnée
  addVelocity(x, y, amountX, amountY) {
    const index = valConverter(x, y);
    this.Vx[index] += amountX;
    this.Vy[index] += amountY;
  }

  // Méthode pour afficher la densité sous forme de carrés colorés
  renderDensity() {
    for (let i = 0; i < config.N; i++) {
      for (let j = 0; j < config.N; j++) {
        const x = i * config.SCALE;
        const y = j * config.SCALE;
        const d = this.density[valConverter(i, j)];
        fill(d);
        noStroke();
        rect(x, y, config.SCALE, config.SCALE);
      }
    }
  }

}

function advect(b, d, d0, velocX, velocY, dt) {
  let deltaX = dt * (config.N - 2);
  let deltaY = deltaX

  let s0, s1, t0, t1;
  let i0, i1, j0, j1;
  let xPos, yPos;

  const maxDimension = config.N - 2;

  for (let j = 1; j < config.N - 1; j++) {
    for (let i = 1; i < config.N - 1; i++) {
      xPos = i - deltaX * velocX[valConverter(i, j)];
      yPos = j - deltaY * velocY[valConverter(i, j)];

      if (xPos < 0.5) xPos = 0.5;
      if (xPos > maxDimension + 0.5) xPos = maxDimension + 0.5;

      if (yPos < 0.5) yPos = 0.5;
      if (yPos > maxDimension + 0.5) yPos = maxDimension + 0.5;

      i0 = Math.floor(xPos);
      i1 = i0 + 1;
      j0 = Math.floor(yPos);
      j1 = j0 + 1;

      s1 = xPos - i0;
      s0 = 1 - s1;
      t1 = yPos - j0;
      t0 = 1 - t1;

      d[valConverter(i, j)] =
        s0 * (t0 * d0[valConverter(i0, j0)] + t1 * d0[valConverter(i0, j1)]) +
        s1 * (t0 * d0[valConverter(i1, j0)] + t1 * d0[valConverter(i1, j1)]);
    }
  }

}

// calcul et Diffuse les valeurs dans la grille
function diffuse(b, x, x0, diff, dt) {
  const a = dt * diff * (config.N - 2) * (config.N - 2);
  lin_solve(b, x, x0, a, 1 + 6 * a);
}


// Fonction de résolution linéaire pour diffusion
function lin_solve(b, x, x0, a, c) {
  const invC = 1.0 / c;

  for (let k = 0; k < config.ITER; k++) {
    for (let j = 1; j < config.N - 1; j++) {
      for (let i = 1; i < config.N - 1; i++) {
        x[valConverter(i, j)] =
          (x0[valConverter(i, j)] + a *
            (x[valConverter(i + 1, j)] +
              x[valConverter(i - 1, j)] +
              x[valConverter(i, j + 1)] +
              x[valConverter(i, j - 1)])) * invC;
      }
    }
  }
}

// Fonction de projection : ajuste les vitesses pour assurer la conservation de la masse.
function project(velocX, velocY, p, div) {
  for (let j = 1; j < config.N - 1; j++) {
    for (let i = 1; i < config.N - 1; i++) {
      div[valConverter(i, j)] =
        (-0.5 *
          (velocX[valConverter(i + 1, j)] - velocX[valConverter(i - 1, j)] +
            velocY[valConverter(i, j + 1)] - velocY[valConverter(i, j - 1)])) / config.N;
      p[valConverter(i, j)] = 0;
    }
  }

  lin_solve(0, p, div, 1, 6);

  for (let j = 1; j < config.N - 1; j++) {
    for (let i = 1; i < config.N - 1; i++) {
      velocX[valConverter(i, j)] -= 0.5 * (p[valConverter(i + 1, j)] - p[valConverter(i - 1, j)]) * config.N;
      velocY[valConverter(i, j)] -= 0.5 * (p[valConverter(i, j + 1)] - p[valConverter(i, j - 1)]) * config.N;
    }
  }

}
