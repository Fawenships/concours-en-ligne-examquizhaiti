// ======================================================
// KONKOU — APPLICATION
// ======================================================

// ======================================================
// QUESTIONS
// ======================================================

const CATEGORIES = [

  {
    id: "histoire",
    name: "Histoire d'Haïti",

    questions: [

      {
        question: "En quelle année Haïti est-elle devenue indépendante ?",
        choices: ["1791", "1804", "1815", "1822"],
        answerIndex: 1
      },

      {
        question: "Qui a été le premier chef d'État d'Haïti après l'indépendance ?",
        choices: [
          "Toussaint Louverture",
          "Henri Christophe",
          "Jean-Jacques Dessalines",
          "Alexandre Pétion"
        ],
        answerIndex: 2
      },

      {
        question: "Quelle bataille marque une étape importante de la lutte pour l'indépendance en 1803 ?",
        choices: [
          "Bataille de Vertières",
          "Bataille de Crête-à-Pierrot",
          "Bataille de Santo Domingo",
          "Bataille de Léogâne"
        ],
        answerIndex: 0
      }

    ]
  },

  {
    id: "geographie",
    name: "Géographie",

    questions: [

      {
        question: "Quelle est la capitale d'Haïti ?",
        choices: [
          "Cap-Haïtien",
          "Jacmel",
          "Port-au-Prince",
          "Gonaïves"
        ],
        answerIndex: 2
      },

      {
        question: "Avec quel pays Haïti partage-t-elle l'île d'Hispaniola ?",
        choices: [
          "Cuba",
          "Jamaïque",
          "République Dominicaine",
          "Porto Rico"
        ],
        answerIndex: 2
      }

    ]
  },

  {
    id: "sport",
    name: "Sport",

    questions: [

      {
        question: "Quel sport est le plus populaire en Haïti ?",
        choices: [
          "Basketball",
          "Football",
          "Baseball",
          "Boxe"
        ],
        answerIndex: 1
      }

    ]
  }

];


// ======================================================
// CONCOURS PAYANT — SIMULATION
// ======================================================

const PAID_CONTEST = {

  id: "concours-semaine",

  name: "🏆 Concours de la semaine",

  entryFee: 50,

  winnersCount: 3,

  prizeShares: [
    0.5,
    0.3,
    0.2
  ],

  commission: 0.20,

  questions: [

    {
      question: "En quelle année Haïti est-elle devenue indépendante ?",
      choices: ["1791", "1804", "1815", "1822"],
      answerIndex: 1
    },

    {
      question: "Quelle est la capitale d'Haïti ?",
      choices: [
        "Cap-Haïtien",
        "Jacmel",
        "Port-au-Prince",
        "Gonaïves"
      ],
      answerIndex: 2
    },

    {
      question: "Quel sport est le plus populaire en Haïti ?",
      choices: [
        "Basketball",
        "Football",
        "Baseball",
        "Boxe"
      ],
      answerIndex: 1
    }

  ]

};


// ======================================================
// CONFIGURATION
// ======================================================

const TIME_PER_QUESTION = 15;

const FREE_TICKETS_PER_DAY = 3;


// ======================================================
// ÉTAT
// ======================================================

const state = {

  currentCategory: null,

  currentQuestions: [],

  currentIndex: 0,

  score: 0,

  correctAnswers: 0,

  timer: null,

  timeLeft: TIME_PER_QUESTION,

  tickets: FREE_TICKETS_PER_DAY,

  answered: false,

  currentPlayerPhone: null

};


// ======================================================
// ÉLÉMENTS HTML
// ======================================================

const screens = {

  home: document.getElementById("screen-home"),

  payment: document.getElementById("screen-payment"),

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

  contestStandings:
    document.getElementById("contest-standings"),

  paymentFee:
    document.getElementById("payment-fee"),

  paymentPlayers:
    document.getElementById("payment-players"),

  paymentPot:
    document.getElementById("payment-pot"),

  paymentPhone:
    document.getElementById("payment-phone"),

  paymentStatus:
    document.getElementById("payment-status"),

  btnPay:
    document.getElementById("btn-pay"),

  btnPaymentCancel:
    document.getElementById("btn-payment-cancel"),

  btnQuit:
    document.getElementById("btn-quit"),

  btnReplay:
    document.getElementById("btn-replay"),

  btnHome:
    document.getElementById("btn-home")

};


