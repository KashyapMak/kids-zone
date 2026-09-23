/**
 * Memory Trail - Memory Match Game Engine
 */
(function () {
  'use strict';

  const cfg = {
    set: 'numbers',
    diff: 'easy',
    totalSecs: 120,
    maxLevels: 5,
    levelCards: [8, 12, 16, 20, 24],
    peekOnStart: false,
    shuffleEach: true
  };

  const symbolBank = [
    '★', '♥', '♦', '♣', '♠', '●', '▲', '■', '◆', '☀', '☂', '☁', '✿', '♫', '☯', '☘', '🍀', '🍎', '🍊', '🍉', '🍇', '🍓', '🍒', '⚽', '🏀', '🏈', '🏐', '⚾', '🎲'
  ];

  let streak = 0, score = 0, level = 1, timeLeft = cfg.totalSecs, timer = null;
  let pairsTotal = 0, pairsFound = 0, firstPick = null, lockBoard = false, boardData = [];
  let histories = [];
  let flipBackDelay = 850, mismatchPenalty = 0, scorePerMatch = 10;

  const $ = s => document.querySelector(s);
  const shuffle = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
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

  function updateStatsText() {
    const key = `mem_${cfg.set}_${cfg.diff}`;
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    const t = [
      `Set: ${cfg.set} | Diff: ${cfg.diff.toUpperCase()}`,
      data.best ? `Best: ${data.best.score} (lv ${data.best.level})` : `Best: —`,
      data.last ? `Last: ${data.last.score} (lv ${data.last.level})` : `Last: —`
    ].join('  •  ');
    $('#stats').textContent = t;
  }

  function saveResult() {
    const key = `mem_${cfg.set}_${cfg.diff}`;
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    const best = (data.best && data.best.score >= score) ? data.best : { score, level, date: Date.now() };
    const last = { score, level, date: Date.now() };
    localStorage.setItem(key, JSON.stringify({ best, last }));
  }

  function readSetup() {
    cfg.set = document.querySelector('input[name="set"]:checked').value;
    cfg.diff = document.querySelector('input[name="diff"]:checked').value;
    cfg.totalSecs = Math.max(30, Math.min(900, Number($('#time-secs').value) || 120));
    cfg.peekOnStart = $('#show-peek').checked;
    cfg.shuffleEach = $('#shuffle-cards').checked;

    if (cfg.diff === 'easy') {
      flipBackDelay = 850; mismatchPenalty = 0; scorePerMatch = 10;
    } else if (cfg.diff === 'medium') {
      flipBackDelay = 700; mismatchPenalty = 2; scorePerMatch = 12;
    } else {
      flipBackDelay = 550; mismatchPenalty = 5; scorePerMatch = 15;
    }
  }

  function startGame() {
    if (window.KZAudio) KZAudio.playClick();
    readSetup();
    level = 1; score = 0; streak = 0; timeLeft = cfg.totalSecs; pairsFound = 0; histories = []; firstPick = null; lockBoard = false;
    $('#setup-screen').style.display = 'none';
    $('#game-screen').style.display = 'block';
    updateStatsText();
    startTimer();
    startLevel();
  }

  function startTimer() {
    clearInterval(timer);
    $('#timer-clock').textContent = fmt(timeLeft);
    timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 3) beep('tick');
      $('#timer-clock').textContent = fmt(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
        endGame(true);
      }
    }, 1000);
  }

  function buildDeck(count) {
    const pairs = count / 2;
    let items = [];
    const poolNumbers = Array.from({ length: 50 }, (_, i) => String(i + 1));
    const poolSymbols = symbolBank.slice();
    function pickPool() {
      if (cfg.set === 'numbers') return poolNumbers;
      if (cfg.set === 'symbols') return poolSymbols;
      return poolNumbers.concat(poolSymbols);
    }
    const pool = pickPool().slice();
    if (pool.length < pairs) {
      while (pool.length < pairs) pool.push(...pickPool());
    }
    shuffle(pool);
    const chosen = pool.slice(0, pairs);
    chosen.forEach(val => {
      const id1 = Math.random().toString(36).slice(2, 10);
      const id2 = Math.random().toString(36).slice(2, 10);
      items.push({ val, id: id1 });
      items.push({ val, id: id2 });
    });
    return shuffle(items);
  }

  function startLevel() {
    if (level > cfg.maxLevels) { endGame(false); return; }
    const total = cfg.levelCards[Math.min(level - 1, cfg.levelCards.length - 1)];
    boardData = buildDeck(total);
    pairsTotal = total / 2; pairsFound = 0; firstPick = null; lockBoard = false;
    $('#level-info').textContent = `Level ${level}/${cfg.maxLevels}`;
    $('#pairs-info').textContent = `Pairs 0/${pairsTotal}`;
    $('#score-box').textContent = `Score: ${score}`;
    $('#streak-box').textContent = `Streak: ${streak} 🔥`;
    $('#found-box').textContent = `Found: 0`;

    const cols = Math.ceil(Math.sqrt(total));
    const board = $('#board');
    board.style.setProperty('--cols', cols);
    board.innerHTML = '';
    boardData.forEach((t, idx) => {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.index = idx;
      tile.innerHTML = `
        <div class="tile-inner">
          <div class="face front">?</div>
          <div class="face back">${t.val}</div>
        </div>`;
      tile.addEventListener('click', () => onFlip(tile, t));
      board.appendChild(tile);
    });

    if (cfg.peekOnStart) {
      peekAll(true);
      setTimeout(() => hideAll(), 1000);
    } else {
      hideAll();
    }
    setMessage('Find all matching pairs!');
    $('#next-btn').disabled = true;
    updateProgress();
  }

  function hideAll() {
    document.querySelectorAll('.tile').forEach(tile => tile.classList.remove('flipped'));
  }

  function setMessage(text, type = 'info') {
    const el = $('#message');
    el.style.color = (type === 'ok') ? 'var(--ok)' : (type === 'warn' ? 'var(--danger)' : 'var(--muted)');
    el.textContent = text;
  }

  function onFlip(tile, t) {
    if (lockBoard) return;
    if (tile.classList.contains('flipped')) return;
    tile.classList.add('flipped');

    if (!firstPick) {
      firstPick = { tile, t };
      return;
    }

    lockBoard = true;
    const match = (firstPick.t.val === t.val && firstPick.tile !== tile);
    if (match) {
      tile.style.pointerEvents = 'none';
      firstPick.tile.style.pointerEvents = 'none';
      pairsFound++;
      streak++;
      score += scorePerMatch + Math.max(0, (streak - 1));
      setMessage('Great! It\'s a match!', 'ok');
      beep('ok');
      $('#streak-box').textContent = `Streak: ${streak} 🔥`;
      $('#score-box').textContent = `Score: ${score}`;
      $('#pairs-info').textContent = `Pairs ${pairsFound}/${pairsTotal}`;
      $('#found-box').textContent = `Found: ${pairsFound}`;
      histories.push({ level, event: `Match: ${t.val}`, time: cfg.totalSecs - timeLeft });
      firstPick = null;
      lockBoard = false;
      if (pairsFound === pairsTotal) onLevelComplete();
    } else {
      streak = 0;
      setMessage('Try again!', 'warn');
      beep('wrong');
      const a = firstPick.tile, b = tile;
      histories.push({ level, event: `Miss: ${firstPick.t.val} ≠ ${t.val}`, time: cfg.totalSecs - timeLeft });
      firstPick = null;
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        lockBoard = false;
      }, flipBackDelay);
      if (mismatchPenalty > 0) {
        timeLeft = Math.max(0, timeLeft - mismatchPenalty);
        $('#timer-clock').textContent = fmt(timeLeft);
      }
      $('#streak-box').textContent = `Streak: ${streak} 🔥`;
    }
  }

  function onLevelComplete() {
    setMessage('Level cleared! 🎯', 'ok');
    if (window.KZ) KZ.confetti({ count: 120, spread: 65 });
    if (level < cfg.maxLevels && timeLeft > 0) {
      $('#next-btn').disabled = false;
    } else {
      endGame(false);
    }
  }

  function endGame(forced) {
    clearInterval(timer);
    saveResult();
    if (window.KZ) KZ.setProgress(100);
    $('#game-screen').style.display = 'none';
    $('#result-screen').style.display = 'block';
    const appraise = forced ? 'Timer up — awesome try! ⏰' : 'Trail complete — fantastic!';
    $('#appraise').textContent = appraise;
    $('#score-big').textContent = `${score} pts`;
    $('#time-left').textContent = fmt(timeLeft);

    if (window.KZ && KZ.recordScore) {
      const maxPts = cfg.maxLevels * scorePerMatch;
      KZ.recordScore({
        gameId: 'memory',
        score: score,
        total: maxPts,
        accuracy: Math.min(100, Math.round((score / maxPts) * 100)),
        mode: cfg.diff,
        details: `${cfg.theme} (${level} levels)`,
        durationSec: cfg.timeLimit - timeLeft
      });
    }

    const badges = [];
    if (!forced) badges.push('🏆 Finisher');
    if (score >= (cfg.maxLevels * scorePerMatch * 0.8)) badges.push('🌟 High Scorer');
    if (cfg.diff === 'hard') badges.push('🔥 Hard Mode');
    $('#badges').innerHTML = badges.map(b => `<span class="badge">${b}</span>`).join('');

    const list = $('#review-list');
    if (histories.length === 0) {
      list.textContent = 'No events captured.';
    } else {
      list.innerHTML = histories.map(h => `<div class="review-item">
        <strong>T${fmt(h.time)}</strong> • Level ${h.level} • ${h.event}
      </div>`).join('');
    }
  }

  function peekAll(fromStart = false) {
    document.querySelectorAll('.tile').forEach(tile => tile.classList.add('flipped'));
    if (!fromStart) setTimeout(() => hideAll(), 1000);
  }

  function updateProgress() {
    const pct = ((level - 1) / cfg.maxLevels) * 100;
    if (window.KZ) KZ.setProgress(pct);
  }

  window.addEventListener('DOMContentLoaded', () => {
    updateStatsText();

    document.querySelectorAll('input[name="set"]').forEach(r =>
      r.addEventListener('change', () => {
        cfg.set = document.querySelector('input[name="set"]:checked').value;
        updateStatsText();
      })
    );
    document.querySelectorAll('input[name="diff"]').forEach(r =>
      r.addEventListener('change', () => {
        cfg.diff = document.querySelector('input[name="diff"]:checked').value;
        updateStatsText();
      })
    );

    $('#start-btn').addEventListener('click', startGame);
    $('#quit-btn').addEventListener('click', () => endGame(true));
    $('#next-btn').addEventListener('click', () => { level++; startLevel(); });
    $('#peek-btn').addEventListener('click', () => peekAll(false));
    $('#print-btn').addEventListener('click', () => window.print());
    $('#play-again').addEventListener('click', () => location.reload());

    $('#reset-progress').addEventListener('click', () => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('mem_'));
      keys.forEach(k => localStorage.removeItem(k));
      updateStatsText();
      alert('Progress reset!');
    });
  });
})();
