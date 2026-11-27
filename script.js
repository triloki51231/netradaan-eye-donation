/* =====================================================
   Netradaan – Corneal Eye Donation Awareness & Pledge Registry
   Plain JavaScript, no libraries. Data is kept in localStorage.
   ===================================================== */

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "netradaanPledges";

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function loadPledges() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch (e) { return []; }
}
function savePledges(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  catch (e) { alert("Could not save. Your browser may be blocking local storage."); }
}

/* ---------- Mobile menu ---------- */
const menuBtn = $("menuBtn");
const nav = $("nav");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    nav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

/* =====================================================
   1. MYTH BUSTING QUIZ
   ===================================================== */
const QUESTIONS = [
  {
    q: "Eye donation disfigures the face.",
    options: ["True", "False"], answer: 1,
    why: "Only the thin, clear front layer (cornea) is taken. The eyelids are closed afterwards and the face looks natural, so an open-casket funeral is still possible."
  },
  {
    q: "People who wear glasses cannot donate their eyes.",
    options: ["True", "False"], answer: 1,
    why: "Poor eyesight, short sight or long sight does not stop donation. Only the cornea needs to be healthy, not the whole eye's focus."
  },
  {
    q: "Eyes must be removed within how many hours of death?",
    options: ["1 hour", "6 hours", "24 hours", "48 hours"], answer: 1,
    why: "Corneas should be collected within about 6 hours of death. That is why the eye bank must be called quickly."
  },
  {
    q: "Eye donation is against most religions.",
    options: ["True", "False"], answer: 1,
    why: "Major religions in India support organ and eye donation as an act of charity and compassion."
  },
  {
    q: "Can a person with diabetes or high blood pressure donate corneas?",
    options: ["No, never", "Yes, usually they can"], answer: 1,
    why: "Common conditions like diabetes, hypertension and asthma usually do not rule out corneal donation. The eye bank doctor makes the final check."
  },
  {
    q: "Eyes can be donated while the person is alive.",
    options: ["True", "False"], answer: 1,
    why: "Corneas are donated only after death. A living person cannot donate their eyes."
  },
  {
    q: "How many people can regain sight from one donor?",
    options: ["1", "2", "4", "None, eyes are not reused"], answer: 1,
    why: "Each cornea can go to a different patient, so one donor can restore sight to two people."
  },
  {
    q: "The donor family has to pay for the eye collection.",
    options: ["True", "False"], answer: 1,
    why: "Eye banks collect corneas free of charge, usually at the home or hospital, and the process takes around 20 to 30 minutes."
  }
];

let qIndex = 0;
let score = 0;
let answered = false;

function renderQuestion() {
  const item = QUESTIONS[qIndex];
  answered = false;
  $("quizProgress").textContent = `Question ${qIndex + 1} of ${QUESTIONS.length}`;
  $("quizScore").textContent = `Score: ${score}`;
  $("progressBar").style.width = `${(qIndex / QUESTIONS.length) * 100}%`;
  $("quizQuestion").textContent = item.q;
  $("quizFeedback").hidden = true;
  $("nextBtn").hidden = true;

  const box = $("quizOptions");
  box.innerHTML = "";
  item.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "opt";
    btn.textContent = text;
    btn.addEventListener("click", () => pickAnswer(i));
    box.appendChild(btn);
  });
}

function pickAnswer(i) {
  if (answered) return;
  answered = true;
  const item = QUESTIONS[qIndex];
  const buttons = $("quizOptions").querySelectorAll(".opt");
  buttons.forEach((b, idx) => {
    b.disabled = true;
    if (idx === item.answer) b.classList.add("correct");
    else if (idx === i) b.classList.add("wrong");
  });

  const right = i === item.answer;
  if (right) score++;
  $("quizScore").textContent = `Score: ${score}`;

  const fb = $("quizFeedback");
  fb.innerHTML = `<strong>${right ? "Correct." : "Not quite."}</strong>${escapeHTML(item.why)}`;
  fb.hidden = false;

  $("nextBtn").textContent = qIndex === QUESTIONS.length - 1 ? "See my result" : "Next question";
  $("nextBtn").hidden = false;
  $("nextBtn").focus();
}