// ======================================================
// NAVIGATION
// ======================================================

function showScreen(name) {

  Object.values(screens).forEach(screen => {

    screen.classList.remove("active");

  });

  if (screens[name]) {

    screens[name].classList.add("active");

  }

}


// ======================================================
// CATÉGORIES
// ======================================================

function renderCategories() {

  el.categoryList.innerHTML = "";

  // Concours payant

  const paidButton = document.createElement("button");

  paidButton.className = "paid-contest-btn";

  paidButton.innerHTML = `
    <span>${PAID_CONTEST.name}</span>
    <span class="cat-count">
      Entrée : ${PAID_CONTEST.entryFee} HTG
    </span>
  `;

  paidButton.addEventListener(
    "click",
    openPaymentScreen
  );

  el.categoryList.appendChild(paidButton);


  // Catégories gratuites

  CATEGORIES.forEach(category => {

    const button =
      document.createElement("button");

    button.innerHTML = `
      <span>${category.name}</span>
      <span class="cat-count">
        ${category.questions.length} questions
      </span>
    `;

    button.addEventListener(
      "click",
      () => startQuiz(category)
    );

    el.categoryList.appendChild(button);

  });

}


// ======================================================
// TICKETS
// ======================================================

function getToday() {

  const now = new Date();

  return (
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0")
  );

}


function updateTickets() {

  const today = getToday();

  let saved = null;

  try {

    saved =
      JSON.parse(
        localStorage.getItem(
          "konkou_tickets"
        )
      );

  } catch {

    saved = null;

  }


  if (
    saved &&
    saved.date === today
  ) {

    state.tickets = saved.count;

  } else {

    state.tickets =
      FREE_TICKETS_PER_DAY;

    saveTickets();

  }


  refreshTicketDisplay();

}


function saveTickets() {

  localStorage.setItem(

    "konkou_tickets",

    JSON.stringify({

      date: getToday(),

      count: state.tickets

    })

  );

  refreshTicketDisplay();

}


function refreshTicketDisplay() {

  el.ticketCount.textContent =
    state.tickets;

  el.ticketCountHome.textContent =
    state.tickets;

}


function useTicket() {

  if (state.tickets <= 0) {

    return false;

  }

  state.tickets--;

  saveTickets();

  return true;

}


// ======================================================
// CONCOURS
// ======================================================

function getContestEntries() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "konkou_contest_entries"
      )
    ) || [];

  } catch {

    return [];

  }

}


function saveContestEntries(entries) {

  localStorage.setItem(

    "konkou_contest_entries",

    JSON.stringify(entries)

  );

}


function addPlayerToPot(phone) {

  const entries =
    getContestEntries();

  entries.push({

    phone: phone,

    score: null,

    joinedAt: Date.now()

  });

  saveContestEntries(entries);

  return entries;

}


function recordPlayerScore(
  phone,
  score
) {

  const entries =
    getContestEntries();

  for (
    let i = entries.length - 1;
    i >= 0;
    i--
  ) {

    if (
      entries[i].phone === phone &&
      entries[i].score === null
    ) {

      entries[i].score = score;

      break;

    }

  }

  saveContestEntries(entries);

}


// ======================================================
// CLASSEMENT
// ======================================================

function computeStandings() {

  const allEntries =
    getContestEntries();

  const scoredEntries =
    allEntries.filter(
      entry => entry.score !== null
    );

  const totalPot =
    allEntries.length *
    PAID_CONTEST.entryFee;

  const netPot =
    Math.round(
      totalPot *
      (1 - PAID_CONTEST.commission)
    );


  const ranked =
    [...scoredEntries].sort(
      (a, b) => b.score - a.score
    );


  const winners =
    ranked
      .slice(
        0,
        PAID_CONTEST.winnersCount
      )
      .map((entry, index) => ({

        ...entry,

        rank: index + 1,

        prize:
          Math.round(
            netPot *
            (
              PAID_CONTEST
                .prizeShares[index] || 0
            )
          )

      }));


  return {

    totalPot,

    netPot,

    winners

  };

}


// ======================================================
// PAIEMENT
// ======================================================

