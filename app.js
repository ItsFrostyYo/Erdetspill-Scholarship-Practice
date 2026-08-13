"use strict";

const FORM_TIME = 40;
const RED_TIME = 20;
const FLASH_TIME = 10;
const RESULT_OVERLAY_DURATION = 2000;

const NORMAL_QUESTIONS = [
  "Spillernavn:",
  "Fødselsdato:",
  "Adresse:",
  "Postnummer:",
  "Telefonnummer:",
  "E-postadresse:"
];

const UNUSUAL_QUESTIONS = [
  "Favorittfarge på brød:",
  "Antall ganger du har tenkt på elg denne uken:",
  "Beskriv lukten av en mandag:",
  "Hva er din mening om grus som matvare?",
  "Oppgi din nærmeste nabos bilmerke:"
];

const EXISTENTIAL_QUESTIONS = [
  "Hvorfor er du her?",
  "Hva er egentlig penger?",
  "Hadde du fortjent dette stipendet?",
  "Er du sikker på at dette er riktig valg?",
  "Hva ville mormor ha sagt?"
];

const NORMAL_CHEATSHEET = [
  { prompt: "Favorittfarge på brød:", parts: [["letter", "x"]] },
  { prompt: "Oppgi din nærmeste nabos bilmerke:", parts: [["letter", "x"]] },
  { prompt: "Hva ville mormor ha sagt?", parts: [["letter", "xxx"]] },
  { prompt: "Beskriv lukten av en mandag:", parts: [["letter", "xxx"]] },
  { prompt: "Hva er egentlig penger?", parts: [["letter", "xxx"]] },
  { prompt: "Hvorfor er du her?", parts: [["letter", "xxxxx"]] },
  { prompt: "Spillernavn:", parts: [["player", ""]], note: "(your player name)" },
  { prompt: "E-postadresse:", parts: [["letter", "x"], ["plain", "@"], ["letter", "x"], ["plain", "."], ["letter", "x"]] },
  { prompt: "Adresse:", parts: [["letter", "x"], ["number", "0"]], note: "(include letters and numbers)" },
  { prompt: "Postnummer:", parts: [["number", "0000"]], note: "(exact amount)" },
  { prompt: "Telefonnummer:", parts: [["number", "00000000"]], note: "(exact amount)" },
  { prompt: "Fødselsdato:", parts: [["number", "00.00.0000"]], note: "(exact amount)" },
  { prompt: "Antall ganger du har tenkt på elg denne uken:", parts: [["number", "0"]] },
  { prompt: "Er du sikker på at dette er riktig valg?", parts: [["plain", "ja"]] },
  { prompt: "Hadde du fortjent dette stipendet?", parts: [["plain", "ja"]] },
  { prompt: "Hva er din mening om grus som matvare?", parts: [["plain", "ja"], ["choice", " / "], ["plain", "nei"]] }
];

const ADVANCED_CHEATSHEET = [
  { prompt: "brød =", parts: [["letter", "x"]] },
  { prompt: "bilmerke =", parts: [["letter", "x"]] },
  { prompt: "sagt? =", parts: [["amount", "(3)"], ["letter", "x"]] },
  { prompt: "mandag =", parts: [["amount", "(3)"], ["letter", "x"]] },
  { prompt: "penger? =", parts: [["amount", "(3)"], ["letter", "x"]] },
  { prompt: "her? =", parts: [["amount", "(5)"], ["letter", "x"]] },
  { prompt: "Spillernavn =", parts: [["player", ""]] },
  { prompt: "E-postadresse =", parts: [["letter", "x"], ["plain", "@"], ["letter", "x"], ["plain", "."], ["letter", "x"]] },
  { prompt: "Adresse =", parts: [["letter", "x"], ["plain", " + "], ["number", "0"]] },
  { prompt: "Postnummer =", parts: [["amount", "(4)"], ["number", "0"]] },
  { prompt: "Telefonnummer =", parts: [["amount", "(8)"], ["number", "0"]] },
  { prompt: "Fødselsdato =", parts: [["number", "00.00."], ["amount", "(4)"], ["number", "0"]] },
  { prompt: "uken =", parts: [["number", "0"]] },
  { prompt: "valg? =", parts: [["plain", "ja"]] },
  { prompt: "stipendet? =", parts: [["plain", "ja"]] },
  { prompt: "matvare? =", parts: [["plain", "ja"], ["choice", " / "], ["plain", "nei"]] }
];

