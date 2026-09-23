/**
 * Order Number Trail - Core Game Logic & Drag/Drop
 */
(function () {
  'use strict';

  const cfg = {
    mode: 'practice',
    timeboxType: 'per-question',
    perQSeconds: 30,
    totalSeconds: 300,
    total: 12,
    useWhole: true,
    useDecimal: true,
    useSimpleFrac: true,
    useComplexFrac: true,
    direction: 'asc',
    cardCount: 4,
    wholeMin: 1,
    wholeMax: 20,
    decPlaces: 2
  };

  let score = 0, current = 0, questions = [], history = [];
  let timerObj = null, timeLeft = 0, streak = 0;
  let startTimeMs = 0, endTimeMs = 0, totalTimerObj = null;
  let answered = false;

  let dragSrcCard = null;
  let selectedCard = null;
  let slots = [];

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
      KZAudio.speak(text.replace(/\//g, ' over '));
    }
  }

  function setMessage(text, type = 'info') {
    const el = $('#message');
    el.style.color = type === 'ok' ? 'var(--ok)' : (type === 'warn' ? 'var(--danger)' : 'var(--muted)');
    el.textContent = text;
  }

  function praise() {
    const m = ['Brilliant!', 'Nice job!', 'You rock!', 'Fantastic!', 'Great work!', 'Super!', 'Math Hero!', 'Amazing!', 'Yes! Keep it up!', 'Perfect order! 🎯'];
    return m[randInt(0, m.length - 1)];
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  function simplifyFrac(n, d) {
    const g = gcd(Math.abs(n), Math.abs(d)) || 1;
    let sn = n / g, sd = d / g;
    if (sd < 0) { sn = -sn; sd = -sd; }
    return { n: sn, d: sd };
  }

  function buildFracLines(n, d) {
    const ns = String(n), ds = String(d);
    const w = Math.max(ns.length, ds.length);
    const pad = s => {
      const left = Math.floor((w - s.length) / 2);
      const right = Math.ceil((w - s.length) / 2);
      return ' '.repeat(left) + s + ' '.repeat(right);
    };
    return pad(ns) + '\n' + '─'.repeat(w) + '\n' + pad(ds);
  }

  function makeWhole() {
    const v = randInt(cfg.wholeMin, cfg.wholeMax);
    return { kind: 'whole', value: v, display: String(v), label: 'Whole' };
  }

  function makeDecimal() {
    const m = 10 ** cfg.decPlaces;
    const maxV = cfg.wholeMax * m - 1;
    const raw = randInt(0, maxV) / m;
    const v = parseFloat(raw.toFixed(cfg.decPlaces));
    return { kind: 'decimal', value: v, display: v.toFixed(cfg.decPlaces), label: 'Decimal' };
  }

  function makeSimpleFrac() {
    const d = randInt(2, 5);
    const n = randInt(1, d * 2);
    const f = simplifyFrac(n, d);
    return { kind: 'simple-frac', value: f.n / f.d, n: f.n, d: f.d, display: `${f.n}/${f.d}`, label: 'Simple Frac' };
  }

  function makeComplexFrac() {
    const d = randInt(6, 20);
    const n = randInt(1, d * 2);
    const f = simplifyFrac(n, d);
    return { kind: 'complex-frac', value: f.n / f.d, n: f.n, d: f.d, display: `${f.n}/${f.d}`, label: 'Complex Frac' };
  }

  function pickRandom() {
    const pool = [];
    if (cfg.useWhole) pool.push('whole');
    if (cfg.useDecimal) pool.push('decimal');
    if (cfg.useSimpleFrac) pool.push('simple-frac');
    if (cfg.useComplexFrac) pool.push('complex-frac');
    if (!pool.length) pool.push('whole');
    const k = pool[randInt(0, pool.length - 1)];
    if (k === 'whole') return makeWhole();
    if (k === 'decimal') return makeDecimal();
    if (k === 'simple-frac') return makeSimpleFrac();
    return makeComplexFrac();
  }

  function generateOnePair() {
    let dir = cfg.direction;
    if (dir === 'mix') dir = Math.random() < 0.5 ? 'asc' : 'desc';

    let nums = [];
    let tries = 0;
    while (nums.length < cfg.cardCount && tries++ < 200) {
      const n = pickRandom();
      if (!nums.some(x => Math.abs(x.value - n.value) < 1e-9)) {
        nums.push(n);
      }
    }

    const sorted = [...nums].sort((a, b) => dir === 'asc' ? a.value - b.value : b.value - a.value);
    const shuffled = shuffle([...nums]);

    return { nums: shuffled, sorted, dir };
  }

  function generateQuestions() {
    questions = []; history = []; current = 0; score = 0; streak = 0;
    for (let i = 0; i < cfg.total; i++) questions.push(generateOnePair());
  }

  function buildCardEl(num, cardId) {
    const el = document.createElement('div');
    el.className = 'num-card';
    el.draggable = true;
    el.dataset.cardId = cardId;
    el.dataset.kind = num.kind;

    const typeDiv = document.createElement('div');
    typeDiv.className = 'card-type';
    typeDiv.textContent = num.label;
    el.appendChild(typeDiv);

    if (num.kind === 'whole' || num.kind === 'decimal') {
      const valDiv = document.createElement('div');
      valDiv.className = 'card-val';
      valDiv.textContent = num.display;
      el.appendChild(valDiv);
    } else {
      const pre = document.createElement('pre');
      pre.className = 'frac-pre';
      pre.textContent = buildFracLines(num.n, num.d);
      el.appendChild(pre);
    }

    return el;
  }

  function renderQuestion() {
    if (current >= cfg.total) { endQuiz(); return; }
    answered = false;

    const q = questions[current];
    slots = new Array(cfg.cardCount).fill(null);

    const isAsc = q.dir === 'asc';
    $('#dir-arrow').textContent = isAsc ? '⬆️' : '⬇️';
    $('#dir-label').textContent = isAsc
      ? 'Ascending — Smallest → Largest'
      : 'Descending — Largest → Smallest';

    setMessage('Drag cards into the slots, then press ✔ Check Order', 'info');

    $('#reveal-wrap').classList.add('hidden');
    $('#reveal-row').innerHTML = '';

    const slotsRow = $('#slots-row');
    slotsRow.innerHTML = '';
    for (let i = 0; i < cfg.cardCount; i++) {
      const wrap = document.createElement('div');
      wrap.className = 'slot-wrap';

      const lbl = document.createElement('div');
      lbl.className = 'slot-num';
      lbl.textContent = `#${i + 1}`;
      wrap.appendChild(lbl);

      const slot = document.createElement('div');
      slot.className = 'drop-slot';
      slot.dataset.slotIdx = i;
      slot.innerHTML = `<span class="slot-empty-hint">${i + 1}</span>`;

      slot.addEventListener('dragover', onSlotDragOver);
      slot.addEventListener('dragleave', onSlotDragLeave);
      slot.addEventListener('drop', e => onSlotDrop(e, i));
      slot.addEventListener('click', () => onSlotClick(i));

      wrap.appendChild(slot);
      slotsRow.appendChild(wrap);
    }

    const tray = $('#source-tray');
    tray.innerHTML = '';
    selectedCard = null;

    q.nums.forEach((num, idx) => {
      const el = buildCardEl(num, idx);
      el.addEventListener('dragstart', e => onCardDragStart(e, el, idx, false));
      el.addEventListener('dragend', onCardDragEnd);
      el.addEventListener('click', () => onCardClick(el, idx, false));
      tray.appendChild(el);
    });

    $('#check-btn').classList.remove('hidden');
    $('#next-btn').classList.add('hidden');
    $('#check-btn').disabled = false;
    $('#clear-btn').disabled = false;

    updateProgress();

    clearInterval(timerObj);
    if (cfg.mode === 'test' && cfg.timeboxType === 'per-question') {
      timeLeft = cfg.perQSeconds;
      $('#timer-clock').textContent = fmtTime(timeLeft);
      timerObj = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 5) beep('tick');
        $('#timer-clock').textContent = fmtTime(Math.max(0, timeLeft));
        if (timeLeft <= 0) { clearInterval(timerObj); autoSubmit(); }
      }, 1000);
    } else if (cfg.mode === 'practice') {
      $('#timer-clock').textContent = '';
    }

    say('Arrange these numbers in ' + (isAsc ? 'ascending' : 'descending') + ' order: ' +
      q.nums.map(n => n.display).join(', '));
  }

  function autoSubmit() {
    if (!answered) checkOrder(true);
  }

  function onCardDragStart(e, el, cardIdx, fromSlot, slotIdx) {
    dragSrcCard = { cardIdx, fromSlot, slotIdx };
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(cardIdx));

    let ghost = document.getElementById('drag-ghost');
    if (!ghost) {
      ghost = document.createElement('div');
      ghost.id = 'drag-ghost';
      document.body.appendChild(ghost);
    }
    ghost.innerHTML = el.innerHTML;
    ghost.style.display = 'flex';
    ghost.style.width = el.offsetWidth + 'px';
    e.dataTransfer.setDragImage(ghost, el.offsetWidth / 2, el.offsetHeight / 2);
  }

  function onCardDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    const ghost = document.getElementById('drag-ghost');
    if (ghost) ghost.style.display = 'none';
    dragSrcCard = null;
  }

  function onSlotDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
  }

  function onSlotDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  function onSlotDrop(e, slotIdx) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (!dragSrcCard) return;
    placeCard(dragSrcCard.cardIdx, slotIdx, dragSrcCard.fromSlot, dragSrcCard.slotIdx);
  }

  function onCardClick(el, cardIdx, fromSlot, slotIdx) {
    if (answered) return;
    if (selectedCard && selectedCard.el === el) {
      el.classList.remove('selected');
      selectedCard = null;
      return;
    }
    if (selectedCard) selectedCard.el.classList.remove('selected');

    selectedCard = { el, cardIdx, fromSlot, slotIdx };
    el.classList.add('selected');
    setMessage('Now tap an empty slot to place this card ✋', 'info');
  }

  function onSlotClick(slotIdx) {
    if (answered) return;
    if (!selectedCard) {
      if (slots[slotIdx] !== null) {
        const slotEl = document.querySelector(`.drop-slot[data-slot-idx="${slotIdx}"]`);
        const cardEl = slotEl.querySelector('.num-card');
        if (cardEl) {
          if (selectedCard && selectedCard.el === cardEl) {
            cardEl.classList.remove('selected');
            selectedCard = null;
            return;
          }
          if (selectedCard) selectedCard.el.classList.remove('selected');
          selectedCard = { el: cardEl, cardIdx: slots[slotIdx], fromSlot: true, slotIdx };
          cardEl.classList.add('selected');
          setMessage('Now tap another slot or tray to move it ✋', 'info');
        }
      }
      return;
    }
    placeCard(selectedCard.cardIdx, slotIdx, selectedCard.fromSlot, selectedCard.slotIdx);
    selectedCard.el.classList.remove('selected');
    selectedCard = null;
    setMessage('', 'info');
  }

  function placeCard(cardIdx, targetSlotIdx, fromSlot, fromSlotIdx) {
    if (answered) return;

    const tray = $('#source-tray');
    const existingInTarget = slots[targetSlotIdx];

    if (fromSlot) {
      if (existingInTarget !== null) {
        slots[fromSlotIdx] = existingInTarget;
        renderSlotCard(fromSlotIdx, existingInTarget);
      } else {
        slots[fromSlotIdx] = null;
        const srcSlotEl = document.querySelector(`.drop-slot[data-slot-idx="${fromSlotIdx}"]`);
        srcSlotEl.innerHTML = `<span class="slot-empty-hint">${fromSlotIdx + 1}</span>`;
      }
      slots[targetSlotIdx] = cardIdx;
      renderSlotCard(targetSlotIdx, cardIdx);
    } else {
      if (existingInTarget !== null) {
        returnCardToTray(existingInTarget);
      }
      const cardInTray = tray.querySelector(`.num-card[data-card-id="${cardIdx}"]`);
      if (cardInTray) cardInTray.remove();

      slots[targetSlotIdx] = cardIdx;
      renderSlotCard(targetSlotIdx, cardIdx);
    }
  }

  function renderSlotCard(slotIdx, cardIdx) {
    const q = questions[current];
    const num = q.nums[cardIdx];
    const slotEl = document.querySelector(`.drop-slot[data-slot-idx="${slotIdx}"]`);
    slotEl.innerHTML = '';
    const el = buildCardEl(num, cardIdx);
    el.style.border = 'none';
    el.style.boxShadow = 'none';
    el.style.background = 'transparent';
    el.style.cursor = 'pointer';
    el.draggable = true;
    el.addEventListener('dragstart', e => onCardDragStart(e, el, cardIdx, true, slotIdx));
    el.addEventListener('dragend', onCardDragEnd);
    el.addEventListener('click', () => onSlotCardClick(el, cardIdx, slotIdx));
    slotEl.appendChild(el);
  }

  function onSlotCardClick(el, cardIdx, slotIdx) {
    if (answered) return;
    if (selectedCard && selectedCard.el === el) {
      el.classList.remove('selected');
      selectedCard = null;
      setMessage('', 'info');
      return;
    }
    if (selectedCard) {
      placeCard(selectedCard.cardIdx, slotIdx, selectedCard.fromSlot, selectedCard.slotIdx);
      selectedCard.el.classList.remove('selected');
      selectedCard = null;
      setMessage('', 'info');
      return;
    }
    if (selectedCard) selectedCard.el.classList.remove('selected');
    selectedCard = { el, cardIdx, fromSlot: true, slotIdx };
    el.classList.add('selected');
    setMessage('Now tap a slot or another card to swap ✋', 'info');
  }

  function returnCardToTray(cardIdx) {
    const q = questions[current];
    const num = q.nums[cardIdx];
    const tray = $('#source-tray');
    const el = buildCardEl(num, cardIdx);
    el.addEventListener('dragstart', e => onCardDragStart(e, el, cardIdx, false));
    el.addEventListener('dragend', onCardDragEnd);
    el.addEventListener('click', () => onCardClick(el, cardIdx, false));
    el.classList.add('bounce-in');
    tray.appendChild(el);
  }

  function checkOrder(isTimeout = false) {
    if (answered) return;
    const q = questions[current];

    const allFilled = slots.every(s => s !== null);
    if (!allFilled && !isTimeout) {
      setMessage('Fill all slots before checking! 🧩', 'warn');
      const slotsRow = $('#slots-row');
      slotsRow.classList.add('shake');
      setTimeout(() => slotsRow.classList.remove('shake'), 400);
      return;
    }

    answered = true;
    clearInterval(timerObj);

    const userOrder = slots.map(s => s === null ? -1 : s);
    const correctOrder = q.sorted.map(sn => q.nums.findIndex(n => Math.abs(n.value - sn.value) < 1e-9));

    const correct = userOrder.every((u, i) => u === correctOrder[i]);

    const slotEls = document.querySelectorAll('.drop-slot');
    slotEls.forEach((el, i) => {
      el.classList.remove('slot-correct', 'slot-wrong');
      if (userOrder[i] === correctOrder[i]) el.classList.add('slot-correct');
      else el.classList.add('slot-wrong');
    });

    history.push({
      nums: q.nums.map(n => n.display),
      correctOrder: q.sorted.map(n => n.display),
      userOrder: userOrder.map(i => i >= 0 ? q.nums[i].display : '—'),
      dir: q.dir,
      correct,
      timeout: isTimeout
    });

    if (correct) {
      score++; streak++;
      setMessage(praise(), 'ok');
      beep('ok');
      if (cfg.mode === 'practice') {
        setTimeout(() => { current++; renderQuestion(); }, 900);
      } else {
        showNextBtn();
      }
    } else {
      streak = 0;
      setMessage(isTimeout ? '⏰ Time\'s up! Check the correct order below.' : 'Not quite — see the correct order below! 💪', 'warn');
      beep('bad');
      showCorrectOrder(q);
      if (cfg.mode === 'practice') {
        setTimeout(() => { current++; renderQuestion(); }, 2200);
      } else {
        showNextBtn();
      }
    }

    updateProgress();
  }

  function showCorrectOrder(q) {
    const wrap = $('#reveal-wrap');
    const row = $('#reveal-row');
    row.innerHTML = '';
    wrap.classList.remove('hidden');

    q.sorted.forEach(num => {
      const card = document.createElement('div');
      card.className = 'reveal-card';
      if (num.kind === 'whole' || num.kind === 'decimal') {
        card.textContent = num.display;
      } else {
        const pre = document.createElement('pre');
        pre.className = 'frac-pre';
        pre.style.fontSize = '0.95rem';
        pre.textContent = buildFracLines(num.n, num.d);
        card.appendChild(pre);
      }
      row.appendChild(card);
    });
  }

  function showNextBtn() {
    $('#check-btn').classList.add('hidden');
    $('#next-btn').classList.remove('hidden');
    $('#clear-btn').disabled = true;
  }

  function clearAllSlots() {
    if (answered) return;
    slots.forEach((cardIdx, slotIdx) => {
      if (cardIdx !== null) {
        returnCardToTray(cardIdx);
        slots[slotIdx] = null;
        const slotEl = document.querySelector(`.drop-slot[data-slot-idx="${slotIdx}"]`);
        if (slotEl) slotEl.innerHTML = `<span class="slot-empty-hint">${slotIdx + 1}</span>`;
      }
    });
    if (selectedCard) {
      selectedCard.el.classList.remove('selected');
      selectedCard = null;
    }
    setMessage('', 'info');
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
        gameId: 'order-number',
        score: score,
        total: cfg.total,
        mode: cfg.mode,
        durationSec: totalTakenSec
      });
    }

    let msg = 'Great effort! Keep practicing and you’ll master it!';
    if (forcedByTimer) msg = 'Time’s up! Awesome try — practice again and beat the clock! ⏰';
    else if (pct === 100) msg = 'Perfect score! You’re a Number Order Champion! 🏆';
    else if (pct >= 80) msg = 'Awesome work! You’re on fire! 🌟';
    else if (pct >= 60) msg = 'Good job! Keep ordering! 💪';
    $('#appraise').textContent = msg;

    const badges = [];
    if (pct === 100) badges.push('🏆 Flawless!');
    if (cfg.mode === 'test') badges.push(cfg.timeboxType === 'per-question' ? '⏱️ Speed Master' : '⏱️ Countdown Master');
    if (streak >= 4) badges.push(`🔥 Streak ${streak}`);
    if (cfg.cardCount >= 5) badges.push('🧠 5-Card Wizard');
    $('#badges').innerHTML = badges.map(b => `<span class="badge">${b}</span>`).join('');

    if (pct >= 80 && window.KZ) {
      KZ.confetti({ count: 120, spread: 70 });
    }

    const list = $('#review-list');
    list.innerHTML = history.map(h => {
      const dirSym = h.dir === 'asc' ? '⬆️ Ascending' : '⬇️ Descending';
      return `
        <div class="review-item">
          <div>
            <strong>${dirSym}:</strong> [${h.correctOrder.join(' < ')}]
            <br>
            <span style="font-size:0.85rem; color:var(--muted);">Your order: [${h.userOrder.join(', ')}]</span>
          </div>
          <div style="font-weight:800; color:${h.correct ? 'var(--ok)' : 'var(--danger)'}">
            ${h.correct ? '✅' : '❌'} ${h.timeout ? '⏰' : ''}
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
      cfg.direction = document.querySelector('input[name="direction"]:checked').value;
      cfg.cardCount = clamp(Number($('#card-count').value) || 4, 3, 6);
      cfg.wholeMin = clamp(Number($('#whole-min').value) || 1, 0, 999);
      cfg.wholeMax = clamp(Number($('#whole-max').value) || 20, cfg.wholeMin + 1, 1000);
      cfg.decPlaces = clamp(Number($('#dec-places').value) || 2, 1, 3);
      cfg.total = clamp(Number($('#qty-num').value) || 12, 5, 50);
      cfg.perQSeconds = clamp(Number($('#per-q-secs').value) || 30, 10, 120);
      cfg.totalSeconds = clamp(Number($('#total-secs').value) || 300, 60, 1800);

      generateQuestions();
      $('#setup-screen').classList.add('hidden');
      $('#quiz-screen').classList.remove('hidden');

      startTimeMs = Date.now();
      if (cfg.mode === 'test' && cfg.timeboxType === 'total') {
        let left = cfg.totalSeconds;
        $('#timer-clock').textContent = fmtTime(left);
        totalTimerObj = setInterval(() => {
          left--;
          if (left <= 5) beep('tick');
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

    $('#check-btn').addEventListener('click', () => checkOrder(false));
    $('#clear-btn').addEventListener('click', clearAllSlots);
    $('#next-btn').addEventListener('click', () => { current++; renderQuestion(); });
    $('#skip-btn').addEventListener('click', () => {
      const q = questions[current];
      if (q) {
        history.push({
          nums: q.nums.map(n => n.display),
          correctOrder: q.sorted.map(n => n.display),
          userOrder: ['—'],
          dir: q.dir,
          correct: false,
          timeout: false
        });
        streak = 0;
      }
      current++; renderQuestion();
    });

    $('#read-btn').addEventListener('click', () => {
      const q = questions[current];
      if (q && window.KZAudio) {
        const isAsc = q.dir === 'asc';
        KZAudio.speak((isAsc ? 'Ascending: ' : 'Descending: ') + q.nums.map(n => n.display).join(', '));
      }
    });

    $('#play-again').addEventListener('click', () => location.reload());
    $('#print-btn').addEventListener('click', () => window.print());

    document.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      if (k === 'r') $('#read-btn').click();
      if (k === 'c') $('#clear-btn').click();
      if (k === 's') $('#skip-btn').click();
      if (e.key === 'Enter') {
        if (!$('#check-btn').classList.contains('hidden')) $('#check-btn').click();
        else if (!$('#next-btn').classList.contains('hidden')) $('#next-btn').click();
      }
    });
  });
})();
