const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = [];

app.use(express.static('public'));  // Sert les fichiers statiques (ton jeu)

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Attribuer une couleur unique à chaque joueur
    const playerColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    
    // Envoie la couleur au client
    socket.emit('color', playerColor);

    // Définir la zone protégée (100x100 pixels autour d'une position)
    const playerStartPosition = {
        x: Math.random() * 500 + 100,  // Position aléatoire sur l'écran
        y: Math.random() * 500 + 100
    };

    // Ajouter le joueur à la liste
    players.push({
        id: socket.id,
        color: playerColor,
        x: playerStartPosition.x,
        y: playerStartPosition.y,
        protectedZone: {
            x: playerStartPosition.x - 50,
            y: playerStartPosition.y - 50,
            width: 100,
            height: 100
        }
    });

    // Mettre à jour la position des joueurs aux autres joueurs
    socket.broadcast.emit('players', players);

    // Écouter les mises à jour des positions des joueurs
    socket.on('move', (data) => {
        const player = players.find(p => p.id === socket.id);
        if (player) {
            // Vérifier si la nouvelle position est à l'intérieur de la zone protégée
            if (
                data.x >= player.protectedZone.x &&
                data.x <= player.protectedZone.x + player.protectedZone.width &&
                data.y >= player.protectedZone.y &&
                data.y <= player.protectedZone.y + player.protectedZone.height
            ) {
                // Empêcher de quitter la zone protégée
                data.x = player.x;
                data.y = player.y;
            } else {
                player.x = data.x;
                player.y = data.y;
            }
            io.emit('players', players);  // Mettre à jour la position de tous les joueurs
        }
    });

    // Lorsque le joueur se déconnecte, on le retire
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        players = players.filter(p => p.id !== socket.id);
        io.emit('players', players);  // Mettre à jour la liste des joueurs
    });

    // Réinitialiser la partie
    socket.on('reset', () => {
        players.forEach(player => {
            // Déplacer chaque joueur dans sa zone protégée
            player.x = player.protectedZone.x + 50;
            player.y = player.protectedZone.y + 50;
        });
        io.emit('players', players);  // Informer tous les clients de la réinitialisation
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
