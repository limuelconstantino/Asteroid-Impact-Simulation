const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");

const sizeInput = document.getElementById("size");
const velocityInput = document.getElementById("velocity");
const angleInput = document.getElementById("angle");
const angleValue = document.getElementById("angleValue");
const surfaceInput = document.getElementById("surface");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const statSize = document.getElementById("stat-size");
const statVelocity = document.getElementById("stat-velocity");
const statAngle = document.getElementById("stat-angle");
const statSurface = document.getElementById("stat-surface");
const statEnergy = document.getElementById("stat-energy");
const statusEl = document.getElementById("status");

let asteroid = null;
let explosion = null;
let animationFrame = null;
let isPaused = false;
let stars = [];

function resizeCanvasForDisplay() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width);
  canvas.height = 440;
}

function createStars(count) {
  stars = [];
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height * 0.65),
      r: Math.random() * 1.6 + 0.3,
      twinkle: Math.random() * Math.PI * 2
    });
  }
}

function getSurfaceColor(surface) {
  const map = {
    Ocean: "#1a6ab8",
    Desert: "#b08542",
    Forest: "#2e7d32",
    City: "#4a4f57",
    Ice: "#98c8e8"
  };
  return map[surface] || "#2e7d32";
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#050813");
  sky.addColorStop(0.7, "#132548");
  sky.addColorStop(1, "#1b3153");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const s of stars) {
    s.twinkle += 0.03;
    const alpha = 0.45 + (Math.sin(s.twinkle) + 1) * 0.25;
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const surface = surfaceInput.value;
  ctx.fillStyle = getSurfaceColor(surface);
  ctx.fillRect(0, canvas.height - 90, canvas.width, 90);

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  for (let x = 0; x < canvas.width; x += 30) {
    ctx.fillRect(x, canvas.height - 90, 18, 4);
  }
}

function computeEnergy(size, velocity, angle) {
  const massProxy = size * size * size;
  const velocityFactor = velocity * velocity;
  const angleFactor = Math.sin((angle * Math.PI) / 180);
  return (massProxy * velocityFactor * angleFactor) / 1200;
}

function updateStats(size, velocity, angle, surface, status) {
  statSize.textContent = `${size} km`;
  statVelocity.textContent = `${velocity} km/s`;
  statAngle.textContent = `${angle}°`;
  statSurface.textContent = surface;
  statEnergy.textContent = `${computeEnergy(size, velocity, angle).toFixed(1)} Mt TNT`;
  statusEl.textContent = status;
}

function createAsteroid() {
  const size = Number(sizeInput.value);
  const velocity = Number(velocityInput.value);
  const angle = Number(angleInput.value);

  const radians = (angle * Math.PI) / 180;
  const speed = velocity / 5;

  asteroid = {
    x: 40,
    y: 50,
    vx: Math.cos(radians) * speed,
    vy: Math.sin(radians) * speed,
    radius: Math.max(6, size * 1.35)
  };
}

function drawAsteroid() {
  if (!asteroid) {
    return;
  }

  ctx.beginPath();
  ctx.arc(asteroid.x - asteroid.radius * 1.5, asteroid.y, asteroid.radius * 0.8, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 121, 48, 0.5)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#8d6e63";
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function updateExplosion(x, y, radius) {
  explosion = { x, y, radius, life: 32 };
}

function drawExplosion() {
  if (!explosion) {
    return;
  }

  explosion.life -= 1;
  const grow = 1 + (32 - explosion.life) * 0.22;
  const outer = explosion.radius * grow;
  const inner = outer * 0.55;

  ctx.beginPath();
  ctx.arc(explosion.x, explosion.y, outer, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 92, 43, 0.42)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(explosion.x, explosion.y, inner, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 208, 94, 0.55)";
  ctx.fill();

  if (explosion.life <= 0) {
    explosion = null;
  }
}

function animate() {
  drawBackground();

  if (!isPaused && asteroid) {
    asteroid.x += asteroid.vx;
    asteroid.y += asteroid.vy;

    const groundY = canvas.height - 90;
    if (asteroid.y + asteroid.radius >= groundY) {
      updateExplosion(asteroid.x, groundY, asteroid.radius * 2);
      asteroid = null;
      statusEl.textContent = "Impact Detected!";
    }
  }

  drawAsteroid();
  drawExplosion();

  animationFrame = requestAnimationFrame(animate);
}

function startSimulation() {
  isPaused = false;
  createAsteroid();
  updateStats(
    Number(sizeInput.value),
    Number(velocityInput.value),
    Number(angleInput.value),
    surfaceInput.value,
    "Simulation Running"
  );
}

function pauseSimulation() {
  isPaused = !isPaused;
  statusEl.textContent = isPaused ? "Paused" : "Simulation Running";
}

function resetSimulation() {
  asteroid = null;
  explosion = null;
  isPaused = false;
  updateStats(
    Number(sizeInput.value),
    Number(velocityInput.value),
    Number(angleInput.value),
    surfaceInput.value,
    "Waiting..."
  );
}

angleInput.addEventListener("input", () => {
  angleValue.textContent = `${angleInput.value}°`;
  statAngle.textContent = `${angleInput.value}°`;
});

sizeInput.addEventListener("input", resetSimulation);
velocityInput.addEventListener("input", resetSimulation);
surfaceInput.addEventListener("change", resetSimulation);

startBtn.addEventListener("click", startSimulation);
pauseBtn.addEventListener("click", pauseSimulation);
resetBtn.addEventListener("click", resetSimulation);

window.addEventListener("resize", () => {
  resizeCanvasForDisplay();
  createStars(120);
});

resizeCanvasForDisplay();
createStars(120);
resetSimulation();
animate();