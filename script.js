/* ===== 동물의숲 스피드 타이핑 ===== */
const GAME_TIME = 20;      // 제한 시간(초)
const BASE_POINT = 10;     // 정답 기본 점수(벨)
const PENALTY = 5;         // 오답 감점(벨)
const FEVER_COMBO = 5;     // 피버 진입에 필요한 연속 정답 수
const FEVER_MULTIPLIER = 2;
const FEVER_PLAYBACK_RATE = 1.6;
const STORAGE_KEY = 'typing-game-character';
const WORDS = [
  'APPLE', 'BEACH', 'CLOUD', 'DREAM', 'EARTH', 'FLOWER', 'GREEN', 'HAPPY',
  'ISLAND', 'JELLY', 'LEAF', 'MUSIC', 'OCEAN', 'PANDA', 'RIVER', 'SMILE',
  'STAR', 'SWEET', 'TREE', 'WATER'
];

/* ---------------------------------------------------------
   캐릭터 테이블
   캐릭터를 추가하려면 이 배열에 항목 하나만 넣으면 된다.
   테마 색과 모티프 아이콘은 style.css 의
   body[data-character="<id>"] 블록에서 정의한다.
   --------------------------------------------------------- */
const CHARACTERS = [
  {
    id: 'nook',
    name: '너굴',
    motif: '나뭇잎',
    video: '해당_너구리_캐릭터가_손을_흔들며_눈을_깜빡_거리는_실.mp4',
    origin: '50% 22%',
    zoom: 1.25,
    lines: {
      ready: () => '시작 버튼을 눌러 줘!',
      start: () => '자, 시작이야! ' + FEVER_COMBO + '콤보를 쌓으면 피버 타임이라구!',
      correct: (points, combo) => '좋았어! +' + points + '벨! (' + combo + '콤보)',
      feverStart: () => '피버 타임이야! 지금부터 벨이 두 배라구!',
      feverCorrect: (points) => '좋았어! +' + points + '벨! 이 기세를 유지하라구!',
      wrong: (penalty) => '앗, 틀렸어! -' + penalty + '벨이야…',
      feverWrong: (penalty) => '앗, 아쉽네… 피버 타임 종료야. -' + penalty + '벨!',
      end: (score) => '수고했어! 오늘 모은 벨은 ' + score + '벨이야.',
      hello: () => '나랑 같이 해보자구!',
    },
  },
  {
    id: 'changsik',
    name: '김창식',
    motif: '빙글빙글',
    video: '얘는_애니메이션을_하품하는_것과_안경_올리는_것으로_동.mp4',
    origin: '50% 8%',
    zoom: 1.25,
    lines: {
      ready: () => '……어, 왔구나. 준비되면 눌러.',
      start: () => '하아암… 그럼 시작할까. ' + FEVER_COMBO + '콤보면 피버야.',
      correct: (points, combo) => '응, +' + points + '벨. ' + combo + '콤보네.',
      feverStart: () => '오, 피버다. 안경 좀 올리고… 이제 두 배야.',
      feverCorrect: (points) => '+' + points + '벨. 나쁘지 않은데.',
      wrong: (penalty) => '어라… -' + penalty + '벨. 졸았나?',
      feverWrong: (penalty) => '아… 피버 끝났어. -' + penalty + '벨.',
      end: (score) => '끝. ' + score + '벨 모았네. 난 좀 잘게…',
      hello: () => '…잘 부탁해.',
    },
  },
  {
    id: 'kkotbun',
    name: '꽃분이',
    motif: '딸기',
    video: '해당_여성_캐릭터가_눈을_깜빡_거리고_어깨_으쓱거리는.mp4',
    origin: '50% -3%',
    zoom: 1.35,
    startAt: 1.6,   /* 도입부 클로즈업 줌인 구간은 건너뛴다 */
    lines: {
      ready: () => '준비되면 시작 버튼 눌러 줘!',
      start: () => '좋아, 가볼까! ' + FEVER_COMBO + '콤보 쌓으면 피버야!',
      correct: (points, combo) => '나이스! +' + points + '벨! (' + combo + '콤보)',
      feverStart: () => '와, 피버 타임! 지금부터 두 배야!',
      feverCorrect: (points) => '+' + points + '벨! 완전 잘하는데?',
      wrong: (penalty) => '아깝다! -' + penalty + '벨…',
      feverWrong: (penalty) => '으앙, 피버 끝났어. -' + penalty + '벨…',
      end: (score) => '수고했어! 오늘 ' + score + '벨 모았네!',
      hello: () => '안녕! 나랑 해보자!',
    },
  },
];

