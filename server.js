// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));  // Sert les fichiers statiques (HTML, CSS, JS)

let players = [];  // Tableau pour stocker les joueurs

// Lorsqu'un joueur se connecte
io.on('connection', (socket) => {
    console.log('Un joueur est connecté');

    // Attribution d'une couleur unique au joueur
    const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    // Ajouter le joueur au tableau
    players.push({ id: socket.id, color: color, lives: 3, x: 100, y: 100 });

    // Envoyer l'état initial des joueurs à tous les clients
    io.emit('updatePlayers', players);

    // Quand un joueur déplace son personnage
    socket.on('move', (data) => {
        const player = players.find(p => p.id === socket.id);
        if (player) {
            player.x = data.x;
            player.y = data.y;
            io.emit('updatePlayers', players);  // Mettre à jour les positions des joueurs
        }
    });

    // Quand un joueur tire
    socket.on('shoot', (data) => {
        io.emit('shoot', { id: socket.id, angle: data.angle });
    });

    // Quand un joueur perd une vie
    socket.on('loseLife', () => {
        const player = players.find(p => p.id === socket.id);
        if (player && player.lives > 0) {
            player.lives--;
        }

        if (player.lives <= 0) {
            // Enlever le joueur du jeu si il n'a plus de vies
            players = players.filter(p => p.id !== socket.id);
        }

        io.emit('updatePlayers', players);
    });

    // Quand un joueur se déconnecte
    socket.on('disconnect', () => {
        console.log('Un joueur s\'est déconnecté');
        players = players.filter(p => p.id !== socket.id);
        io.emit('updatePlayers', players);
    });

    // Réinitialiser la partie
    socket.on('resetGame', () => {
        players = [];
        io.emit('updatePlayers', players);
    });
});

server.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});
