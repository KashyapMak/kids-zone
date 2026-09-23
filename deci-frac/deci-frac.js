/**
 * Deci-Frac Trail - Core Game Logic
 */
(function () {
  'use strict';

  const cfg = {
    type: 'decimal',
    opMode: 'add',
    total: 15,
    mode: 'practice',
    timeboxType: 'per-question',
    perQSeconds: 12,
    totalSeconds: 240,
    shuffleOptions: true,
    showAid: true,
    wholeDigits: 2,
    decPlaces: 2,
    denMin: 3,
    denMax: 12,
    likeDen: true,
    simplify: true,
    properOnly: false,
    noNegative: true
  };

  let score = 0, current = 0, questions = [], history = [];
  let timerObj = null, timeLeft = 0, streak = 0, awaitingAnswer = true;
  let startTimeMs = 0, endTimeMs = 0;
  let totalTimerObj = null;

  const $ = sel => document.querySelector(sel);
  const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

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

  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

  function simplifyFrac(n, d) {
    const g = gcd(n, d) || 1;
    n /= g; d /= g;
    if (d < 0) { n = -n; d = -d; }
    return { n, d };
  }

  function addFrac(a, b) {
    const L = lcm(a.d, b.d);
    return simplifyFrac(a.n * (L / a.d) + b.n * (L / b.d), L);
  }

  function subFrac(a, b) {
    const L = lcm(a.d, b.d);
    return simplifyFrac(a.n * (L / a.d) - b.n * (L / b.d), L);
  }

  function cmpFrac(a, b) {
    return a.n * b.d - b.n * a.d;
  }

  function fracToString(fr, simpl = true) {
    const f = simpl ? simplifyFrac(fr.n, fr.d) : fr;
    return `${f.n}/${f.d}`;
  }

  function genDecimalNumber(wholeDigits, dp) {
    const maxWhole = 10 ** wholeDigits - 1;
    const minWhole = (wholeDigits === 1) ? 0 : 10 ** (wholeDigits - 1);
    const whole = randInt(minWhole, maxWhole);
    const frac = randInt(0, 10 ** dp - 1);
    return Number(`${whole}.${String(frac).padStart(dp, '0')}`);
  }

  function roundDP(x, dp) {
    const m = 10 ** dp;
    return Math.round(x * m) / m;
  }

  function generateDecimalPair(op) {
    let a = genDecimalNumber(cfg.wholeDigits, cfg.decPlaces);
    let b = genDecimalNumber(cfg.wholeDigits, cfg.decPlaces);
    a = roundDP(a, cfg.decPlaces);
    b = roundDP(b, cfg.decPlaces);
    if (op === 'sub' && cfg.noNegative && a < b) {
      const t = a; a = b; b = t;
    }
    const ans = roundDP(op === 'add' ? a + b : a - b, cfg.decPlaces);
    return { kind: 'decimal', a, b, op, ans };
  }

  function randomDen() { return randInt(cfg.denMin, cfg.denMax); }
  function randomNum(d) { return randInt(1, d - 1); }

  function generateFractionPair(op) {
    let d1 = randomDen(), d2 = cfg.likeDen ? d1 : randomDen();
    let a = { n: randomNum(d1), d: d1 }, b = { n: randomNum(d2), d: d2 };
    if (op === 'sub' && cfg.noNegative && cmpFrac(a, b) < 0) {
      const t = a; a = b; b = t;
    }
    if (cfg.properOnly) {
      let tries = 0;
      while (tries++ < 120) {
        const res = op === 'add' ? addFrac(a, b) : subFrac(a, b);
        if (res.n >= 0 && res.n < res.d) break;
        d2 = cfg.likeDen ? d1 : randomDen();
        b = { n: randomNum(d2), d: d2 };
        if (op === 'sub' && cfg.noNegative && cmpFrac(a, b) < 0) {
          const t = a; a = b; b = t;
        }
      }
    }
    const ans = (op === 'add') ? addFrac(a, b) : subFrac(a, b);
    return { kind: 'fraction', a, b, op, ans };
  }

  function generateOne() {
    const type = (cfg.type === 'mixed') ? (Math.random() < 0.5 ? 'decimal' : 'fraction') : cfg.type;
    const op = (cfg.opMode === 'mix') ? (Math.random() < 0.5 ? 'add' : 'sub') : cfg.opMode;
    return (type === 'decimal') ? generateDecimalPair(op) : generateFractionPair(op);
  }

  function smartOptionsDecimal(correct, a, b, op) {
    const step = 10 ** (-cfg.decPlaces);
    const cand = new Set([correct]);
    [
      correct + step, correct - step, correct + 2 * step, correct - 2 * step,
      correct + 1, correct - 1, correct + (op === 'add' ? a : -a), correct + (op === 'add' ? b : -b)
    ].forEach(v => cand.add(roundDP(v, cfg.decPlaces)));
    while (cand.size < 4) {
      cand.add(roundDP(correct + (randInt(-9, 9)) * step, cfg.decPlaces));
    }
    return Array.from(cand).slice(0, 4);
  }

  function smartOptionsFraction(correct, a, b, op) {
    const answers = new Map();
    const addAns = fr => {
      const s = fracToString(fr, cfg.simplify);
      if (!answers.has(s)) answers.set(s, simplifyFrac(fr.n, fr.d));
    };
    addAns(correct);
    addAns(simplifyFrac(a.n + b.n, a.d + b.d));
    addAns(simplifyFrac(op === 'add' ? a.n + b.n : a.n - b.n, a.d));
    addAns(simplifyFrac(correct.n + 1, correct.d));
    addAns(simplifyFrac(correct.n - 1, correct.d));
    addAns(simplifyFrac(correct.n, correct.d + 1));
    if (correct.d > 2) addAns(simplifyFrac(correct.n, correct.d - 1));
    let tries = 0;
    while (answers.size < 4 && tries++ < 20) {
      const nu = correct.n + randInt(-2, 2);
      const de = Math.max(2, correct.d + randInt(-2, 2));
      addAns(simplifyFrac(nu, de));
    }
    return Array.from(answers.keys()).slice(0, 4);
  }

  function generateQuestions() {
    questions = []; history = []; current = 0; score = 0; streak = 0;
    for (let i = 0; i < cfg.total; i++) {
      const q = generateOne();
      if (q.kind === 'decimal') {
        let opts = smartOptionsDecimal(q.ans, q.a, q.b, q.op);
        if (cfg.shuffleOptions) opts = shuffle(opts);
        questions.push({ kind: 'decimal', a: q.a, b: q.b, op: q.op, ans: q.ans, opts });
      } else {
        let opts = smartOptionsFraction(q.ans, q.a, q.b, q.op);
        if (cfg.shuffleOptions) opts = shuffle(opts);
        questions.push({ kind: 'fraction', a: q.a, b: q.b, op: q.op, ans: q.ans, opts });
      }
    }
  }

  function padLeft(str, total) {
    str = String(str);
    if (str.length >= total) return str;
    return ' '.repeat(total - str.length) + str;
  }

  function decToFixedStr(n, dp) { return n.toFixed(dp); }
  function fracStr(fr) { return fracToString(fr, cfg.simplify); }
  function buildVerticalBlock(lines) { return lines.join('\n'); }

  function buildStackedFractionLines(A_num, A_den, B_num, B_den, opSym) {
    const n1 = String(A_num), d1 = String(A_den), n2 = String(B_num), d2 = String(B_den);
    const w1 = Math.max(n1.length, d1.length), w2 = Math.max(n2.length, d2.length);
    const line1 = padLeft(n1, w1) + '   ' + padLeft(n2, w2);
    const line2 = '-'.repeat(w1) + ' ' + opSym + ' ' + '-'.repeat(w2);
    const line3 = padLeft(d1, w1) + '   ' + padLeft(d2, w2);
    return [line1, line2, line3];
  }

  function updateProgress() {
    $('#q-progress').textContent = `Question ${Math.min(current + 1, cfg.total)}/${cfg.total}`;
    $('#streak').textContent = `Streak: ${streak} 🔥`;
    const pct = (current / cfg.total) * 100;
    if (window.KZ) KZ.setProgress(pct);
  }

  function renderAidDecimal(q) {
    const box = $('#helper-visual');
    box.innerHTML = '';
    if (!cfg.showAid) return;
    const maxVal = Math.max(q.a, q.b, Math.abs(q.ans));
    if (cfg.decPlaces <= 2 && maxVal <= 10) {
      const grid = document.createElement('div');
      grid.className = 'grid100';
      const filled = Math.round((q.a + (q.op === 'add' ? q.b : -q.b)) * 10);
      for (let i = 0; i < 100; i++) {
        const cell = document.createElement('span');
        if (i < Math.max(0, Math.min(100, filled))) cell.classList.add('on');
        grid.appendChild(cell);
      }
      const cap = document.createElement('div');
      cap.style.fontWeight = '800';
      cap.style.margin = '6px 0 2px';
      cap.style.color = 'var(--muted)';
      cap.textContent = 'Visualization (hundred chart)';
      box.appendChild(cap);
      box.appendChild(grid);
    }
  }

  function renderAidFraction(q) {
    const box = $('#helper-visual');
    box.innerHTML = '';
    if (!cfg.showAid) return;
    function addBar(fr, label) {
      const wrap = document.createElement('div');
      wrap.style.margin = '6px 0';
      const lab = document.createElement('div');
      lab.style.fontWeight = '800';
      lab.style.color = 'var(--muted)';
      lab.textContent = label + ` (${fr.n}/${fr.d})`;
      const bar = document.createElement('div');
      bar.className = 'frac-bar';
      const fill = document.createElement('div');
      fill.className = 'frac-fill';
      fill.style.width = `${Math.max(0, Math.min(100, (fr.n / fr.d) * 100))}%`;
      bar.appendChild(fill);
      wrap.appendChild(lab);
      wrap.appendChild(bar);
      box.appendChild(wrap);
    }
    addBar(q.a, 'Term 1');
    addBar(q.b, q.op === 'add' ? 'Term 2 (add)' : 'Term 2 (subtract)');
  }

  function renderOptionsDecimal(q) {
    const cont = $('#options');
    cont.innerHTML = '';
    q.opts.forEach((val, idx) => {
      const b = document.createElement('button');
      b.className = 'option-btn';
      b.textContent = Number(val).toFixed(cfg.decPlaces);
      b.addEventListener('click', () => checkAnswer(b.textContent, false, b));
      cont.appendChild(b);
    });
    $('#next-btn').disabled = true;
  }

  function renderOptionsFraction(q) {
    const cont = $('#options');
    cont.innerHTML = '';
    q.opts.forEach((txt, idx) => {
      const b = document.createElement('button');
      b.className = 'option-btn';
      b.textContent = txt;
      b.addEventListener('click', () => checkAnswer(txt, false, b));
      cont.appendChild(b);
    });
    $('#next-btn').disabled = true;
  }

  function renderQuestion() {
    if (current >= cfg.total) return endQuiz();
    const q = questions[current];
    const opSym = (q.op === 'add' ? '+' : '−');

    if (q.kind === 'decimal') {
      const A = decToFixedStr(q.a, cfg.decPlaces), B = decToFixedStr(q.b, cfg.decPlaces);
      const width = Math.max(A.length, B.length) + 2;
      const top = padLeft(A, width);
      const bot = opSym + ' ' + padLeft(B, width - 2);
      const dashes = '-'.repeat(Math.max(width, 6));
      $('#question-text').textContent = buildVerticalBlock([top, bot, dashes]);
      renderAidDecimal(q);
      renderOptionsDecimal(q);
      say(`${A} ${q.op === 'add' ? 'plus' : 'minus'} ${B}`);
    } else {
      const lines = buildStackedFractionLines(q.a.n, q.a.d, q.b.n, q.b.d, opSym);
      $('#question-text').textContent = buildVerticalBlock(lines);
      renderAidFraction(q);
      renderOptionsFraction(q);
      say(`${q.a.n} over ${q.a.d} ${q.op === 'add' ? 'plus' : 'minus'} ${q.b.n} over ${q.b.d}`);
    }

    updateProgress();
    awaitingAnswer = true;
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

  function fractionEqual(strA, frB) {
    const parts = String(strA).split('/');
    if (parts.length !== 2) return false;
    const n = Number(parts[0]), d = Number(parts[1]);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return false;
    const A = simplifyFrac(n, d), B = simplifyFrac(frB.n, frB.d);
    return A.n === B.n && A.d === B.d;
  }

  function checkAnswer(val, isTimeout = false, btnEl = null) {
    if (!awaitingAnswer) return;
    awaitingAnswer = false;
    clearInterval(timerObj);

    const q = questions[current];
    let correct = false, displayAns = '', chosenDisplay = '';

    if (q.kind === 'decimal') {
      displayAns = q.ans.toFixed(cfg.decPlaces);
      chosenDisplay = (val === null) ? '—' : String(val);
      correct = (val !== null) && (String(val) === displayAns);
    } else {
      displayAns = fracStr(q.ans);
      chosenDisplay = (val === null) ? '—' : String(val);
      correct = (val !== null) && fractionEqual(val, q.ans);
    }

    const eqStr = (q.kind === 'decimal')
      ? `${q.a.toFixed(cfg.decPlaces)} ${q.op === 'add' ? '+' : '−'} ${q.b.toFixed(cfg.decPlaces)}`
      : `${q.a.n}/${q.a.d} ${q.op === 'add' ? '+' : '−'} ${q.b.n}/${q.b.d}`;

    history.push({ q: eqStr, ans: displayAns, user: (val === null ? null : chosenDisplay), timeout: isTimeout });

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
    endTimeMs = Date.now();

    $('#quiz-screen').classList.add('hidden');
    $('#result-screen').classList.remove('hidden');

    const pct = Math.round((score / cfg.total) * 100);
    $('#score-big').textContent = `${score} / ${cfg.total} (${pct}%)`;

    const totalTakenSec = Math.max(0, Math.round((endTimeMs - startTimeMs) / 1000));
    $('#time-taken').textContent = fmtTime(totalTakenSec);

    if (window.KZ && KZ.recordScore) {
      KZ.recordScore({
        gameId: 'deci-frac',
        score: score,
        total: cfg.total,
        mode: cfg.mode,
        durationSec: totalTakenSec
      });
    }

    let msg = 'Great effort! Keep practicing and you’ll master it!';
    if (forcedByTimer) msg = 'Time’s up! Awesome try — practice again and beat the clock! ⏰';
    else if (pct === 100) msg = 'Perfect score! You’re a Deci-Frac Champion! 🏆';
    else if (pct >= 80) msg = 'Awesome work! You’re on fire! 🌟';
    else if (pct >= 60) msg = 'Good job! Keep building your skills! 💪';
    $('#appraise').textContent = msg;

    const badges = [];
    if (pct === 100) badges.push('🏆 Flawless!');
    if (cfg.mode === 'test') badges.push(cfg.timeboxType === 'per-question' ? '⏱️ Speed Master' : '⏱️ Countdown Master');
    if (streak >= 5) badges.push(`🔥 Streak ${streak}`);
    if (cfg.type === 'mixed' || cfg.opMode === 'mix') badges.push('🔀 Mixed Mode');
    $('#badges').innerHTML = badges.map(b => `<span class="badge">${b}</span>`).join('');

    if (pct >= 80 && window.KZ) {
      KZ.confetti({ count: 120, spread: 70 });
    }

    const list = $('#review-list');
    list.innerHTML = history.map(h => {
      const ok = (h.user !== null && String(h.user) === String(h.ans));
      const u = (h.user === null) ? '—' : h.user;
      return `
        <div class="review-item">
          <div><strong>${h.q}</strong> = <b>${h.ans}</b></div>
          <div style="font-weight:800; color:${ok ? 'var(--ok)' : 'var(--danger)'}">${ok ? '✅' : '❌'} ${h.timeout ? '⏰' : ''} ${!ok && u !== '—' ? `(Your choice: ${u})` : ''}</div>
        </div>
      `;
    }).join('');
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  window.addEventListener('DOMContentLoaded', () => {
    $('#btn-practice').addEventListener('click', () => {
      cfg.mode = 'practice';
      $('#btn-practice').style.opacity = '1';
      $('#btn-test').style.opacity = '.7';
      $('#timed-controls').classList.add('hidden');
    });

    $('#btn-test').addEventListener('click', () => {
      cfg.mode = 'test';
      $('#btn-practice').style.opacity = '.7';
      $('#btn-test').style.opacity = '1';
      $('#timed-controls').classList.remove('hidden');
    });

    document.querySelectorAll('input[name="tbtype"]').forEach(r => r.addEventListener('change', e => {
      cfg.timeboxType = e.target.value;
      const perQ = (cfg.timeboxType === 'per-question');
      $('#perq-wrap').classList.toggle('hidden', !perQ);
      $('#total-wrap').classList.toggle('hidden', perQ);
    }));

    document.querySelectorAll('input[name="type"]').forEach(r => r.addEventListener('change', e => {
      cfg.type = e.target.value;
      $('#dec-opts').classList.toggle('hidden', cfg.type === 'fraction');
      $('#frac-opts').classList.toggle('hidden', cfg.type === 'decimal');
    }));

    $('#start-btn').addEventListener('click', () => {
      if (window.KZAudio) KZAudio.playClick();
      cfg.opMode = document.querySelector('input[name="ops"]:checked').value;
      cfg.total = clamp(Number($('#qty-num').value) || 15, 5, 50);
      cfg.wholeDigits = Number($('#whole-dig').value);
      cfg.decPlaces = Number($('#dec-places').value);
      cfg.denMin = clamp(Number($('#den-min')?.value || 3), 2, 98);
      cfg.denMax = clamp(Number($('#den-max')?.value || 12), cfg.denMin + 1, 100);
      cfg.likeDen = $('#like-den') ? $('#like-den').checked : true;
      cfg.simplify = $('#simplify') ? $('#simplify').checked : true;
      cfg.properOnly = $('#proper-only') ? $('#proper-only').checked : false;
      cfg.noNegative = $('#no-negative').checked;
      cfg.perQSeconds = clamp(Number($('#per-q-secs').value) || 12, 5, 60);
      cfg.totalSeconds = clamp(Number($('#total-secs').value) || 240, 30, 1800);
      cfg.showAid = $('#show-aid').checked;
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
    });

    $('#next-btn').addEventListener('click', () => { current++; renderQuestion(); });
    $('#skip-btn').addEventListener('click', () => {
      const q = questions[current];
      if (q) {
        const eqStr = (q.kind === 'decimal')
          ? `${q.a.toFixed(cfg.decPlaces)} ${q.op === 'add' ? '+' : '−'} ${q.b.toFixed(cfg.decPlaces)}`
          : `${q.a.n}/${q.a.d} ${q.op === 'add' ? '+' : '−'} ${q.b.n}/${q.b.d}`;
        const ansStr = (q.kind === 'decimal') ? q.ans.toFixed(cfg.decPlaces) : fracStr(q.ans);
        history.push({ q: eqStr, ans: ansStr, user: null, timeout: false });
        streak = 0;
      }
      current++; renderQuestion();
    });

    $('#read-btn').addEventListener('click', () => {
      const q = questions[current];
      if (!q || !window.KZAudio) return;
      if (q.kind === 'decimal') {
        const A = decToFixedStr(q.a, cfg.decPlaces), B = decToFixedStr(q.b, cfg.decPlaces);
        KZAudio.speak(`${A} ${q.op === 'add' ? 'plus' : 'minus'} ${B}`);
      } else {
        KZAudio.speak(`${q.a.n} over ${q.a.d} ${q.op === 'add' ? 'plus' : 'minus'} ${q.b.n} over ${q.b.d}`);
      }
    });

    $('#play-again').addEventListener('click', () => location.reload());
    $('#print-btn').addEventListener('click', () => window.print());

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
  });
})();
