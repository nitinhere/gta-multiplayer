
const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let playerId;
let players = {};

const keys = {};
const speed = 3;
const bullets = [];

window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

socket.on("init", (data) => {
  playerId = data.id;
  players = data.players;
});

socket.on("newPlayer", (data) => {
  players[data.id] = { x: data.x, y: data.y, bullets: [] };
});

socket.on("updatePlayers", (data) => {
  players = data;
});

socket.on("removePlayer", (id) => {
  delete players[id];
});

socket.on("bulletFired", ({ id, bullet }) => {
  if (players[id]) {
    players[id].bullets.push(bullet);
  }
});

function shoot() {
  const player = players[playerId];
  const bullet = { x: player.x + 20, y: player.y + 10, dx: 5, dy: 0 };
  bullets.push(bullet);
  socket.emit("shoot", bullet);
}

function update() {
  const p = players[playerId];
  if (!p) return;

  if (keys["ArrowUp"]) p.y -= speed;
  if (keys["ArrowDown"]) p.y += speed;
  if (keys["ArrowLeft"]) p.x -= speed;
  if (keys["ArrowRight"]) p.x += speed;
  if (keys[" "]) shoot();

  socket.emit("move", { x: p.x, y: p.y });

  bullets.forEach(b => b.x += b.dx);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw buildings
  ctx.fillStyle = "#222";
  ctx.fillRect(200, 100, 100, 100);
  ctx.fillRect(500, 300, 120, 120);

  // Draw players
  for (let id in players) {
    const p = players[id];
    ctx.fillStyle = id === playerId ? "red" : "blue";
    ctx.fillRect(p.x, p.y, 40, 20);

    // Draw bullets
    ctx.fillStyle = "yellow";
    (p.bullets || []).forEach(b => ctx.fillRect(b.x, b.y, 5, 5));
  }

  // Local bullets
  bullets.forEach(b => ctx.fillRect(b.x, b.y, 5, 5));
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
