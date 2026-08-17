const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

/* =====================================================
   CONFIGURATION
===================================================== */

const REGISTRATION_FEE = 50;

// Le 1er joueur reçoit 70 % de la cagnotte
const WINNER_PERCENTAGE = 0.70;

// Les 30 % restants
const PLATFORM_PERCENTAGE = 0.30;

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());


/* =====================================================
   DONNÉES DES JOUEURS
===================================================== */

let players = [];


/* =====================================================
   CAGNOTTE DU CONCOURS
===================================================== */

let contest = {

    registrations: 0,

    prizePool: 0,

    winner: null,

    winnerPrize: 0,

    platformShare: 0,

    status: "open"

};


/* =====================================================
   OUTILS
===================================================== */

function getRanking() {

    return [...players]

        .sort((a, b) => {

            if (b.score !== a.score) {

                return b.score - a.score;

            }

            return a.id - b.id;

        })

        .map((player, index) => ({

            rank: index + 1,

            id: player.id,

            name: player.name,

            score: player.score,

            games: player.games,

            registered: player.registered,

            winnings: player.winnings || 0

        }));

}


function findPlayerByName(name) {

    return players.find(

        player =>

            player.name.toLowerCase() ===
            name.trim().toLowerCase()

    );

}


/* =====================================================
   CALCULER LE GAGNANT
===================================================== */

function updateWinner() {

    const ranking = getRanking();

    if (ranking.length === 0) {

        contest.winner = null;

        contest.winnerPrize = 0;

        contest.platformShare = 0;

        return;

    }

    const first = ranking[0];

    const winner = players.find(

        player => player.id === first.id

    );

    if (!winner) return;


    const winnerPrize = Math.floor(

        contest.prizePool *
        WINNER_PERCENTAGE

    );


    contest.winner = winner.name;

    contest.winnerPrize = winnerPrize;

    contest.platformShare =

        contest.prizePool -
        winnerPrize;


    /*
       Mettre à jour le gain du premier.
    */

    players.forEach(player => {

        player.winnings = 0;

    });


    winner.winnings = winnerPrize;

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
            players.length,

        registrations:
            contest.registrations,

        prizePool:
            contest.prizePool,

        winnerPercentage:
            "70%",

        status:
            contest.status

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
            players.length,

        registrations:
            contest.registrations,

        prizePool:
            contest.prizePool,

        winnerPercentage:
            "70%",

        status:
            contest.status

    });

});


/* =====================================================
   INSCRIPTION AU CONCOURS
===================================================== */

app.post("/api/register", (req, res) => {

    try {

        const { name } = req.body;


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
            findPlayerByName(cleanName);


        /*
           Si le joueur existe déjà
           et est déjà inscrit,
           on ne lui fait pas payer
           une deuxième fois.
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
                        contest.registrations,

                    prizePool:
                        contest.prizePool,

                    winnerPrize:
                        Math.floor(
                            contest.prizePool *
                            WINNER_PERCENTAGE
                        )

                }

            });

        }


        /*
           Créer le joueur
           s'il n'existe pas.
        */

        if (!player) {

            player = {

                id:

                    players.length > 0

                        ? Math.max(
                            ...players.map(
                                p => p.id
                            )
                        ) + 1

                        : 1,

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


            players.push(player);

        }


        /*
           Inscription
        */

        player.registered = true;

        player.registrationPaid =
            REGISTRATION_FEE;


        /*
           Ajouter les 50 HTG
           à la cagnotte.
        */

        contest.registrations += 1;

        contest.prizePool +=
            REGISTRATION_FEE;


        /*
           Recalculer le gagnant.
        */

        updateWinner();


        console.log(

            `🎟️ ${player.name} inscrit`

            + ` → +${REGISTRATION_FEE} HTG`

            + ` | Cagnotte : ${contest.prizePool} HTG`

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
                    contest.registrations,

                registrationFee:
                    REGISTRATION_FEE,

                prizePool:
                    contest.prizePool,

                winner:
                    contest.winner,

                winnerPrize:
                    contest.winnerPrize

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


        /*
           Chercher le joueur
        */

        let player =
            findPlayerByName(cleanName);


        /*
           Créer le joueur
           s'il n'existe pas.
        */

        if (!player) {

            player = {

                id:

                    players.length > 0

                        ? Math.max(
                            ...players.map(
                                p => p.id
                            )
                        ) + 1

                        : 1,

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


            players.push(player);

        }


        /*
           Le joueur doit être inscrit.
        */

        if (!player.registered) {

            return res.status(403).json({

                success: false,

                message:
                    "Le joueur doit être inscrit au concours."

            });

        }


        /*
           Ajouter les points.
        */

        player.score += score;

        player.games += 1;


        /*
           Recalculer automatiquement
           le classement et le gagnant.
        */

        updateWinner();


        const ranking =
            getRanking();


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
                    contest.registrations,

                prizePool:
                    contest.prizePool,

                winner:
                    contest.winner,

                winnerPrize:
                    contest.winnerPrize,

                platformShare:
                    contest.platformShare

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
                    contest.registrations,

                registrationFee:
                    REGISTRATION_FEE,

                prizePool:
                    contest.prizePool,

                winner:
                    contest.winner,

                winnerPrize:
                    contest.winnerPrize,

                winnerPercentage:
                    WINNER_PERCENTAGE * 100,

                platformShare:
                    contest.platformShare,

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
                contest.status,

            registrations:
                contest.registrations,

            registrationFee:
                REGISTRATION_FEE,

            prizePool:
                contest.prizePool,

            winner:
                contest.winner,

            winnerPercentage:
                WINNER_PERCENTAGE * 100,

            winnerPrize:
                contest.winnerPrize,

            platformPercentage:
                PLATFORM_PERCENTAGE * 100,

            platformShare:
                contest.platformShare

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
                players.find(

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
                players.length,

            registrations:
                contest.registrations,

            prizePool:
                contest.prizePool,

            time:
                new Date().toISOString()

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
            "🏆 Classement : /api/ranking"
        );

        console.log(
            "💰 Concours : /api/contest"
        );

        console.log(
            "❤️ Santé : /api/health"
        );

        console.log(
            "🥇 1er joueur : 70 % de la cagnotte"
        );

        console.log(
            "================================="
        );

        console.log("");

    }

);
