// Score tracking: persists across rounds until the game is reset
let scorePlayer = 0;
let scoreComputer = 0;

// Cache DOM references once at load time rather than querying on every click
const rockBtn          = document.querySelector("#btn-rock");
const paperBtn         = document.querySelector("#btn-paper");
const scissorsBtn      = document.querySelector("#btn-scissors");
const resetBtn         = document.querySelector("#btn-reset");
const gameResult       = document.querySelector("#game-result");      // sr-only aria-live region
const roundResult      = document.querySelector("#round-result");     // visible, color-coded
const computerChoiceEl = document.querySelector("#computer-choice");  // visible computer pick
const scorePlayerSpan  = document.querySelector("#score-player");
const scoreComputerSpan = document.querySelector("#score-computer");

// Shape symbols shown in the visible result box: give colorblind users a
// non-color cue (shape) to distinguish win/lose/tie at a glance.
// These are NOT added to the sr-only gameResult region; the text there is
// already fully descriptive without them.
const RESULT_SYMBOL = { win: "⚔ ", lose: "☠ ", tie: "⚖ " };

// Display names and emoji for each move
const DISPLAY = {
  rock:     { label: "Stone",  emoji: "✊" },
  paper:    { label: "Scroll", emoji: "📜" },
  scissors: { label: "Blade",  emoji: "⚔️"  },
};

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function displayName(move) {
  return DISPLAY[move].label;
}

// Returns "win", "lose", or "tie": used to set color class and build messages
function playRound(player, computer) {
  if (player === computer) return "tie";
  if (
    (player === "rock"     && computer === "scissors") ||
    (player === "paper"    && computer === "rock")     ||
    (player === "scissors" && computer === "paper")
  ) return "win";
  return "lose";
}

function getComputerChoice() {
  const choices = ["rock", "paper", "scissors"];
  return choices[Math.floor(Math.random() * choices.length)];
}

// Pick a random element from an array
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Swap the color class on the visible result box
function setResultClass(state) {
  roundResult.classList.remove("result-win", "result-lose", "result-tie");
  if (state) roundResult.classList.add(`result-${state}`);
}

// Medieval battle round messages: each is a function(playerMove, computerMove) => string
const WIN_LINES = [
  (p, c) => `Victory! Thy ${displayName(p)} hath shattered the ${displayName(c)}!`,
  (p, c) => `The ${displayName(c)} crumbles before thy ${displayName(p)}! Thou art triumphant!`,
  (p, c) => `Well struck, warrior! Thy ${displayName(p)} overcomes the ${displayName(c)}!`,
  (p, c) => `Huzzah! Thy ${displayName(p)} triumphs over the enemy's ${displayName(c)}!`,
];

const LOSE_LINES = [
  (p, c) => `Defeated! The enemy's ${displayName(c)} hath overcome thy ${displayName(p)}!`,
  (p, c) => `The ${displayName(c)} hath bested thy ${displayName(p)}! Retreat and regroup!`,
  (p, c) => `Thy ${displayName(p)} could not withstand the enemy's ${displayName(c)}!`,
  (p, c) => `The battlefield is lost! The enemy's ${displayName(c)} prevails!`,
];

const TIE_LINES = [
  "A standoff! Both warriors clash with equal arms!",
  "Neither warrior yields! The duel rages on!",
  "An equal match! Steel thy resolve and strike again!",
  "Deadlock! The fates hold their breath. Choose wisely!",
];

function handleClick(playerSelection) {
  const computerSelection = getComputerChoice();
  const outcome = playRound(playerSelection, computerSelection);

  // Show computer's pick visually (aria-hidden so sr-only region handles AT)
  const c = DISPLAY[computerSelection];
  computerChoiceEl.textContent = `The enemy wields: ${c.emoji} ${c.label}`;

  let message;
  if (outcome === "win") {
    scorePlayer++;
    message = pick(WIN_LINES)(playerSelection, computerSelection);
  } else if (outcome === "lose") {
    scoreComputer++;
    message = pick(LOSE_LINES)(playerSelection, computerSelection);
  } else {
    message = pick(TIE_LINES);
  }

  setResultClass(outcome);
  scorePlayerSpan.textContent   = scorePlayer;
  scoreComputerSpan.textContent = scoreComputer;
  roundResult.textContent = RESULT_SYMBOL[outcome] + message;
  // Single authoritative announcement for screen readers (no symbol prefix, text is already descriptive)
  gameResult.textContent =
    `${message} Score: Player ${scorePlayer}, Computer ${scoreComputer}.`;

  if (scorePlayer === 5) {
    endGame("win", "Champion! Thou hast conquered the battlefield! Victory is thine!");
  } else if (scoreComputer === 5) {
    endGame("lose", "Defeated! The iron machine hath claimed the day. Wilt thou fight again?");
  }
}

function endGame(outcome, message) {
  setResultClass(outcome);
  roundResult.textContent = RESULT_SYMBOL[outcome] + message;
  gameResult.textContent =
    `${message} Final score: Player ${scorePlayer}, Computer ${scoreComputer}.`;
  disableButtons();
  resetBtn.classList.remove("hidden");
  resetBtn.focus(); // Move focus to the only available action (keyboard & switch users)
}

// Prevents the player from clicking after the match has ended
function disableButtons() {
  rockBtn.disabled     = true;
  paperBtn.disabled    = true;
  scissorsBtn.disabled = true;
}

// Resets scores, clears display, re-enables buttons, and returns focus
function resetGame() {
  scorePlayer = 0;
  scoreComputer = 0;
  scorePlayerSpan.textContent   = 0;
  scoreComputerSpan.textContent = 0;
  roundResult.textContent       = "";
  computerChoiceEl.textContent  = "";
  setResultClass(null);
  rockBtn.disabled     = false;
  paperBtn.disabled    = false;
  scissorsBtn.disabled = false;
  resetBtn.classList.add("hidden");
  // Announce the reset to screen readers
  gameResult.textContent = "A new battle commences! Choose thy weapon, warrior.";
  rockBtn.focus(); // Return focus to first choice button (keyboard & switch users)
}

// Button click listeners
rockBtn.addEventListener("click",     () => handleClick("rock"));
paperBtn.addEventListener("click",    () => handleClick("paper"));
scissorsBtn.addEventListener("click", () => handleClick("scissors"));
resetBtn.addEventListener("click", resetGame);

// Navigation is handled via standard Tab / Enter / Space only.
// Single-character shortcuts (1, 2, 3, R) were removed because they conflict
// with screen reader navigation commands (e.g. NVDA/JAWS use number keys for
// heading navigation), violating WCAG 2.1.4 Character Key Shortcuts.
