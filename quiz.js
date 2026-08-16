// ==========================================
// KONKOU
// SYSTÈME DE QUIZ
// ==========================================


// ==========================================
// ÉTAT DU JEU
// ==========================================

const state = {

  categories: [

    {
      name: "Culture générale",
      icon: "🧠",

      questions: [

        {
          question:
            "Quelle est la capitale de la France ?",

          choices: [
            "Paris",
            "Madrid",
            "Rome",
            "Berlin"
          ],

          answerIndex: 0
        },

        {
          question:
            "Quelle est la plus grande planète du système solaire ?",

          choices: [
            "Mars",
            "Terre",
            "Jupiter",
            "Vénus"
          ],

          answerIndex: 2
        },

        {
          question:
            "Combien y a-t-il de continents ?",

          choices: [
            "5",
            "6",
            "7",
            "8"
          ],

          answerIndex: 2
        },

        {
          question:
            "Quel est le plus grand océan du monde ?",

          choices: [
            "Atlantique",
            "Pacifique",
            "Indien",
            "Arctique"
          ],

          answerIndex: 1
        },

        {
          question:
            "Combien de jours compte une année normale ?",

          choices: [
            "360",
            "365",
            "366",
            "370"
          ],

          answerIndex: 1
        }

      ]
    },


    {
      name: "Culture haïtienne",
      icon: "🇭🇹",

      questions: [

        {
          question:
            "Quelle est la capitale d'Haïti ?",

          choices: [
            "Les Cayes",
            "Jacmel",
            "Port-au-Prince",
            "Cap-Haïtien"
          ],

          answerIndex: 2
        },

        {
          question:
            "Quelle est la fête nationale d'Haïti ?",

          choices: [
            "1er janvier",
            "18 mai",
            "17 octobre",
            "20 mai"
          ],

          answerIndex: 0
        },

        {
          question:
            "Quelles sont les deux langues officielles d'Haïti ?",

          choices: [
            "Français et créole",
            "Français et anglais",
            "Créole et espagnol",
            "Anglais et espagnol"
          ],

          answerIndex: 0
        }

      ]
    },


    {
      name: "Sport",
      icon: "⚽",

      questions: [

        {
          question:
            "Combien de joueurs une équipe de football a-t-elle sur le terrain ?",

          choices: [
            "9",
            "10",
            "11",
            "12"
          ],

          answerIndex: 2
        },

        {
          question:
            "Quel sport utilise un volant ?",

          choices: [
            "Tennis",
            "Badminton",
            "Basketball",
            "Football"
          ],

          answerIndex: 1
        },

        {
          question:
            "Combien vaut un tir à trois points au basketball ?",

          choices: [
            "1",
            "2",
            "3",
            "4"
          ],

          answerIndex: 2
        }

      ]
    },


    {
      name: "Sciences",
      icon: "🔬",

      questions: [

        {
          question:
            "Quelle est la formule chimique de l'eau ?",

          choices: [
            "CO2",
            "H2O",
            "O2",
            "NaCl"
          ],

          answerIndex: 1
        },

        {
          question:
            "Quelle planète est la plus proche du Soleil ?",

          choices: [
            "Terre",
            "Vénus",
            "Mercure",
            "Mars"
          ],

          answerIndex: 2
        },

        {
          question:
            "Quel organe pompe le sang dans le corps humain ?",

          choices: [
            "Le cerveau",
            "Le foie",
            "Le cœur",
            "Le poumon"
          ],

          answerIndex: 2
        }

      ]
    },


    {
      name: "Informatique",
      icon: "💻",

      questions: [

        {
          question:
            "Que signifie HTML ?",

          choices: [
            "HyperText Markup Language",
            "HighText Machine Language",
            "Hyper Tool Modern Language",
            "HomeText Markup Language"
          ],

          answerIndex: 0
        },

        {
          question:
            "Quel langage est utilisé pour styliser une page web ?",

          choices: [
            "HTML",
            "CSS",
            "JavaScript",
            "Python"
          ],

          answerIndex: 1
        },

        {
          question:
            "Quel langage permet d'ajouter de l'interactivité à une page web ?",

          choices: [
            "CSS",
            "HTML",
            "JavaScript",
            "SQL"
          ],

          answerIndex: 2
        }

      ]
    }

  ],


  currentCategory: null,

  currentQuestions: [],

  currentIndex: 0,

  score: 0,

  timer: null,

  timeLeft: 15,

  tickets: 3,

  answered: false

};


