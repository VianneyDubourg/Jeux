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
    lastKey: null,
};

// Connexion au serveur (si nécessaire, sinon laisse vide)
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
    player.lastKey = e.key;
    if (e.key === "ArrowUp" && player.y > 0) player.y -= player.speed;
    if (e.key === "ArrowDown" && player.y + player.size < canvas.height) player.y += player.speed;
    if (e.key === "ArrowLeft" && player.x > 0) player.x -= player.speed;
    if (e.key === "ArrowRight" && player.x + player.size < canvas.width) player.x += player.speed;
    if (e.key === " ") {
        shootBullet();
    }
});

// Annuler le déplacement en cas de collision
function handleWallCollision() {
    if (checkWallCollision(player)) {
        if (player.lastKey === "ArrowUp") player.y += player.speed;
        if (player.lastKey === "ArrowDown") player.y -= player.speed;
        if (player.lastKey === "ArrowLeft") player.x += player.speed;
        if (player.lastKey === "ArrowRight") player.x -= player.speed;
    }
}

// Tirer un projectile
function shootBullet() {
    bullets.push({
        x: player.x + player.size / 2 - 5,
        y: player.y + player.size / 2 - 5,
        size: 10,
        color: "yellow",
    });
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
        bullet.y -= bulletSpeed;

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

    drawWalls();
    drawPlayer();
    drawBullets();

    handleWallCollision();
    updateBullets();
}

setInterval(update, 16);

