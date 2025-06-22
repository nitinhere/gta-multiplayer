const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let players = {};
let myId = null;

document.addEventListener("keydown", (e) => {
  const me = players[myId];
  if (!me) return;

  if (e.key === "ArrowUp") me.y -= 5;
  if (e.key === "ArrowDown") me.y += 5;
  if (e.key === "ArrowLeft") me.x -= 5;
  if (e.key === "ArrowRight") me.x += 5;
  if (e.key === " ") {
    const bullet = { x: me.x + 10, y: me.y };
    socket.emit("shoot", bullet);
  }

  socket.emit("move", { x: me.x, y: me.y });
});

socket.on("init", (data) => {
  myId = data.id;
  players = data.players;
});

socket.on("newPlayer", (data) => {
  players[data.id] = { x: data.x, y: data.y, bullets: [] };
});

socket.on("updatePlayers", (updatedPlayers) => {
  players = updatedPlayers;
});

socket.on("bulletFired", ({ id, bullet }) => {
  if (players[id]) players[id].bullets.push(bullet);
});

socket.on("removePlayer", (id) => {
  delete players[id];
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let id in players) {
    const p = players[id];
    ctx.fillStyle = id === myId ? "blue" : "red";
    ctx.fillRect(p.x, p.y, 20, 20);
    ctx.fillStyle = "black";
    p.bullets.forEach(b => {
      b.x += 5;
      ctx.fillRect(b.x, b.y + 8, 5, 5);
    });
  }
  requestAnimationFrame(gameLoop);
}

gameLoop();
