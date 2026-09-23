/**
 * Klotski Trail - Sliding Tile Puzzle Engine
 */
(function () {
  'use strict';

  const MODES = {
    simple: { n: 4, label: 'Simple (4×4)', shuffles: 80 },
    medium: { n: 8, label: 'Medium (8×8)', shuffles: 200 },
    hard: { n: 12, label: 'Hard (12×12)', shuffles: 350 }
  };

  let mode = 'simple';
  let N = 4;
  let tiles = [];
  let initTiles = [];
  let emptyIdx = 0;
  let moves = 0;
  let timerSec = 0;
  let timerObj = null;
  let gameActive = false;

  const $ = id => document.getElementById(id);

  function beep(type = 'slide') {
    if (!window.KZAudio) return;
    if (type === 'slide') KZAudio.playTick();
    else if (type === 'win') KZAudio.playOk();
    else if (type === 'hint') KZAudio.playClick();
  }

  function selectMode(m, btn) {
    mode = m;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    newGame();
  }

  function tileSize() {
    const maxBoard = Math.min(window.innerWidth - 48, window.innerHeight - 280, 580);
    const gap = 4;
    const pad = 4 * 2;
    const frame = 10 * 2;
    const available = maxBoard - pad - frame - gap * (N - 1);
    return Math.max(26, Math.floor(available / N));
  }

  function fontSize(ts) {
    if (N <= 4) return Math.round(ts * 0.42);
    if (N <= 8) return Math.round(ts * 0.38);
    return Math.round(ts * 0.33);
  }

  function goalState() {
    const g = [];
    for (let i = 1; i < N * N; i++) g.push(i);
    g.push(0);
    return g;
  }

  function isSolved() {
    const goal = goalState();
    return tiles.every((v, i) => v === goal[i]);
  }

  function shufflePuzzle() {
    tiles = goalState();
    emptyIdx = N * N - 1;
    const steps = MODES[mode].shuffles;
    let lastEmpty = -1;
    for (let i = 0; i < steps; i++) {
      const neighbors = getMoveable(emptyIdx).filter(idx => idx !== lastEmpty);
      const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
      if (pick === undefined) continue;
      lastEmpty = emptyIdx;
      tiles[emptyIdx] = tiles[pick];
      tiles[pick] = 0;
      emptyIdx = pick;
    }
  }

  function getMoveable(eIdx) {
    const row = Math.floor(eIdx / N), col = eIdx % N;
    const neighbors = [];
    if (row > 0) neighbors.push(eIdx - N);
    if (row < N - 1) neighbors.push(eIdx + N);
    if (col > 0) neighbors.push(eIdx - 1);
    if (col < N - 1) neighbors.push(eIdx + 1);
    return neighbors;
  }

  function canSlide(idx) {
    return getMoveable(emptyIdx).includes(idx);
  }

  function slideTile(idx) {
    if (!gameActive || !canSlide(idx)) return;
    if (moves === 0) startTimer();

    tiles[emptyIdx] = tiles[idx];
    tiles[idx] = 0;
    emptyIdx = idx;
    moves++;
    $('move-count').textContent = moves;
    beep('slide');
    renderBoard(true);

    if (isSolved()) {
      gameActive = false;
      clearInterval(timerObj);
      setTimeout(showWin, 300);
    }
  }

  function startTimer() {
    clearInterval(timerObj);
    timerObj = setInterval(() => {
      timerSec++;
      $('timer-disp').textContent = fmtTime(timerSec);
      if (timerSec >= 600) $('timer-chip').classList.add('timer-urgent');
    }, 1000);
  }

  function fmtTime(s) {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function getBest(m) {
    try { return JSON.parse(localStorage.getItem('klotski_best_' + m) || 'null'); } catch { return null; }
  }

  function setBest(m, data) {
    try { localStorage.setItem('klotski_best_' + m, JSON.stringify(data)); } catch {}
  }

  function updateBestDisplay() {
    const best = getBest(mode);
    $('best-disp').textContent = best ? `${best.moves}mv ${fmtTime(best.time)}` : '—';
  }

  function showWin() {
    beep('win');
    if (window.KZ) KZ.confetti({ count: 200, spread: 80 });

    const best = getBest(mode);
    if (!best || moves < best.moves || (moves === best.moves && timerSec < best.time)) {
      setBest(mode, { moves, time: timerSec });
    }
    updateBestDisplay();

    $('win-title').textContent = moves < 30 ? '🏆 Masterful!' : moves < 80 ? '🎉 Solved!' : '💪 You did it!';
    $('win-stats').innerHTML = `Mode: <strong>${MODES[mode].label}</strong><br>Moves: <strong>${moves}</strong> &nbsp;|&nbsp; Time: <strong>${fmtTime(timerSec)}</strong>`;
    $('win-overlay').classList.remove('hidden');

    if (window.KZ && KZ.recordScore) {
      KZ.recordScore({
        gameId: 'klotski',
        score: Math.max(10, Math.min(100, Math.round(100 - (moves - 20) * 1.2))),
        total: 100,
        mode: MODES[mode].label,
        details: `${moves} moves`,
        durationSec: timerSec
      });
    }
  }

  function solveHint() {
    beep('hint');
    const board = $('board');
    const moveables = getMoveable(emptyIdx);
    board.querySelectorAll('.tile').forEach(el => {
      const idx = parseInt(el.dataset.idx, 10);
      if (moveables.includes(idx)) {
        el.style.boxShadow = '0 0 0 3px #ffd700, 0 0 18px #ffd700';
        setTimeout(() => { el.style.boxShadow = ''; }, 1000);
      }
    });
  }

  function renderBoard(animate = false) {
    N = MODES[mode].n;
    const board = $('board');
    const ts = tileSize();
    const boardPx = ts * N + 4 * (N - 1) + 8;

    board.style.gridTemplateColumns = `repeat(${N}, ${ts}px)`;
    board.style.gridTemplateRows = `repeat(${N}, ${ts}px)`;
    board.style.width = boardPx + 'px';
    board.style.height = boardPx + 'px';

    const total = N * N;
    board.innerHTML = '';

    for (let i = 0; i < total; i++) {
      const val = tiles[i];

      if (val === 0) {
        const empty = document.createElement('div');
        empty.className = 'tile-empty';
        empty.style.width = ts + 'px';
        empty.style.height = ts + 'px';
        board.appendChild(empty);
        continue;
      }

      const el = document.createElement('div');
      el.className = 'tile';
      el.dataset.idx = i;
      el.dataset.val = val;
      el.style.width = ts + 'px';
      el.style.height = ts + 'px';
      el.style.fontSize = fontSize(ts) + 'px';

      const hue = 160 + ((val * 7) % 30) - 15;
      const sat = 58 + ((val * 3) % 12);
      const lit = 48 + ((val * 5) % 12) - 6;
      el.style.background = `linear-gradient(135deg, hsl(${hue}, ${sat}%, ${lit + 8}%) 0%, hsl(${hue}, ${sat}%, ${lit}%) 50%, hsl(${hue}, ${sat}%, ${lit - 8}%) 100%)`;
      el.style.boxShadow = 'var(--shadow-tile)';

      const slideable = canSlide(i);
      el.classList.toggle('slideable', slideable);
      el.classList.toggle('not-slideable', !slideable);

      const inner = document.createElement('div');
      inner.className = 'tile-inner';
      inner.textContent = val;
      inner.style.borderColor = `hsl(${hue}, ${sat}%, ${lit - 22}%)`;
      if (ts < 36) {
        inner.style.border = 'none';
        inner.style.background = 'transparent';
      }

      el.appendChild(inner);
      el.addEventListener('click', () => slideTile(parseInt(el.dataset.idx, 10)));

      if (animate && slideable) {
        el.style.transition = 'transform .12s cubic-bezier(.34, 1.3, .64, 1)';
      }

      board.appendChild(el);
    }
  }

  function newGame() {
    N = MODES[mode].n;
    $('win-overlay').classList.add('hidden');
    clearInterval(timerObj);
    moves = 0;
    timerSec = 0;
    $('move-count').textContent = '0';
    $('timer-disp').textContent = '00:00';
    $('timer-chip').classList.remove('timer-urgent');
    shufflePuzzle();
    initTiles = [...tiles];
    gameActive = true;
    updateBestDisplay();
    renderBoard(false);
  }

  function resetBoard() {
    if (!gameActive && !$('win-overlay').classList.contains('hidden')) return;
    $('win-overlay').classList.add('hidden');
    clearInterval(timerObj);
    tiles = [...initTiles];
    emptyIdx = tiles.indexOf(0);
    moves = 0;
    timerSec = 0;
    $('move-count').textContent = '0';
    $('timer-disp').textContent = '00:00';
    $('timer-chip').classList.remove('timer-urgent');
    gameActive = true;
    renderBoard(false);
  }

  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        selectMode(e.currentTarget.dataset.mode, e.currentTarget);
      });
    });

    $('new-game-btn').addEventListener('click', newGame);
    $('reset-btn').addEventListener('click', resetBoard);
    $('hint-btn').addEventListener('click', solveHint);
    $('play-again-btn').addEventListener('click', newGame);

    document.addEventListener('keydown', e => {
      if (!gameActive) return;
      const row = Math.floor(emptyIdx / N), col = emptyIdx % N;
      let target = -1;
      if (e.key === 'ArrowUp' && row < N - 1) target = emptyIdx + N;
      if (e.key === 'ArrowDown' && row > 0) target = emptyIdx - N;
      if (e.key === 'ArrowLeft' && col < N - 1) target = emptyIdx + 1;
      if (e.key === 'ArrowRight' && col > 0) target = emptyIdx - 1;
      if (target >= 0) { e.preventDefault(); slideTile(target); }
      if (e.key.toLowerCase() === 'h') solveHint();
      if (e.key.toLowerCase() === 'r') resetBoard();
      if (e.key.toLowerCase() === 'n') newGame();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => renderBoard(false), 120);
    });

    newGame();
  });
})();