let score = 0;
let timeLeft = GAME_TIME;
let combo = 0;
let isFever = false;
let isGameRunning = false;
let gameInterval = null;
let bannerTimer = null;
let currentCharacter = CHARACTERS[0];
let gameMode = 'char';
let typedWord = '';
const characterVideos = {};

const targetCharElement = document.getElementById('targetChar');
const targetAreaElement = document.getElementById('targetArea');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const typedCharElement = document.getElementById('typedChar');
const feedbackElement = document.getElementById('feedback');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const changeModeButton = document.getElementById('changeModeButton');
const modeScreen = document.getElementById('modeScreen');
const gameScreen = document.getElementById('gameScreen');
const nookMediaElement = document.getElementById('nookMedia');
const nookRingElement = document.getElementById('nookRing');
const multiplierElement = document.getElementById('multiplier');
const feverBannerElement = document.getElementById('feverBanner');
const titleNameElement = document.getElementById('titleName');
const characterButton = document.getElementById('characterButton');
const characterModal = document.getElementById('characterModal');
const characterListElement = document.getElementById('characterList');
const stampElements = Array.from(document.querySelectorAll('#stamps .stamp'));
const guideElement = document.getElementById('guide');
const targetCaptionElement = document.getElementById('targetCaption');
const inputLabelElement = document.getElementById('inputLabel');
const modeChoices = Array.from(document.querySelectorAll('.mode-choice'));
const modeCharactersElement = document.getElementById('modeCharacters');
const modeCharacterButton = document.getElementById('modeCharacterButton');

/* 모달을 연 버튼으로 포커스를 되돌리기 위해 기억해 둔다. */
let modalOpener = characterButton;

/* ---------- 유틸 ---------- */
function getRandomChar() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return chars[Math.floor(Math.random() * chars.length)];
}

function setNewTargetChar() {
  if (gameMode === 'word') {
    let nextWord;
    do {
      nextWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    } while (WORDS.length > 1 && nextWord === targetCharElement.textContent);
    targetCharElement.textContent = nextWord;
  } else {
    targetCharElement.textContent = getRandomChar();
  }
}

function setGameMode(mode) {
  if (isGameRunning || (mode !== 'char' && mode !== 'word')) return;
  gameMode = mode;
  typedWord = '';
  document.body.dataset.mode = mode;
  guideElement.textContent = mode === 'word'
    ? '화면의 단어를 입력하고 Enter를 눌러 줘! 대소문자는 상관없다구.'
    : '화면의 문자와 똑같이 입력해 줘! 대소문자를 구분한다구.';
  targetCaptionElement.textContent = mode === 'word' ? '이 단어를 입력!' : '이 글자를 입력!';
  inputLabelElement.textContent = mode === 'word' ? '내가 입력한 단어' : '내가 누른 키';
  targetCharElement.textContent = '?';
  typedCharElement.textContent = '-';
  typedCharElement.className = 'neutral';
  modeScreen.hidden = true;
  gameScreen.hidden = false;
  resetGame();
  startButton.focus();
}

function showModeScreen() {
  clearBoard();
  score = 0;
  timeLeft = GAME_TIME;
  gameScreen.hidden = true;
  modeScreen.hidden = false;
  modeChoices[0].focus();
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

/* 사파리 프라이빗 모드 등에서 localStorage 접근이 막혀도 게임은 돌아가야 한다. */
function readStoredCharacterId() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function storeCharacterId(id) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch (error) {
    /* 저장이 안 되면 이번 세션에만 적용된다. */
  }
}

