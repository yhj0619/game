/* ===== 너굴 스피드 타이핑 ===== */
const GAME_TIME = 20;      // 제한 시간(초)
const BASE_POINT = 10;     // 정답 기본 점수(벨)
const PENALTY = 5;         // 오답 감점(벨)
const FEVER_COMBO = 5;     // 피버 진입에 필요한 연속 정답 수
const FEVER_MULTIPLIER = 2;

let score = 0;
let timeLeft = GAME_TIME;
let combo = 0;
let isFever = false;
let isGameRunning = false;
let gameInterval = null;
let bannerTimer = null;

const targetCharElement = document.getElementById('targetChar');
const targetAreaElement = document.getElementById('targetArea');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const typedCharElement = document.getElementById('typedChar');
const feedbackElement = document.getElementById('feedback');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const nookElement = document.getElementById('nook');
const nookRingElement = document.getElementById('nookRing');
const multiplierElement = document.getElementById('multiplier');
const feverBannerElement = document.getElementById('feverBanner');
const stampElements = Array.from(document.querySelectorAll('#stamps .stamp'));

/* ---------- 유틸 ---------- */
function getRandomChar() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return chars[Math.floor(Math.random() * chars.length)];
}

function setNewTargetChar() {
  targetCharElement.textContent = getRandomChar();
}

function restartAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function say(message, tone) {
  feedbackElement.textContent = message;
  feedbackElement.className = tone;
}

/* ---------- 너굴 리액션 ---------- */
function reactNook(type) {
  nookElement.classList.remove('correct', 'wrong');
  nookRingElement.classList.remove('correct', 'wrong');
  void nookElement.offsetWidth;
  nookElement.classList.add(type);
  nookRingElement.classList.add(type);
}

/* ---------- 점수 / 콤보 표시 ---------- */
function updateScoreDisplay(gained) {
  scoreElement.textContent = score + '벨';
  if (gained) restartAnimation(scoreElement, 'gain');
}

function updateComboDisplay() {
  const filled = isFever ? FEVER_COMBO : combo;
  stampElements.forEach((stamp, index) => {
    stamp.classList.toggle('on', index < filled);
  });
}

/* ---------- 피버 ---------- */
function enterFever() {
  isFever = true;
  document.body.classList.add('fever');
  multiplierElement.textContent = '×' + FEVER_MULTIPLIER;
  multiplierElement.classList.add('fever');
  nookElement.playbackRate = 1.6;
  updateComboDisplay();

  clearTimeout(bannerTimer);
  restartAnimation(feverBannerElement, 'show');
  bannerTimer = setTimeout(() => feverBannerElement.classList.remove('show'), 1200);
}

function exitFever() {
  isFever = false;
  document.body.classList.remove('fever');
  multiplierElement.textContent = '×1';
  multiplierElement.classList.remove('fever');
  nookElement.playbackRate = 1;
  feverBannerElement.classList.remove('show');
  clearTimeout(bannerTimer);
}

/* ---------- 입력 처리 ---------- */
function handleCorrect() {
  const points = isFever ? BASE_POINT * FEVER_MULTIPLIER : BASE_POINT;
  score += points;
  combo += 1;

  const justEnteredFever = !isFever && combo >= FEVER_COMBO;
  if (justEnteredFever) enterFever();

  updateScoreDisplay(true);
  updateComboDisplay();
  reactNook('correct');
  restartAnimation(targetAreaElement, 'flash-correct');

  if (justEnteredFever) {
    say('피버 타임이야! 지금부터 벨이 두 배라구!', 'correct');
  } else if (isFever) {
    say('좋았어! +' + points + '벨! 이 기세를 유지하라구!', 'correct');
  } else {
    say('좋았어! +' + points + '벨! (' + combo + '콤보)', 'correct');
  }
}

function handleWrong() {
  const wasFever = isFever;
  score -= PENALTY;
  combo = 0;
  if (wasFever) exitFever();

  updateScoreDisplay(false);
  updateComboDisplay();
  reactNook('wrong');
  restartAnimation(targetAreaElement, 'flash-wrong');

  say(wasFever
    ? '앗, 아쉽네… 피버 타임 종료야. -' + PENALTY + '벨!'
    : '앗, 틀렸어! -' + PENALTY + '벨이야…', 'wrong');
}

function checkInput(event) {
  if (!isGameRunning || event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;

  const inputChar = event.key;
  typedCharElement.textContent = inputChar;

  if (inputChar === targetCharElement.textContent) {
    typedCharElement.className = 'correct';
    handleCorrect();
  } else {
    typedCharElement.className = 'wrong';
    handleWrong();
  }

  setNewTargetChar();
}

/* ---------- 타이머 ---------- */
function updateTimerDisplay() {
  timerElement.textContent = timeLeft + '초';
  timerElement.classList.toggle('danger', timeLeft <= 5 && timeLeft > 0);
}

function updateTimer() {
  timeLeft -= 1;
  updateTimerDisplay();
  if (timeLeft <= 0) endGame();
}

/* ---------- 게임 흐름 ---------- */
function clearBoard() {
  clearInterval(gameInterval);
  gameInterval = null;
  isGameRunning = false;
  combo = 0;
  exitFever();
  updateComboDisplay();
  typedCharElement.textContent = '-';
  typedCharElement.className = 'neutral';
  timerElement.classList.remove('danger');
}

function endGame() {
  clearBoard();
  targetCharElement.textContent = '끝!';
  say('수고했어! 오늘 모은 벨은 ' + score + '벨이야.', 'wrong');
  startButton.disabled = false;
  startButton.textContent = '한 번 더!';
}

function startGame() {
  if (isGameRunning) return;
  clearBoard();

  score = 0;
  timeLeft = GAME_TIME;
  isGameRunning = true;

  updateScoreDisplay(false);
  updateTimerDisplay();
  setNewTargetChar();
  say('자, 시작이야! 5콤보를 쌓으면 피버 타임이라구!', 'neutral');

  startButton.disabled = true;
  startButton.textContent = '게임 진행 중';
  gameInterval = setInterval(updateTimer, 1000);
}

function resetGame() {
  clearBoard();
  score = 0;
  timeLeft = GAME_TIME;

  updateScoreDisplay(false);
  updateTimerDisplay();
  targetCharElement.textContent = '?';
  say('시작 버튼을 눌러 줘!', 'neutral');

  startButton.disabled = false;
  startButton.textContent = '게임 시작';
}

startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
document.addEventListener('keydown', checkInput);
