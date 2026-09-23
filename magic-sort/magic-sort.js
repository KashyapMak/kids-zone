/**
 * Magic Sort - Color Sorting Puzzle Engine
 */
(function () {
  'use strict';

  const CAP = 4;
  const SAVE = 'kidsZone_magicSort_save_v5';
  const COLORS = ['#ff1744', '#2979ff', '#00e676', '#ffea00', '#d500f9', '#ff6d00', '#00e5ff', '#76ff03'];

  const $ = id => document.getElementById(id);
  const screens = {
    setup: $('setupScreen'),
    game: $('gameScreen'),
    result: $('resultScreen')
  };

  const st = {
    difficulty: 'easy',
    mode: 'practice',
    level: 1,
    tubes: [],
    initial: [],
    history: [],
    selected: null,
    anim: false,
    moves: 0,
    timeoutLevel: null,
    timer: { id: null, total: 0, remaining: 0 }
  };

  const clone = o => JSON.parse(JSON.stringify(o));
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  function show(k) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[k].classList.add('active');
  }

  function toast(m) {
    const t = $('toast');
    t.textContent = m;
    t.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('show'), 1800);
  }

  function hasSave() {
    try { return !!localStorage.getItem(SAVE); } catch (e) { return false; }
  }

  function updateBtns() {
    const h = hasSave();
    $('continueBtn').classList.toggle('hidden', !h);
    $('resetBtn').classList.toggle('hidden', !h);
  }

  function save() {
    try {
      localStorage.setItem(SAVE, JSON.stringify({
        level: st.level,
        difficulty: st.difficulty,
        mode: st.mode
      }));
    } catch (e) {}
    updateBtns();
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(SAVE) || 'null'); } catch (e) { return null; }
  }

  function resetSave() {
    try { localStorage.removeItem(SAVE); } catch (e) {}
    updateBtns();
  }

  function beep(type) {
    if (!window.KZAudio) return;
    if (type === 'select') KZAudio.playClick();
    else if (type === 'pour') KZAudio.playTick();
    else if (type === 'error') KZAudio.playWrong();
    else if (type === 'win') KZAudio.playOk();
    else if (type === 'fail') KZAudio.playWrong();
  }

  function cfg() {
    const n = Math.min(8, Math.max(2, st.level + 1));
    let e = 2;
    if (st.difficulty === 'hard') e = 1;
    if (st.difficulty === 'easy' && n >= 6) e = 3;
    return { numColors: n, extraEmpty: e };
  }

  function timeFor() {
    const c = cfg().numColors;
    let sec = 75 + c * 18 + Math.min(50, st.level * 4);
    if (st.difficulty === 'medium') sec *= 0.86;
    if (st.difficulty === 'hard') sec *= 0.74;
    return Math.max(50, Math.round(sec));
  }

  function complete(t) {
    return t.length === CAP && t.every(x => x === t[0]);
  }

  function solved(tubes) {
    return tubes.every(t => t.length === 0 || complete(t));
  }

  function can(tubes, s, t) {
    if (s === t) return false;
    const S = tubes[s], T = tubes[t];
    if (!S || !T || !S.length || T.length >= CAP) return false;
    return !T.length || S[S.length - 1] === T[T.length - 1];
  }

  function apply(tubes, s, t) {
    const S = tubes[s], T = tubes[t], c = S[S.length - 1];
    let k = 0;
    for (let i = S.length - 1; i >= 0 && S[i] === c; i--) k++;
    const n = Math.min(k, CAP - T.length);
    for (let i = 0; i < n; i++) T.push(S.pop());
    return n;
  }

  function hasComplete(tubes) {
    return tubes.some(t => complete(t));
  }

  function hasMixed(tubes) {
    return tubes.some(t => t.length > 0 && !complete(t));
  }

  function generateLevel(numColors, extraEmpty) {
    for (let build = 0; build < 60; build++) {
      const tubes = [];
      for (let i = 0; i < numColors; i++) tubes.push(Array(CAP).fill(COLORS[i]));
      for (let i = 0; i < extraEmpty; i++) tubes.push([]);

      let last = null, done = 0, target = rnd(180, 240);
      for (let tries = 0; tries < target * 16 && done < target; tries++) {
        let moves = [];
        for (let s = 0; s < tubes.length; s++) {
          for (let t = 0; t < tubes.length; t++) {
            if (!can(tubes, s, t)) continue;
            const S = tubes[s], T = tubes[t];
            if (last && last.s === t && last.t === s && Math.random() < 0.90) continue;
            if (complete(S) && T.length === 0 && Math.random() < 0.82) continue;
            moves.push({ s, t });
          }
        }
        if (!moves.length) {
          for (let s = 0; s < tubes.length; s++) {
            for (let t = 0; t < tubes.length; t++) {
              if (can(tubes, s, t)) moves.push({ s, t });
            }
          }
        }
        if (!moves.length) break;
        const m = moves[rnd(0, moves.length - 1)];
        apply(tubes, m.s, m.t);
        last = m;
        done++;
      }
      if (tubes.some(t => t.length) && !solved(tubes) && !hasComplete(tubes) && hasMixed(tubes)) {
        return tubes;
      }
    }

    const tubes = Array.from({ length: numColors + extraEmpty }, () => []), layers = [];
    for (let c = 0; c < numColors; c++) {
      for (let k = 0; k < CAP; k++) layers.push(COLORS[c]);
    }
    for (let i = layers.length - 1; i > 0; i--) {
      const j = rnd(0, i);
      [layers[i], layers[j]] = [layers[j], layers[i]];
    }
    let idx = 0;
    for (const color of layers) {
      for (let step = 0; step < tubes.length; step++) {
        const ti = (idx + step) % tubes.length;
        if (tubes[ti].length < CAP) {
          tubes[ti].push(color);
          idx = ti + 1;
          break;
        }
      }
    }
    return tubes;
  }

  function render() {
    const g = $('tubesGrid');
    g.innerHTML = '';
    st.tubes.forEach((tube, i) => {
      const b = document.createElement('button');
      b.className = 'tube';
      b.dataset.i = i;
      b.type = 'button';
      b.innerHTML = '<div class="neck"></div><div class="body"><div class="stack"></div><div class="shine"></div><div class="shine2"></div></div>';
      const stack = b.querySelector('.stack');
      tube.forEach((c, j) => {
        const l = document.createElement('div');
        l.className = 'liq';
        l.style.background = `linear-gradient(180deg, ${c} 0%, ${c} 62%, ${c}dd 100%)`;
        l.style.animationDelay = j * 18 + 'ms';
        stack.appendChild(l);
      });
      if (complete(tube)) b.classList.add('complete');
      if (st.selected === i) b.classList.add('selected');
      b.onclick = () => clickTube(i, b);
      g.appendChild(b);
    });
    $('moveLabel').textContent = 'Moves: ' + st.moves;
  }

  const node = i => document.querySelector(`.tube[data-i="${i}"]`);

  function invalid(n) {
    if (n) {
      n.classList.add('invalid');
      setTimeout(() => n.classList.remove('invalid'), 380);
    }
  }

  function stream(a, b, c) {
    if (!a || !b) return;
    const A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
    const sx = A.left + A.width / 2, sy = A.top + 18;
    const tx = B.left + B.width / 2, ty = B.top + 20;
    const dx = tx - sx, dy = ty - sy;
    const len = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx) * 180 / Math.PI - 90;

    const el = document.createElement('div');
    el.className = 'stream';
    el.style.left = sx + 'px';
    el.style.top = sy + 'px';
    el.style.background = c;
    el.style.transform = `rotate(${ang}deg)`;
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transition = 'height .22s ease-out, opacity .18s ease .34s';
      el.style.height = len + 'px';
      el.style.opacity = '0';
    });
    setTimeout(() => el.remove(), 620);
  }

  function clickTube(i, n) {
    if (st.anim) return;
    if (st.selected === null) {
      if (!st.tubes[i].length) {
        beep('error');
        invalid(n);
        toast('Pick a tube with potion first');
        return;
      }
      st.selected = i;
      beep('select');
      render();
      return;
    }
    if (st.selected === i) {
      st.selected = null;
      beep('select');
      render();
      return;
    }
    if (!can(st.tubes, st.selected, i)) {
      beep('error');
      invalid(n);
      return;
    }
    pour(st.selected, i);
  }

  function pour(s, t) {
    const c = st.tubes[s][st.tubes[s].length - 1];
    const sn = node(s), tn = node(t);
    st.history.push({ tubes: clone(st.tubes), moves: st.moves });
    st.anim = true;
    st.selected = null;
    if (sn) sn.style.transform = 'translateY(-32px) rotate(-15deg)';
    stream(sn, tn, c);
    beep('pour');
    setTimeout(() => {
      apply(st.tubes, s, t);
      st.moves++;
      st.anim = false;
      render();
      if (solved(st.tubes)) setTimeout(win, 280);
    }, 520);
  }

  function startLevel() {
    stopTimer();
    const c = cfg();
    st.tubes = generateLevel(c.numColors, c.extraEmpty);
    st.initial = clone(st.tubes);
    st.history = [];
    st.selected = null;
    st.anim = false;
    st.moves = 0;
    st.timeoutLevel = null;
    $('levelLabel').textContent = 'Level ' + st.level;
    render();
    save();
    show('game');
    if (st.mode === 'timed') startTimer(timeFor());
    else $('timerWrap').classList.add('hidden');
  }

  function restart() {
    stopTimer();
    if (!st.initial.length) { startLevel(); return; }
    st.tubes = clone(st.initial);
    st.history = [];
    st.selected = null;
    st.anim = false;
    st.moves = 0;
    $('levelLabel').textContent = 'Level ' + st.level;
    render();
    show('game');
    if (st.mode === 'timed') startTimer(timeFor());
    else $('timerWrap').classList.add('hidden');
  }

  function undo() {
    if (st.anim) return;
    const h = st.history.pop();
    if (!h) {
      beep('error');
      toast('No moves to undo');
      return;
    }
    st.tubes = clone(h.tubes);
    st.moves = h.moves;
    st.selected = null;
    beep('select');
    render();
  }

  function stopTimer() {
    if (st.timer.id) clearInterval(st.timer.id);
    st.timer.id = null;
  }

  function updateTimer() {
    const r = Math.max(0, st.timer.remaining);
    const pct = st.timer.total ? (r / st.timer.total) * 100 : 0;
    const f = $('timerFill');
    f.style.width = pct + '%';
    f.classList.toggle('low', pct < 40 && pct >= 15);
    f.classList.toggle('critical', pct < 15);
    $('timerText').textContent =
      String(Math.floor(r / 60)).padStart(2, '0') + ':' + String(r % 60).padStart(2, '0');
  }

  function startTimer(sec) {
    stopTimer();
    st.timer.total = sec;
    st.timer.remaining = sec;
    $('timerWrap').classList.remove('hidden');
    updateTimer();
    st.timer.id = setInterval(() => {
      st.timer.remaining--;
      updateTimer();
      if (st.timer.remaining > 0 && st.timer.remaining <= 5) beep('tick');
      if (st.timer.remaining <= 0) timeout();
    }, 1000);
  }

  function win() {
    stopTimer();
    beep('win');
    if (window.KZ) KZ.confetti({ count: 120, spread: 70 });
    const completed = st.level;
    st.level++;
    save();
    setTimeout(() => result(true, completed), 850);
  }

  function timeout() {
    if (st.timeoutLevel === st.level) return;
    st.timeoutLevel = st.level;
    stopTimer();
    beep('fail');
    result(false, st.level);
  }

  function result(ok, lvl) {
    $('resultIcon').textContent = ok ? '🏆' : '⏰';
    $('resultTitle').textContent = ok ? 'Level Complete!' : 'Time Up!';
    $('resultSubtitle').textContent = ok ? 'Amazing sorting skills!' : 'Retry a fresh puzzle or restart the same one.';
    $('resultLevel').textContent = lvl;
    $('nextLevelBtn').classList.toggle('hidden', !ok);
    $('retryBtn').classList.toggle('hidden', ok);

    if (window.KZ && KZ.recordScore && ok) {
      KZ.recordScore({
        gameId: 'magic-sort',
        score: lvl,
        total: lvl,
        accuracy: 100,
        mode: `Level ${lvl}`,
        durationSec: (st.totalSec && st.sec !== undefined) ? Math.max(0, st.totalSec - st.sec) : 60
      });
    }
    $('resultRestartBtn').classList.toggle('hidden', ok);
    show('result');
  }

  function bindGroup(id, fn) {
    document.querySelectorAll('#' + id + ' .chip').forEach(ch => {
      ch.onclick = () => {
        document.querySelectorAll('#' + id + ' .chip').forEach(c => c.classList.remove('active'));
        ch.classList.add('active');
        fn(ch.dataset.value);
        beep('select');
      };
    });
  }

  function sync(id, v) {
    document.querySelectorAll('#' + id + ' .chip').forEach(c => {
      c.classList.toggle('active', c.dataset.value === v);
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    updateBtns();
    bindGroup('difficultyGroup', v => { st.difficulty = v; });
    bindGroup('modeGroup', v => { st.mode = v; });

    $('startBtn').onclick = () => {
      st.level = 1;
      startLevel();
    };

    $('continueBtn').onclick = () => {
      const sv = load();
      if (!sv) {
        beep('error');
        toast('No saved progress found');
        updateBtns();
        return;
      }
      st.level = Math.max(1, +sv.level || 1);
      st.difficulty = ['easy', 'medium', 'hard'].includes(sv.difficulty) ? sv.difficulty : 'easy';
      st.mode = ['practice', 'timed'].includes(sv.mode) ? sv.mode : 'practice';
      sync('difficultyGroup', st.difficulty);
      sync('modeGroup', st.mode);
      startLevel();
    };

    $('resetBtn').onclick = () => {
      resetSave();
      beep('select');
      toast('Progress reset');
    };

    $('undoBtn').onclick = undo;
    $('restartBtn').onclick = restart;
    $('quitBtn').onclick = () => {
      stopTimer();
      updateBtns();
      show('setup');
    };

    $('nextLevelBtn').onclick = startLevel;
    $('retryBtn').onclick = startLevel;
    $('resultRestartBtn').onclick = restart;
    $('homeBtn').onclick = () => {
      stopTimer();
      updateBtns();
      show('setup');
    };

    document.addEventListener('keydown', e => {
      if (!screens.game.classList.contains('active')) return;
      if (e.key.toLowerCase() === 'z') undo();
      if (e.key.toLowerCase() === 'r') restart();
      if (e.key === 'Escape' && st.selected !== null) {
        st.selected = null;
        render();
      }
    });
  });
})();
