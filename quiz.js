// ===============================
// KONKOU — QUIZ
// ===============================

const state = {
  categories: [],
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
const FREE_TICKETS_PER_DAY = 3;


// ===============================
// ÉLÉMENTS
// ===============================

const screens = {
  home: document.getElementById("screen-home"),
  quiz: document.getElementById("screen-quiz"),
  result: document.getElementById("screen-result")
};

const el = {
  ticketCount: document.getElementById("ticket-count"),
  ticketCountHome: document.getElementById("ticket-count-home"),
  categoryList: document.getElementById("category-list"),

  quizCategory: document.getElementById("quiz-category"),
  quizQuestion: document.getElementById("quiz-question"),
  quizChoices: document.getElementById("quiz-choices"),
  quizScore: document.getElementById("quiz-score"),
  quizProgress: document.getElementById("quiz-progress"),

  progressFill: document.getElementById("progress-fill"),
  timer: document.getElementById("timer"),

  resultScore: document.getElementById("result-score"),
  resultTotal: document.getElementById("result-total"),
  resultMessage: document.getElementById("result-message"),
  resultBadge: document.getElementById("result-badge"),

  btnQuit: document.getElementById("btn-quit"),
  btnReplay: document.getElementById("btn-replay"),
  btnHome: document.getElementById("btn-home")
};


// ===============================
// CHARGER LES QUESTIONS
// ===============================

async function loadQuestions() {

  try {

    const response =
      await fetch("data/questions.json");

    if (!response.ok) {
      throw new Error(
        "Impossible de charger questions.json"
      );
    }

    const data =
      await response.json();

    state.categories =
      data.categories || [];

    renderCategories();

  } catch (error) {

    console.error(error);

    el.categoryList.innerHTML = `
      <div class="error-message">
        <strong>Impossible de charger les catégories.</strong>
        <p>
          Vérifie que le fichier
          <b>data/questions.json</b>
          existe et que tu utilises un serveur local.
        </p>
      </div>
    `;

  }

}


// ===============================
// AFFICHER LES CATÉGORIES
// ===============================

function renderCategories() {

  el.categoryList.innerHTML = "";

  state.categories.forEach((category) => {

    const button =
      document.createElement("button");

    button.className =
      "category-card";

    const icon =
      getCategoryIcon(category.name);

    button.innerHTML = `

      <div class="category-icon">
        ${icon}
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
      () => startQuiz(category)
    );

    el.categoryList.appendChild(button);

  });

}


// ===============================
// ICÔNES DES CATÉGORIES
// ===============================

function getCategoryIcon(name) {

  const icons = {
    "Culture générale": "🧠",
    "Culture haïtienne": "🇭🇹",
    "Sport": "⚽",
    "Actualité": "📰",
    "Sciences": "🔬",
    "Informatique": "💻"
  };

  return icons[name] || "🎯";

}


// ===============================
// TICKETS
// ===============================

function loadTickets() {

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const saved =
    JSON.parse(
      localStorage.getItem(
        "konkou_tickets"
      ) || "{}"
    );

  if (saved.date === today) {

    state.tickets =
      Number(saved.count);

  } else {

    state.tickets =
      FREE_TICKETS_PER_DAY;

    saveTickets();

  }

  updateTickets();

}


function saveTickets() {

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  localStorage.setItem(
    "konkou_tickets",

    JSON.stringify({
      date: today,
      count: state.tickets
    })
  );

  updateTickets();

}


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


function useTicket() {

  if (state.tickets <= 0) {

    alert(
      "Tu n'as plus de tickets aujourd'hui."
    );

    return false;

  }

  state.tickets--;

  saveTickets();

  return true;

}


// ===============================
// NAVIGATION
// ===============================

function showScreen(name) {

  Object.values(screens).forEach(
    (screen) => {
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

  if (!category.questions ||
      category.questions.length === 0) {

    alert(
      "Cette catégorie ne contient aucune question."
    );

    return;

  }

  if (!useTicket()) {
    return;
  }

  state.currentCategory =
    category;

  // Copie des questions puis mélange
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


// ===============================
// MÉLANGER
// ===============================

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
    ] = [
      array[j],
      array[i]
    ];

  }

  return array;

}


// ===============================
// AFFICHER UNE QUESTION
// ===============================

function showQuestion() {

  clearInterval(state.timer);

  state.answered = false;

  const question =
    state.currentQuestions[
      state.currentIndex
    ];

  if (!question) {

    finishQuiz();

    return;

  }


  // Catégorie
  el.quizCategory.textContent =
    state.currentCategory.name;


  // Question
  el.quizQuestion.textContent =
    question.question;


  // Score
  el.quizScore.textContent =
    state.score;


  // Progression
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
    `${progress}%`;


  // Supprimer les anciennes réponses
  el.quizChoices.innerHTML = "";


  // Créer les réponses
  const choices =
    question.choices.map(
      (text, index) => ({
        text: text,
        isCorrect:
          index === question.answerIndex
      })
    );


  // Mélanger les réponses
  shuffle(choices);


  choices.forEach(
    (choice) => {

      const button =
        document.createElement("button");

      button.textContent =
        choice.text;

      button.addEventListener(
        "click",
        () =>
          selectAnswer(
            button,
            choice.isCorrect
          )
      );

      el.quizChoices.appendChild(
        button
      );

    }
  );


  startTimer();

}


// ===============================
// CHRONOMÈTRE
// ===============================

function startTimer() {

  clearInterval(state.timer);

  state.timeLeft =
    TIME_PER_QUESTION;

  el.timer.textContent =
    state.timeLeft;

  el.timer.classList.remove("low");


  state.timer =
    setInterval(() => {

      state.timeLeft--;

      el.timer.textContent =
        state.timeLeft;


      if (state.timeLeft <= 5) {

        el.timer.classList.add(
          "low"
        );

      }


      if (state.timeLeft <= 0) {

        clearInterval(
          state.timer
        );

        if (!state.answered) {

          selectAnswer(
            null,
            false
          );

        }

      }

    }, 1000);

}


// ===============================
// RÉPONDRE
// ===============================

function selectAnswer(
  button,
  isCorrect
) {

  if (state.answered) {
    return;
  }

  state.answered = true;

  clearInterval(
    state.timer
  );


  const buttons =
    el.quizChoices
      .querySelectorAll("button");


  buttons.forEach(
    (btn) => {

      btn.disabled = true;

      if (btn === button) {

        btn.classList.add(
          isCorrect
            ? "correct"
            : "wrong"
        );

      }

    }
  );


  if (isCorrect) {

    state.score += 10;

    el.quizScore.textContent =
      state.score;

  }


  // Petite pause avant la question suivante
  setTimeout(() => {

    state.currentIndex++;


    if (
      state.currentIndex <
      state.currentQuestions.length
    ) {

      showQuestion();

    } else {

      finishQuiz();

    }

  }, 900);

}


// ===============================
// FIN DU QUIZ
// ===============================

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
    total > 0
      ? state.score / total
      : 0;


  let message =
    "Continue à t'entraîner pour améliorer ton score !";


  if (ratio === 1) {

    message =
      "Excellent ! Tu as obtenu un score parfait !";

  } else if (ratio >= 0.7) {

    message =
      "Très bien ! Tu maîtrises bien cette catégorie.";

  } else if (ratio >= 0.5) {

    message =
      "Pas mal ! Tu peux encore améliorer ton score.";

  }


  el.resultMessage.textContent =
    message;


  el.resultBadge.style.display =
    ratio >= 0.7
      ? "inline-block"
      : "none";


  el.resultBadge.textContent =
    ratio === 1
      ? "🏆 Score parfait !"
      : "👍 Bien joué !";


  // Barre de progression terminée
  el.progressFill.style.width =
    "100%";


  showScreen("result");

}


// ===============================
// QUITTER LE QUIZ
// ===============================

el.btnQuit.addEventListener(
  "click",
  () => {

    clearInterval(
      state.timer
    );

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
// RETOUR AUX CATÉGORIES
// ===============================

el.btnHome.addEventListener(
  "click",
  () => {

    clearInterval(
      state.timer
    );

    showScreen("home");

  }
);


// ===============================
// INITIALISATION
// ===============================

loadTickets();

loadQuestions();

showScreen("home");
