
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const players = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);
  players[socket.id] = { x: 100, y: 100, bullets: [] };

  socket.emit("init", { id: socket.id, players });

  socket.broadcast.emit("newPlayer", { id: socket.id, x: 100, y: 100 });

  socket.on("move", (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      io.emit("updatePlayers", players);
    }
  });

  socket.on("shoot", (bullet) => {
    if (players[socket.id]) {
      players[socket.id].bullets.push(bullet);
      io.emit("bulletFired", { id: socket.id, bullet });
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("removePlayer", socket.id);
  });
});

http.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