$("nextBtn").addEventListener("click", () => {
  if (qIndex < QUESTIONS.length - 1) {
    qIndex++;
    renderQuestion();
  } else {
    showResult();
  }
});

function showResult() {
  ["quizQuestion", "quizOptions", "quizFeedback", "nextBtn"].forEach((id) => ($(id).hidden = true));
  $("progressBar").style.width = "100%";
  const total = QUESTIONS.length;
  let title, text;
  if (score === total) {
    title = `${score}/${total}: you know the facts.`;
    text = "Share what you learned with your family. Their consent is what makes a pledge work.";
  } else if (score >= total / 2) {
    title = `${score}/${total}: a good start.`;
    text = "Retake the quiz to catch the myths you missed, then pledge your eyes.";
  } else {
    title = `${score}/${total}: lots of myths still around.`;
    text = "That is common. Read each explanation again and try once more.";
  }
  $("resultTitle").textContent = title;
  $("resultText").textContent = text;
  $("quizResult").hidden = false;
}

$("restartBtn").addEventListener("click", () => {
  qIndex = 0; score = 0;
  $("quizResult").hidden = true;
  ["quizQuestion", "quizOptions"].forEach((id) => ($(id).hidden = false));
  renderQuestion();
});

renderQuestion();

/* =====================================================
   2. PLEDGE FORM (validation + save)
   ===================================================== */
const form = $("pledgeForm");

function setError(id, msg) {
  const field = $(id);
  const err = $("err-" + id);
  if (err) err.textContent = msg;
  if (field) field.classList.toggle("invalid", Boolean(msg));
  return Boolean(msg);
}

const phoneOK = (v) => /^[6-9]\d{9}$/.test(v.trim());
const nameOK = (v) => /^[A-Za-z][A-Za-z .'-]{1,59}$/.test(v.trim());

function validateForm() {
  let bad = false;
  const v = (id) => $(id).value.trim();

  bad |= setError("donorName", nameOK(v("donorName")) ? "" : "Enter your full name (letters only).");

  const age = Number(v("donorAge"));
  bad |= setError("donorAge", age >= 18 && age <= 120 ? "" : "Age must be between 18 and 120.");

  bad |= setError("bloodGroup", v("bloodGroup") ? "" : "Select your blood group.");
  bad |= setError("donorPhone", phoneOK(v("donorPhone")) ? "" : "Enter a valid 10-digit mobile number.");

  ["c1", "c2"].forEach((p) => {
    bad |= setError(p + "Name", nameOK(v(p + "Name")) ? "" : "Enter the contact's name.");
    bad |= setError(p + "Rel", v(p + "Rel").length >= 2 ? "" : "Enter the relationship.");
    bad |= setError(p + "Phone", phoneOK(v(p + "Phone")) ? "" : "Enter a valid 10-digit mobile number.");
  });

  if (!bad && v("c1Phone") === v("c2Phone")) {
    bad |= setError("c2Phone", "Use a different number from Contact 1.");
  }
  if (!bad && v("c1Phone") === v("donorPhone")) {
    bad |= setError("c1Phone", "Contact must be someone other than you.");
  }

  const consentErr = $("consent").checked ? "" : "Please tick the pledge statement.";
  $("err-consent").textContent = consentErr;
  bad |= Boolean(consentErr);

  return !bad;
}

// Allow only digits in phone fields
["donorPhone", "c1Phone", "c2Phone"].forEach((id) => {
  $(id).addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
  });
});

