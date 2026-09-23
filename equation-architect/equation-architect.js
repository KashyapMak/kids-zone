/**
 * Equation Architect - Logic & Solver Engine
 */
(function () {
  'use strict';

  const cfg = {
    lvlMax: 5,
    diff: {
      easy: { nums: 3, range: [10, 25], ops: ['+', '-'] },
      medium: { nums: 4, range: [20, 60], ops: ['+', '-', '*'] },
      hard: { nums: 4, range: [30, 100], ops: ['+', '-', '*', '/'] }
    }
  };

  let state = {
    diff: 'easy',
    level: 1,
    streak: 0,
    score: 0,
    timer: 0,
    target: 0,
    nums: [],
    userEq: [],
    usedIdx: [],
    solutionStr: '',
    history: [],
    interval: null
  };

  function beep(type) {
    if (!window.KZAudio) return;
    if (type === 'ok') KZAudio.playOk();
    else if (type === 'wrong') KZAudio.playWrong();
    else KZAudio.playTick();
  }

  function startGame() {
    if (window.KZAudio) KZAudio.playClick();
    state.diff = document.getElementById('diff-select').value;
    state.level = 1;
    state.score = 0;
    state.streak = 0;
    state.history = [];
    state.timer = 0;
    switchScreen('game-screen');
    initLvl();

    if (state.interval) clearInterval(state.interval);
    state.interval = setInterval(() => {
      state.timer++;
      document.getElementById('timer-txt').innerText = `⏱️ ${state.timer.toString().padStart(2, '0')}s`;
    }, 1000);
  }

  function initLvl() {
    const d = cfg.diff[state.diff];
    let found = false;
    while (!found) {
      state.target = Math.floor(Math.random() * (d.range[1] - d.range[0])) + d.range[0];
      state.nums = Array.from({ length: d.nums }, () => Math.floor(Math.random() * 8) + 2);
      state.solutionStr = findLinearSol(state.nums, state.target, d.ops);
      if (state.solutionStr) found = true;
    }
    state.userEq = [];
    state.usedIdx = [];
    renderPools();
    document.getElementById('target-val').innerText = state.target;
    document.getElementById('cur-lvl').innerText = state.level;
    const pct = ((state.level - 1) / cfg.lvlMax) * 100;
    if (window.KZ) KZ.setProgress(pct);
    updateUI();
  }

  function updateUI() {
    const eqStr = state.userEq.map(e => e.v).join(' ');
    document.getElementById('eq-display').innerText = eqStr || 'Tap blocks...';
    const calc = document.getElementById('live-calc');
    try {
      if (!eqStr) throw 'Empty';
      const res = evaluateLinear(state.userEq.map(e => e.v));
      calc.innerText = (res !== undefined && !isNaN(res)) ? Number(res.toFixed(1)) : '?';
      calc.className = 'result-preview ' + (Math.abs(res - state.target) < 0.1 ? '' : 'wrong');
    } catch {
      calc.innerText = '?';
      calc.className = 'result-preview';
    }
    document.querySelectorAll('#num-pool .block').forEach((b, i) => {
      b.className = state.usedIdx.includes(i) ? 'block used' : 'block';
    });
  }

  function evaluateLinear(arr) {
    if (arr.length === 0) return 0;
    let res = parseFloat(arr[0]);
    for (let i = 1; i < arr.length; i += 2) {
      const op = arr[i];
      const nextVal = parseFloat(arr[i + 1]);
      if (op === '+') res += nextVal;
      if (op === '-') res -= nextVal;
      if (op === '*') res *= nextVal;
      if (op === '/') res /= nextVal;
    }
    return res;
  }

  function checkSol() {
    if (state.usedIdx.length < state.nums.length) {
      alert('You must use all number blocks!');
      return;
    }
    processLevel(false);
  }

  function skipLevel() {
    processLevel(true);
  }

  function processLevel(isSkipped) {
    const eqStr = state.userEq.map(e => e.v).join(' ') || '(Skipped)';
    const resVal = parseFloat(document.getElementById('live-calc').innerText) || 0;
    const isCorrect = !isSkipped && Math.abs(resVal - state.target) < 0.1;

    state.history.push({
      q: `${state.nums.join(', ')} → Target ${state.target}`,
      ans: eqStr + (isSkipped ? '' : ' = ' + resVal),
      isCorrect: isCorrect,
      hint: state.solutionStr
    });

    if (isCorrect) {
      beep('ok');
      if (window.KZ) KZ.confetti({ count: 100, spread: 70 });
      state.score++;
      state.streak++;
    } else {
      beep('wrong');
      state.streak = 0;
    }

    document.getElementById('cur-strk').innerText = state.streak;
    if (state.level < cfg.lvlMax) {
      state.level++;
      initLvl();
    } else {
      showResults();
    }
  }

  function showResults() {
    clearInterval(state.interval);
    if (window.KZ) KZ.setProgress(100);
    switchScreen('result-screen');
    const pct = Math.round((state.score / cfg.lvlMax) * 100);
    document.getElementById('final-stats').innerText = `${state.score} / ${cfg.lvlMax} (${pct}%)`;
    document.getElementById('time-summary').innerText = `Completed in ${state.timer} seconds.`;

    if (window.KZ && KZ.recordScore) {
      KZ.recordScore({
        gameId: 'equation-architect',
        score: state.score,
        total: cfg.lvlMax,
        mode: cfg.difficulty,
        durationSec: state.timer
      });
    }

    const log = document.getElementById('history-log');
    log.innerHTML = '';
    state.history.forEach((h, i) => {
      log.innerHTML += `
        <div class="summary-row">
          <div class="summary-content">
            <strong>Lvl ${i + 1}: ${h.q}</strong><br>
            <span>Your Equation: ${h.ans}</span><br>
            ${!h.isCorrect ? `<small style="color:var(--primary); font-weight:700">Correct: ${h.hint}</small>` : ''}
          </div>
          <div class="summary-status">${h.isCorrect ? '✅' : '❌'}</div>
        </div>`;
    });

    localStorage.setItem('ea_best', Math.max(state.score, localStorage.getItem('ea_best') || 0));
    localStorage.setItem('ea_last', state.score);
  }

  function findLinearSol(ns, t, os) {
    const permutations = arr => {
      if (arr.length <= 1) return [arr];
      let res = [];
      for (let i = 0; i < arr.length; i++) {
        let rest = permutations([...arr.slice(0, i), ...arr.slice(i + 1)]);
        for (let r of rest) res.push([arr[i], ...r]);
      }
      return res;
    };

    const numsPerms = permutations(ns);
    for (let p of numsPerms) {
      const opCombs = n => {
        if (n === 0) return [[]];
        let res = [];
        for (let o of os) {
          for (let c of opCombs(n - 1)) res.push([o, ...c]);
        }
        return res;
      };

      for (let ops of opCombs(p.length - 1)) {
        let val = p[0], str = p[0].toString();
        for (let i = 0; i < ops.length; i++) {
          const o = ops[i], next = p[i + 1];
          if (o === '+') val += next;
          else if (o === '-') val -= next;
          else if (o === '*') val *= next;
          else if (o === '/') {
            if (next === 0) { val = NaN; break; }
            val /= next;
          }
          str += ` ${o} ${next}`;
        }
        if (Math.abs(val - t) < 0.1) return str;
      }
    }
    return null;
  }

  function renderPools() {
    const np = document.getElementById('num-pool'), op = document.getElementById('op-pool');
    np.innerHTML = '';
    op.innerHTML = '';
    state.nums.forEach((n, i) => {
      const b = document.createElement('div');
      b.className = 'block';
      b.innerText = n;
      b.onclick = () => {
        if (!state.usedIdx.includes(i)) {
          if (window.KZAudio) KZAudio.playClick();
          state.userEq.push({ v: n, i });
          state.usedIdx.push(i);
          updateUI();
        }
      };
      np.appendChild(b);
    });

    cfg.diff[state.diff].ops.forEach(o => {
      const b = document.createElement('div');
      b.className = 'block op';
      b.innerText = o;
      b.onclick = () => {
        if (state.userEq.length % 2 !== 0) {
          if (window.KZAudio) KZAudio.playClick();
          state.userEq.push({ v: o, i: -1 });
          updateUI();
        }
      };
      op.appendChild(b);
    });
  }

  function undoLast() {
    const l = state.userEq.pop();
    if (l && l.i !== -1) {
      state.usedIdx = state.usedIdx.filter(x => x !== l.i);
    }
    updateUI();
  }

  function clearEq() {
    state.userEq = [];
    state.usedIdx = [];
    updateUI();
  }

  function switchScreen(id) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  function revealSol() {
    alert("Architect's Solution: " + state.solutionStr);
  }

  window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('best-stat').innerText = `${localStorage.getItem('ea_best') || 0}/5`;
    document.getElementById('last-stat').innerText = `${localStorage.getItem('ea_last') || 0}/5`;

    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('clear-btn').addEventListener('click', clearEq);
    document.getElementById('check-btn').addEventListener('click', checkSol);
    document.getElementById('hint-btn').addEventListener('click', revealSol);
    document.getElementById('skip-btn').addEventListener('click', skipLevel);
    document.getElementById('workspace-strip').addEventListener('click', undoLast);
    document.getElementById('play-again').addEventListener('click', () => location.reload());
    document.getElementById('print-btn').addEventListener('click', () => window.print());

    document.getElementById('reset-btn').addEventListener('click', () => {
      localStorage.removeItem('ea_best');
      localStorage.removeItem('ea_last');
      document.getElementById('best-stat').innerText = '0/5';
      document.getElementById('last-stat').innerText = '0/5';
      alert('Progress reset!');
    });
  });
})();
