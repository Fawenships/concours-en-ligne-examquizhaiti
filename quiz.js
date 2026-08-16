// ==========================================
// DONNÉES DES QUESTIONS (intégrées, pas de fetch)
// ==========================================
const CATEGORIES = [
  {
    id: "histoire",
    name: "Histoire d'Haïti",
    questions: [
      { question: "En quelle année Haïti est-elle devenue indépendante ?", choices: ["1791", "1804", "1815", "1822"], answerIndex: 1 },
      { question: "Qui a été le premier chef d'État d'Haïti après l'indépendance ?", choices: ["Toussaint Louverture", "Henri Christophe", "Jean-Jacques Dessalines", "Alexandre Pétion"], answerIndex: 2 },
      { question: "Quelle bataille marque une étape importante de la lutte pour l'indépendance en 1803 ?", choices: ["Bataille de Vertières", "Bataille de Crête-à-Pierrot", "Bataille de Santo Domingo", "Bataille de Léogâne"], answerIndex: 0 }
    ]
  },
  {
    id: "geographie",
    name: "Géographie",
    questions: [
      { question: "Quelle est la capitale d'Haïti ?", choices: ["Cap-Haïtien", "Jacmel", "Port-au-Prince", "Gonaïves"], answerIndex: 2 },
      { question: "Avec quel pays Haïti partage-t-elle l'île d'Hispaniola ?", choices: ["Cuba", "Jamaïque", "République Dominicaine", "Porto Rico"], answerIndex: 2 }
    ]
  },
  {
    id: "sport",
    name: "Sport",
    questions: [
      { question: "Quel sport est le plus populaire en Haïti ?", choices: ["Basketball", "Football", "Baseball", "Boxe"], answerIndex: 1 }
    ]
  }
];

// ==========================================
// CONCOURS PAYANT (démo — pot simulé en local)
// ==========================================
const PAID_CONTEST = {
  id: "concours-semaine",
  name: "🏆 Concours de la semaine",
  entryFee: 50,
  winnersCount: 3,
  prizeShares: [0.5, 0.3, 0.2],
  commission: 0.2,
  questions: [
    { question: "En quelle année Haïti est-elle devenue indépendante ?", choices: ["1791", "1804", "1815", "1822"], answerIndex: 1 },
    { question: "Quelle est la capitale d'Haïti ?", choices: ["Cap-Haïtien", "Jacmel", "Port-au-Prince", "Gonaïves"], answerIndex: 2 },
    { question: "Quel sport est le plus populaire en Haïti ?", choices: ["Basketball", "Football", "Baseball", "Boxe"], answerIndex: 1 }
  ]
};

const TIME_PER_QUESTION = 15;
const FREE_TICKETS_PER_DAY = 3;

// ==========================================
// ÉTAT DU JEU
// ==========================================
const state = {
  currentCategory: null,
  currentQuestions: [],
  currentIndex: 0,
  score: 0,
  timer: null,
  timeLeft: 15,
  tickets: 3,
  answered: false,
  currentPlayerPhone: null
};

// ==========================================
// ÉLÉMENTS DOM
// ==========================================
const screens = {
  home: document.getElementById('screen-home'),
  payment: document.getElementById('screen-payment'),
  quiz: document.getElementById('screen-quiz'),
  result: document.getElementById('screen-result')
};

const el = {
  ticketCount: document.getElementById('ticket-count'),
  ticketCountHome: document.getElementById('ticket-count-home'),
  categoryList: document.getElementById('category-list'),
  quizCategory: document.getElementById('quiz-category'),
  quizQuestion: document.getElementById('quiz-question'),
  quizChoices: document.getElementById('quiz-choices'),
  quizScore: document.getElementById('quiz-score'),
  quizProgress: document.getElementById('quiz-progress'),
  progressFill: document.getElementById('progress-fill'),
  timer: document.getElementById('timer'),
  resultScore: document.getElementById('result-score'),
  resultTotal: document.getElementById('result-total'),
  resultMessage: document.getElementById('result-message'),
  resultBadge: document.getElementById('result-badge'),
  contestStandings: document.getElementById('contest-standings'),
  paymentFee: document.getElementById('payment-fee'),
  paymentPlayers: document.getElementById('payment-players'),
  paymentPot: document.getElementById('payment-pot'),
  paymentPhone: document.getElementById('payment-phone'),
  paymentStatus: document.getElementById('payment-status'),
  btnPay: document.getElementById('btn-pay'),
  btnPaymentCancel: document.getElementById('btn-payment-cancel'),
  btnQuit: document.getElementById('btn-quit'),
  btnReplay: document.getElementById('btn-replay'),
  btnHome: document.getElementById('btn-home')
};

