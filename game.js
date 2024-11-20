const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const player = {
    x: 100,
    y: 100,
    size: 20,
    color: "red",
    speed: 5,
    lastDirection: "right",
};

let otherPlayers = []; // Liste des autres joueurs
const bullets = []; // Liste des projectiles

const socket = io('https://railway.app/project/a74dc6e0-73f7-4840-882e-98de92e9b9bf'); // Connexion au serveur

// Dessiner le joueur
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

// Dessiner les autres joueurs
function drawOtherPlayers() {
    otherPlayers.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
}

// Dessiner les projectiles
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
    });
}

// Mettre à jour les positions des autres joueurs
socket.on('updatePlayers', (players) => {
    otherPlayers = Object.keys(players).map(id => {
        if (id !== socket.id) {
            return players[id];
        }
    }).filter(Boolean);
});

// Mettre à jour les projectiles
socket.on('shootBullet', (bullet) => {
    bullets.push(bullet);
});

// Envoyer les mouvements du joueur au serveur
function sendPlayerMovement() {
    socket.emit('movePlayer', {
        x: player.x,
        y: player.y,
        color: player.color,
        lastDirection: player.lastDirection
    });
}

// Envoyer les projectiles au serveur
function sendBulletMovement() {
    bullets.forEach(bullet => {
        socket.emit('shootBullet', bullet);
    });
}

// Contrôles pour déplacer le joueur et tirer
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
        player.y = Math.max(0, player.y - player.speed);
        player.lastDirection = "up";
    }
    if (e.key === "ArrowDown") {
        player.y = Math.min(canvas.height - player.size, player.y + player.speed);
        player.lastDirection = "down";
    }
    if (e.key === "ArrowLeft") {
        player.x = Math.max(0, player.x - player.speed);
        player.lastDirection = "left";
    }
    if (e.key === "ArrowRight") {
        player.x = Math.min(canvas.width - player.size, player.x + player.speed);
        player.lastDirection = "right";
    }
    if (e.key === " ") {
        shootBullet();
    }
});

// Fonction pour tirer un projectile
function shootBullet() {
    let bullet = {
        x: player.x + player.size / 2 - 5,
        y: player.y + player.size / 2 - 5,
        size: 10,
        color: "yellow",
        direction: player.lastDirection,
    };
    bullets.push(bullet);
    sendBulletMovement(); // Envoie le projectile au serveur
}

// Fonction pour dessiner la scène
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawBullets();
    drawOtherPlayers();

    sendPlayerMovement();
}

setInterval(update, 16); // Rafraîchit la scène toutes les 16ms (60FPS)
