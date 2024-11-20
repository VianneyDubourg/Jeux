// Importer les modules nécessaires
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialiser express et le serveur HTTP
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Stocker les informations des joueurs
let players = [];

// Servir le fichier HTML du jeu
app.use(express.static('public'));

// Quand un joueur se connecte
io.on('connection', (socket) => {
    console.log('Un joueur est connecté');

    // Ajouter un joueur à la liste avec une couleur unique
    const playerId = socket.id;
    const playerColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    players.push({ id: playerId, color: playerColor, x: 100, y: 100 });

    // Envoyer les informations des joueurs à tous les clients
    io.emit('updatePlayers', players);

    // Gérer le mouvement des joueurs
    socket.on('move', (data) => {
        const player = players.find(p => p.id === playerId);
        if (player) {
            player.x = data.x;
            player.y = data.y;
            io.emit('updatePlayers', players); // Mettre à jour la position
        }
    });

    // Réinitialiser le jeu
    socket.on('resetGame', () => {
        players = players.filter(p => p.id !== playerId);
        io.emit('updatePlayers', players);
    });

    // Gérer la déconnexion du joueur
    socket.on('disconnect', () => {
        console.log('Un joueur a quitté');
        players = players.filter(p => p.id !== playerId);
        io.emit('updatePlayers', players);
    });
});

// Démarrer le serveur
server.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});