function refreshPaymentSummary() {

  const entries =
    getContestEntries();

  const total =
    entries.length *
    PAID_CONTEST.entryFee;


  el.paymentFee.textContent =
    `${PAID_CONTEST.entryFee} HTG`;

  el.paymentPlayers.textContent =
    entries.length;

  el.paymentPot.textContent =
    `${total} HTG`;

}


function openPaymentScreen() {

  el.paymentPhone.value = "";

  el.paymentStatus.textContent = "";

  el.paymentStatus.className =
    "payment-status";

  el.btnPay.disabled = false;

  el.btnPay.textContent =
    "Payer et rejoindre";

  refreshPaymentSummary();

  showScreen("payment");

}


el.btnPaymentCancel.addEventListener(
  "click",
  () => {

    showScreen("home");

  }
);


el.btnPay.addEventListener(
  "click",
  () => {

    const phone =
      el.paymentPhone.value
        .replace(/\s+/g, "")
        .trim();


    if (
      !/^\d{8}$/.test(phone)
    ) {

      el.paymentStatus.textContent =
        "Entre un numéro MonCash valide à 8 chiffres.";

      el.paymentStatus.className =
        "payment-status error";

      return;

    }


    el.btnPay.disabled = true;

    el.btnPay.textContent =
      "Paiement en cours...";


    el.paymentStatus.textContent =
      "Vérification du paiement...";


    setTimeout(() => {

      state.currentPlayerPhone =
        phone;

      addPlayerToPot(phone);


      el.paymentStatus.textContent =
        "Paiement confirmé (simulation). Bonne chance !";

      el.paymentStatus.className =
        "payment-status success";


      setTimeout(() => {

        startQuiz(PAID_CONTEST);

      }, 800);


    }, 1200);

  }
);


// ======================================================
// QUIZ
// ======================================================

function startQuiz(category) {

  const isPaidContest =
    category.id === PAID_CONTEST.id;


  if (
    !isPaidContest &&
    !useTicket()
  ) {

    alert(
      "Tu n'as plus de tickets aujourd'hui. Reviens demain !"
    );

    return;

  }


  state.currentCategory =
    category;

  state.currentQuestions =
    shuffle(
      [...category.questions]
    );

  state.currentIndex = 0;

  state.score = 0;

  state.correctAnswers = 0;

  state.currentPlayerPhone =
    isPaidContest
      ? state.currentPlayerPhone
      : null;


  showScreen("quiz");

  showQuestion();

}


// ======================================================
// MÉLANGE
// ======================================================

function shuffle(array) {

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
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


// ======================================================
// QUESTION
// ======================================================

function showQuestion() {

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


  el.quizChoices.innerHTML = "";


  const choices =
    question.choices.map(
      (text, index) => ({

        text,

        isCorrect:
          index === question.answerIndex

      })
    );


  shuffle(choices);


  choices.forEach(choice => {

    const button =
      document.createElement("button");

    button.type = "button";

    button.textContent =
      choice.text;

    button.addEventListener(
      "click",
      () => {

        selectAnswer(
          button,
          choice.isCorrect
        );

      }
    );


    el.quizChoices.appendChild(
      button
    );

  });


  startTimer();

}


// ======================================================
// TIMER
// ======================================================

function startTimer() {

  clearInterval(state.timer);


  state.timeLeft =
    TIME_PER_QUESTION;


  el.timer.textContent =
    state.timeLeft;


  el.timer.classList.remove(
    "low"
  );


  state.timer =
    setInterval(() => {

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

    }, 1000);

}


// ======================================================
// RÉPONSE
// ======================================================

function selectAnswer(
  button,
  isCorrect
) {

  if (
    state.answered
  ) {

    return;

  }


  state.answered = true;


  clearInterval(
    state.timer
  );


  const buttons =
    el.quizChoices
      .querySelectorAll(
        "button"
      );


  buttons.forEach(
    currentButton => {

      currentButton.disabled =
        true;


      if (
        currentButton === button
      ) {

        currentButton.classList.add(
          isCorrect
            ? "correct"
            : "wrong"
        );

      }

    }
  );


  if (isCorrect) {

    state.score += 10;

    state.correctAnswers++;

  }


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

  }, 700);

}


