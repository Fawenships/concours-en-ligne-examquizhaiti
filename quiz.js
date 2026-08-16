// ===============================
// KONKOU — INTERFACE DE DÉMO
// ===============================

const state = {

  categories: [
    {
      name: "Culture générale",
      icon: "🧠",
      questions: 10
    },

    {
      name: "Culture haïtienne",
      icon: "🇭🇹",
      questions: 10
    },

    {
      name: "Sport",
      icon: "⚽",
      questions: 10
    },

    {
      name: "Actualité",
      icon: "📰",
      questions: 10
    },

    {
      name: "Sciences",
      icon: "🔬",
      questions: 10
    },

    {
      name: "Informatique",
      icon: "💻",
      questions: 10
    }
  ],

  currentCategory: null,

  tickets: 3,

  score: 0

};


// ===============================
// ÉLÉMENTS
// ===============================

const screens = {

  home: document.getElementById("screen-home"),

  quiz: document.getElementById("screen-quiz"),

  result: document.getElementById("screen-result")

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


// ===============================
// AFFICHER LES CATÉGORIES
// ===============================

function renderCategories() {

  el.categoryList.innerHTML = "";

  state.categories.forEach((category) => {

    const button =
      document.createElement("button");

    button.className = "category-card";

    button.innerHTML = `

      <div class="category-icon">
        ${category.icon}
      </div>

      <h3>
        ${category.name}
      </h3>

      <p>
        ${category.questions} questions
      </p>

      <span class="category-arrow">
        →
      </span>

    `;

    button.addEventListener(
      "click",
      () => startQuiz(category)
    );

    el.categoryList.appendChild(button);

  });

}


// ===============================
// TICKETS
// ===============================

function updateTickets() {

  el.ticketCount.textContent =
    state.tickets;

  el.ticketCountHome.textContent =
    state.tickets;

}


// ===============================
// NAVIGATION
// ===============================

function showScreen(name) {

  Object.values(screens).forEach(
    screen => {

      screen.classList.remove("active");

    }
  );

  screens[name].classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ===============================
// DÉMARRER LE QUIZ
// ===============================

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

  state.score = 0;


  showScreen("quiz");


  el.quizCategory.textContent =
    category.name;


  el.quizScore.textContent =
    "0";


  el.quizProgress.textContent =
    "Question 1 sur 10";


  el.quizQuestion.textContent =
    "Les questions seront ajoutées prochainement.";


  el.progressFill.style.width =
    "0%";


  el.timer.textContent =
    "15";


  createDemoChoices();

}


// ===============================
// CHOIX DE DÉMONSTRATION
// ===============================

function createDemoChoices() {

  el.quizChoices.innerHTML = "";


  const choices = [

    "Réponse A",

    "Réponse B",

    "Réponse C",

    "Réponse D"

  ];


  choices.forEach(
    (choice) => {

      const button =
        document.createElement("button");

      button.textContent =
        choice;

      button.addEventListener(
        "click",
        () => {

          state.score += 10;

          el.quizScore.textContent =
            state.score;

          showResult();

        }
      );

      el.quizChoices.appendChild(
        button
      );

    }
  );

}


// ===============================
// AFFICHER LE RÉSULTAT
// ===============================

function showResult() {

  el.resultScore.textContent =
    state.score;

  el.resultTotal.textContent =
    "100";

  el.resultMessage.textContent =
    "Très bien ! Ceci est actuellement une interface de démonstration.";

  el.resultBadge.textContent =
    "👍 Bien joué !";

  showScreen("result");

}


// ===============================
// QUITTER
// ===============================

el.btnQuit.addEventListener(
  "click",
  () => {

    showScreen("home");

  }
);


// ===============================
// REJOUER
// ===============================

el.btnReplay.addEventListener(
  "click",
  () => {

    if (state.currentCategory) {

      startQuiz(
        state.currentCategory
      );

    }

  }
);


// ===============================
// RETOUR ACCUEIL
// ===============================

el.btnHome.addEventListener(
  "click",
  () => {

    showScreen("home");

  }
);


// ===============================
// INITIALISATION
// ===============================

renderCategories();

updateTickets();

showScreen("home");
