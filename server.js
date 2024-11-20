const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
    res.send("Serveur actif !");
});

let players = {};

io.on("connection", (socket) => {
    console.log(`Un joueur s'est connecté : ${socket.id}`);

    players[socket.id] = { x: 100, y: 100 };

    socket.on("disconnect", () => {
        console.log(`Un joueur s'est déconnecté : ${socket.id}`);
        delete players[socket.id];
    });

    socket.on("move", (direction) => {
        const player = players[socket.id];
        if (direction === "up") player.y -= 5;
        if (direction === "down") player.y += 5;
        if (direction === "left") player.x -= 5;
        if (direction === "right") player.x += 5;

        io.emit("state", players);
    });
});

server.listen(3000, () => {
    console.log("Serveur en cours d'exécution sur le port 3000");
});
