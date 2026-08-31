/* ===================== CONFIG ===================== */
const TOTAL_SECONDS = 150 * 60; // 2 hours 30 minutes (150 minutes)
let timeLeft = TOTAL_SECONDS;
let timerInterval = null;

/* ===================== STATE ===================== */
// status per question: 'notVisited' | 'notAnswered' | 'answered' | 'marked' | 'answeredMarked'
let sections = [];
let state = [];
let curSection = 0, curQuestion = 0;
let defaultLang = 'en';
let submitted = false;
let examTestId = null;

// Called once the test's questions have been loaded (see the inline loader script at
// the bottom of each tet-mock-test-N.html) — before this runs, nothing below can be
// interacted with, since nameScreen stays hidden until the loader reveals it.
// `loadedSections` comes from the get_test_questions() RPC and never contains the
// correct-answer field — scoring happens server-side in submitTest(), via the
// score_test_attempt() RPC, which is the only place that ever sees the answer key.
function initExam(loadedSections, testId){
  sections = loadedSections;
  examTestId = testId;
  state = sections.map(sec => sec.questions.map(() => ({status:'notVisited', selected:null})));
}

/* ===================== INSTRUCTIONS ===================== */
document.getElementById('agreeBox').addEventListener('change', function(){
  document.getElementById('beginBtn').disabled = !this.checked;
});

let candidateName = '';

function proceedToInstructions(){
  const nameInput = document.getElementById('candidateNameInput');
  const name = nameInput.value.trim();
  const errorEl = document.getElementById('nameError');
  if(!name){
    errorEl.textContent = 'Please enter your name to continue.';
    return;
  }
  errorEl.textContent = '';
  candidateName = name;
  document.getElementById('candidateNameFooter').textContent = candidateName;
  document.getElementById('candidateNameSidebar').textContent = candidateName;
  document.getElementById('nameScreen').style.display = 'none';
  document.getElementById('instructionsScreen').style.display = 'block';
}

function beginTest(){
  defaultLang = document.getElementById('defaultLang').value || 'en';
  document.getElementById('qLangSelect').value = defaultLang;
  document.getElementById('instructionsScreen').style.display = 'none';
  document.getElementById('testScreen').style.display = 'block';
  buildSectionTabs();
  goToQuestion(0,0);
  startTimer();
}

/* ===================== TIMER ===================== */
function startTimer(){
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if(timeLeft <= 0){
      clearInterval(timerInterval);
      submitTest(true);
    }
  }, 1000);
}
function updateTimerDisplay(){
  const m = Math.floor(timeLeft/60).toString().padStart(2,'0');
  const s = (timeLeft%60).toString().padStart(2,'0');
  document.getElementById('timerDisplay').textContent = `Time Left : ${m}:${s}`;
}

/* ===================== NAVIGATION / RENDER ===================== */
function buildSectionTabs(){
  const wrap = document.getElementById('sectionTabs');
  wrap.innerHTML = '';
  sections.forEach((sec, i) => {
    const tab = document.createElement('div');
    tab.className = 'section-tab' + (i === curSection ? ' active' : '');
    tab.textContent = sec.name.toUpperCase();
    tab.onclick = () => goToQuestion(i, 0);
    wrap.appendChild(tab);
  });
}

function goToQuestion(secIdx, qIdx){
  curSection = secIdx;
  curQuestion = qIdx;
  if(state[secIdx][qIdx].status === 'notVisited'){
    state[secIdx][qIdx].status = 'notAnswered';
  }
  buildSectionTabs();
  renderQuestion();
  renderPalette();
  renderLegendCounts();
}

function renderQuestion(){
  const item = sections[curSection].questions[curQuestion];
  const mode = sections[curSection].mode || 'bilingual';
  const langBar = document.getElementById('langBarWrap');
  let lang;
  if(mode === 'bilingual'){
    langBar.style.display = 'flex';
    lang = document.getElementById('qLangSelect').value;
  } else {
    langBar.style.display = 'none';
    lang = mode;
  }
  const data = item[lang];
  document.getElementById('qNoLabel').textContent = `Question No. ${curQuestion+1}`;
  document.getElementById('qText').textContent = data.q;
  const optWrap = document.getElementById('optionsList');
  optWrap.innerHTML = '';
  const saved = state[curSection][curQuestion].selected;
  data.options.forEach((opt, i) => {
    const id = `opt_${curSection}_${curQuestion}_${i}`;
    const label = document.createElement('label');
    label.className = 'option';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `q_${curSection}_${curQuestion}`;
    input.id = id;
    input.value = i;
    input.checked = saved === i;
    input.addEventListener('change', () => {
      state[curSection][curQuestion].selected = i;
    });
    const span = document.createElement('span');
    span.textContent = opt;
    label.appendChild(input);
    label.appendChild(document.createTextNode(' '));
    label.appendChild(span);
    optWrap.appendChild(label);
  });
  document.getElementById('sidebarSectionName').textContent = sections[curSection].name.toUpperCase();
}

