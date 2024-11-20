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
    lastDirection: "right", // Pour savoir dans quelle direction tirer
};

// Connexion au serveur (si nécessaire)
const socket = io("https://ton-backend-railway-url"); // Mets l'URL Railway ici

// Liste des murs
const walls = [
    { x: 200, y: 150, width: 100, height: 20 },
    { x: 400, y: 300, width: 150, height: 20 },
    { x: 300, y: 400, width: 20, height: 100 },
];

// Liste des projectiles
const bullets = [];
const bulletSpeed = 7;

// Dessiner le joueur
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

// Dessiner les murs
function drawWalls() {
    ctx.fillStyle = "grey";
    walls.forEach((wall) => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
}

// Dessiner les bordures de la map
function drawMapBorders() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// Vérifier les collisions avec les murs
function checkWallCollision(player) {
    for (let wall of walls) {
        if (
            player.x < wall.x + wall.width &&
            player.x + player.size > wall.x &&
            player.y < wall.y + wall.height &&
            player.y + player.size > wall.y
        ) {
            return true;
        }
    }
    return false;
}

// Détecter les touches pour déplacer le joueur
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

// Annuler le déplacement en cas de collision
function handleWallCollision() {
    if (checkWallCollision(player)) {
        if (player.lastDirection === "up") player.y += player.speed;
        if (player.lastDirection === "down") player.y -= player.speed;
        if (player.lastDirection === "left") player.x += player.speed;
        if (player.lastDirection === "right") player.x -= player.speed;
    }
}

// Tirer un projectile
function shootBullet() {
    let bullet = {
        x: player.x + player.size / 2 - 5,
        y: player.y + player.size / 2 - 5,
        size: 10,
        color: "yellow",
        direction: player.lastDirection,
    };
    bullets.push(bullet);
}

// Dessiner les projectiles
function drawBullets() {
    bullets.forEach((bullet) => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
    });
}

// Mettre à jour les projectiles
function updateBullets() {
    bullets.forEach((bullet, index) => {
        if (bullet.direction === "up") bullet.y -= bulletSpeed;
        if (bullet.direction === "down") bullet.y += bulletSpeed;
        if (bullet.direction === "left") bullet.x -= bulletSpeed;
        if (bullet.direction === "right") bullet.x += bulletSpeed;

        // Supprimer les projectiles hors écran ou touchant un mur
        if (
            bullet.x < 0 ||
            bullet.y < 0 ||
            bullet.x > canvas.width ||
            bullet.y > canvas.height ||
            checkBulletCollision(bullet)
        ) {
            bullets.splice(index, 1); // Supprime le projectile
        }
    });
}

// Vérifier les collisions des projectiles avec les murs
function checkBulletCollision(bullet) {
    for (let wall of walls) {
        if (
            bullet.x < wall.x + wall.width &&
            bullet.x + bullet.size > wall.x &&
            bullet.y < wall.y + wall.height &&
            bullet.y + bullet.size > wall.y
        ) {
            return true;
        }
    }
    return false;
}

// Boucle principale
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMapBorders();
    drawWalls();
    drawPlayer();
    drawBullets();

    handleWallCollision();
    updateBullets();
}

setInterval(update, 16);
