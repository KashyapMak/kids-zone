/**
 * Add & Sub Trail - Core Game Logic
 */
(function () {
  'use strict';

  const cfg = {
    digits: 1,
    opMode: 'add',
    total: 15,
    mode: 'practice',
    timeboxType: 'per-question',
    perQSeconds: 10,
    totalSeconds: 180,
    shuffleOptions: true,
    showNumberLine: true,
    noNegative: true,
    avoidCarry: false,
    avoidBorrow: false
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
    const key = `as_${cfg.digits}_${cfg.opMode}_${cfg.mode}_${cfg.timeboxType}`;
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      const text = [
        `Digits: ${cfg.digits} | Op: ${cfg.opMode.toUpperCase()} | ${cfg.mode.toUpperCase()} ${cfg.mode === 'test' ? `(${cfg.timeboxType.replace('-', ' ')})` : ''}`,
        data.best ? `Best: ${data.best.score}/${data.best.total}` : `Best: —`,
        data.last ? `Last: ${data.last.score}/${data.last.total}` : `Last: —`
      ].join('  •  ');
      $('#stats').textContent = text;
    } catch (e) {}
  }

  function saveResult() {
    const key = `as_${cfg.digits}_${cfg.opMode}_${cfg.mode}_${cfg.timeboxType}`;
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      const best = data.best && (data.best.score / data.best.total) >= (score / cfg.total) ? data.best : { score, total: cfg.total, date: Date.now() };
      const last = { score, total: cfg.total, date: Date.now() };
      localStorage.setItem(key, JSON.stringify({ best, last }));
    } catch (e) {}
  }

  function pow10(n) { return Math.pow(10, n); }
  function digitRange(d) { return d === 1 ? [1, 9] : [pow10(d - 1), pow10(d) - 1]; }

  function hasCarry(a, b) {
    let carry = 0;
    while (a > 0 || b > 0) {
      const da = a % 10, db = b % 10;
      if (da + db + carry >= 10) return true;
      carry = Math.floor((da + db + carry) / 10);
      a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return false;
  }

  function needsBorrow(a, b) {
    while (a > 0 || b > 0) {
      const da = a % 10, db = b % 10;
      if (db > da) return true;
      a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return false;
  }

  function generatePair(d, op) {
    const [minV, maxV] = digitRange(d);
    let tries = 0;
    while (tries < 200) {
      tries++;
      let a = randInt(minV, maxV);
      let b = randInt(minV, maxV);

      if (op === 'sub') {
        if (cfg.noNegative && a < b) { const t = a; a = b; b = t; }
        if (cfg.avoidBorrow && needsBorrow(a, b)) continue;
        return { a, b, op };
      } else if (op === 'add') {
        if (cfg.avoidCarry && hasCarry(a, b)) continue;
        return { a, b, op };
      }
    }
    let a = minV, b = Math.min(minV, maxV);
    if (op === 'sub' && cfg.noNegative && a < b) [a, b] = [b, a];
    return { a, b, op };
  }

  function smartOptions(correct, a, b, op, doShuffle = true) {
    const set = new Set([correct]);
    const near = [
      correct + 1, correct - 1, correct + 2, correct - 2,
      correct + (op === 'add' ? a : -a),
      correct + (op === 'add' ? b : -b),
      (op === 'add' ? a + (b + 1) : a - (b - 1)),
      (op === 'add' ? a + (b - 1) : a - (b + 1)),
    ].filter(x => Number.isFinite(x));

    near.forEach(v => { if (v >= 0 && set.size < 4) set.add(v); });
    while (set.size < 4) {
      set.add(correct + randInt(-9, 9));
    }
    const arr = Array.from(set).slice(0, 4);
    return doShuffle ? shuffle(arr) : arr;
  }

  function generateQuestions() {
    questions = []; history = []; current = 0; score = 0; streak = 0;

    for (let i = 0; i < cfg.total; i++) {
      const op = (cfg.opMode === 'mix') ? (Math.random() < 0.5 ? 'add' : 'sub') : cfg.opMode;
      let { a, b } = generatePair(cfg.digits, op);

      const p = i / cfg.total;
      if (cfg.digits === 1) {
        if (p < 0.33) b = randInt(1, 3);
        else if (p < 0.66) b = randInt(2, 7);
      }

      if (op === 'sub' && cfg.noNegative && a < b) [a, b] = [b, a];

      const ans = (op === 'add') ? a + b : a - b;
      const opts = smartOptions(ans, a, b, op, cfg.shuffleOptions);
      questions.push({ a, b, op, ans, opts });
    }
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
    cfg.digits = Number(document.querySelector('input[name="digits"]:checked').value);
    cfg.opMode = document.querySelector('input[name="ops"]:checked').value;
    cfg.total = Math.min(Math.max(Number($('#qty-num').value) || 15, 5), 50);
    cfg.noNegative = $('#no-negative').checked;
    cfg.avoidCarry = $('#avoid-carry').checked;
    cfg.avoidBorrow = $('#avoid-borrow').checked;
    cfg.perQSeconds = Math.min(Math.max(Number($('#per-q-secs').value) || 10, 5), 60);
    cfg.totalSeconds = Math.min(Math.max(Number($('#total-secs').value) || 180, 30), 1800);
    cfg.showNumberLine = $('#show-numberline').checked;
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
    const symbol = (q.op === 'add') ? '+' : '−';
    $('#question-text').textContent = `${q.a} ${symbol} ${q.b}`;
    renderNumberLine(q);
    renderOptions(q);
    updateProgress();
    awaitingAnswer = true;

    say(`${q.a} ${symbol === '+' ? 'plus' : 'minus'} ${q.b}`);

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

  function renderNumberLine(q) {
    const hv = $('#helper-visual');
    hv.innerHTML = '';
    if (!cfg.showNumberLine) return;

    const values = [q.a, q.b, q.ans];
    const maxVal = Math.max(...values);
    const minVal = Math.min(0, ...values);
    if (maxVal > 30 || minVal < 0) return;

    const maxTick = Math.max(10, maxVal);
    const line = document.createElement('div');
    line.className = 'number-line';
    const track = document.createElement('div');
    track.className = 'track';
    line.appendChild(track);

    for (let t = 0; t <= maxTick; t++) {
      const pct = (t / maxTick) * 100;
      const tick = document.createElement('div');
      tick.className = 'tick';
      tick.style.left = `calc(${pct}% + 8px)`;
      line.appendChild(tick);

      const lbl = document.createElement('div');
      lbl.className = 'label';
      lbl.style.left = `calc(${pct}% + 8px)`;
      lbl.textContent = t;
      line.appendChild(lbl);
    }

    function placeMarker(value, color) {
      const pct = (value / maxTick) * 100;
      const m = document.createElement('div');
      m.className = 'marker';
      m.style.left = `calc(${pct}% + 8px)`;
      m.style.background = color;
      line.appendChild(m);
    }

    placeMarker(q.a, '#10b981');
    if (q.op === 'add') {
      placeMarker(q.a + q.b, '#f59e0b');
    } else {
      placeMarker(q.a - q.b, '#f59e0b');
    }

    hv.appendChild(line);
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
    const symbol = (q.op === 'add') ? '+' : '−';

    history.push({ q: `${q.a} ${symbol} ${q.b}`, ans: q.ans, user: val, timeout: isTimeout });

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
        gameId: 'add-sub',
        score: score,
        total: cfg.total,
        mode: cfg.mode,
        durationSec: totalTakenSec
      });
    }

    let msg = 'Great effort! Keep practicing and you’ll master it!';
    if (forcedByTimer) msg = 'Time’s up! Awesome try — practice again and beat the clock! ⏰';
    else if (pct === 100) msg = 'Perfect score! You’re an Arithmetic Champion! 🏆';
    else if (pct >= 80) msg = 'Awesome work! You’re on fire! 🌟';
    else if (pct >= 60) msg = 'Good job! Keep building your skills! 💪';
    $('#appraise').textContent = msg;

    const badges = [];
    if (pct === 100) badges.push('🏆 Flawless!');
    if (cfg.mode === 'test') badges.push(cfg.timeboxType === 'per-question' ? '⏱️ Speed Master' : '⏱️ Countdown Master');
    if (cfg.digits >= 3) badges.push('🧠 Multi-Digit Wizard');
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

  window.addEventListener('DOMContentLoaded', () => {
    $('#btn-practice').addEventListener('click', () => setMode('practice'));
    $('#btn-test').addEventListener('click', () => setMode('test'));

    document.querySelectorAll('input[name="tbtype"]').forEach(r => {
      r.addEventListener('change', e => setTimeboxType(e.target.value));
    });

    document.querySelectorAll('input[name="digits"], input[name="ops"]').forEach(r => {
      r.addEventListener('change', updateSavedStats);
    });

    $('#start-btn').addEventListener('click', startQuiz);
    $('#next-btn').addEventListener('click', () => { current++; renderQuestion(); });
    $('#skip-btn').addEventListener('click', () => {
      const q = questions[current];
      const symbol = (q.op === 'add') ? '+' : '−';
      if (q) { history.push({ q: `${q.a} ${symbol} ${q.b}`, ans: q.ans, user: null, timeout: false }); streak = 0; }
      current++; renderQuestion();
    });

    $('#read-btn').addEventListener('click', () => {
      const q = questions[current];
      const symbol = (q.op === 'add') ? 'plus' : 'minus';
      if (q && window.KZAudio) KZAudio.speak(`${q.a} ${symbol} ${q.b}`);
    });

    $('#play-again').addEventListener('click', () => location.reload());
    $('#print-btn').addEventListener('click', () => window.print());

    $('#reset-progress').addEventListener('click', () => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('as_'));
      keys.forEach(k => localStorage.removeItem(k));
      updateSavedStats();
      alert('Progress reset!');
    });

    // Keyboard controls
    document.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      if (k === 'r') { $('#read-btn').click(); }
      if (['1', '2', '3', '4'].includes(k)) {
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
  });
})();