/* ---------- 캐릭터 ---------- */
function findCharacter(id) {
  return CHARACTERS.find((character) => character.id === id) || CHARACTERS[0];
}

/* 재생 중인 video 의 src 를 갈아끼우면 다시 로드해야 해서 전환이 끊긴다.
   캐릭터 영상을 처음부터 모두 겹쳐 두고 active 클래스로만 전환한다. */
function createCharacterVideo(character) {
  const video = document.createElement('video');
  video.muted = true;
  video.setAttribute('src', character.video);
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');

  /* startAt 이 있으면 loop 대신 직접 되감아 도입부를 건너뛴다. */
  if (character.startAt) {
    const rewind = () => {
      video.currentTime = character.startAt;
      if (video.play) video.play().catch(() => {});
    };
    video.addEventListener('loadedmetadata', rewind);
    video.addEventListener('ended', rewind);
  } else {
    video.setAttribute('loop', '');
  }
  /* 영상마다 인물이 잡힌 크기가 달라 캐릭터별로 확대율과 기준점을 맞춘다. */
  video.style.transform = 'scale(' + character.zoom + ')';
  video.style.transformOrigin = character.origin;
  return video;
}

function buildCharacterStage() {
  CHARACTERS.forEach((character) => {
    const video = createCharacterVideo(character);
    characterVideos[character.id] = video;
    nookMediaElement.appendChild(video);
  });
}

function buildModeCharacters() {
  CHARACTERS.forEach((character) => {
    const card = document.createElement('span');
    card.className = 'main-character';
    card.dataset.id = character.id;

    const media = document.createElement('span');
    media.className = 'main-character-video';
    media.appendChild(createCharacterVideo(character));

    const name = document.createElement('span');
    name.textContent = character.name;
    card.append(media, name);
    modeCharactersElement.appendChild(card);
  });
}

/* 피버 중에는 캐릭터 영상도 빠르게 돈다. */
function syncCharacterPlaybackRate() {
  const video = characterVideos[currentCharacter.id];
  if (video) video.playbackRate = isFever ? FEVER_PLAYBACK_RATE : 1;
}

function applyCharacter(id) {
  const character = findCharacter(id);
  const isSwitching = character !== currentCharacter;
  currentCharacter = character;

  document.body.dataset.character = character.id;
  titleNameElement.textContent = character.name;

  CHARACTERS.forEach((item) => {
    const video = characterVideos[item.id];
    if (video) video.classList.toggle('active', item.id === character.id);
  });
  syncCharacterPlaybackRate();

  markSelectedCharacterCard();
  storeCharacterId(character.id);

  if (isSwitching && !isGameRunning) {
    say(character.lines.hello(), 'neutral');
  }
}

/* ---------- 캐릭터 선택 모달 ---------- */
function markSelectedCharacterCard() {
  Array.from(characterListElement.children).forEach((card) => {
    card.classList.toggle('selected', card.dataset.id === currentCharacter.id);
  });
  Array.from(modeCharactersElement.children).forEach((card) => {
    card.classList.toggle('selected', card.dataset.id === currentCharacter.id);
  });
}

function buildCharacterList() {
  CHARACTERS.forEach((character) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'character-card';
    card.dataset.id = character.id;

    const thumb = document.createElement('span');
    thumb.className = 'character-thumb';

    const preview = createCharacterVideo(character);
    thumb.appendChild(preview);

    const name = document.createElement('span');
    name.className = 'character-name';
    name.textContent = character.name;

    const badge = document.createElement('span');
    badge.className = 'character-badge';
    badge.textContent = character.motif;

    card.append(thumb, name, badge);
    card.addEventListener('click', () => {
      applyCharacter(character.id);
      closeCharacterModal();
    });

    characterListElement.appendChild(card);
  });
}

function openCharacterModal(opener) {
  modalOpener = opener || characterButton;
  characterModal.hidden = false;
}

