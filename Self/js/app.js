//
// LIFEOS CORE ENGINE
// XP + LEVEL + STREAK + PROGRESS SYSTEM
//

let state = {
  xp: 0,
  level: 1,
  streak: 0,
  progress: 0,
  lastLogin: null
};

// =========================
// LOAD FROM LOCAL STORAGE
// =========================

function loadState(){
  let saved = localStorage.getItem("lifeos_state");

  if(saved){
    state = JSON.parse(saved);
  }

  checkStreak();
  updateUI();
}

// =========================
// SAVE STATE
// =========================

function saveState(){
  localStorage.setItem("lifeos_state", JSON.stringify(state));
}

// =========================
// STREAK SYSTEM (DAILY CHECK)
// =========================

function checkStreak(){
  let today = new Date().toDateString();

  if(state.lastLogin !== today){
    
    if(state.lastLogin){
      let last = new Date(state.lastLogin);
      let diff = Math.floor((new Date() - last) / (1000*60*60*24));

      if(diff === 1){
        state.streak += 1; // continue streak
      } else {
        state.streak = 1; // reset streak
      }
    } else {
      state.streak = 1;
    }

    state.lastLogin = today;
    saveState();
  }
}

// =========================
// XP SYSTEM
// =========================

function addXP(amount){
  state.xp += amount;

  if(state.xp >= 100){
    state.xp = state.xp - 100;
    state.level += 1;

    levelUpEffect();
  }

  state.progress = Math.min(100, state.progress + (amount / 2));

  saveState();
  updateUI();
}

// =========================
// LEVEL UP EFFECT
// =========================

function levelUpEffect(){
  alert("🎉 LEVEL UP! You became stronger!");
}

// =========================
// UPDATE UI
// =========================

function updateUI(){

  // XP
  let xpEl = document.getElementById("xp");
  if(xpEl) xpEl.innerText = state.xp;

  // LEVEL
  let levelEl = document.getElementById("level");
  if(levelEl) levelEl.innerText = "Level " + state.level;

  // STREAK
  let streakEl = document.getElementById("streak");
  if(streakEl) streakEl.innerText = state.streak + " Days";

  // PROGRESS CIRCLE
  updateCircle(state.progress);
}

// =========================
// CIRCLE PROGRESS ANIMATION
// =========================

function updateCircle(progress){
  let circle = document.getElementById("circle");
  let percent = document.getElementById("percent");

  if(!circle || !percent) return;

  let angle = progress * 3.6;

  circle.style.background =
    `conic-gradient(#6c8cff ${angle}deg, #1a2233 0deg)`;

  percent.innerText = Math.floor(progress) + "%";
}

// =========================
// TASK COMPLETION
// =========================

function completeTask(btn){
  if(btn.disabled) return;

  btn.innerText = "Done ✔";
  btn.disabled = true;

  addXP(10);

  // small visual feedback
  btn.style.transform = "scale(1.1)";
  setTimeout(()=> btn.style.transform = "scale(1)", 200);
}

// =========================
// MANUAL XP BUTTON
// =========================

function increaseXP(){
  addXP(20);
}

// =========================
// INIT SYSTEM
// =========================

loadState();
