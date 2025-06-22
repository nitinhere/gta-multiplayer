const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let players = {};
let myId = null;

HEAD
// Movement controls
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

document.addEventListener("keydown", (e) => {
  if (e.key in keys) keys[e.key] = true;
  if (e.key === " ") {
    shoot();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key in keys) keys[e.key] = false;
});

// Move and emit updates
function updatePosition() {
  const me = players[myId];
  if (!me) return;

  let moved = false;
  if (keys.ArrowUp) { me.y -= 3; moved = true; }
  if (keys.ArrowDown) { me.y += 3; moved = true; }
  if (keys.ArrowLeft) { me.x -= 3; moved = true; }
  if (keys.ArrowRight) { me.x += 3; moved = true; }

  if (moved) {
    socket.emit("move", { x: me.x, y: me.y });
  }
}

// Shooting logic
function shoot() {
  const me = players[myId];
  if (!me) return;
  const bullet = { x: me.x + 10, y: me.y + 8 };
  socket.emit("shoot", bullet);
}

// Drawing everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let id in players) {
    const p = players[id];

    // Draw player
    ctx.fillStyle = id === myId ? "blue" : "red";
    ctx.fillRect(p.x, p.y, 20, 20);

    // Draw bullets
    ctx.fillStyle = "black";
    p.bullets = p.bullets || [];
    p.bullets.forEach((b, i) => {
      b.x += 5;
      ctx.fillRect(b.x, b.y, 5, 5);

      // Remove off-screen bullets
      if (b.x > canvas.width) p.bullets.splice(i, 1);
    });
  }
}

function gameLoop() {
  updatePosition();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  const me = players[myId];
  if (!me) return;

  if (e.key  "ArrowUp") me.y -= 5;
  if (e.key  "ArrowDown") me.y += 5;
  if (e.key "ArrowLeft") me.x -= 5;
  if (e.key  "ArrowRight") me.x += 5;
  if (e.key  " ") {
    const bullet = { x: me.x + 10, y: me.y };
    socket.emit("shoot", bullet);
  }

  socket.emit("move", { x: me.x, y: me.y });
});
9f235d0324fd1f7c7a55d01359894ae5e6928beb

socket.on("init", (data) => {
  myId = data.id;
  players = data.players;
});

socket.on("newPlayer", (data) => {
  players[data.id] = { x: data.x, y: data.y, bullets: [] };
});

HEAD
socket.on("updatePlayers", (updated) => {
  players = updated;
});

socket.on("bulletFired", ({ id, bullet }) => {
  if (players[id]) {
    players[id].bullets = players[id].bullets || [];
    players[id].bullets.push(bullet);
  }

socket.on("updatePlayers", (updatedPlayers) => {
  players = updatedPlayers;
});

socket.on("bulletFired", ({ id, bullet }) => {
  if (players[id]) players[id].bullets.push(bullet);
9f235d0324fd1f7c7a55d01359894ae5e6928beb
});

socket.on("removePlayer", (id) => {
  delete players[id];
});

HEAD

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let id in players) {
    const p = players[id];
    ctx.fillStyle = id  myId ? "blue" : "red";
    ctx.fillRect(p.x, p.y, 20, 20);
    ctx.fillStyle = "black";
    p.bullets.forEach(b => {
      b.x += 5;
      ctx.fillRect(b.x, b.y + 8, 5, 5);
    });
  }
  requestAnimationFrame(gameLoop);
}

9f235d0324fd1f7c7a55d01359894ae5e6928beb
gameLoop();
