const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

/* =====================================================
   CONFIGURATION
===================================================== */

const REGISTRATION_FEE = 50;

// 70 % pour le gagnant
const WINNER_PERCENTAGE = 0.70;

// 30 % pour la plateforme
const PLATFORM_PERCENTAGE = 0.30;


/* =====================================================
   CONFIGURATION EXPRESS
===================================================== */

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());


/* =====================================================
   FICHIER DE SAUVEGARDE
===================================================== */

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "konkou.json");


/* =====================================================
   CRÉER LE DOSSIER DATA
===================================================== */

if (!fs.existsSync(DATA_DIR)) {

    fs.mkdirSync(DATA_DIR, {
        recursive: true
    });

}


/* =====================================================
   DONNÉES PAR DÉFAUT
===================================================== */

let data = {

    players: [],

    contest: {

        registrations: 0,

        prizePool: 0,

        winner: null,

        winnerPrize: 0,

        platformShare: 0,

        status: "open"

    }

};


/* =====================================================
   CHARGER LES DONNÉES
===================================================== */

function loadData() {

    try {

        if (fs.existsSync(DATA_FILE)) {

            const file =
                fs.readFileSync(
                    DATA_FILE,
                    "utf8"
                );

            const savedData =
                JSON.parse(file);


            if (
                savedData &&
                Array.isArray(savedData.players) &&
                savedData.contest
            ) {

                data = savedData;

                console.log(
                    "💾 Données Konkou chargées."
                );

                console.log(
                    `👥 ${data.players.length} joueur(s)`
                );

                console.log(
                    `💰 Cagnotte : ${data.contest.prizePool} HTG`
                );

            }

        }

    }

    catch (error) {

        console.error(
            "❌ Impossible de charger les données :",
            error
        );

        console.log(
            "⚠️ Utilisation des données par défaut."
        );

    }

}


/* =====================================================
   SAUVEGARDER LES DONNÉES
===================================================== */

function saveData() {

    try {

        fs.writeFileSync(

            DATA_FILE,

            JSON.stringify(
                data,
                null,
                4
            ),

            "utf8"

        );

    }

    catch (error) {

        console.error(
            "❌ Erreur sauvegarde :",
            error
        );

    }

}


/* =====================================================
   CHARGEMENT AU DÉMARRAGE
===================================================== */

loadData();


/* =====================================================
   OUTILS
===================================================== */

function getRanking() {

    return [...data.players]

        .sort((a, b) => {

            if (b.score !== a.score) {

                return b.score - a.score;

            }

            return a.id - b.id;

        })

        .map((player, index) => ({

            rank:
                index + 1,

            id:
                player.id,

            name:
                player.name,

            score:
                player.score,

            games:
                player.games,

            registered:
                player.registered,

            winnings:
                player.winnings || 0

        }));

}


/* =====================================================
   RECHERCHER UN JOUEUR
===================================================== */

function findPlayerByName(name) {

    return data.players.find(

        player =>

            player.name.toLowerCase() ===
            name.trim().toLowerCase()

    );

}


/* =====================================================
   NOUVEL ID
===================================================== */

function getNextPlayerId() {

    if (data.players.length === 0) {

        return 1;

    }

    return (

        Math.max(
            ...data.players.map(
                player => player.id
            )
        ) + 1

    );

}


/* =====================================================
   CALCULER LE GAGNANT
===================================================== */

function updateWinner() {

    const ranking =
        getRanking();


    if (ranking.length === 0) {

        data.contest.winner =
            null;

        data.contest.winnerPrize =
            0;

        data.contest.platformShare =
            0;

        return;

    }


    const first =
        ranking[0];


    const winner =
        data.players.find(

            player =>
                player.id === first.id

        );


    if (!winner) {

        return;

    }


    const winnerPrize =
        Math.floor(

            data.contest.prizePool *
            WINNER_PERCENTAGE

        );


    data.contest.winner =
        winner.name;


    data.contest.winnerPrize =
        winnerPrize;


    data.contest.platformShare =

        data.contest.prizePool -
        winnerPrize;


    /*
       Réinitialiser les gains.
    */

    data.players.forEach(
        player => {

            player.winnings = 0;

        }
    );


    /*
       Donner le gain au premier.
    */

    winner.winnings =
        winnerPrize;

}


/* =====================================================
   TEST SERVEUR
===================================================== */

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "🏆 Serveur Konkou fonctionne !",

        players:
            data.players.length,

        registrations:
            data.contest.registrations,

        prizePool:
            data.contest.prizePool,

        winnerPercentage:
            "70%",

        status:
            data.contest.status

    });

});


/* =====================================================
   API
===================================================== */

app.get("/api", (req, res) => {

    res.json({

        success: true,

        message:
            "🏆 Serveur Konkou fonctionne !",

        players:
            data.players.length,

        registrations:
            data.contest.registrations,

        prizePool:
            data.contest.prizePool,

        winnerPercentage:
            "70%",

        status:
            data.contest.status

    });

});


/* =====================================================
   INSCRIPTION
===================================================== */