const UI_TEXT = {
  en: {
    minigame: "Minigame Active",
    showCheatsheet: "Show Cheatsheet",
    switchSides: "Switch Sides",
    cheatsheetType: "Cheatsheet Type",
    normal: "Normal",
    advanced: "Advanced",
    language: "Language",
    english: "English",
    norwegian: "Norwegian",
    playerName: "Player Name",
    reset: "Reset",
    title: "erdetspill scholarship office",
    anyLetter: "any letter",
    anyNumber: "any number",
    chooseOne: "choose one",
    amount: "Amount",
    explanations: "Explanations",
    normalHeading: "Normal Cheatsheet",
    advancedHeading: "Advanced Cheatsheet",
    currentSide: "Currently on the",
    sides: { left: "left", right: "right" },
    notes: {
      "(your player name)": "(your player name)",
      "(include letters and numbers)": "(include letters and numbers)",
      "(exact amount)": "(exact amount)"
    }
  },
  no: {
    minigame: "Minispill",
    showCheatsheet: "Vis jukselapp",
    switchSides: "Bytt side",
    cheatsheetType: "Jukselapptype",
    normal: "Normal",
    advanced: "Avansert",
    language: "Språk",
    english: "Engelsk",
    norwegian: "Norsk",
    playerName: "Spillernavn",
    reset: "Nullstill",
    title: "erdetspill lånekasse",
    anyLetter: "vilkårlig bokstav",
    anyNumber: "vilkårlig tall",
    chooseOne: "velg én",
    amount: "Antall",
    explanations: "Forklaringer",
    normalHeading: "Normal jukselapp",
    advancedHeading: "Avansert jukselapp",
    currentSide: "Nå på",
    sides: { left: "venstre side", right: "høyre side" },
    notes: {
      "(your player name)": "(spillernavnet ditt)",
      "(include letters and numbers)": "(inkluder bokstaver og tall)",
      "(exact amount)": "(nøyaktig antall)"
    }
  }
};

const form = document.querySelector("#scholarship-form");
const questionsElement = document.querySelector("#questions");
const questionsScroll = document.querySelector("#questions-scroll");
const timerElement = document.querySelector("#timer");
const timeBar = document.querySelector("#time-bar");
const timeBarFill = timeBar.querySelector("span");
const signatureFrame = document.querySelector("#signature-frame");
const signatureCanvas = document.querySelector("#signature");
const errorElement = document.querySelector("#error");
const statusElement = document.querySelector("#status");
const submitButton = document.querySelector("#submit");
const clearButton = document.querySelector("#clear");
const playerNameInput = document.querySelector("#player-name");
const newRoundButton = document.querySelector("#new-round");
const workspace = document.querySelector("#workspace");
const cheatsheet = document.querySelector("#cheatsheet");
const cheatsheetRows = document.querySelector("#cheatsheet-rows");
const cheatsheetHeading = document.querySelector("#cheatsheet-heading");
const toggleCheatsheetButton = document.querySelector("#toggle-cheatsheet");
const switchSidesButton = document.querySelector("#switch-sides");
const cheatsheetType = document.querySelector("#cheatsheet-type");
const languageSelect = document.querySelector("#language");
const minigameTab = document.querySelector("#minigame-tab");
const cheatsheetTypeLabel = document.querySelector("#cheatsheet-type-label");
const normalOption = document.querySelector("#normal-option");
const advancedOption = document.querySelector("#advanced-option");
const languageLabel = document.querySelector("#language-label");
const englishOption = document.querySelector("#english-option");
const norwegianOption = document.querySelector("#norwegian-option");
const playerNameLabel = document.querySelector("#player-name-label");
const cheatsheetTitle = document.querySelector("#cheatsheet-title");
const letterLegend = document.querySelector("#letter-legend");
const numberLegend = document.querySelector("#number-legend");
const choiceLegend = document.querySelector("#choice-legend");
const amountLegend = document.querySelector("#amount-legend");
const parenthesesLegend = document.querySelector("#parentheses-legend");
const rejectionOverlay = document.querySelector("#rejection");
const rejectionReason = document.querySelector("#rejection-reason");
const rejectionExtra = document.querySelector("#rejection-extra");
const rejectionOk = document.querySelector("#rejection-ok");
const resultOverlay = document.querySelector("#result");
const resultLabel = document.querySelector("#result-label");

