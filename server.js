const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('.')); // Sert tous les fichiers à la racine

let players = {}; // Pour stocker les joueurs connectés

// Lorsqu'un joueur se connecte
io.on('connection', (socket) => {
    console.log('Un joueur est connecté:', socket.id);

    // Créer un joueur initial
    players[socket.id] = {
        x: 100,
        y: 100,
        color: 'red',
        lastDirection: 'right'
    };

    // Envoyer les positions des joueurs à tous les clients
    socket.emit('updatePlayers', players);

    // Lorsqu'un joueur déplace son personnage
    socket.on('movePlayer', (data) => {
        players[socket.id] = data;
        io.emit('updatePlayers', players); // Envoie à tous les joueurs les positions mises à jour
    });

    // Lorsqu'un joueur tire un projectile
    socket.on('shootBullet', (data) => {
        io.emit('shootBullet', data); // Envoie les projectiles à tous les joueurs
    });

    // Lorsqu'un joueur se déconnecte
    socket.on('disconnect', () => {
        console.log('Un joueur a quitté:', socket.id);
        delete players[socket.id]; // Supprimer le joueur de la liste
        io.emit('updatePlayers', players); // Mettre à jour la liste des joueurs pour les autres
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