// ======================================================
// FIN DU QUIZ
// ======================================================

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


  const isPaidContest =
    state.currentCategory.id ===
    PAID_CONTEST.id;


  if (
    isPaidContest &&
    state.currentPlayerPhone
  ) {

    recordPlayerScore(
      state.currentPlayerPhone,
      state.score
    );


    showContestStandings();

    return;

  }


  const ratio =
    total > 0
      ? state.score / total
      : 0;


  let message =
    "Pas mal ! Retente ta chance pour faire mieux.";


  if (
    ratio === 1
  ) {

    message =
      "🎉 Parfait ! Tu as répondu juste à toutes les questions !";

  } else if (
    ratio >= 0.7
  ) {

    message =
      "👏 Très bien ! Tu maîtrises bien cette catégorie.";

  } else if (
    ratio >= 0.5
  ) {

    message =
      "👍 Bien joué ! Tu peux encore progresser.";

  }


  el.resultMessage.textContent =
    message;


  if (
    el.resultBadge
  ) {

    el.resultBadge.style.display =
      ratio >= 0.7
        ? "inline-block"
        : "none";


    el.resultBadge.textContent =
      ratio === 1
        ? "🏆 Score parfait !"
        : "👍 Bien joué !";

  }


  if (
    el.contestStandings
  ) {

    el.contestStandings.style.display =
      "none";

  }


  showScreen("result");

}


// ======================================================
// CLASSEMENT DU CONCOURS
// ======================================================

function showContestStandings() {

  const {
    totalPot,
    netPot,
    winners
  } = computeStandings();


  const myRank =
    winners.find(
      winner =>
        winner.phone ===
        state.currentPlayerPhone
    );


  if (myRank) {

    el.resultMessage.textContent =
      `🏆 Tu es actuellement classé n°${myRank.rank} — gain estimé : ${myRank.prize} HTG.`;

  } else {

    el.resultMessage.textContent =
      "Tu n'es pas encore dans le top 3 pour l'instant.";

  }


  if (
    el.resultBadge
  ) {

    el.resultBadge.style.display =
      "none";

  }


  el.contestStandings.style.display =
    "block";


  el.contestStandings.innerHTML = `

    <div>

      Pot total :
      <strong>
        ${totalPot} HTG
      </strong>

      <br>

      Pot net :
      <strong>
        ${netPot} HTG
      </strong>

    </div>

    <br>

    <strong>
      🏆 Top 3 actuel
    </strong>

    <div>

      ${
        winners.length === 0

          ? `
            <p>
              Aucun score enregistré.
            </p>
          `

          : winners.map(
              winner => `

                <div
                  style="
                    display:flex;
                    justify-content:space-between;
                    padding:10px;
                    margin-top:8px;
                    background:white;
                    border-radius:10px;
                  "
                >

                  <span>
                    #${winner.rank}
                  </span>

                  <span>
                    ${maskPhone(
                      winner.phone
                    )}
                  </span>

                  <strong>
                    ${winner.score} pts
                  </strong>

                  <span>
                    ${winner.prize} HTG
                  </span>

                </div>

              `
            ).join("")

      }

    </div>

  `;


  showScreen("result");

}


// ======================================================
// MASQUER LE NUMÉRO
// ======================================================

function maskPhone(phone) {

  if (
    !phone ||
    phone.length < 4
  ) {

    return phone;

  }


  return (
    phone.substring(0, 4) +
    "••••"
  );

}


// ======================================================
// BOUTON QUITTER
// ======================================================

el.btnQuit.addEventListener(
  "click",
  () => {

    clearInterval(
      state.timer
    );

    state.currentPlayerPhone =
      null;

    showScreen("home");

  }
);


// ======================================================
// REJOUER
// ======================================================

el.btnReplay.addEventListener(
  "click",
  () => {

    if (
      state.currentCategory
    ) {

      startQuiz(
        state.currentCategory
      );

    }

  }
);


// ======================================================
// ACCUEIL
// ======================================================

el.btnHome.addEventListener(
  "click",
  () => {

    clearInterval(
      state.timer
    );

    state.currentPlayerPhone =
      null;

    showScreen("home");

  }
);


// ======================================================
// DÉMARRAGE
// ======================================================

function init() {

  renderCategories();

  updateTickets();

  showScreen("home");

  console.log(
    "🏆 KONKOU : application prête."
  );

}


init();