// Unique registration ID: NDR-YYYY-XXXXXX (no confusing characters)
function generateId(existing) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id;
  do {
    let part = "";
    for (let i = 0; i < 6; i++) part += chars[Math.floor(Math.random() * chars.length)];
    id = `NDR-${new Date().getFullYear()}-${part}`;
  } while (existing.some((p) => p.id === id));
  return id;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateForm()) {
    const firstBad = form.querySelector(".invalid");
    if (firstBad) firstBad.focus();
    return;
  }

  const pledges = loadPledges();
  const v = (id) => $(id).value.trim();
  const pledge = {
    id: generateId(pledges),
    name: v("donorName"),
    age: Number(v("donorAge")),
    blood: v("bloodGroup"),
    phone: v("donorPhone"),
    city: v("donorCity"),
    contacts: [
      { name: v("c1Name"), rel: v("c1Rel"), phone: v("c1Phone") },
      { name: v("c2Name"), rel: v("c2Rel"), phone: v("c2Phone") }
    ],
    date: new Date().toISOString()
  };

  pledges.unshift(pledge);
  savePledges(pledges);
  showCard(pledge);
  renderRegistry();
  form.reset();
  document.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
  $("card").scrollIntoView();
});

$("resetBtn").addEventListener("click", () => {
  document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
});

/* =====================================================
   3. DONOR CARD GENERATOR
   ===================================================== */
let currentPledge = null;

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Decorative barcode derived from the ID so each card looks unique
function drawBars(id) {
  const box = $("dcBars");
  box.innerHTML = "";
  for (const ch of id) {
    const code = ch.charCodeAt(0);
    const bar = document.createElement("span");
    bar.style.width = (code % 3) + 1 + "px";
    box.appendChild(bar);
    const gap = document.createElement("span");
    gap.style.width = ((code >> 2) % 2) + 1 + "px";
    gap.style.background = "transparent";
    box.appendChild(gap);
  }
}

function showCard(p) {
  currentPledge = p;
  $("dcName").textContent = p.name;
  $("dcAge").textContent = p.age;
  $("dcBlood").textContent = p.blood;
  $("dcDate").textContent = formatDate(p.date);
  $("dcC1").textContent = `${p.contacts[0].name} (${p.contacts[0].rel}): ${p.contacts[0].phone}`;
  $("dcC2").textContent = `${p.contacts[1].name} (${p.contacts[1].rel}): ${p.contacts[1].phone}`;
  $("dcId").textContent = p.id;
  drawBars(p.id);
  $("cardEmpty").hidden = true;
  $("cardArea").hidden = false;
}

$("printBtn").addEventListener("click", () => window.print());

$("copyIdBtn").addEventListener("click", async () => {
  if (!currentPledge) return;
  const btn = $("copyIdBtn");
  try {
    await navigator.clipboard.writeText(currentPledge.id);
    btn.textContent = "Copied";
  } catch (e) {
    btn.textContent = currentPledge.id;
  }
  setTimeout(() => (btn.textContent = "Copy ID"), 1800);
});

