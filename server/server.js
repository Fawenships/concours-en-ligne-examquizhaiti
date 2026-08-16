const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dataFile = path.join(__dirname, "data.json");

function readData() {
    if (!fs.existsSync(dataFile)) {
        return {
            players: [],
            scores: []
        };
    }

    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(
        dataFile,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

// Tester le serveur
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "API Konkou fonctionne !"
    });
});

// Créer un joueur
app.post("/api/players", (req, res) => {
    const { username } = req.body;

    if (!username || username.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Nom d'utilisateur invalide."
        });
    }

    const data = readData();

    const existingPlayer = data.players.find(
        player => player.username.toLowerCase() === username.toLowerCase()
    );

    if (existingPlayer) {
        return res.status(409).json({
            success: false,
            message: "Ce joueur existe déjà."
        });
    }

    const player = {
        id: Date.now().toString(),
        username: username.trim(),
        tickets: 3,
        createdAt: new Date().toISOString()
    };

    data.players.push(player);
    saveData(data);

    res.json({
        success: true,
        player
    });
});

// Obtenir les joueurs
app.get("/api/players", (req, res) => {
    const data = readData();

    res.json({
        success: true,
        players: data.players
    });
});

// Enregistrer un score
app.post("/api/scores", (req, res) => {
    const { playerId, category, score } = req.body;

    if (!playerId || !category || typeof score !== "number") {
        return res.status(400).json({
            success: false,
            message: "Données invalides."
        });
    }

    const data = readData();

    const player = data.players.find(
        p => p.id === playerId
    );

    if (!player) {
        return res.status(404).json({
            success: false,
            message: "Joueur introuvable."
        });
    }

    const newScore = {
        id: Date.now().toString(),
        playerId,
        category,
        score,
        createdAt: new Date().toISOString()
    };

    data.scores.push(newScore);
    saveData(data);

    res.json({
        success: true,
        score: newScore
    });
});

// Classement
app.get("/api/ranking", (req, res) => {
    const data = readData();

    const ranking = data.players.map(player => {
        const playerScores = data.scores
            .filter(score => score.playerId === player.id);

        const totalScore = playerScores.reduce(
            (total, item) => total + item.score,
            0
        );

        return {
            id: player.id,
            username: player.username,
            score: totalScore
        };
    });

    ranking.sort((a, b) => b.score - a.score);

    res.json({
        success: true,
        ranking
    });
});

app.listen(PORT, () => {
    console.log(`KONKOU API démarrée sur http://localhost:${PORT}`);
});
