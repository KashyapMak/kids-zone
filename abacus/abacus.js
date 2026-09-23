/**
 * Abacus Trail - Interactive Visualization & Arithmetic Logic
 */
(function () {
  'use strict';

  const PLACES = ['B', 'HM', 'TM', 'M', 'HT', 'TT', 'Th', 'H', 'T', 'O'];
  const PLACE_FULL = ['Billions', 'H-Mill', 'T-Mill', 'Millions', 'H-Thou', 'T-Thou', 'Thousands', 'Hundreds', 'Tens', 'Ones'];
  let mode = 'represent';

  const tips = {
    represent: '💡 Type a number and watch the abacus beads snap into place!',
    add: '💡 Enter two numbers. The abacus shows the first, then adds the second!',
    sub: '💡 Enter two numbers. The abacus shows the first, then subtracts the second!'
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function beep(type) {
    if (!window.KZAudio) return;
    if (type === 'ok') KZAudio.playOk();
    else if (type === 'tick') KZAudio.playTick();
    else KZAudio.playClick();
  }

  function buildAbacus() {
    let html = '';
    for (let i = 0; i < 10; i++) {
      html += `
      <div class="col c${i}" id="c${i}">
        <div class="place-label">${PLACE_FULL[i]}</div>
        <div class="rod"></div>
        <div class="centre-bar"></div>
        <div class="bead heaven" id="c${i}h">5</div>
        <div class="bead e1"    id="c${i}e1">1</div>
        <div class="bead e2"    id="c${i}e2">1</div>
        <div class="bead e3"    id="c${i}e3">1</div>
        <div class="bead e4"    id="c${i}e4">1</div>
        <div class="digit-label" id="dl${i}">0</div>
      </div>`;
    }
    const container = document.getElementById('abacus');
    if (container) container.innerHTML = html;
  }

  function update(num) {
    const digits = Math.abs(Math.round(num)).toString().padStart(10, '0');
    digits.split('').forEach((d, i) => {
      let v = parseInt(d, 10);
      ['h', 'e1', 'e2', 'e3', 'e4'].forEach(k => {
        const el = document.getElementById(`c${i}${k}`);
        if (el) el.classList.remove('active');
      });
      if (v >= 5) {
        const hEl = document.getElementById(`c${i}h`);
        if (hEl) hEl.classList.add('active');
        v -= 5;
      }
      for (let e = 1; e <= v; e++) {
        const eEl = document.getElementById(`c${i}e${e}`);
        if (eEl) eEl.classList.add('active');
      }
      const label = document.getElementById(`dl${i}`);
      if (label) label.textContent = d;
    });
  }

  async function startTrail() {
    const n1 = parseInt(document.getElementById('num1').value, 10) || 0;
    const n2 = parseInt(document.getElementById('num2').value, 10) || 0;
    const stepBar = document.getElementById('step-bar');
    const stepDisp = document.getElementById('step-display');
    const resultDisp = document.getElementById('result-display');
    resultDisp.className = '';
    resultDisp.textContent = '';
    stepDisp.textContent = '';

    if (mode === 'represent') {
      stepBar.classList.add('hidden');
      update(n1);
      stepDisp.textContent = `Showing ${n1.toLocaleString()} on the abacus`;
      resultDisp.textContent = `${n1.toLocaleString()} 🎯`;
      resultDisp.classList.add('pop');
      beep('ok');
      return;
    }

    stepBar.classList.remove('hidden');

    setDot(0);
    update(n1);
    stepDisp.textContent = `Step 1: Show ${n1.toLocaleString()} on the abacus`;
    beep('tick');
    await sleep(1400);

    setDot(1);
    stepDisp.textContent = `Step 2: Now ${mode === 'add' ? 'adding' : 'subtracting'} ${n2.toLocaleString()}…`;
    beep('tick');
    await sleep(900);

    setDot(2);
    const result = mode === 'add' ? n1 + n2 : n1 - n2;
    update(result);
    const sym = mode === 'add' ? '+' : '−';
    stepDisp.textContent = `Step 3: Done! 🎉`;
    resultDisp.textContent = `${n1.toLocaleString()} ${sym} ${n2.toLocaleString()} = ${result.toLocaleString()} 🎉`;
    resultDisp.classList.add('pop');
    beep('ok');

    if (window.KZ) {
      KZ.confetti({ count: 90, spread: 65 });
    }
  }

  function setDot(idx) {
    document.querySelectorAll('.step-dot').forEach((d, i) => {
      d.className = 'step-dot' + (i < idx ? ' done' : i === idx ? ' active' : '');
    });
  }

  function setMode(m, btn) {
    mode = m;
    document.querySelectorAll('.trail-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const n2w = document.getElementById('num2-wrap');
    const ob = document.getElementById('op-badge');
    if (m === 'represent') {
      n2w.classList.add('hidden');
      ob.classList.add('hidden');
    } else {
      n2w.classList.remove('hidden');
      ob.classList.remove('hidden');
      ob.textContent = m === 'add' ? '+' : '−';
    }
    document.getElementById('mode-tip').textContent = tips[m];
    document.getElementById('step-bar').classList.add('hidden');
    document.getElementById('step-display').textContent = '';
    document.getElementById('result-display').textContent = '';
    update(0);
  }

  window.addEventListener('DOMContentLoaded', () => {
    buildAbacus();
    update(0);

    document.querySelectorAll('.trail-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const m = e.currentTarget.dataset.mode;
        setMode(m, e.currentTarget);
      });
    });

    document.getElementById('start-btn').addEventListener('click', startTrail);

    document.addEventListener('keydown', e => {
      if (e.key === 'Enter') startTrail();
    });
  });
})();
