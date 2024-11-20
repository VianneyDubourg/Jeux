const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = [];

// Serve les fichiers statiques de 'public'
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un joueur est connecté:', socket.id);

    // Attribuer une couleur unique à chaque joueur
    const playerColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    // Position initiale du joueur et zone protégée
    const startPosition = {
        x: Math.random() * 500 + 100,  // Position aléatoire
        y: Math.random() * 500 + 100,
    };
    const protectedZone = {
        x: startPosition.x - 50,
        y: startPosition.y - 50,
        width: 100,
        height: 100,
    };

    // Ajouter le joueur
    players.push({
        id: socket.id,
        color: playerColor,
        x: startPosition.x,
        y: startPosition.y,
        protectedZone,
    });

    // Envoyer la couleur au client
    socket.emit('color', playerColor);

    // Émettre les positions de tous les joueurs aux clients
    io.emit('players', players);

    // Écouter le mouvement des joueurs
    socket.on('move', (data) => {
        const player = players.find(p => p.id === socket.id);
        if (player) {
            // Si le joueur est dans sa zone protégée, il ne peut pas sortir
            if (
                data.x >= player.protectedZone.x &&
                data.x <= player.protectedZone.x + player.protectedZone.width &&
                data.y >= player.protectedZone.y &&
                data.y <= player.protectedZone.y + player.protectedZone.height
            ) {
                // Remettre le joueur dans sa position originale s'il tente de sortir
                data.x = player.x;
                data.y = player.y;
            }
            player.x = data.x;
            player.y = data.y;
            io.emit('players', players);  // Mettre à jour les positions
        }
    });

    // Réinitialiser la partie (placer les joueurs dans leur zone protégée)
    socket.on('reset', () => {
        players.forEach(player => {
            player.x = player.protectedZone.x + 50;
            player.y = player.protectedZone.y + 50;
        });
        io.emit('players', players);  // Réinitialiser les positions des joueurs
    });

    // Lorsqu'un joueur se déconnecte
    socket.on('disconnect', () => {
        console.log('Un joueur est déconnecté:', socket.id);
        players = players.filter(p => p.id !== socket.id);
        io.emit('players', players);  // Mettre à jour la liste des joueurs
    });
});

server.listen(3000, () => {
    console.log('Serveur en marche sur le port 3000');
});
