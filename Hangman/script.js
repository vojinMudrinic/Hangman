const letters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

let highscores = [];
let word;
let wordSplit = [];
let hintWord = [];
let tryLeft = 6;
let revealedLetters = 0;
let timerCount = 60;
let scoreCount = 0;
let streakCount = 0;
let hintLeft = 3;
let interval;

//DOM elements

const popupForm = document.querySelector(".popup-name");
const highscorePopup = document.querySelector(".popup-highscores");
const popupSuccess = document.querySelector(".popup-success");
const lettersContainer = document.querySelector(".letters");
const hint = document.querySelector(".hint");
const textWrapper = document.querySelector(".text-wrapper");
const timer = document.querySelector(".timer");
const score = document.querySelector(".score");
const streak = document.querySelector(".streak");
const inputName = document.querySelector("#name");
const hiddenWord = document.querySelector("#hidden-word");
const scoreList = document.querySelector(".score-list");
const textControls = document.querySelector(".text-controls");

//Audio
const gameOverAudio = new Audio("./audio/game-over.wav");
const streakAudio = new Audio("./audio/streak.wav");
const successAudio = new Audio("./audio/success.wav");
const wrongGuessAudio = new Audio("./audio/wrong-guess.wav");

//Functions

const fetchAPI = async () => {
  const response = await fetch("https://random-word-api.herokuapp.com/word");
  return response.json();
};

const prepareGame = async () => {
  word = await fetchAPI();
  wordSplit = word[0].toUpperCase().split("");
  document.querySelector(".timer-container").style.visibility = "unset";

  renderWordLetters();
  renderKeys();
  hintWord = [...wordSplit];
  interval = setInterval(decrementCount, 1000);
};

const renderHangmanParts = () => {
  let part;
  switch (tryLeft) {
    case 6:
      document.querySelector(".head").style.opacity = 0;
      document.querySelector(".body").style.opacity = 0;
      document.querySelector(".l-arm").style.opacity = 0;
      document.querySelector(".r-arm").style.opacity = 0;
      document.querySelector(".l-leg").style.opacity = 0;
      document.querySelector(".r-leg").style.opacity = 0;
      return;
    case 5:
      part = document.querySelector(".head");
      part.style.opacity = 1;
      return;
    case 4:
      part = document.querySelector(".body");
      part.style.opacity = 1;
      return;
    case 3:
      part = document.querySelector(".l-arm");
      part.style.opacity = 1;
      return;
    case 2:
      part = document.querySelector(".r-arm");
      part.style.opacity = 1;
      return;
    case 1:
      part = document.querySelector(".l-leg");
      part.style.opacity = 1;
      return;
    case 0:
      part = document.querySelector(".r-leg");
      part.style.opacity = 1;
      return;
    default:
      return;
  }
};

const renderCorrectLetter = (text) => {
  const letters = document.querySelectorAll(".letter");

  wordSplit.forEach((el, i) => {
    if (el === text) {
      letters[i].textContent = text;
      revealedLetters++;
    }
  });
};

const renderStreak = () => {
  streak.textContent = "+" + streakCount;
  streak.style.display = "unset";
  streakAudio.play();
  const timeout = setTimeout(() => {
    streak.style.display = "none";
  }, 1000);
  return () => clearTimeout(timeout);
};

const onKeyClick = (index) => {
  const clickedElement = document.getElementById(index);
  const correctGuess = wordSplit.includes(clickedElement.textContent);
  clickedElement.style.color = "white";
  clickedElement.style.pointerEvents = "none";

  if (correctGuess) {
    clickedElement.style.backgroundColor = "green";

    scoreCount++;
    streakCount++;
    if (streakCount > 1) {
      scoreCount += streakCount;
      renderStreak();
    }
    if (streakCount % 2 === 0) {
      hintLeft++;
      hint.textContent = hintLeft;
    }
    score.textContent = scoreCount;
    renderCorrectLetter(clickedElement.textContent);
    hintWord = hintWord.filter((el) => el !== clickedElement.textContent);
  } else {
    wrongGuessAudio.play();
    streakCount = 0;
    clickedElement.style.backgroundColor = "red";
    tryLeft--;
    renderHangmanParts();
  }

  if (tryLeft <= 0) {
    gameOverAudio.play();
    renderPopupForm();
  }

  if (revealedLetters === wordSplit.length) {
    renderSuccessPopup();
  }
};

