/**
 * Times Table Trail - Core Game Logic
 */
(function () {
  'use strict';

  const cfg = {
    start: 1, end: 10, total: 15,
    mode: 'practice',            // 'practice' | 'test'
    timeboxType: 'per-question', // 'per-question' | 'total'
    perQSeconds: 10,
    totalSeconds: 180,
    showArrays: true,
    shuffleOptions: true,
    factorMax: 12,
  };

  let score = 0, current = 0, questions = [], history = [];
  let timerObj = null, timeLeft = 0, streak = 0, awaitingAnswer = true;
  let startTimeMs = 0, endTimeMs = 0;
  let totalTimerObj = null;

  const $ = sel => document.querySelector(sel);

  const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  const shuffle = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  function fmtTime(s) {
    const m = Math.floor(s / 60), sec = Math.max(0, Math.floor(s % 60));
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function beep(type = 'ok') {
    if (!window.KZAudio) return;
    if (type === 'ok') KZAudio.playOk();
    else if (type === 'tick') KZAudio.playTick();
    else KZAudio.playWrong();
  }

  function say(text) {
    if (window.KZAudio && KZAudio.isSpeakingEnabled()) {
      KZAudio.speak(text);
    }
  }

  function updateSavedStats() {
    const key = `mw_${cfg.start}-${cfg.end}_${cfg.mode}_${cfg.timeboxType}`;
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      const text = [
        `Preset: ${cfg.start}–${cfg.end} | ${cfg.mode.toUpperCase()} ${cfg.mode === 'test' ? `(${cfg.timeboxType.replace('-', ' ')})` : ''}`,
        data.best ? `Best: ${data.best.score}/${data.best.total}` : `Best: —`,
        data.last ? `Last: ${data.last.score}/${data.last.total}` : `Last: —`
      ].join('  •  ');
      $('#stats').textContent = text;
    } catch (e) {}
  }

  function saveResult() {
    const key = `mw_${cfg.start}-${cfg.end}_${cfg.mode}_${cfg.timeboxType}`;
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      const best = data.best && (data.best.score / data.best.total) >= (score / cfg.total) ? data.best : { score, total: cfg.total, date: Date.now() };
      const last = { score, total: cfg.total, date: Date.now() };
      localStorage.setItem(key, JSON.stringify({ best, last }));
    } catch (e) {}
  }

  function generateQuestions() {
    questions = []; history = []; current = 0; score = 0; streak = 0;

    for (let i = 0; i < cfg.total; i++) {
      const n1 = randInt(cfg.start, cfg.end);
      let n2;
      const p = i / cfg.total;
      if (p < 0.33) n2 = randInt(1, 5);
      else if (p < 0.66) n2 = randInt(3, 9);
      else n2 = randInt(6, cfg.factorMax);

      const ans = n1 * n2;
      const opts = generateOptions(ans, n1, n2, cfg.shuffleOptions);
      questions.push({ n1, n2, ans, opts });
    }
  }

  function generateOptions(correct, n1, n2, doShuffle = true) {
    const set = new Set([correct]);
    const pool = [
      n1 * (n2 + 1), n1 * (n2 - 1), (n1 + 1) * n2, (n1 - 1) * n2,
      correct + n1, correct - n1, correct + n2, correct - n2,
      correct + 1, correct - 1, correct + 2, correct - 2
    ].filter(x => Number.isFinite(x) && x > 0);

    shuffle(pool);
    for (const v of pool) {
      if (set.size >= 4) break;
      set.add(v);
    }
    while (set.size < 4) {
      set.add(correct + randInt(-9, 9) || correct + randInt(2, 7));
    }
    const arr = Array.from(set);
    return doShuffle ? shuffle(arr) : arr;
  }

  function toggleCustom() {
    const v = $('#range-select').value;
    $('#custom-fields').classList.toggle('hidden', v !== 'custom');
  }

  function setMode(mode) {
    cfg.mode = mode;
    const isTest = mode === 'test';
    $('#btn-practice').setAttribute('aria-pressed', String(!isTest));
    $('#btn-test').setAttribute('aria-pressed', String(isTest));
    $('#btn-practice').style.opacity = isTest ? '.7' : '1';
    $('#btn-test').style.opacity = isTest ? '1' : '.7';
    $('#timed-controls').classList.toggle('hidden', !isTest);
    updateSavedStats();
  }

  function setTimeboxType(val) {
    cfg.timeboxType = val;
    const perQ = (val === 'per-question');
    $('#perq-wrap').classList.toggle('hidden', !perQ);
    $('#total-wrap').classList.toggle('hidden', perQ);
    updateSavedStats();
  }

  function startQuiz() {
    if (window.KZAudio) KZAudio.playClick();
    const sel = $('#range-select').value;
    if (sel === 'custom') {
      cfg.start = Number($('#start-num').value) || 1;
      cfg.end   = Number($('#end-num').value)   || 10;
      cfg.total = Math.min(Math.max(Number($('#qty-num').value) || 15, 5), 50);
      if (cfg.start > cfg.end) [cfg.start, cfg.end] = [cfg.end, cfg.start];
      cfg.start = Math.max(1, Math.min(cfg.start, 50));
      cfg.end   = Math.max(1, Math.min(cfg.end, 50));
    } else {
      const [a, b] = sel.split('-').map(Number);
      cfg.start = a; cfg.end = b; cfg.total = 15;
    }
    cfg.perQSeconds = Math.min(Math.max(Number($('#per-q-secs').value) || 10, 5), 60);
    cfg.totalSeconds = Math.min(Math.max(Number($('#total-secs').value) || 180, 30), 1800);
    cfg.showArrays = $('#show-arrays').checked;
    cfg.shuffleOptions = $('#shuffle-options').checked;

    generateQuestions();
    $('#setup-screen').classList.add('hidden');
    $('#quiz-screen').classList.remove('hidden');

    startTimeMs = Date.now();
    if (cfg.mode === 'test' && cfg.timeboxType === 'total') {
      let left = cfg.totalSeconds;
      $('#timer-clock').textContent = fmtTime(left);
      totalTimerObj = setInterval(() => {
        left--;
        if (left <= 3) beep('tick');
        $('#timer-clock').textContent = fmtTime(left);
        if (left <= 0) {
          clearInterval(totalTimerObj);
          endQuiz(true);
        }
      }, 1000);
    } else {
      $('#timer-clock').textContent = '';
    }

    renderQuestion();
    updateProgress();
    $('#message').textContent = (cfg.mode === 'practice')
      ? 'Try answering — you can retry if you miss!'
      : (cfg.timeboxType === 'per-question' ? 'Answer within the time ⏱️ (per question)' : 'Beat the global timer ⏱️ (total)');
  }

  function updateProgress() {
    $('#q-progress').textContent = `Question ${Math.min(current + 1, cfg.total)}/${cfg.total}`;
    $('#streak').textContent = `Streak: ${streak} 🔥`;
    const pct = (current / cfg.total) * 100;
    if (window.KZ) KZ.setProgress(pct);
  }

  function renderQuestion() {
    if (current >= cfg.total) return endQuiz();

    const q = questions[current];
    $('#question-text').textContent = `${q.n1} × ${q.n2}`;
    renderVisual(q);
    renderOptions(q);
    updateProgress();
    awaitingAnswer = true;

    say(`${q.n1} times ${q.n2}`);

    clearInterval(timerObj);
    if (cfg.mode === 'test' && cfg.timeboxType === 'per-question') {
      timeLeft = cfg.perQSeconds;
      $('#timer-clock').textContent = `00:${timeLeft.toString().padStart(2, '0')}`;
      timerObj = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 3) beep('tick');
        $('#timer-clock').textContent = `00:${Math.max(0, timeLeft).toString().padStart(2, '0')}`;
        if (timeLeft <= 0) {
          clearInterval(timerObj);
          checkAnswer(null, true);
        }
      }, 1000);
    } else if (cfg.mode === 'practice') {
      $('#timer-clock').textContent = '';
    }
  }

  function renderVisual(q) {
    const box = $('#helper-visual');
    if (!cfg.showArrays) {
      box.classList.add('hidden');
      box.innerHTML = '';
      return;
    }
    const maxDots = 100;
    const total = q.n1 * q.n2;

    if (total > maxDots) {
      box.classList.remove('hidden');
      box.setAttribute('aria-hidden', 'false');
      box.innerHTML = `<div style="font-weight:700; color:var(--muted)">(${q.n1} rows × ${q.n2} columns — too large to display dots)</div>`;
      return;
    }
    box.classList.remove('hidden');
    box.setAttribute('aria-hidden', 'false');
    box.style.gridTemplateColumns = `repeat(${q.n2}, 16px)`;
    box.innerHTML = Array.from({ length: total }).map(() => '<span class="dot"></span>').join('');
  }

  function renderOptions(q) {
    const cont = $('#options');
    cont.innerHTML = '';
    q.opts.forEach((val, idx) => {
      const b = document.createElement('button');
      b.className = 'option-btn';
      b.textContent = String(val);
      b.setAttribute('data-val', val);
      b.setAttribute('aria-label', `Option ${idx + 1}: ${val}`);
      b.addEventListener('click', () => checkAnswer(val, false, b));
      cont.appendChild(b);
    });
    $('#next-btn').disabled = true;
  }

  function checkAnswer(val, isTimeout = false, btnEl = null) {
    if (!awaitingAnswer) return;
    awaitingAnswer = false;

    clearInterval(timerObj);
    const q = questions[current];
    const correct = (val === q.ans);

    history.push({ q: `${q.n1} × ${q.n2}`, ans: q.ans, user: val, timeout: isTimeout });

    if (cfg.mode === 'practice') {
      const opts = [...document.querySelectorAll('.option-btn')];
      opts.forEach(b => b.disabled = true);
      if (correct) {
        if (btnEl) btnEl.classList.add('correct');
        score++; streak++;
        setMessage(praise(), 'ok');
        beep('ok');
        setTimeout(() => { current++; renderQuestion(); }, 650);
      } else {
        streak = 0;
        if (btnEl) btnEl.classList.add('wrong');
        setMessage(isTimeout ? '⏰ Time’s up — try another!' : 'Oops! Try again 😊', 'warn');
        beep('bad');
        setTimeout(() => {
          opts.forEach(b => {
            if (!b.classList.contains('wrong')) b.disabled = false;
          });
          awaitingAnswer = true;
        }, 350);
      }
    } else {
      const opts = [...document.querySelectorAll('.option-btn')];
      opts.forEach(b => b.disabled = true);
      if (correct) {
        score++; streak++;
        if (btnEl) btnEl.classList.add('correct');
        setMessage(praise(), 'ok');
        beep('ok');
      } else {
        streak = 0;
        if (btnEl) btnEl.classList.add('wrong');
        setMessage(isTimeout ? '⏰ Out of time!' : 'Not this one — keep going!', 'warn');
        beep('bad');
      }
      $('#next-btn').disabled = false;
    }
    updateProgress();
  }

  function setMessage(text, type = 'info') {
    const el = $('#message');
    el.style.color = (type === 'ok') ? 'var(--ok)' : (type === 'warn' ? 'var(--danger)' : 'var(--muted)');
    el.textContent = text;
  }

  function praise() {
    const msgs = ['Brilliant!', 'Nice job!', 'You rock!', 'Fantastic!', 'Great work!', 'Super!', 'Math Hero!', 'Amazing!'];
    return msgs[randInt(0, msgs.length - 1)];
  }

  function endQuiz(forcedByTimer = false) {
    if (totalTimerObj) { clearInterval(totalTimerObj); totalTimerObj = null; }
    if (window.KZ) KZ.setProgress(100);

    saveResult();
    endTimeMs = Date.now();

    $('#quiz-screen').classList.add('hidden');
    $('#result-screen').classList.remove('hidden');

    const pct = Math.round((score / cfg.total) * 100);
    $('#score-big').textContent = `${score} / ${cfg.total} (${pct}%)`;

    const totalTakenSec = Math.max(0, Math.round((endTimeMs - startTimeMs) / 1000));
    $('#time-taken').textContent = fmtTime(totalTakenSec);

    if (window.KZ && KZ.recordScore) {
      KZ.recordScore({
        gameId: 'time-table',
        score: score,
        total: cfg.total,
        mode: cfg.mode,
        durationSec: totalTakenSec
      });
    }

    let msg = 'Great effort! Keep practicing and you’ll master it!';
    if (forcedByTimer) msg = 'Time’s up! Awesome try — practice again and beat the clock! ⏰';
    else if (pct === 100) msg = 'Perfect score! You’re a Times Table Champion! 🏆';
    else if (pct >= 80) msg = 'Awesome work! You’re on fire! 🌟';
    else if (pct >= 60) msg = 'Good job! Keep building your skills! 💪';
    $('#appraise').textContent = msg;

    const badges = [];
    if (pct === 100) badges.push('🏆 Flawless!');
    if (cfg.mode === 'test') badges.push(cfg.timeboxType === 'per-question' ? '⏱️ Speed Master' : '⏱️ Countdown Master');
    if (cfg.end - cfg.start >= 9) badges.push('🧠 Big Range');
    if (streak >= 5) badges.push(`🔥 Streak ${streak}`);
    $('#badges').innerHTML = badges.map(b => `<span class="badge">${b}</span>`).join('');

    if (pct >= 80 && window.KZ) {
      KZ.confetti({ count: 120, spread: 70 });
    }

    const list = $('#review-list');
    list.innerHTML = history.map(h => {
      const ok = (h.user === h.ans);
      const u = (h.user === null) ? '—' : h.user;
      return `
        <div class="review-item">
          <div><strong>${h.q}</strong> = <b>${h.ans}</b></div>
          <div style="font-weight:800; color:${ok ? 'var(--ok)' : 'var(--danger)'}">${ok ? '✅' : '❌'} ${h.timeout ? '⏰' : ''} ${!ok && u !== '—' ? `(Your choice: ${u})` : ''}</div>
        </div>
      `;
    }).join('');
  }

  // Setup UI event listeners
  window.addEventListener('DOMContentLoaded', () => {
    $('#range-select').addEventListener('change', toggleCustom);
    $('#btn-practice').addEventListener('click', () => setMode('practice'));
    $('#btn-test').addEventListener('click', () => setMode('test'));

    document.querySelectorAll('input[name="tbtype"]').forEach(r => {
      r.addEventListener('change', e => setTimeboxType(e.target.value));
    });

    $('#start-btn').addEventListener('click', startQuiz);
    $('#next-btn').addEventListener('click', () => { current++; renderQuestion(); });
    $('#skip-btn').addEventListener('click', () => {
      const q = questions[current];
      if (q) { history.push({ q: `${q.n1} × ${q.n2}`, ans: q.ans, user: null, timeout: false }); streak = 0; }
      current++; renderQuestion();
    });

    $('#read-btn').addEventListener('click', () => {
      const q = questions[current];
      if (q && window.KZAudio) KZAudio.speak(`${q.n1} times ${q.n2}`);
    });

    $('#play-again').addEventListener('click', () => location.reload());
    $('#print-btn').addEventListener('click', () => window.print());

    $('#reset-progress').addEventListener('click', () => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('mw_'));
      keys.forEach(k => localStorage.removeItem(k));
      updateSavedStats();
      alert('Progress reset!');
    });

    // Keyboard controls
    document.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      if (k === 'r') { $('#read-btn').click(); }
      if (['1', '2', '3', '4', '5', '6'].includes(k)) {
        const idx = Number(k) - 1;
        const btn = document.querySelectorAll('.option-btn')[idx];
        if (btn) btn.click();
      }
      if (k === 'n' || e.key === 'Enter') {
        if (!$('#next-btn').disabled) $('#next-btn').click();
      }
      if (k === 's') $('#skip-btn').click();
    });

    setMode('practice');
    setTimeboxType('per-question');
    updateSavedStats();
    toggleCustom();
  });
})();