let fields = [];
let deadline = 0;
let animationFrame = 0;
let resolved = false;
let submitting = false;
let signatureHasContent = false;
let signatureOutOfBounds = false;
let drawing = false;
let lastPoint = null;
let resultTimer = 0;
let cheatsheetSide = "right";

function renderCheatsheet() {
  const advanced = cheatsheetType.value === "advanced";
  const rows = advanced ? ADVANCED_CHEATSHEET : NORMAL_CHEATSHEET;
  const text = UI_TEXT[languageSelect.value];
  cheatsheetHeading.textContent = advanced ? text.advancedHeading : text.normalHeading;
  amountLegend.textContent = advanced ? text.amount : text.explanations;
  parenthesesLegend.classList.toggle("amount", advanced);
  parenthesesLegend.classList.toggle("explanation", !advanced);
  cheatsheetRows.replaceChildren();

  for (const row of rows) {
    const line = document.createElement("p");
    line.className = "cheat-row";
    const prompt = document.createElement("span");
    prompt.className = "prompt";
    prompt.textContent = row.prompt;
    const answer = document.createElement("span");
    answer.className = "answer";

    for (const [type, text] of row.parts) {
      const part = document.createElement("span");
      part.className = type;
      part.textContent = type === "player" ? (playerNameInput.value.trim() || "a") : text;
      answer.append(part);
    }

    line.append(prompt, answer);
    if (row.note) {
      const note = document.createElement("span");
      note.className = "note";
      note.textContent = text.notes[row.note] || row.note;
      line.append(note);
    }
    cheatsheetRows.append(line);
  }
}

function applyLanguage() {
  const language = languageSelect.value;
  const text = UI_TEXT[language];
  document.documentElement.lang = language;
  minigameTab.textContent = text.minigame;
  toggleCheatsheetButton.textContent = text.showCheatsheet;
  switchSidesButton.textContent = text.switchSides;
  cheatsheetTypeLabel.textContent = text.cheatsheetType;
  normalOption.textContent = text.normal;
  advancedOption.textContent = text.advanced;
  languageLabel.textContent = text.language;
  englishOption.textContent = text.english;
  norwegianOption.textContent = text.norwegian;
  playerNameLabel.textContent = text.playerName;
  newRoundButton.textContent = text.reset;
  cheatsheetTitle.textContent = text.title;
  letterLegend.textContent = text.anyLetter;
  numberLegend.textContent = text.anyNumber;
  choiceLegend.textContent = text.chooseOne;
  switchSidesButton.setAttribute(
    "aria-label",
    `${text.switchSides}. ${text.currentSide} ${text.sides[cheatsheetSide]}.`
  );
  renderCheatsheet();
}

function toggleCheatsheet() {
  const willShow = cheatsheet.hidden;
  cheatsheet.hidden = !willShow;
  toggleCheatsheetButton.setAttribute("aria-pressed", String(willShow));
  toggleCheatsheetButton.classList.toggle("toggle-on", willShow);
  switchSidesButton.disabled = !willShow;
  if (willShow) renderCheatsheet();
}

