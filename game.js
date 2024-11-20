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
};

// Connexion au serveur Socket.IO
const socket = io("https://railway.app/project/a74dc6e0-73f7-4840-882e-98de92e9b9bf"); // Mets l'URL Railway ici

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
}

// Détecte les touches pour déplacer le joueur
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") player.y -= player.speed;
    if (e.key === "ArrowDown") player.y += player.speed;
    if (e.key === "ArrowLeft") player.x -= player.speed;
    if (e.key === "ArrowRight") player.x += player.speed;
});

setInterval(update, 16);