app.post("/api/register", (req, res) => {

    try {

        const { name } =
            req.body;


        if (
            !name ||
            typeof name !== "string" ||
            name.trim().length < 2
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Le nom est obligatoire."

            });

        }


        const cleanName =
            name.trim();


        let player =
            findPlayerByName(
                cleanName
            );


        /*
           Déjà inscrit
        */

        if (
            player &&
            player.registered
        ) {

            return res.json({

                success: true,

                message:
                    "Joueur déjà inscrit.",

                alreadyRegistered:
                    true,

                player: {

                    id:
                        player.id,

                    name:
                        player.name,

                    registered:
                        true

                },

                contest: {

                    registrations:
                        data.contest.registrations,

                    prizePool:
                        data.contest.prizePool,

                    winnerPrize:

                        Math.floor(

                            data.contest.prizePool *
                            WINNER_PERCENTAGE

                        )

                }

            });

        }


        /*
           Créer le joueur
        */

        if (!player) {

            player = {

                id:
                    getNextPlayerId(),

                name:
                    cleanName,

                score:
                    0,

                games:
                    0,

                registered:
                    false,

                registrationPaid:
                    0,

                winnings:
                    0

            };


            data.players.push(
                player
            );

        }


        /*
           Inscription
        */

        player.registered =
            true;


        player.registrationPaid =
            REGISTRATION_FEE;


        /*
           Ajouter à la cagnotte
        */

        data.contest.registrations +=
            1;


        data.contest.prizePool +=
            REGISTRATION_FEE;


        /*
           Recalculer le gagnant
        */

        updateWinner();


        /*
           Sauvegarder immédiatement
        */

        saveData();


        console.log(

            `🎟️ ${player.name}` +

            ` inscrit` +

            ` → +${REGISTRATION_FEE} HTG` +

            ` | Cagnotte : ${data.contest.prizePool} HTG`

        );


        res.json({

            success: true,

            message:
                "Inscription enregistrée.",

            player: {

                id:
                    player.id,

                name:
                    player.name,

                registered:
                    true

            },

            contest: {

                registrations:
                    data.contest.registrations,

                registrationFee:
                    REGISTRATION_FEE,

                prizePool:
                    data.contest.prizePool,

                winner:
                    data.contest.winner,

                winnerPrize:
                    data.contest.winnerPrize

            }

        });

    }

    catch (error) {

        console.error(
            "❌ Erreur /api/register :",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Erreur interne du serveur."

        });

    }

});


/* =====================================================
   AJOUTER UN SCORE
===================================================== */

app.post("/api/players", (req, res) => {

    try {

        const { name, score } =
            req.body;


        /*
           Vérification du nom
        */

        if (
            !name ||
            typeof name !== "string" ||
            name.trim().length < 2
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Le nom est obligatoire."

            });

        }


        /*
           Vérification du score
        */

        if (
            typeof score !== "number" ||
            !Number.isFinite(score) ||
            score < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Score invalide."

            });

        }


        const cleanName =
            name.trim();


        let player =
            findPlayerByName(
                cleanName
            );


        /*
           Créer le joueur
           s'il n'existe pas.
        */

        if (!player) {

            player = {

                id:
                    getNextPlayerId(),

                name:
                    cleanName,

                score:
                    0,

                games:
                    0,

                registered:
                    false,

                registrationPaid:
                    0,

                winnings:
                    0

            };


            data.players.push(
                player
            );

        }


        /*
           Vérifier inscription
        */

        if (!player.registered) {

            return res.status(403).json({

                success: false,

                message:
                    "Le joueur doit être inscrit au concours."

            });

        }


        /*
           Ajouter les points
        */

        player.score +=
            score;


        player.games +=
            1;


        /*
           Recalculer
        */

        updateWinner();


        const ranking =
            getRanking();


        /*
           Sauvegarder
        */

        saveData();


        console.log(

            `🏆 ${player.name}` +

            ` +${score} points` +

            ` → ${player.score} points`

        );


        res.json({

            success: true,

            message:
                "Score enregistré.",

            player: {

                id:
                    player.id,

                name:
                    player.name,

                score:
                    player.score,

                games:
                    player.games,

                winnings:
                    player.winnings || 0

            },

            ranking:
                ranking,

            contest: {

                registrations:
                    data.contest.registrations,

                prizePool:
                    data.contest.prizePool,

                winner:
                    data.contest.winner,

                winnerPrize:
                    data.contest.winnerPrize,

                platformShare:
                    data.contest.platformShare

            }

        });

    }

    catch (error) {

        console.error(
            "❌ Erreur /api/players :",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Erreur interne du serveur."

        });

    }

});


/* =====================================================
   LISTE DE TOUS LES JOUEURS
===================================================== */

app.get("/api/players", (req, res) => {

    try {

        res.json({

            success: true,

            players:
                data.players.map(
                    player => ({

                        id:
                            player.id,

                        name:
                            player.name,

                        score:
                            player.score,

                        games:
                            player.games,

                        registered:
                            player.registered,

                        winnings:
                            player.winnings || 0

                    })
                )

        });

    }

    catch (error) {

        console.error(
            "❌ Erreur /api/players GET :",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Impossible de récupérer les joueurs."

        });

    }

});