function switchCheatsheetSide() {
  cheatsheetSide = cheatsheetSide === "right" ? "left" : "right";
  workspace.classList.toggle("cheatsheet-left", cheatsheetSide === "left");
  workspace.classList.toggle("cheatsheet-right", cheatsheetSide === "right");
  const text = UI_TEXT[languageSelect.value];
  switchSidesButton.setAttribute(
    "aria-label",
    `${text.switchSides}. ${text.currentSide} ${text.sides[cheatsheetSide]}.`
  );
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function chooseQuestions() {
  const existential = EXISTENTIAL_QUESTIONS[Math.floor(Math.random() * EXISTENTIAL_QUESTIONS.length)];
  const pool = shuffle([...NORMAL_QUESTIONS, ...UNUSUAL_QUESTIONS]);
  return shuffle([existential, ...pool.slice(0, 3)]);
}

function createFields() {
  questionsElement.replaceChildren();
  fields = chooseQuestions().map((question, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "question";

    const label = document.createElement("label");
    const input = document.createElement("input");
    input.id = `answer-${index + 1}`;
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    label.htmlFor = input.id;
    label.textContent = question;

    if (question === "Fødselsdato:") {
      input.inputMode = "numeric";
      input.addEventListener("input", () => {
        const digits = input.value.replace(/[^0-9]/g, "").slice(0, 8);
        let formatted = "";
        for (let i = 0; i < digits.length; i += 1) {
          if (i === 2 || i === 4) formatted += ".";
          formatted += digits[i];
        }
        input.value = formatted;
      });
    }

    wrapper.append(label, input);
    questionsElement.append(wrapper);
    return { question, input };
  });
  questionsScroll.scrollTop = 0;
}

function resizeSignatureCanvas() {
  const rect = signatureCanvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  signatureCanvas.width = Math.max(1, Math.round(rect.width * ratio));
  signatureCanvas.height = Math.max(1, Math.round(rect.height * ratio));
  const context = signatureCanvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.lineWidth = 2;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#f2f2f2";
}

function clearSignature() {
  const context = signatureCanvas.getContext("2d");
  context.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  signatureHasContent = false;
  signatureOutOfBounds = false;
  drawing = false;
  lastPoint = null;
  signatureFrame.classList.remove("invalid");
  showError("");
}

function signaturePoint(event) {
  const rect = signatureCanvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top, rect };
}

signatureCanvas.addEventListener("pointerdown", (event) => {
  if (resolved || event.button !== 0) return;
  const point = signaturePoint(event);
  drawing = true;
  lastPoint = point;
  signatureHasContent = true;
  signatureCanvas.setPointerCapture(event.pointerId);
});

signatureCanvas.addEventListener("pointermove", (event) => {
  if (!drawing || resolved) return;
  const point = signaturePoint(event);
  const inside = point.x >= 0 && point.y >= 0 && point.x <= point.rect.width && point.y <= point.rect.height;
  if (!inside) {
    signatureOutOfBounds = true;
    signatureFrame.classList.add("invalid");
    return;
  }
  const context = signatureCanvas.getContext("2d");
  context.beginPath();
  context.moveTo(lastPoint.x, lastPoint.y);
  context.lineTo(point.x, point.y);
  context.stroke();
  lastPoint = point;
  signatureHasContent = true;
});

function stopDrawing(event) {
  drawing = false;
  lastPoint = null;
  if (event && signatureCanvas.hasPointerCapture(event.pointerId)) {
    signatureCanvas.releasePointerCapture(event.pointerId);
  }
}

signatureCanvas.addEventListener("pointerup", stopDrawing);
signatureCanvas.addEventListener("pointercancel", stopDrawing);
signatureCanvas.addEventListener("lostpointercapture", () => stopDrawing());

function updateTimer(now) {
  if (resolved) return;
  const remaining = Math.max(0, (deadline - now) / 1000);
  timerElement.textContent = `${Math.ceil(remaining)}s`;
  timerElement.classList.toggle("warning", remaining <= RED_TIME);
  timerElement.classList.toggle("flash", remaining <= FLASH_TIME);
  timeBar.classList.toggle("visible", remaining <= RED_TIME);
  timeBarFill.style.transform = `scaleX(${Math.max(0, Math.min(1, remaining / RED_TIME))})`;

  if (remaining <= 0) {
    submitting = true;
    showResult(false, "SØKNAD AVVIST ✗");
    return;
  }
  animationFrame = requestAnimationFrame(updateTimer);
}

