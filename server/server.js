```js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/* =========================
   DONNÉES DES JOUEURS
========================= */

let players = [];


/* =========================
   PAGE D'ACCUEIL DU SERVEUR
========================= */

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "🏆 Serveur Konkou fonctionne !"
    });

});


/* =========================
   AJOUTER UN JOUEUR / SCORE
========================= */

app.post("/api/players", (req, res) => {

    const { name, score } = req.body;

    if (!name || typeof name !== "string") {

        return res.status(400).json({
            success: false,
            message: "Le nom est obligatoire."
        });

    }

    const playerName = name.trim();

    if (playerName.length < 2) {

        return res.status(400).json({
            success: false,
            message: "Le nom est trop court."
        });

    }

    let player = players.find(
        p =>
            p.name.toLowerCase() ===
            playerName.toLowerCase()
    );


    /* =========================
       NOUVEAU JOUEUR
    ========================= */

    if (!player) {

        player = {

            id: players.length + 1,

            name: playerName,

            score: 0,

            games: 0,

            bestScore: 0

        };

        players.push(player);

    }


    /* =========================
       AJOUT DU SCORE
    ========================= */

    if (
        typeof score === "number" &&
        Number.isFinite(score) &&
        score >= 0
    ) {

        player.score += score;

        player.games++;

        if (score > player.bestScore) {

            player.bestScore = score;

        }

    }


    res.json({

        success: true,

        message: "Score enregistré.",

        player: player

    });

});


/* =========================
   CLASSEMENT
========================= */

app.get("/api/ranking", (req, res) => {

    const ranking = [...players]

        .sort((a, b) => {

            if (b.score !== a.score) {

                return b.score - a.score;

            }

            return b.bestScore - a.bestScore;

        })

        .map((player, index) => {

            return {

                rank: index + 1,

                id: player.id,

                name: player.name,

                score: player.score,

                games: player.games,

                bestScore: player.bestScore

            };

        });


    res.json({

        success: true,

        ranking: ranking

    });

});


/* =========================
   RECHERCHER UN JOUEUR
========================= */

app.get("/api/players/:name", (req, res) => {

    const name =
        decodeURIComponent(req.params.name)
        .trim()
        .toLowerCase();


    const player = players.find(

        p =>
            p.name.toLowerCase() === name

    );


    if (!player) {

        return res.status(404).json({

            success: false,

            message: "Joueur introuvable."

        });

    }


    const ranking = [...players]
        .sort((a, b) => b.score - a.score);

    const position =
        ranking.findIndex(
            p => p.id === player.id
        );


    res.json({

        success: true,

        player: {

            ...player,

            rank: position + 1

        }

    });

});


/* =========================
   STATISTIQUES DU SERVEUR
========================= */

app.get("/api/stats", (req, res) => {

    const totalPlayers =
        players.length;


    const totalGames =
        players.reduce(
            (total, player) =>
                total + player.games,
            0
        );


    const totalPoints =
        players.reduce(
            (total, player) =>
                total + player.score,
            0
        );


    res.json({

        success: true,

        statistics: {

            players: totalPlayers,

            games: totalGames,

            points: totalPoints

        }

    });

});


/* =========================
   DEMARRAGE DU SERVEUR
========================= */

app.listen(PORT, () => {

    console.log("");

    console.log(
        "================================="
    );

    console.log(
        "🏆 KONKOU"
    );

    console.log(
        "================================="
    );

    console.log(
        `Serveur : http://localhost:${PORT}`
    );

    console.log(
        "Classement : http://localhost:3000/api/ranking"
    );

    console.log(
        "Statistiques : http://localhost:3000/api/stats"
    );

    console.log(
        "================================="
    );

    console.log("");

});
```