function renderPalette(){
  const wrap = document.getElementById('palette');
  wrap.innerHTML = '';
  sections[curSection].questions.forEach((_, i) => {
    const st = state[curSection][i].status;
    const btn = document.createElement('div');
    btn.className = 'qnum ' + (i === curQuestion ? 'current' : '');
    btn.style.background = colorForStatus(st);
    btn.textContent = i+1;
    btn.onclick = () => goToQuestion(curSection, i);
    wrap.appendChild(btn);
  });
}

function colorForStatus(st){
  switch(st){
    case 'answered': return 'var(--green)';
    case 'notAnswered': return 'var(--red)';
    case 'marked': return 'var(--purple)';
    case 'answeredMarked': return 'var(--purple)';
    default: return 'var(--grey)';
  }
}

function renderLegendCounts(){
  let answered=0, notAnswered=0, notVisited=0, marked=0;
  state.forEach(sec => sec.forEach(q => {
    if(q.status === 'answered') answered++;
    else if(q.status === 'notAnswered') notAnswered++;
    else if(q.status === 'notVisited') notVisited++;
    else if(q.status === 'marked' || q.status === 'answeredMarked') marked++;
  }));
  document.getElementById('cntAnswered').textContent = answered;
  document.getElementById('cntNotAnswered').textContent = notAnswered;
  document.getElementById('cntNotVisited').textContent = notVisited;
  document.getElementById('cntMarked').textContent = marked;
}

/* ===================== ACTIONS ===================== */
function saveAndNext(){
  const cell = state[curSection][curQuestion];
  cell.status = cell.selected !== null ? 'answered' : 'notAnswered';
  advance();
}
function clearResponse(){
  state[curSection][curQuestion].selected = null;
  state[curSection][curQuestion].status = 'notAnswered';
  renderQuestion();
  renderPalette();
  renderLegendCounts();
}
function markForReviewAndNext(){
  const cell = state[curSection][curQuestion];
  cell.status = cell.selected !== null ? 'answeredMarked' : 'marked';
  advance();
}
function advance(){
  const qs = sections[curSection].questions;
  if(curQuestion < qs.length - 1){
    goToQuestion(curSection, curQuestion+1);
  } else if(curSection < sections.length - 1){
    goToQuestion(curSection+1, 0);
  } else {
    renderPalette();
    renderLegendCounts();
  }
}
function prevQuestion(){
  if(curQuestion > 0){
    goToQuestion(curSection, curQuestion-1);
  } else if(curSection > 0){
    const prevSec = curSection - 1;
    goToQuestion(prevSec, sections[prevSec].questions.length - 1);
  }
}

/* ===================== SUBMIT / RESULT ===================== */
function confirmSubmit(){
  if(confirm('Are you sure you want to submit the test? You will not be able to make changes after submission.')){
    submitTest(false);
  }
}

// Scoring happens in Postgres (score_test_attempt RPC), not here — the browser never
// holds the answer key, so there's nothing for a student to read out of dev tools.
async function submitTest(autoSubmitted){
  if(submitted) return;
  submitted = true;
  clearInterval(timerInterval);
  document.getElementById('testScreen').style.display = 'none';
  document.getElementById('resultScreen').style.display = 'block';

  document.getElementById('resultCandidateLine').textContent = 'Candidate: ' + candidateName;
  document.getElementById('resultSummaryLine').textContent = 'Calculating your result…';
  document.getElementById('resScore').textContent = '—';
  document.getElementById('resCorrect').textContent = '—';
  document.getElementById('resIncorrect').textContent = '—';
  document.getElementById('resUnattempted').textContent = '—';
  document.querySelector('#secBreakdownTable tbody').innerHTML = '';

  const answers = state.map(sec => sec.map(q => q.selected));

  const { data, error } = await supabaseClient.rpc('score_test_attempt', {
    p_test_id: examTestId,
    p_answers: answers,
  });

  if(error || !data){
    const summary = document.getElementById('resultSummaryLine');
    summary.textContent = '';
    summary.append('Could not calculate your result — please check your connection. ');
    const retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'btn btn-primary';
    retryBtn.textContent = 'Retry';
    retryBtn.onclick = () => { submitted = false; submitTest(autoSubmitted); };
    summary.appendChild(retryBtn);
    return;
  }

  document.getElementById('resultSummaryLine').textContent = autoSubmitted
    ? 'Time is up — your test was submitted automatically.'
    : 'Your test has been submitted successfully.';
  document.getElementById('resScore').textContent = data.score;
  document.getElementById('resCorrect').textContent = data.totalCorrect;
  document.getElementById('resIncorrect').textContent = data.totalIncorrect;
  document.getElementById('resUnattempted').textContent = data.totalUnattempted;

  const tbody = document.querySelector('#secBreakdownTable tbody');
  tbody.innerHTML = '';
  (data.rows || []).forEach(r => {
    const tr = document.createElement('tr');
    [r.name, r.total, r.c, r.ic, r.un].forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}