function qerr(question, detail) {
  return `«${question}» — ${detail}`;
}

function isValidInteger(value) {
  return /^[+-]?\d+$/.test(value);
}

function validateField(question, value) {
  const lower = value.toLowerCase();

  switch (question) {
    case "Spillernavn:":
      if (!value) return qerr(question, "feltet kan ikke være tomt.");
      if (lower !== playerNameInput.value.trim().toLowerCase()) {
        return qerr(question, "navnet stemmer ikke med spillernavnet ditt.");
      }
      break;
    case "Fødselsdato:":
      if (!value) return qerr(question, "feltet kan ikke være tomt.");
      if (!/^[0-9.]+$/.test(value)) return qerr(question, "bruk kun tall og punktum (DD.MM.ÅÅÅÅ).");
      if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return qerr(question, "bruk formatet DD.MM.ÅÅÅÅ.");
      break;
    case "Adresse:":
      if (!value) return qerr(question, "feltet kan ikke være tomt.");
      if (!/[0-9]/.test(value)) return qerr(question, "adressen må inneholde gatenummer.");
      if (!/[A-Za-zÆØÅæøå]/.test(value)) return qerr(question, "adressen må inneholde gatenavn.");
      break;
    case "Postnummer:":
      if (value.length !== 4) return qerr(question, "postnummer må være nøyaktig 4 siffer.");
      if (!isValidInteger(value)) return qerr(question, "postnummer kan kun inneholde tall.");
      break;
    case "Telefonnummer:":
      if (value.length !== 8) return qerr(question, "telefonnummer må være nøyaktig 8 siffer.");
      if (!isValidInteger(value)) return qerr(question, "telefonnummer kan kun inneholde tall.");
      break;
    case "E-postadresse:": {
      if (!value) return qerr(question, "feltet kan ikke være tomt.");
      if (!value.includes("@")) return qerr(question, "e-post må inneholde @.");
      const atIndex = value.indexOf("@");
      const dotIndex = value.lastIndexOf(".");
      if (atIndex <= 0 || dotIndex <= atIndex + 1 || dotIndex >= value.length - 1) {
        return qerr(question, "ugyldig e-postadresse.");
      }
      break;
    }
    case "Favorittfarge på brød:":
      if (!value) return qerr(question, "feltet kan ikke være tomt.");
      if (!/^[A-Za-zÆØÅæøå ]+$/.test(value)) return qerr(question, "bruk bare bokstaver (ingen tall eller spesialtegn).");
      break;
    case "Antall ganger du har tenkt på elg denne uken:":
      if (!value) return qerr(question, "feltet kan ikke være tomt.");
      if (!isValidInteger(value)) return qerr(question, "skriv et heltall (kun tall, ingen bokstaver).");
      break;
    case "Beskriv lukten av en mandag:":
      if (value.length < 3) return qerr(question, "utdyp svaret (minst tre tegn).");
      break;
    case "Hva er din mening om grus som matvare?":
      if (lower !== "ja" && lower !== "nei") return qerr(question, "svar «ja» eller «nei».");
      break;
    case "Oppgi din nærmeste nabos bilmerke:":
      if (!value) return qerr(question, "feltet kan ikke være tomt.");
      if (!/^[A-Za-zÆØÅæøå ]+$/.test(value)) return qerr(question, "bruk bare bokstaver (ingen tall).");
      break;
    case "Hvorfor er du her?":
      if (value.length < 5) return qerr(question, "utdyp svaret (minst fem tegn).");
      break;
    case "Hva er egentlig penger?":
      if (value.length < 3) return qerr(question, "utdyp svaret.");
      break;
    case "Hadde du fortjent dette stipendet?":
      if (lower === "nei") return "HARD_FAIL:Søknaden er avvist. Du innrømmet selv at du ikke fortjener det.";
      if (lower !== "ja" && lower !== "nei") return qerr(question, "svar «ja» eller «nei».");
      break;
    case "Er du sikker på at dette er riktig valg?":
      if (lower === "nei") return qerr(question, "Du må svare «ja» for å gå videre.");
      if (lower !== "ja" && lower !== "nei") return qerr(question, "svar «ja» eller «nei».");
      break;
    case "Hva ville mormor ha sagt?":
      if (value.length < 3) return qerr(question, "utdyp svaret (minst tre tegn).");
      break;
  }
  return "";
}