const TIME_PER_QUESTION = 15;


// ==========================================
// ÉLÉMENTS HTML
// ==========================================

const screens = {

  home:
    document.getElementById("screen-home"),

  quiz:
    document.getElementById("screen-quiz"),

  result:
    document.getElementById("screen-result")

};


const el = {

  ticketCount:
    document.getElementById("ticket-count"),

  ticketCountHome:
    document.getElementById("ticket-count-home"),

  categoryList:
    document.getElementById("category-list"),

  quizCategory:
    document.getElementById("quiz-category"),

  quizQuestion:
    document.getElementById("quiz-question"),

  quizChoices:
    document.getElementById("quiz-choices"),

  quizScore:
    document.getElementById("quiz-score"),

  quizProgress:
    document.getElementById("quiz-progress"),

  progressFill:
    document.getElementById("progress-fill"),

  timer:
    document.getElementById("timer"),

  resultScore:
    document.getElementById("result-score"),

  resultTotal:
    document.getElementById("result-total"),

  resultMessage:
    document.getElementById("result-message"),

  resultBadge:
    document.getElementById("result-badge"),

  btnQuit:
    document.getElementById("btn-quit"),

  btnReplay:
    document.getElementById("btn-replay"),

  btnHome:
    document.getElementById("btn-home")

};


// ==========================================
// VÉRIFICATION
// ==========================================

console.log("KONKOU : JavaScript chargé.");


// ==========================================
// AFFICHER LES CATÉGORIES
// ==========================================

function renderCategories() {

  console.log("Création des catégories...");

  el.categoryList.innerHTML = "";


  state.categories.forEach(
    (category) => {

      const button =
        document.createElement("button");


      button.type = "button";


      button.className =
        "category-card";


      button.innerHTML = `

        <div class="category-icon">
          ${category.icon}
        </div>

        <h3>
          ${category.name}
        </h3>

        <p>
          ${category.questions.length}
          questions
        </p>

        <span class="category-arrow">
          →
        </span>

      `;


      button.addEventListener(
        "click",
        function () {

          console.log(
            "Catégorie sélectionnée :",
            category.name
          );

          startQuiz(category);

        }
      );


      el.categoryList.appendChild(
        button
      );

    }
  );

}


// ==========================================
// TICKETS
// ==========================================

function updateTickets() {

  if (el.ticketCount) {

    el.ticketCount.textContent =
      state.tickets;

  }


  if (el.ticketCountHome) {

    el.ticketCountHome.textContent =
      state.tickets;

  }

}


// ==========================================
// CHANGER D'ÉCRAN
// ==========================================

function showScreen(name) {

  screens.home.classList.remove("active");

  screens.quiz.classList.remove("active");

  screens.result.classList.remove("active");


  screens[name].classList.add("active");

}


// ==========================================
// DÉMARRER LE QUIZ
// ==========================================

function startQuiz(category) {

  if (state.tickets <= 0) {

    alert(
      "Tu n'as plus de tickets disponibles."
    );

    return;

  }


  state.tickets--;

  updateTickets();


  state.currentCategory =
    category;


  state.currentQuestions =
    shuffle(
      [...category.questions]
    );


  state.currentIndex = 0;

  state.score = 0;

  state.answered = false;


  showScreen("quiz");


  showQuestion();

}


// ==========================================
// MÉLANGER
// ==========================================

function shuffle(array) {

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );


    [
      array[i],
      array[j]
    ] =
    [
      array[j],
      array[i]
    ];

  }


  return array;

}


// ==========================================
// AFFICHER QUESTION
// ==========================================

