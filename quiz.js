// ---------- ÉTAT DU JEU ----------
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

const TIME_PER_QUESTION = 15; // secondes
const FREE_TICKETS_PER_DAY = 3;

// ---------- ÉLÉMENTS DOM ----------
const screens = {
  home: document.getElementById('screen-home'),
  quiz: document.getElementById('screen-quiz'),
  result: document.getElementById('screen-result')
};

const el = {
  ticketCount: document.getElementById('ticket-count'),
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
  btnQuit: document.getElementById('btn-quit'),
  btnReplay: document.getElementById('btn-replay'),
  btnHome: document.getElementById('btn-home')
};

// ---------- CHARGEMENT DES QUESTIONS ----------
async function loadQuestions() {
  const res = await fetch('data/questions.json');
  const data = await res.json();
  state.categories = data.categories;
  renderCategoryList();
}

function renderCategoryList() {
  el.categoryList.innerHTML = '';
  state.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.innerHTML = `
      <span>${cat.name}</span>
      <span class="cat-count">${cat.questions.length} questions</span>
    `;
    btn.addEventListener('click', () => startQuiz(cat));
    el.categoryList.appendChild(btn);
  });
}

// ---------- GESTION DES TICKETS ----------
function loadTickets() {
  const today = new Date().toISOString().slice(0, 10);
  const saved = JSON.parse(localStorage.getItem('konkou_tickets') || '{}');
  if (saved.date === today) {
    state.tickets = saved.count;
  } else {
    state.tickets = FREE_TICKETS_PER_DAY;
    saveTickets();
  }
  el.ticketCount.textContent = state.tickets;
}

function saveTickets() {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem('konkou_tickets', JSON.stringify({ date: today, count: state.tickets }));
  el.ticketCount.textContent = state.tickets;
}

function useTicket() {
  if (state.tickets <= 0) return false;
  state.tickets -= 1;
  saveTickets();
  return true;
}

// ---------- NAVIGATION ----------
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ---------- DÉROULEMENT DU QUIZ ----------
function startQuiz(category) {
  if (!useTicket()) {
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

  const ratio = state.score / total;
  let message = 'Pas mal ! Retente ta chance pour faire mieux.';
  if (ratio === 1) message = 'Parfait ! Tu as répondu juste à toutes les questions !';
  else if (ratio >= 0.7) message = 'Très bien ! Tu maîtrises bien cette catégorie.';

  el.resultMessage.textContent = message;
  el.resultBadge.style.display = ratio >= 0.7 ? 'inline-block' : 'none';
  el.resultBadge.textContent = ratio === 1 ? '🏆 Score parfait !' : '👍 Bien joué !';
  showScreen('result');
}

// ---------- ÉVÉNEMENTS ----------
el.btnQuit.addEventListener('click', () => {
  clearInterval(state.timer);
  showScreen('home');
});

el.btnReplay.addEventListener('click', () => {
  startQuiz(state.currentCategory);
});

el.btnHome.addEventListener('click', () => {
  showScreen('home');
});

// ---------- INITIALISATION ----------
loadTickets();
loadQuestions();

// Enregistrement du service worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}