function validateAllFields() {
  fields.forEach(({ input }) => input.classList.remove("invalid"));
  for (const { question, input } of fields) {
    const value = input.value.trim();
    if (!value) input.classList.add("invalid");
    const error = validateField(question, value);
    if (error) return error;
  }
  return "";
}

function showError(message) {
  errorElement.textContent = message;
}

function showResult(success, text) {
  resolved = true;
  cancelAnimationFrame(animationFrame);
  clearTimeout(resultTimer);
  resultOverlay.classList.toggle("success", success);
  resultOverlay.classList.toggle("failure", !success);
  resultLabel.textContent = text;
  resultOverlay.hidden = false;
  resultTimer = window.setTimeout(newRound, RESULT_OVERLAY_DURATION);
}

function showHardFailure(reason) {
  resolved = true;
  cancelAnimationFrame(animationFrame);
  rejectionReason.textContent = reason;
  rejectionExtra.textContent = "Du kan prøve igjen om 15 sekunder.";
  rejectionOverlay.hidden = false;
}

function submitForm() {
  if (resolved || submitting) return;
  submitting = true;
  submitButton.disabled = true;
  submitButton.textContent = "Behandler...";

  requestAnimationFrame(() => {
    if (signatureOutOfBounds) {
      signatureFrame.classList.add("invalid");
      showError("Signaturen er utenfor feltet.");
    } else if (!signatureHasContent) {
      signatureFrame.classList.add("invalid");
      showError("Du må signere søknaden.");
    } else {
      signatureFrame.classList.remove("invalid");
      const error = validateAllFields();
      if (!error) {
        showError("");
        showResult(true, "SØKNAD GODKJENT ✓");
        return;
      }
      if (error.startsWith("HARD_FAIL:")) {
        showHardFailure(error.replace("HARD_FAIL:", ""));
        return;
      }
      showError(error);
    }

    submitButton.disabled = false;
    submitButton.textContent = "Send inn søknad";
    submitting = false;
  });
}

function newRound() {
  clearTimeout(resultTimer);
  cancelAnimationFrame(animationFrame);
  resolved = false;
  submitting = false;
  resultOverlay.hidden = true;
  rejectionOverlay.hidden = true;
  resultOverlay.classList.remove("success", "failure");
  submitButton.disabled = false;
  submitButton.textContent = "Send inn søknad";
  statusElement.textContent = "";
  showError("");
  createFields();
  resizeSignatureCanvas();
  clearSignature();
  deadline = performance.now() + FORM_TIME * 1000;
  animationFrame = requestAnimationFrame(updateTimer);
  fields[0]?.input.focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitForm();
});

clearButton.addEventListener("click", clearSignature);
newRoundButton.addEventListener("click", newRound);
toggleCheatsheetButton.addEventListener("click", toggleCheatsheet);
switchSidesButton.addEventListener("click", switchCheatsheetSide);
cheatsheetType.addEventListener("change", renderCheatsheet);
languageSelect.addEventListener("change", applyLanguage);
playerNameInput.addEventListener("input", () => {
  if (!cheatsheet.hidden) renderCheatsheet();
});
rejectionOk.addEventListener("click", newRound);
window.addEventListener("resize", () => {
  if (!signatureHasContent) resizeSignatureCanvas();
});

applyLanguage();
newRound();