/* =====================================================
   CLASSEMENT
===================================================== */

app.get("/api/ranking", (req, res) => {

    try {

        updateWinner();


        res.json({

            success: true,

            ranking:
                getRanking(),

            contest: {

                registrations:
                    data.contest.registrations,

                registrationFee:
                    REGISTRATION_FEE,

                prizePool:
                    data.contest.prizePool,

                winner:
                    data.contest.winner,

                winnerPrize:
                    data.contest.winnerPrize,

                winnerPercentage:
                    WINNER_PERCENTAGE * 100,

                platformShare:
                    data.contest.platformShare,

                platformPercentage:
                    PLATFORM_PERCENTAGE * 100

            }

        });

    }

    catch (error) {

        console.error(
            "❌ Erreur classement :",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Impossible de récupérer le classement."

        });

    }

});


/* =====================================================
   INFORMATIONS DU CONCOURS
===================================================== */

app.get("/api/contest", (req, res) => {

    updateWinner();


    res.json({

        success: true,

        contest: {

            status:
                data.contest.status,

            registrations:
                data.contest.registrations,

            registrationFee:
                REGISTRATION_FEE,

            prizePool:
                data.contest.prizePool,

            winner:
                data.contest.winner,

            winnerPercentage:
                WINNER_PERCENTAGE * 100,

            winnerPrize:
                data.contest.winnerPrize,

            platformPercentage:
                PLATFORM_PERCENTAGE * 100,

            platformShare:
                data.contest.platformShare

        }

    });

});


/* =====================================================
   RECHERCHER UN JOUEUR
===================================================== */

app.get(
    "/api/players/:name",
    (req, res) => {

        try {

            const name =

                decodeURIComponent(
                    req.params.name
                )
                    .trim()
                    .toLowerCase();


            const player =
                data.players.find(

                    p =>
                        p.name.toLowerCase() ===
                        name

                );


            if (!player) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Joueur introuvable."

                });

            }


            updateWinner();


            const ranking =
                getRanking();


            const position =

                ranking.findIndex(

                    p =>
                        p.id ===
                        player.id

                ) + 1;


            res.json({

                success: true,

                player: {

                    id:
                        player.id,

                    name:
                        player.name,

                    score:
                        player.score,

                    games:
                        player.games,

                    rank:
                        position,

                    registered:
                        player.registered,

                    winnings:
                        player.winnings || 0

                }

            });

        }

        catch (error) {

            console.error(

                "❌ Erreur recherche joueur :",
                error

            );


            res.status(500).json({

                success: false,

                message:
                    "Erreur interne."

            });

        }

    }

);


/* =====================================================
   SANTÉ DU SERVEUR
===================================================== */

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            status:
                "online",

            service:
                "Konkou",

            players:
                data.players.length,

            registrations:
                data.contest.registrations,

            prizePool:
                data.contest.prizePool,

            time:
                new Date().toISOString()

        });

    }

);


/* =====================================================
   RÉINITIALISER LE CLASSEMENT
   ⚠️ POUR TEST UNIQUEMENT
===================================================== */

app.delete(
    "/api/players",
    (req, res) => {

        data.players = [];

        data.contest = {

            registrations:
                0,

            prizePool:
                0,

            winner:
                null,

            winnerPrize:
                0,

            platformShare:
                0,

            status:
                "open"

        };


        saveData();


        res.json({

            success: true,

            message:
                "Classement réinitialisé."

        });

    }

);


/* =====================================================
   404 API
===================================================== */

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Route API introuvable."

        });

    }
);


/* =====================================================
   GESTION DES ERREURS
===================================================== */

app.use(
    (err, req, res, next) => {

        console.error(
            "❌ Erreur serveur :",
            err
        );


        res.status(500).json({

            success: false,

            message:
                "Erreur interne du serveur."

        });

    }
);


/* =====================================================
   DÉMARRAGE
===================================================== */

app.listen(

    PORT,

    "0.0.0.0",

    () => {

        console.log("");

        console.log(
            "================================="
        );

        console.log(
            "🏆 KONKOU SERVER"
        );

        console.log(
            "================================="
        );

        console.log(
            `🚀 Port : ${PORT}`
        );

        console.log(
            "🌐 API : /api"
        );

        console.log(
            "🎟️ Inscription : /api/register"
        );

        console.log(
            "👥 Joueurs : /api/players"
        );

        console.log(
            "🏆 Classement : /api/ranking"
        );

        console.log(
            "💰 Concours : /api/contest"
        );

        console.log(
            "❤️ Santé : /api/health"
        );

        console.log(
            "💾 Sauvegarde : data/konkou.json"
        );

        console.log(
            "🥇 1er joueur : 70 % de la cagnotte"
        );

        console.log(
            "================================="
        );

        console.log("");

        console.log(
            "🚀 Serveur Konkou prêt !"
        );

    }

);