// ==========================================
// NAVIGATION
// ==========================================
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ==========================================
// CATÉGORIES
// ==========================================
function renderCategories() {
  el.categoryList.innerHTML = '';

  const paidBtn = document.createElement('button');
  paidBtn.className = 'paid-contest-btn';
  paidBtn.innerHTML = `<span>${PAID_CONTEST.name}</span><span class="cat-count">Entrée : ${PAID_CONTEST.entryFee} HTG</span>`;
  paidBtn.addEventListener('click', () => openPaymentScreen());
  el.categoryList.appendChild(paidBtn);

  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.innerHTML = `<span>${cat.name}</span><span class="cat-count">${cat.questions.length} questions</span>`;
    btn.addEventListener('click', () => startQuiz(cat));
    el.categoryList.appendChild(btn);
  });
}

// ==========================================
// TICKETS
// ==========================================
function updateTickets() {
  const today = new Date().toISOString().slice(0, 10);
  const saved = JSON.parse(localStorage.getItem('konkou_tickets') || '{}');
  if (saved.date === today) {
    state.tickets = saved.count;
  } else {
    state.tickets = FREE_TICKETS_PER_DAY;
    saveTickets();
  }
  refreshTicketDisplay();
}

function saveTickets() {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem('konkou_tickets', JSON.stringify({ date: today, count: state.tickets }));
  refreshTicketDisplay();
}

function refreshTicketDisplay() {
  el.ticketCount.textContent = state.tickets;
  el.ticketCountHome.textContent = state.tickets;
}

function useTicket() {
  if (state.tickets <= 0) return false;
  state.tickets -= 1;
  saveTickets();
  return true;
}

// ==========================================
// CONCOURS PAYANT — POT ET CLASSEMENT SIMULÉS
// ==========================================
function getContestEntries() {
  return JSON.parse(localStorage.getItem('konkou_contest_entries') || '[]');
}

function saveContestEntries(entries) {
  localStorage.setItem('konkou_contest_entries', JSON.stringify(entries));
}

function addPlayerToPot(phone) {
  const entries = getContestEntries();
  entries.push({ phone, score: null, joinedAt: Date.now() });
  saveContestEntries(entries);
  return entries;
}

function recordPlayerScore(phone, score) {
  const entries = getContestEntries();
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].phone === phone && entries[i].score === null) {
      entries[i].score = score;
      break;
    }
  }
  saveContestEntries(entries);
  return entries;
}

function computeStandings() {
  const entries = getContestEntries().filter(e => e.score !== null);
  const totalPot = getContestEntries().length * PAID_CONTEST.entryFee;
  const netPot = Math.round(totalPot * (1 - PAID_CONTEST.commission));

  const ranked = [...entries].sort((a, b) => b.score - a.score);
  const winners = ranked.slice(0, PAID_CONTEST.winnersCount).map((entry, i) => ({
    ...entry,
    rank: i + 1,
    prize: Math.round(netPot * (PAID_CONTEST.prizeShares[i] || 0))
  }));

  return { totalPot, netPot, winners };
}

function refreshPaymentSummary() {
  const entries = getContestEntries();
  const total = entries.length * PAID_CONTEST.entryFee;
  el.paymentFee.textContent = `${PAID_CONTEST.entryFee} HTG`;
  el.paymentPlayers.textContent = entries.length;
  el.paymentPot.textContent = `${total} HTG`;
}

function openPaymentScreen() {
  el.paymentPhone.value = '';
  el.paymentStatus.textContent = '';
  el.btnPay.disabled = false;
  el.btnPay.textContent = 'Payer et rejoindre';
  refreshPaymentSummary();
  showScreen('payment');
}

el.btnPaymentCancel.addEventListener('click', () => {
  showScreen('home');
});

el.btnPay.addEventListener('click', () => {
  const phone = el.paymentPhone.value.trim();

  if (phone.length < 8) {
    el.paymentStatus.textContent = "Entre un numéro MonCash valide.";
    el.paymentStatus.className = 'payment-status error';
    return;
  }

  el.btnPay.disabled = true;
  el.btnPay.textContent = 'Paiement en cours...';
  el.paymentStatus.textContent = '';

  setTimeout(() => {
    state.currentPlayerPhone = phone;
    addPlayerToPot(phone);
    el.paymentStatus.textContent = "Paiement confirmé (simulation). Bonne chance !";
    el.paymentStatus.className = 'payment-status success';
    setTimeout(() => startQuiz(PAID_CONTEST), 900);
  }, 1500);
});