function showQuestion() {

  clearInterval(
    state.timer
  );


  state.answered = false;


  const question =
    state.currentQuestions[
      state.currentIndex
    ];


  if (!question) {

    finishQuiz();

    return;

  }


  el.quizCategory.textContent =
    state.currentCategory.name;


  el.quizQuestion.textContent =
    question.question;


  el.quizScore.textContent =
    state.score;


  el.quizProgress.textContent =
    `Question ${
      state.currentIndex + 1
    } sur ${
      state.currentQuestions.length
    }`;


  const progress =
    (
      state.currentIndex /
      state.currentQuestions.length
    ) * 100;


  el.progressFill.style.width =
    progress + "%";


  el.quizChoices.innerHTML =
    "";


  const choices =
    question.choices.map(
      (text, index) => ({

        text: text,

        correct:
          index === question.answerIndex

      })
    );


  shuffle(choices);


  choices.forEach(
    (choice) => {

      const button =
        document.createElement("button");


      button.type =
        "button";


      button.textContent =
        choice.text;


      button.addEventListener(
        "click",
        function () {

          selectAnswer(
            button,
            choice.correct
          );

        }
      );


      el.quizChoices.appendChild(
        button
      );

    }
  );


  startTimer();

}


// ==========================================
// CHRONOMÈTRE
// ==========================================

function startTimer() {

  clearInterval(
    state.timer
  );


  state.timeLeft =
    TIME_PER_QUESTION;


  el.timer.textContent =
    state.timeLeft;


  el.timer.classList.remove(
    "low"
  );


  state.timer =
    setInterval(
      function () {

        state.timeLeft--;


        el.timer.textContent =
          state.timeLeft;


        if (
          state.timeLeft <= 5
        ) {

          el.timer.classList.add(
            "low"
          );

        }


        if (
          state.timeLeft <= 0
        ) {

          clearInterval(
            state.timer
          );


          if (
            !state.answered
          ) {

            selectAnswer(
              null,
              false
            );

          }

        }

      },
      1000
    );

}


// ==========================================
// RÉPONDRE
// ==========================================

function selectAnswer(
  button,
  correct
) {

  if (
    state.answered
  ) {

    return;

  }


  state.answered =
    true;


  clearInterval(
    state.timer
  );


  const buttons =
    el.quizChoices
      .querySelectorAll(
        "button"
      );


  buttons.forEach(
    (btn) => {

      btn.disabled =
        true;


      if (
        btn === button
      ) {

        btn.classList.add(
          correct
            ? "correct"
            : "wrong"
        );

      }

    }
  );


  if (correct) {

    state.score += 10;

  }


  el.quizScore.textContent =
    state.score;


  setTimeout(
    function () {

      state.currentIndex++;


      if (
        state.currentIndex <
        state.currentQuestions.length
      ) {

        showQuestion();

      } else {

        finishQuiz();

      }

    },
    800
  );

}


// ==========================================
// TERMINER LE QUIZ
// ==========================================

function finishQuiz() {

  clearInterval(
    state.timer
  );


  const total =
    state.currentQuestions.length *
    10;


  el.resultScore.textContent =
    state.score;


  el.resultTotal.textContent =
    total;


  const ratio =
    state.score / total;


  if (
    ratio === 1
  ) {

    el.resultMessage.textContent =
      "Excellent ! Score parfait !";


    el.resultBadge.textContent =
      "🏆 Score parfait !";


    el.resultBadge.style.display =
      "inline-block";

  }

  else if (
    ratio >= 0.7
  ) {

    el.resultMessage.textContent =
      "Très bien ! Tu maîtrises cette catégorie.";


    el.resultBadge.textContent =
      "👍 Très bon score !";


    el.resultBadge.style.display =
      "inline-block";

  }

  else {

    el.resultMessage.textContent =
      "Pas mal ! Continue à t'entraîner.";


    el.resultBadge.style.display =
      "none";

  }


  el.progressFill.style.width =
    "100%";


  showScreen("result");

}


// ==========================================
// BOUTON QUITTER
// ==========================================

el.btnQuit.addEventListener(
  "click",
  function () {

    clearInterval(
      state.timer
    );

    showScreen("home");

  }
);


// ==========================================
// BOUTON REJOUER
// ==========================================

el.btnReplay.addEventListener(
  "click",
  function () {

    if (
      state.currentCategory
    ) {

      startQuiz(
        state.currentCategory
      );

    }

  }
);


// ==========================================
// BOUTON ACCUEIL
// ==========================================

el.btnHome.addEventListener(
  "click",
  function () {

    clearInterval(
      state.timer
    );

    showScreen("home");

  }
);


// ==========================================
// LANCEMENT
// ==========================================

renderCategories();

updateTickets();

showScreen("home");

console.log("KONKOU : interface prête.");
