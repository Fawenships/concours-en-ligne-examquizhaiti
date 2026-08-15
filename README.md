# concours-en-ligne-examquizhaiti
# Konkou — Jeu-Concours en Ligne 🏆

Application de jeu-concours interactif où les joueurs répondent à des questions pour gagner des points, grimper au classement, et remporter des prix réels (sponsorisés ou en gourdes).

## 📋 Description

**Konkou** est une extension du projet Exam-Quiz, transformée en plateforme de jeu-concours compétitif. Les utilisateurs peuvent jouer seuls contre la montre, s'affronter en duel ("battle mode"), ou participer à des concours hebdomadaires avec de vrais prix à la clé.

## 🎯 Fonctionnalités

- **Quiz thématiques** : culture générale, culture haïtienne, sport, actualité
- **Mode Battle** : duel en temps réel entre deux joueurs
- **Concours hebdomadaire** : grand tournoi avec prix sponsorisé ou en gourdes
- **Système de tickets** : un nombre limité d'essais gratuits par jour, achats intégrés pour plus de tickets
- **Classement en temps réel** : leaderboard global et par catégorie
- **Intégration MonCash** : pour les achats de tickets et le paiement des prix
- **PWA** : installable sur téléphone, fonctionne même avec une connexion instable

## 🛠️ Stack technique

- **Frontend** : HTML / CSS / JavaScript (React envisagé pour la v2)
- **Backend / temps réel** : Firebase Realtime Database (scores, classement, mode battle)
- **Authentification** : Firebase Auth
- **Paiement** : API MonCash
- **Déploiement** : PWA, hébergement GitHub Pages ou équivalent

## 📂 Structure du projet

```
konkou/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── quiz.js          # Logique du quiz
│   ├── battle.js         # Mode duel en temps réel
│   ├── leaderboard.js    # Classement
│   ├── tickets.js        # Gestion des tickets/essais
│   └── firebase-config.js
├── data/
│   └── questions.json    # Banque de questions par catégorie
├── assets/
│   └── icons/
├── manifest.json          # Config PWA
├── service-worker.js      # Fonctionnement offline
└── README.md
```

## 🚀 Installation

```bash
git clone https://github.com/ton-username/konkou.git
cd konkou
```

Ouvrir `index.html` dans un navigateur, ou servir localement avec un serveur simple :

```bash
npx serve .
```

## 💰 Modèle économique

- **Gratuit** : 3 essais par jour, accès aux quiz de base
- **Tickets premium** : achat via MonCash pour essais illimités
- **Sponsoring** : entreprises locales financent les prix hebdomadaires en échange de visibilité
- **Publicité** : bannières entre les questions pour les utilisateurs gratuits

## 🛡️ Anti-triche

Avec une banque de questions fixes, certaines mesures sont nécessaires pour limiter la triche (recherche sur un autre appareil, comptes multiples, partage de réponses) :

- **Chronomètre serré** : 10-15 secondes par question, surtout en mode Battle en temps réel
- **Questions aléatoires par joueur** : piochées aléatoirement dans une grande banque, pour que deux joueurs n'aient jamais le même ordre au même moment
- **Vérification par numéro de téléphone** (via MonCash ou SMS) pour limiter la création de faux comptes
- **Rotation fréquente des questions**, surtout avant les concours à prix réel
- **Détection d'activité suspecte** : réponses anormalement rapides ou taux de réussite parfait répété → flag pour revue manuelle
- **Concours à prix réel en mode Battle uniquement** : le format duel + chrono court est plus difficile à tricher qu'un quiz solo sans limite de temps

## 🗺️ Roadmap

- [ ] MVP : quiz solo + banque de questions
- [ ] Système de tickets et limite journalière
- [ ] Classement global (Firebase)
- [ ] Mode Battle (duel en temps réel)
- [ ] Intégration MonCash
- [ ] Concours hebdomadaire avec prix
- [ ] Version React (v2)

## 📄 Licence

À définir.
