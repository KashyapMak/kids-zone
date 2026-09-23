/**
 * Perimeter Trail - Core Game Logic & Canvas Engine
 */
(function () {
  'use strict';

  const cfg = {
    shapes: ['square', 'rectangle', 'triangle', 'pentagon'],
    digits: 1,
    total: 15,
    mode: 'practice',
    timeboxType: 'per-question',
    perQSeconds: 12,
    totalSeconds: 240,
    showHint: true,
    shuffleOptions: true
  };

  let score = 0, current = 0, questions = [], history = [];
  let timerObj = null, timeLeft = 0, streak = 0, awaitingAnswer = true;
  let startTimeMs = 0, endTimeMs = 0;
  let totalTimerObj = null;

  const $ = sel => document.querySelector(sel);
  const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const fmt = t => {
    const m = Math.floor(t / 60), s = Math.max(0, Math.floor(t % 60));
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  function beep(type = 'ok') {
    if (!window.KZAudio) return;
    if (type === 'ok') KZAudio.playOk();
    else if (type === 'tick') KZAudio.playTick();
    else KZAudio.playWrong();
  }

  function say(t) {
    if (window.KZAudio && KZAudio.isSpeakingEnabled()) {
      KZAudio.speak(t);
    }
  }

  // Canvas drawing
  let canvas, ctx;
  const MARGIN = 28;

  function initCanvas() {
    canvas = document.getElementById('shapeCanvas');
    if (canvas) ctx = canvas.getContext('2d');
  }

  function getScaleForUnits(unitsW, unitsH) {
    const maxW = canvas.width - 1.5 * MARGIN;
    const maxH = canvas.height - 1.5 * MARGIN;
    return Math.max(8, Math.min(maxW / unitsW, maxH / unitsH));
  }

  function clearCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const strokeColor = getComputedStyle(document.body).getPropertyValue('--primary').trim() || '#059669';
    const textColor = getComputedStyle(document.body).getPropertyValue('--text').trim() || '#052e1c';
    ctx.lineWidth = 4;
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = textColor;
    ctx.font = 'bold 18px Fredoka, sans-serif';
  }

  function drawSquare(side) {
    clearCanvas();
    const s = side;
    const scale = getScaleForUnits(s, s);
    const pxSize = s * scale;
    const x = (canvas.width - pxSize) / 2;
    const y = (canvas.height - pxSize) / 2;
    ctx.strokeRect(x, y, pxSize, pxSize);
    ctx.fillText(`${s} cm`, x + pxSize / 2 - 24, y - 10);
  }

  function drawRectangle(w, h) {
    clearCanvas();
    const scale = getScaleForUnits(w, h);
    const W = w * scale, H = h * scale;
    const x = (canvas.width - W) / 2, y = (canvas.height - H) / 2;
    ctx.strokeRect(x, y, W, H);
    ctx.fillText(`${w} cm`, x + W / 2 - 22, y - 10);
    ctx.fillText(`${h} cm`, x - 48, y + H / 2);
  }

  function drawEquilateral(s) {
    clearCanvas();
    const unitsW = s;
    const unitsH = s * Math.sqrt(3) / 2;
    const maxW = canvas.width - (2 * MARGIN);
    const maxH = canvas.height - (2 * MARGIN);
    const scale = Math.min(maxW / unitsW, maxH / unitsH) * 0.50;
    const basePx = s * scale;
    const heightPx = unitsH * scale;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - (heightPx * 0.1);
    const halfBase = basePx / 2;
    const topX = cx, topY = cy - heightPx / 2;
    const leftX = cx - halfBase, leftY = cy + heightPx / 2;
    const rightX = cx + halfBase, rightY = cy + heightPx / 2;

    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(rightX, rightY);
    ctx.lineTo(leftX, leftY);
    ctx.closePath();
    ctx.stroke();
    ctx.fillText(`${s} cm`, cx - 20, rightY + 22);
  }

  function drawPentagon(s) {
    clearCanvas();
    const unitsW = s * 1.9, unitsH = s * 1.8;
    const scale = getScaleForUnits(unitsW, unitsH) * 0.7;
    const r = s * scale / (2 * Math.sin(Math.PI / 5));
    const cx = canvas.width / 2, cy = canvas.height / 2 + 2;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
      const nx = cx + r * Math.cos(a), ny = cy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(nx, ny);
      else ctx.lineTo(nx, ny);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fillText(`${s} cm`, cx - 22, cy + r + 24);
  }

  function digitsRange(d) { return d === 1 ? [1, 9] : [10, 30]; }

  function buildQuestion() {
    const shape = cfg.shapes[Math.floor(Math.random() * cfg.shapes.length)];
    const [minV, maxV] = digitsRange(cfg.digits);
    let data = {}, answer = 0, hint = '', readText = '';

    if (shape === 'square') {
      const s = ri(minV, maxV); data = { shape, s }; answer = 4 * s;
      hint = cfg.showHint ? 'Hint: Perimeter = 4 × side' : '';
      readText = `Square with side ${s} centimeters. What is the perimeter?`;
    } else if (shape === 'rectangle') {
      const w = ri(minV, maxV), h = ri(minV, maxV); data = { shape, w, h }; answer = 2 * (w + h);
      hint = cfg.showHint ? 'Hint: Perimeter = 2 × (Length + Width)' : '';
      readText = `Rectangle with width ${w} centimeters and height ${h} centimeters. What is the perimeter?`;
    } else if (shape === 'triangle') {
      const s = ri(minV, maxV); data = { shape, s }; answer = 3 * s;
      hint = cfg.showHint ? 'Hint: Equilateral Triangle: Perimeter = 3 × side' : '';
      readText = `Equilateral triangle with side ${s} centimeters. What is the perimeter?`;
    } else if (shape === 'pentagon') {
      const s = ri(minV, maxV); data = { shape, s }; answer = 5 * s;
      hint = cfg.showHint ? 'Hint: Regular Pentagon: Perimeter = 5 × side' : '';
      readText = `Regular pentagon with side ${s} centimeters. What is the perimeter?`;
    }
    const opts = buildOptions(answer, data);
    return { data, answer, opts, hint, readText };
  }

  function buildOptions(correct, data) {
    const set = new Set([correct]);
    const push = v => { if (v > 0) set.add(v); };
    if (data.shape === 'square') { push(data.s * 3); push(data.s * 2); push(data.s + 4); }
    if (data.shape === 'rectangle') { const { w, h } = data; push(2 * w + h); push(w + 2 * h); push(w + h); }
    if (data.shape === 'triangle') { push(data.s * 2); push(data.s * 4); push(data.s + 3); }
    if (data.shape === 'pentagon') { push(data.s * 4); push(data.s * 6); push(data.s + 5); }
    for (let k = -3; k <= 3; k++) { if (k !== 0) push(correct + k); }
    while (set.size < 4) push(correct + ri(-10, 10));
    const arr = Array.from(set).slice(0, 4);
    if (cfg.shuffleOptions) shuffle(arr);
    return arr;
  }

  function generateQuestions() {
    questions = []; history = []; current = 0; score = 0; streak = 0;
    for (let i = 0; i < cfg.total; i++) questions.push(buildQuestion());
  }

  function updateSavedStats() {
    const key = `pt_${cfg.digits}_${cfg.mode}_${cfg.timeboxType}_${cfg.shapes.sort().join('')}`;
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      const text = [
        `Digits: ${cfg.digits} | Mode: ${cfg.mode.toUpperCase()}${cfg.mode === 'test' ? ` (${cfg.timeboxType.replace('-', ' ')})` : ''}`,
        data.best ? `Best: ${data.best.score}/${data.best.total}` : `Best: —`,
        data.last ? `Last: ${data.last.score}/${data.last.total}` : `Last: —`
      ].join('  •  ');
      $('#stats').textContent = text;
    } catch (e) {}
  }

  function saveResult() {
    const key = `pt_${cfg.digits}_${cfg.mode}_${cfg.timeboxType}_${cfg.shapes.sort().join('')}`;
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      const best = (data.best && (data.best.score / data.best.total) >= (score / cfg.total)) ? data.best : { score, total: cfg.total, date: Date.now() };
      const last = { score, total: cfg.total, date: Date.now() };
      localStorage.setItem(key, JSON.stringify({ best, last }));
    } catch (e) {}
  }

  function startQuiz() {
    if (window.KZAudio) KZAudio.playClick();
    cfg.shapes = [...document.querySelectorAll('.shape-cb')].filter(cb => cb.checked).map(cb => cb.value);
    if (cfg.shapes.length === 0) {
      alert('Select at least one shape.');
      return;
    }
    cfg.digits = Number(document.querySelector('input[name="digits"]:checked').value);
    cfg.total = clamp(Number($('#qty-num').value) || 15, 5, 50);
    cfg.showHint = $('#show-hint').checked;
    cfg.shuffleOptions = $('#shuffle-options').checked;
    cfg.perQSeconds = clamp(Number($('#per-q-secs').value) || 12, 5, 60);
    cfg.totalSeconds = clamp(Number($('#total-secs').value) || 240, 30, 1800);

    generateQuestions();
    $('#setup-screen').classList.add('hidden');
    $('#quiz-screen').classList.remove('hidden');

    startTimeMs = Date.now();
    if (cfg.mode === 'test' && cfg.timeboxType === 'total') {
      let left = cfg.totalSeconds;
      $('#timer-clock').textContent = fmt(left);
      totalTimerObj = setInterval(() => {
        left--;
        if (left <= 3) beep('tick');
        $('#timer-clock').textContent = fmt(left);
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
    setMessage(cfg.mode === 'practice'
      ? 'Try answering — you can retry if you miss!'
      : (cfg.timeboxType === 'per-question' ? 'Answer within the time ⏱️ (per question)' : 'Beat the global timer ⏱️ (total)'));
  }

  function updateProgress() {
    $('#q-progress').textContent = `Question ${Math.min(current + 1, cfg.total)}/${cfg.total}`;
    $('#streak').textContent = `Streak: ${streak} 🔥`;
    const pct = (current / cfg.total) * 100;
    if (window.KZ) KZ.setProgress(pct);
  }

  function drawCurrent(q) {
    const d = q.data;
    if (d.shape === 'square') drawSquare(d.s);
    else if (d.shape === 'rectangle') drawRectangle(d.w, d.h);
    else if (d.shape === 'triangle') drawEquilateral(d.s);
    else if (d.shape === 'pentagon') drawPentagon(d.s);
  }

  function renderQuestion() {
    if (current >= cfg.total) return endQuiz();
    const q = questions[current];
    $('#hint').textContent = q.hint || '';
    $('#question-text').textContent = 'Calculate the perimeter (in cm):';
    drawCurrent(q);
    renderOptions(q);
    say(q.readText);

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
    } else {
      $('#timer-clock').textContent = '';
    }
  }

  function renderOptions(q) {
    const cont = $('#options');
    cont.innerHTML = '';
    q.opts.forEach(v => {
      const b = document.createElement('button');
      b.className = 'option-btn';
      b.textContent = `${v} cm`;
      b.addEventListener('click', () => checkAnswer(v, false, b));
      cont.appendChild(b);
    });
    $('#next-btn').disabled = true;
  }

  function checkAnswer(val, isTimeout = false, btnEl = null) {
    if (!awaitingAnswer) return;
    awaitingAnswer = false;
    clearInterval(timerObj);

    const q = questions[current];
    const correct = (val === q.answer);
    history.push({ q: summarize(q), ans: `${q.answer} cm`, user: (val === null ? null : `${val} cm`), timeout: isTimeout });

    const opts = [...document.querySelectorAll('.option-btn')];
    opts.forEach(b => b.disabled = true);

    if (cfg.mode === 'practice') {
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
      if (correct) {
        if (btnEl) btnEl.classList.add('correct');
        score++; streak++;
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

  function summarize(q) {
    const d = q.data;
    switch (d.shape) {
      case 'square': return `Square (side ${d.s} cm)`;
      case 'rectangle': return `Rectangle (W ${d.w} cm, H ${d.h} cm)`;
      case 'triangle': return `Equilateral Triangle (side ${d.s} cm)`;
      case 'pentagon': return `Regular Pentagon (side ${d.s} cm)`;
    }
  }

  function setMessage(t, type = 'info') {
    const el = $('#message');
    el.style.color = (type === 'ok') ? 'var(--ok)' : (type === 'warn' ? 'var(--danger)' : 'var(--muted)');
    el.textContent = t;
  }

  function praise() {
    const msgs = ['Brilliant!', 'Nice job!', 'You rock!', 'Fantastic!', 'Great work!', 'Super!', 'Math Hero!', 'Amazing!'];
    return msgs[ri(0, msgs.length - 1)];
  }

  function endQuiz(forced = false) {
    if (totalTimerObj) { clearInterval(totalTimerObj); totalTimerObj = null; }
    if (window.KZ) KZ.setProgress(100);

    saveResult();
    endTimeMs = Date.now();

    $('#quiz-screen').classList.add('hidden');
    $('#result-screen').classList.remove('hidden');

    const pct = Math.round((score / cfg.total) * 100);
    $('#score-big').textContent = `${score} / ${cfg.total} (${pct}%)`;

    const took = Math.max(0, Math.round((endTimeMs - startTimeMs) / 1000));
    $('#time-taken').textContent = fmt(took);

    if (window.KZ && KZ.recordScore) {
      KZ.recordScore({
        gameId: 'perimeter',
        score: score,
        total: cfg.total,
        mode: cfg.mode,
        durationSec: took
      });
    }

    let msg = 'Great effort! Keep practicing and you’ll master it!';
    if (forced) msg = 'Time’s up! Awesome try — practice again and beat the clock! ⏰';
    else if (pct === 100) msg = 'Perfect score! You’re a Perimeter Champion! 🏆';
    else if (pct >= 80) msg = 'Awesome work! You’re on fire! 🌟';
    else if (pct >= 60) msg = 'Good job! Keep building your geometry skills! 💪';
    $('#appraise').textContent = msg;

    const badges = [];
    if (pct === 100) badges.push('🏆 Flawless!');
    if (cfg.mode === 'test') badges.push(cfg.timeboxType === 'per-question' ? '⏱️ Speed Master' : '⏱️ Countdown Master');
    if (streak >= 5) badges.push(`🔥 Streak ${streak}`);
    $('#badges').innerHTML = badges.map(b => `<span class='badge'>${b}</span>`).join('');

    if (pct >= 80 && window.KZ) {
      KZ.confetti({ count: 120, spread: 70 });
    }

    const list = $('#review-list');
    list.innerHTML = history.map(h => {
      const ok = (h.user !== null && String(h.user) === String(h.ans));
      const u = (h.user === null) ? '—' : h.user;
      return `
        <div class='review-item'>
          <div><strong>${h.q}</strong> = <b>${h.ans}</b></div>
          <div style='font-weight:800; color:${ok ? 'var(--ok)' : 'var(--danger)'}'>${ok ? '✅' : '❌'} ${h.timeout ? '⏰' : ''} ${!ok && u !== '—' ? `(Your choice: ${u})` : ''}</div>
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
    initCanvas();

    $('#btn-practice').addEventListener('click', () => {
      cfg.mode = 'practice';
      $('#btn-practice').style.opacity = '1';
      $('#btn-test').style.opacity = '.7';
      $('#timed-controls').classList.add('hidden');
      updateSavedStats();
    });

    $('#btn-test').addEventListener('click', () => {
      cfg.mode = 'test';
      $('#btn-practice').style.opacity = '.7';
      $('#btn-test').style.opacity = '1';
      $('#timed-controls').classList.remove('hidden');
      updateSavedStats();
    });

    document.querySelectorAll('input[name="tbtype"]').forEach(r => r.addEventListener('change', e => {
      cfg.timeboxType = e.target.value;
      const perQ = (cfg.timeboxType === 'per-question');
      $('#perq-wrap').classList.toggle('hidden', !perQ);
      $('#total-wrap').classList.toggle('hidden', perQ);
      updateSavedStats();
    }));

    $('#start-btn').addEventListener('click', startQuiz);
    $('#next-btn').addEventListener('click', () => { current++; renderQuestion(); });
    $('#skip-btn').addEventListener('click', () => {
      const q = questions[current];
      if (q) {
        history.push({ q: summarize(q), ans: `${q.answer} cm`, user: null, timeout: false });
        streak = 0;
      }
      current++; renderQuestion();
    });

    $('#read-btn').addEventListener('click', () => {
      const q = questions[current];
      if (q && window.KZAudio) KZAudio.speak(q.readText);
    });

    $('#play-again').addEventListener('click', () => location.reload());
    $('#print-btn').addEventListener('click', () => window.print());

    $('#reset-progress').addEventListener('click', () => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('pt_'));
      keys.forEach(k => localStorage.removeItem(k));
      updateSavedStats();
      alert('Progress reset!');
    });

    // Redraw canvas if theme changes
    window.addEventListener('kz-theme-changed', () => {
      if (questions[current]) drawCurrent(questions[current]);
    });

    document.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      if (k === 'r') $('#read-btn').click();
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

    updateSavedStats();
  });
})();
