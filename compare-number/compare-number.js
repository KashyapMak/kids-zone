/**
 * Compare Number Trail - Core Game Logic
 */
(function () {
  'use strict';

  const cfg = {
    mode: 'practice',
    timeboxType: 'per-question',
    perQSeconds: 12,
    totalSeconds: 180,
    total: 15,
    useWhole: true,
    useDecimal: true,
    useSimpleFrac: true,
    useComplexFrac: true,
    allowEqual: true,
    showNumline: true,
    shuffleOpts: true,
    wholeMin: 1,
    wholeMax: 20,
    decPlaces: 2
  };

  let score = 0, current = 0, questions = [], history = [];
  let timerObj = null, timeLeft = 0, streak = 0, awaitingAnswer = true;
  let startTimeMs = 0, endTimeMs = 0, totalTimerObj = null;

  const $ = sel => document.querySelector(sel);
  const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));

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
      KZAudio.speak(text.replace('−', ' minus ').replace('<', ' less than ').replace('>', ' greater than ').replace('/', ' over '));
    }
  }

  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  function simplifyFrac(n, d) {
    const g = gcd(Math.abs(n), Math.abs(d)) || 1;
    let sn = n / g, sd = d / g;
    if (sd < 0) { sn = -sn; sd = -sd; }
    return { n: sn, d: sd };
  }
  function fracToDecimal(f) { return f.n / f.d; }

  function buildFracLines(n, d) {
    const ns = String(n), ds = String(d);
    const w = Math.max(ns.length, ds.length);
    const pad = s => ' '.repeat(Math.floor((w - s.length) / 2)) + s + ' '.repeat(Math.ceil((w - s.length) / 2));
    return [pad(ns), '─'.repeat(w), pad(ds)].join('\n');
  }

  function makeWhole() {
    const v = randInt(cfg.wholeMin, cfg.wholeMax);
    return { kind: 'whole', value: v, display: String(v), label: 'Whole Number' };
  }

  function makeDecimal() {
    const m = 10 ** cfg.decPlaces;
    const maxW = cfg.wholeMax;
    const raw = randInt(0, maxW * m - 1);
    const v = raw / m;
    return { kind: 'decimal', value: v, display: v.toFixed(cfg.decPlaces), label: 'Decimal' };
  }

  function makeSimpleFrac() {
    const d = randInt(2, 5);
    const n = randInt(1, d * 2);
    const f = simplifyFrac(n, d);
    return {
      kind: 'simple-frac',
      value: fracToDecimal(f),
      n: f.n, d: f.d,
      display: `${f.n}/${f.d}`,
      label: 'Simple Fraction'
    };
  }

  function makeComplexFrac() {
    const d = randInt(6, 20);
    const n = randInt(1, d * 2);
    const f = simplifyFrac(n, d);
    return {
      kind: 'complex-frac',
      value: fracToDecimal(f),
      n: f.n, d: f.d,
      display: `${f.n}/${f.d}`,
      label: 'Complex Fraction'
    };
  }

  function pickRandomNumber() {
    const pool = [];
    if (cfg.useWhole) pool.push('whole');
    if (cfg.useDecimal) pool.push('decimal');
    if (cfg.useSimpleFrac) pool.push('simple-frac');
    if (cfg.useComplexFrac) pool.push('complex-frac');
    if (!pool.length) pool.push('whole');
    const kind = pool[randInt(0, pool.length - 1)];
    if (kind === 'whole') return makeWhole();
    if (kind === 'decimal') return makeDecimal();
    if (kind === 'simple-frac') return makeSimpleFrac();
    return makeComplexFrac();
  }

  function generateOnePair() {
    let left = pickRandomNumber();
    let right = pickRandomNumber();

    let tries = 0;
    while (!cfg.allowEqual && Math.abs(left.value - right.value) < 1e-9 && tries++ < 50) {
      right = pickRandomNumber();
    }

    let correctSym;
    const diff = left.value - right.value;
    if (Math.abs(diff) < 1e-9) correctSym = 'eq';
    else if (diff < 0) correctSym = 'lt';
    else correctSym = 'gt';

    let opts = ['lt', 'eq', 'gt'];
    if (cfg.shuffleOpts) opts = shuffle([...opts]);

    return { left, right, correctSym, opts };
  }

  function generateQuestions() {
    questions = []; history = []; current = 0; score = 0; streak = 0;
    for (let i = 0; i < cfg.total; i++) {
      questions.push(generateOnePair());
    }
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function symToChar(sym) {
    if (sym === 'lt') return '<';
    if (sym === 'gt') return '>';
    return '=';
  }

  function symToWords(sym) {
    if (sym === 'lt') return 'less than';
    if (sym === 'gt') return 'greater than';
    return 'equal to';
  }

  function renderNumberBox(boxEl, labelEl, valEl, num) {
    labelEl.textContent = num.label;
    valEl.innerHTML = '';
    valEl.className = '';

    if (num.kind === 'whole' || num.kind === 'decimal') {
      valEl.className = 'num-val';
      valEl.textContent = num.display;
    } else {
      valEl.className = '';
      const pre = document.createElement('pre');
      pre.className = 'frac-pre';
      pre.textContent = buildFracLines(num.n, num.d);
      valEl.appendChild(pre);
    }
  }

  function renderNumline(left, right) {
    const wrap = $('#number-line-wrap');
    wrap.innerHTML = '';
    if (!cfg.showNumline) return;

    const vals = [left.value, right.value];
    const minV = Math.min(...vals);
    const maxV = Math.max(...vals);
    const range = maxV - minV;
    const padding = Math.max(range * 0.3, 0.5);
    const domMin = minV - padding;
    const domMax = maxV + padding;
    const domRange = domMax - domMin;

    function pct(v) { return ((v - domMin) / domRange * 100).toFixed(1) + '%'; }
    const colors = ['#059669', '#f59e0b'];

    const cap = document.createElement('div');
    cap.className = 'nline-caption';
    cap.textContent = 'Number line — where do they fall?';
    wrap.appendChild(cap);

    const cont = document.createElement('div');
    cont.className = 'nline-container';

    const track = document.createElement('div');
    track.className = 'nline-track';
    cont.appendChild(track);

    [left, right].forEach((num, i) => {
      const marker = document.createElement('div');
      marker.className = 'nline-marker';
      marker.style.left = pct(num.value);
      marker.style.background = colors[i];

      const label = document.createElement('div');
      label.className = 'nline-label';
      label.style.left = pct(num.value);
      label.style.top = (i === 0) ? '-18px' : '32px';
      label.style.color = colors[i];
      label.textContent = num.display;

      cont.appendChild(marker);
      cont.appendChild(label);
    });

    wrap.appendChild(cont);
  }

  function renderQuestion() {
    if (current >= cfg.total) { endQuiz(); return; }
    const q = questions[current];

    renderNumberBox($('#left-box'), $('#left-label'), $('#left-val'), q.left);
    renderNumberBox($('#right-box'), $('#right-label'), $('#right-val'), q.right);

    const slot = $('#symbol-slot');
    slot.textContent = '?';
    slot.className = 'symbol-slot';

    renderNumline(q.left, q.right);

    const optCont = $('#options');
    optCont.innerHTML = '';
    q.opts.forEach(sym => {
      const b = document.createElement('button');
      b.className = 'option-btn';
      b.dataset.sym = sym;
      b.setAttribute('aria-label', symToWords(sym));
      b.innerHTML = `${symToChar(sym)}<span class="btn-label">${symToWords(sym)}</span>`;
      b.addEventListener('click', () => checkAnswer(sym, false, b));
      optCont.appendChild(b);
    });

    setMessage('');
    $('#next-btn').disabled = true;
    awaitingAnswer = true;
    updateProgress();

    clearInterval(timerObj);
    if (cfg.mode === 'test' && cfg.timeboxType === 'per-question') {
      timeLeft = cfg.perQSeconds;
      $('#timer-clock').textContent = `00:${String(timeLeft).padStart(2, '0')}`;
      timerObj = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 3) beep('tick');
        $('#timer-clock').textContent = `00:${Math.max(0, timeLeft).toString().padStart(2, '0')}`;
        if (timeLeft <= 0) { clearInterval(timerObj); checkAnswer(null, true); }
      }, 1000);
    } else if (cfg.mode === 'practice') {
      $('#timer-clock').textContent = '';
    }

    say(`Is ${q.left.display} less than, equal to, or greater than ${q.right.display}?`);
  }

  function checkAnswer(sym, isTimeout = false, btnEl = null) {
    if (!awaitingAnswer) return;
    awaitingAnswer = false;
    clearInterval(timerObj);

    const q = questions[current];
    const correct = sym === q.correctSym;

    const slot = $('#symbol-slot');
    slot.textContent = symToChar(q.correctSym);
    slot.classList.add('revealed');

    history.push({
      left: q.left.display,
      right: q.right.display,
      leftLabel: q.left.label,
      rightLabel: q.right.label,
      ans: q.correctSym,
      user: sym,
      timeout: isTimeout
    });

    const allBtns = [...document.querySelectorAll('.option-btn')];
    allBtns.forEach(b => b.disabled = true);

    allBtns.forEach(b => {
      if (b.dataset.sym === q.correctSym) b.classList.add('correct');
    });

    if (cfg.mode === 'practice') {
      if (correct) {
        if (btnEl) btnEl.classList.add('correct');
        score++; streak++;
        setMessage(praise(), 'ok');
        beep('ok');
        setTimeout(() => { current++; renderQuestion(); }, 700);
      } else {
        streak = 0;
        if (btnEl) btnEl.classList.add('wrong');
        setMessage(isTimeout ? '⏰ Time’s up — try again!' : `Oops! The answer is ${symToChar(q.correctSym)} 😊`, 'warn');
        beep('bad');
        setTimeout(() => {
          allBtns.forEach(b => {
            b.disabled = false;
            b.classList.remove('correct', 'wrong');
          });
          awaitingAnswer = true;
        }, 900);
      }
    } else {
      if (correct) { score++; streak++; setMessage(praise(), 'ok'); beep('ok'); }
      else {
        streak = 0;
        if (btnEl) btnEl.classList.add('wrong');
        setMessage(isTimeout ? '⏰ Out of time!' : `It’s ${symToChar(q.correctSym)} — keep going!`, 'warn');
        beep('bad');
      }
      $('#next-btn').disabled = false;
    }
    updateProgress();
  }

  function setMessage(text, type = 'info') {
    const el = $('#message');
    el.style.color = type === 'ok' ? 'var(--ok)' : (type === 'warn' ? 'var(--danger)' : 'var(--muted)');
    el.textContent = text;
  }

  function praise() {
    const msgs = ['Brilliant!', 'Nice job!', 'You rock!', 'Fantastic!', 'Great work!', 'Super!', 'Math Hero!', 'Amazing!', 'Yes! Keep it up!', 'Perfect! 🎯'];
    return msgs[randInt(0, msgs.length - 1)];
  }

  function updateProgress() {
    $('#q-progress').textContent = `Question ${Math.min(current + 1, cfg.total)}/${cfg.total}`;
    $('#streak').textContent = `Streak: ${streak} 🔥`;
    const pct = (current / cfg.total) * 100;
    if (window.KZ) KZ.setProgress(pct);
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
        gameId: 'compare-number',
        score: score,
        total: cfg.total,
        mode: cfg.mode,
        durationSec: totalTakenSec
      });
    }

    let msg = 'Great effort! Keep practicing and you’ll master it!';
    if (forcedByTimer) msg = 'Time’s up! Awesome try — practice again and beat the clock! ⏰';
    else if (pct === 100) msg = 'Perfect score! You’re a Number Compare Champion! 🏆';
    else if (pct >= 80) msg = 'Awesome work! You’re on fire! 🌟';
    else if (pct >= 60) msg = 'Good job! Keep building your number sense! 💪';
    $('#appraise').textContent = msg;

    const badges = [];
    if (pct === 100) badges.push('🏆 Flawless!');
    if (cfg.mode === 'test') badges.push(cfg.timeboxType === 'per-question' ? '⏱️ Speed Master' : '⏱️ Countdown Master');
    if (streak >= 5) badges.push(`🔥 Streak ${streak}`);
    const types = [cfg.useWhole, cfg.useDecimal, cfg.useSimpleFrac, cfg.useComplexFrac].filter(Boolean).length;
    if (types >= 4) badges.push('🔀 All Number Types!');
    if (cfg.allowEqual && history.some(h => h.ans === 'eq')) badges.push('⚖️ Equal Matcher!');
    $('#badges').innerHTML = badges.map(b => `<span class="badge">${b}</span>`).join('');

    if (pct >= 80 && window.KZ) {
      KZ.confetti({ count: 120, spread: 70 });
    }

    const list = $('#review-list');
    list.innerHTML = history.map(h => {
      const ok = h.user === h.ans && !h.timeout;
      const userSym = h.user ? symToChar(h.user) : '—';
      const ansSym = symToChar(h.ans);
      return `
        <div class="review-item">
          <div>
            <strong>${h.left}</strong> ${ansSym} <strong>${h.right}</strong>
            <span style="font-size:0.8rem; color:var(--muted); margin-left:0.4rem;">(${h.leftLabel} vs ${h.rightLabel})</span>
          </div>
          <div style="font-weight:800; color:${ok ? 'var(--ok)' : 'var(--danger)'}">
            ${ok ? '✅' : '❌'} ${h.timeout ? '⏰' : ''} ${!ok && userSym !== '—' ? `(Your pick: ${userSym})` : ''}
          </div>
        </div>
      `;
    }).join('');
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

    $('#start-btn').addEventListener('click', () => {
      if (window.KZAudio) KZAudio.playClick();
      cfg.useWhole = $('#cb-whole').checked;
      cfg.useDecimal = $('#cb-decimal').checked;
      cfg.useSimpleFrac = $('#cb-sfrac').checked;
      cfg.useComplexFrac = $('#cb-cfrac').checked;
      if (!cfg.useWhole && !cfg.useDecimal && !cfg.useSimpleFrac && !cfg.useComplexFrac) {
        alert('Please select at least one number type!');
        return;
      }
      cfg.wholeMin = clamp(Number($('#whole-min').value) || 1, 0, 999);
      cfg.wholeMax = clamp(Number($('#whole-max').value) || 20, cfg.wholeMin + 1, 1000);
      cfg.decPlaces = clamp(Number($('#dec-places').value) || 2, 1, 3);
      cfg.allowEqual = $('#allow-equal').checked;
      cfg.showNumline = $('#show-numline').checked;
      cfg.shuffleOpts = $('#shuffle-opts').checked;
      cfg.total = clamp(Number($('#qty-num').value) || 15, 5, 50);
      cfg.perQSeconds = clamp(Number($('#per-q-secs').value) || 12, 5, 60);
      cfg.totalSeconds = clamp(Number($('#total-secs').value) || 180, 30, 1800);

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
    });

    $('#next-btn').addEventListener('click', () => { current++; renderQuestion(); });
    $('#skip-btn').addEventListener('click', () => {
      const q = questions[current];
      if (q) {
        history.push({
          left: q.left.display, right: q.right.display,
          leftLabel: q.left.label, rightLabel: q.right.label,
          ans: q.correctSym, user: null, timeout: false
        });
        streak = 0;
      }
      current++; renderQuestion();
    });

    $('#read-btn').addEventListener('click', () => {
      const q = questions[current];
      if (q && window.KZAudio) {
        KZAudio.speak(`Is ${q.left.display} less than, equal to, or greater than ${q.right.display}?`);
      }
    });

    $('#play-again').addEventListener('click', () => location.reload());
    $('#print-btn').addEventListener('click', () => window.print());

    document.addEventListener('keydown', e => {
      const k = e.key;
      if (k === 'r' || k === 'R') $('#read-btn').click();
      if (k === '<' || k === ',' || k === '1') {
        const btn = document.querySelector('.option-btn[data-sym="lt"]');
        if (btn && !btn.disabled) btn.click();
      }
      if (k === '=' || k === '2') {
        const btn = document.querySelector('.option-btn[data-sym="eq"]');
        if (btn && !btn.disabled) btn.click();
      }
      if (k === '>' || k === '.' || k === '3') {
        const btn = document.querySelector('.option-btn[data-sym="gt"]');
        if (btn && !btn.disabled) btn.click();
      }
      if (k === 'n' || k === 'N' || k === 'Enter') {
        if (!$('#next-btn').disabled) $('#next-btn').click();
      }
      if (k === 's' || k === 'S') $('#skip-btn').click();
    });
  });
})();