/* ---------- Registry ---------- */
function renderRegistry() {
  const term = $("lookupInput").value.trim().toLowerCase();
  const list = loadPledges().filter(
    (p) => !term || p.id.toLowerCase().includes(term) || p.name.toLowerCase().includes(term)
  );
  const ul = $("registryList");
  ul.innerHTML = "";

  if (!list.length) {
    ul.innerHTML = `<li><span class="meta">${term ? "No pledge matches your search." : "No pledges saved yet."}</span></li>`;
    return;
  }

  list.forEach((p) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${escapeHTML(p.name)}</strong>
        <div class="meta">${escapeHTML(p.id)} · ${escapeHTML(p.blood)} · ${formatDate(p.date)}</div>
      </div>
      <div>
        <button class="mini-btn" data-act="view" data-id="${escapeHTML(p.id)}">View card</button>
        <button class="mini-btn danger" data-act="del" data-id="${escapeHTML(p.id)}">Delete</button>
      </div>`;
    ul.appendChild(li);
  });
}

$("registryList").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const id = btn.dataset.id;
  const pledges = loadPledges();

  if (btn.dataset.act === "view") {
    const p = pledges.find((x) => x.id === id);
    if (p) { showCard(p); $("card").scrollIntoView(); }
  } else if (btn.dataset.act === "del") {
    if (!confirm("Delete this pledge from this device?")) return;
    savePledges(pledges.filter((x) => x.id !== id));
    if (currentPledge && currentPledge.id === id) {
      currentPledge = null;
      $("cardArea").hidden = true;
      $("cardEmpty").hidden = false;
    }
    renderRegistry();
  }
});

$("lookupInput").addEventListener("input", renderRegistry);

// Show latest pledge on page load, if any
(function init() {
  const saved = loadPledges();
  if (saved.length) showCard(saved[0]);
  renderRegistry();
})();

/* =====================================================
   4. 24/7 EYE BANK HOTLINE + 6-HOUR TIMER
   ---------------------------------------------------
   EDIT THIS LIST: replace the "Demo" numbers with real,
   verified eye bank numbers before using the site.
   ===================================================== */
const HOTLINES = [
  { name: "National Emergency Number", city: "India (all cities)", phone: "112", demo: false },
  { name: "Eye Bank – Chandigarh (add real number)", city: "Chandigarh", phone: "0000000000", demo: true },
  { name: "Eye Bank – Ludhiana (add real number)", city: "Ludhiana", phone: "0000000000", demo: true },
  { name: "Eye Bank – Jalandhar (add real number)", city: "Jalandhar", phone: "0000000000", demo: true },
  { name: "Eye Bank – Amritsar (add real number)", city: "Amritsar", phone: "0000000000", demo: true },
  { name: "Eye Bank – Delhi (add real number)", city: "Delhi", phone: "0000000000", demo: true }
];

function renderHotlines() {
  const term = $("hotlineSearch").value.trim().toLowerCase();
  const ul = $("hotlineList");
  ul.innerHTML = "";
  const list = HOTLINES.filter((h) => !term || (h.name + " " + h.city).toLowerCase().includes(term));

  if (!list.length) {
    ul.innerHTML = `<li><span class="h-meta">No eye bank found for that search. Call 112.</span></li>`;
    return;
  }
  list.forEach((h) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <span class="h-name">${escapeHTML(h.name)}${h.demo ? '<span class="badge">Demo</span>' : ""}</span>
        <span class="h-meta">${escapeHTML(h.city)} · Open 24/7 · ${escapeHTML(h.phone)}</span>
      </div>
      <a class="call-btn" href="tel:${escapeHTML(h.phone)}" aria-label="Call ${escapeHTML(h.name)}">Call now</a>`;
    ul.appendChild(li);
  });
}
$("hotlineSearch").addEventListener("input", renderHotlines);
renderHotlines();

/* ---------- 6-hour countdown ---------- */
let timerId = null;
const SIX_HOURS = 6 * 60 * 60 * 1000;

// Default the picker to "now" so one tap is enough in an emergency
function setNowDefault() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  $("deathTime").value = d.toISOString().slice(0, 16);
}
setNowDefault();

function pad(n) { return String(n).padStart(2, "0"); }

function tick(deadline) {
  const out = $("timerOut");
  const left = deadline - Date.now();
  if (left <= 0) {
    out.textContent = "6 hours have passed. Still call the eye bank, as some may accept later.";
    out.classList.add("urgent");
    clearInterval(timerId);
    return;
  }
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  out.textContent = `${pad(h)}:${pad(m)}:${pad(s)} left`;
  out.classList.toggle("urgent", left < 2 * 3600000);
}

$("startTimer").addEventListener("click", () => {
  const val = $("deathTime").value;
  if (!val) { $("timerOut").textContent = "Pick the time of death first."; return; }
  const start = new Date(val).getTime();
  if (start > Date.now() + 60000) { $("timerOut").textContent = "That time is in the future. Check the time."; return; }
  const deadline = start + SIX_HOURS;
  clearInterval(timerId);
  tick(deadline);
  timerId = setInterval(() => tick(deadline), 1000);
});