const renderSuccessPopup = () => {
  successAudio.play();
  document.querySelector(".hint-container").style.pointerEvents = "none";
  popupSuccess.style.display = "flex";
  textWrapper.style.pointerEvents = "none";

  textControls.style.cursor = "not-allowed";
  textControls.style.opacity = 0.3;
  clearInterval(interval);
};

const renderKeys = () => {
  letters.forEach((el, i) => {
    let element = document.createElement("div");
    element.textContent = el;
    element.id = i + 1;
    element.className = "key-input";
    element.addEventListener("click", () => onKeyClick(element.id));
    textWrapper.append(element);
  });
};

const renderWordLetters = () => {
  for (let i = 0; i < wordSplit.length; i++) {
    const element = document.createElement("div");
    element.className = "letter";

    const text = document.createElement("p");

    element.append(text);
    lettersContainer.append(element);
  }
};

const renderPopupForm = () => {
  document.querySelector(".hint-container").style.pointerEvents = "none";
  popupForm.style.display = "flex";
  textWrapper.style.pointerEvents = "none";
  textControls.style.cursor = "not-allowed";
  textControls.style.opacity = 0.3;
  hiddenWord.textContent = word[0].toUpperCase();
  clearInterval(interval);
};

const renderHighscorePopup = () => {
  highscorePopup.style.display = "flex";
  listScores();
};

const restart = () => {
  location.reload();
};

const decrementCount = () => {
  if (timerCount <= 0) {
    clearInterval(interval);
    gameOverAudio.play();
    renderPopupForm();
    return;
  }
  timerCount--;
  timer.textContent = timerCount;
};

const submitName = () => {
  if (!inputName.value) {
    window.alert("Name required!");
    return;
  }
  const hasLocalStorage = localStorage.getItem("highscores");

  if (!hasLocalStorage) {
    localStorage.setItem("highscores", JSON.stringify([]));
  }
  const formatValue = { name: inputName.value, score: scoreCount };
  const listJson = localStorage.getItem("highscores");
  const list = JSON.parse(listJson);
  list.push(formatValue);
  localStorage.setItem("highscores", JSON.stringify(list));
  popupForm.style.display = "none";
  renderHighscorePopup();
};

const initNextLevel = () => {
  timerCount = 60;
  revealedLetters = 0;
  streakCount = 0;
  timer.textContent = timerCount;
  tryLeft = 6;
  hintLeft += 3;
  hint.textContent = hintLeft;
  popupSuccess.style.display = "none";
  textControls.style.cursor = "unset";
  textWrapper.style.pointerEvents = "unset";
  document.querySelector(".hint-container").style.pointerEvents = "unset";
  textControls.style.opacity = 1;
  textWrapper.replaceChildren();
  lettersContainer.replaceChildren();
  renderHangmanParts();
  prepareGame();
};

const listScores = () => {
  const listJson = localStorage.getItem("highscores");
  const list = JSON.parse(listJson);
  const firstPlace = document.createElement("img");
  firstPlace.src = "./svg/crown.svg";
  firstPlace.className = "first-place";
  list.sort((a, b) => b.score - a.score);
  list.forEach((el, i) => {
    const item = document.createElement("li");
    item.className = "item-container";
    const name = document.createElement("p");
    const score = document.createElement("p");
    name.textContent = el.name;
    score.textContent = el.score;
    if (i === 0) {
      item.append(firstPlace);
    }
    item.append(name);
    item.append(score);
    scoreList.append(item);
  });
};

const revealHint = () => {
  if (hintLeft <= 0) {
    return;
  }
  streakCount = 0;
  const index = Math.floor(Math.random() * hintWord.length);
  const letter = hintWord[index];
  renderCorrectLetter(letter);
  const keys = document.querySelectorAll(".key-input");
  keys.forEach((el) => {
    if (el.textContent === letter) {
      el.style.color = "white";
      el.style.backgroundColor = "green";
      el.style.pointerEvents = "none";
    }
  });

  hintWord = hintWord.filter((el) => el !== letter);

  if (revealedLetters === wordSplit.length) {
    renderSuccessPopup();
  }
  hintLeft--;
  hint.textContent = hintLeft;
};

prepareGame();