function closeCharacterModal() {
  characterModal.hidden = true;
  if (modalOpener && modalOpener.focus) modalOpener.focus();
}

function isModalOpen() {
  return characterModal.hidden === false;
}

/* ---------- 캐릭터 리액션 ---------- */
function reactCharacter(type) {
  nookMediaElement.classList.remove('correct', 'wrong');
  nookRingElement.classList.remove('correct', 'wrong');
  void nookMediaElement.offsetWidth;
  nookMediaElement.classList.add(type);
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
  syncCharacterPlaybackRate();
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
  syncCharacterPlaybackRate();
  feverBannerElement.classList.remove('show');
  clearTimeout(bannerTimer);
}

/* ---------- 입력 처리 ---------- */
function handleCorrect() {
  const points = isFever ? BASE_POINT * FEVER_MULTIPLIER : BASE_POINT;
  const lines = currentCharacter.lines;
  score += points;
  combo += 1;

  const justEnteredFever = !isFever && combo >= FEVER_COMBO;
  if (justEnteredFever) enterFever();

  updateScoreDisplay(true);
  updateComboDisplay();
  reactCharacter('correct');
  restartAnimation(targetAreaElement, 'flash-correct');

  if (justEnteredFever) {
    say(lines.feverStart(), 'correct');
  } else if (isFever) {
    say(lines.feverCorrect(points), 'correct');
  } else {
    say(lines.correct(points, combo), 'correct');
  }
}

function handleWrong() {
  const wasFever = isFever;
  const lines = currentCharacter.lines;
  score -= PENALTY;
  combo = 0;
  if (wasFever) exitFever();

  updateScoreDisplay(false);
  updateComboDisplay();
  reactCharacter('wrong');
  restartAnimation(targetAreaElement, 'flash-wrong');

  say(wasFever ? lines.feverWrong(PENALTY) : lines.wrong(PENALTY), 'wrong');
}

function checkInput(event) {
  if (!isGameRunning || isModalOpen()) return;

  if (gameMode === 'word') {
    if (event.key === 'Backspace') {
      event.preventDefault();
      typedWord = typedWord.slice(0, -1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (!typedWord) return;
      if (typedWord.toUpperCase() === targetCharElement.textContent) {
        typedCharElement.className = 'correct';
        handleCorrect();
      } else {
        typedCharElement.className = 'wrong';
        handleWrong();
      }
      typedWord = '';
      setNewTargetChar();
      return;
    } else if (/^[a-zA-Z]$/.test(event.key)) {
      typedWord += event.key.toUpperCase();
    } else {
      return;
    }

    typedCharElement.textContent = typedWord || '-';
    typedCharElement.className = typedWord && targetCharElement.textContent.startsWith(typedWord)
      ? 'neutral'
      : typedWord ? 'wrong' : 'neutral';
    return;
  }

  if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;

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
  typedWord = '';
}

function endGame() {
  clearBoard();
  targetCharElement.textContent = '끝!';
  say(currentCharacter.lines.end(score), 'wrong');
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
  say(currentCharacter.lines.start(), 'neutral');

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
  say(currentCharacter.lines.ready(), 'neutral');

  startButton.disabled = false;
  startButton.textContent = '게임 시작';
}

/* ---------- 초기화 ---------- */
startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
changeModeButton.addEventListener('click', showModeScreen);
modeChoices.forEach((button) => button.addEventListener('click', () => setGameMode(button.dataset.mode)));
characterButton.addEventListener('click', () => openCharacterModal(characterButton));
modeCharacterButton.addEventListener('click', () => openCharacterModal(modeCharacterButton));
document.addEventListener('keydown', checkInput);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isModalOpen()) closeCharacterModal();
});
Array.from(characterModal.querySelectorAll('[data-close]')).forEach((element) => {
  element.addEventListener('click', closeCharacterModal);
});

buildCharacterStage();
buildModeCharacters();
buildCharacterList();
applyCharacter(readStoredCharacterId());
document.body.dataset.mode = gameMode;