// ==========================================
// DÉROULEMENT DU QUIZ
// ==========================================
function startQuiz(category) {
  const isPaidContest = category.id === PAID_CONTEST.id;
  if (!isPaidContest && !useTicket()) {
    alert("Tu n'as plus de tickets aujourd'hui. Reviens demain !");
    return;
  }
  state.currentCategory = category;
  state.currentQuestions = shuffle([...category.questions]);
  state.currentIndex = 0;
  state.score = 0;
  showScreen('quiz');
  showQuestion();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showQuestion() {
  state.answered = false;
  const q = state.currentQuestions[state.currentIndex];

  el.quizCategory.textContent = state.currentCategory.name;
  el.quizQuestion.textContent = q.question;
  el.quizScore.textContent = state.score;
  el.quizProgress.textContent = `Question ${state.currentIndex + 1} sur ${state.currentQuestions.length}`;

  const progress = (state.currentIndex / state.currentQuestions.length) * 100;
  el.progressFill.style.width = progress + '%';

  el.quizChoices.innerHTML = '';
  const shuffledChoices = q.choices.map((text, i) => ({ text, isCorrect: i === q.answerIndex }));
  shuffle(shuffledChoices);

  shuffledChoices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice.text;
    btn.addEventListener('click', () => selectAnswer(btn, choice.isCorrect));
    el.quizChoices.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  state.timeLeft = TIME_PER_QUESTION;
  el.timer.textContent = state.timeLeft;
  el.timer.classList.remove('low');
  clearInterval(state.timer);

  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    el.timer.textContent = state.timeLeft;
    if (state.timeLeft <= 5) el.timer.classList.add('low');

    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      if (!state.answered) selectAnswer(null, false);
    }
  }, 1000);
}

function selectAnswer(btnEl, isCorrect) {
  if (state.answered) return;
  state.answered = true;
  clearInterval(state.timer);

  const buttons = el.quizChoices.querySelectorAll('button');
  buttons.forEach(b => {
    b.disabled = true;
    if (b === btnEl) b.classList.add(isCorrect ? 'correct' : 'wrong');
  });

  if (isCorrect) state.score += 10;

  setTimeout(() => {
    state.currentIndex += 1;
    if (state.currentIndex < state.currentQuestions.length) {
      showQuestion();
    } else {
      finishQuiz();
    }
  }, 900);
}

function finishQuiz() {
  const total = state.currentQuestions.length * 10;
  el.resultScore.textContent = state.score;
  el.resultTotal.textContent = total;

  const isPaidContest = state.currentCategory.id === PAID_CONTEST.id;

  if (isPaidContest && state.currentPlayerPhone) {
    recordPlayerScore(state.currentPlayerPhone, state.score);
    showContestStandings();
    return;
  }

  const ratio = state.score / total;
  let message = 'Pas mal ! Retente ta chance pour faire mieux.';
  if (ratio === 1) message = 'Parfait ! Tu as répondu juste à toutes les questions !';
  else if (ratio >= 0.7) message = 'Très bien ! Tu maîtrises bien cette catégorie.';

  el.resultMessage.textContent = message;
  el.resultBadge.style.display = ratio >= 0.7 ? 'inline-block' : 'none';
  el.resultBadge.textContent = ratio === 1 ? '🏆 Score parfait !' : '👍 Bien joué !';
  el.contestStandings.style.display = 'none';
  showScreen('result');
}

function showContestStandings() {
  const { totalPot, netPot, winners } = computeStandings();
  const myRank = winners.find(w => w.phone === state.currentPlayerPhone && w.rank);

  el.resultMessage.textContent = myRank
    ? `Tu es actuellement classé n°${myRank.rank} — gain estimé : ${myRank.prize} HTG.`
    : "Tu n'es pas encore dans le top 3 pour l'instant.";
  el.resultBadge.style.display = 'none';

  el.contestStandings.style.display = 'block';
  el.contestStandings.innerHTML = `
    <div class="pot-line">Pot total : <strong>${totalPot} HTG</strong> — Pot net (après commission) : <strong>${netPot} HTG</strong></div>
    <div class="standings-title">Top 3 actuel</div>
    <div class="standings-list">
      ${winners.length === 0 ? '<p class="standings-empty">Aucun score enregistré pour l’instant.</p>' : ''}
      ${winners.map(w => `
        <div class="standing-row">
          <span class="standing-rank">#${w.rank}</span>
          <span class="standing-phone">${maskPhone(w.phone)}</span>
          <span class="standing-score">${w.score} pts</span>
          <span class="standing-prize">${w.prize} HTG</span>
        </div>
      `).join('')}
    </div>
    <p class="standings-note">Classement provisoire — se met à jour à chaque nouvelle partie.</p>
  `;

  showScreen('result');
}

function maskPhone(phone) {
  if (phone.length < 4) return phone;
  return phone.slice(0, 4) + '••••';
}

// ==========================================
// ÉVÉNEMENTS
// ==========================================
el.btnQuit.addEventListener('click', () => {
  clearInterval(state.timer);
  showScreen('home');
});

el.btnReplay.addEventListener('click', () => {
  if (state.currentCategory) startQuiz(state.currentCategory);
});

el.btnHome.addEventListener('click', () => {
  clearInterval(state.timer);
  showScreen('home');
});

// ==========================================
// LANCEMENT
// ==========================================
renderCategories();
updateTickets();
showScreen('home');

console.log("KONKOU : interface prête.");
