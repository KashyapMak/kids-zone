/**
 * Seesaw Battle Quiz Arena - Game Engine
 * Supports:
 * - Side-by-Side Dual (Simultaneous Real-Time Race)
 * - Pass & Play Turns (Turn-by-turn alternation)
 * - Seesaw Dynamic Tilt & Bounce Physics based on score
 */

(function () {
  'use strict';

  let match = null;
  let questionsPool = [];
  let t1Questions = [];
  let t2Questions = [];

  let isDualMode = true;
  let halfRounds = 5;

  // Pass & Play Mode state
  let round = 0;
  let currentTurnTeam = 't1'; // 't1' or 't2'
  let isTransitioning = false;
  let currentQSelectedAnswer = null;

  // Dual Mode state
  let t1Index = 0;
  let t2Index = 0;
  let t1Transitioning = false;
  let t2Transitioning = false;

  // Shared match state
  let t1Score = 0;
  let t2Score = 0;
  let t1Log = [];
  let t2Log = [];

  // DOM Elements
  const elBattleContainer = document.getElementById('battle-container');
  const elReviewContainer = document.getElementById('review-container');
  const elSeesawPlank = document.getElementById('seesaw-plank');
  const elSeesawStage = document.getElementById('seesaw-stage');
  const elSeesawStatus = document.getElementById('seesaw-status-label');
  const elT1GaugeLabel = document.getElementById('t1-gauge-label');
  const elT2GaugeLabel = document.getElementById('t2-gauge-label');
  const elT1Rider = document.getElementById('t1-seesaw-char');
  const elT2Rider = document.getElementById('t2-seesaw-char');

  const elT1Score = document.getElementById('t1-score-val');
  const elT2Score = document.getElementById('t2-score-val');
  const elRoundDisplay = document.getElementById('match-round-display');

  // Dual Arena Elements
  const elDualArenaContainer = document.getElementById('dual-arena-container');
  const elT1DualPanel = document.getElementById('t1-dual-panel');
  const elT2DualPanel = document.getElementById('t2-dual-panel');
  const elKbdHelper = document.getElementById('kbd-helper-bar');
  const elT1DualName = document.getElementById('t1-dual-name');
  const elT1DualAvatar = document.getElementById('t1-dual-avatar');
  const elT1DualQNum = document.getElementById('t1-dual-qnum');
  const elT1DualScore = document.getElementById('t1-dual-score');
  const elT1DualQText = document.getElementById('t1-dual-qtext');
  const elT1DualOptions = document.getElementById('t1-dual-options');
  const elT1DualFeedback = document.getElementById('t1-dual-feedback');

  const elT2DualName = document.getElementById('t2-dual-name');
  const elT2DualAvatar = document.getElementById('t2-dual-avatar');
  const elT2DualQNum = document.getElementById('t2-dual-qnum');
  const elT2DualScore = document.getElementById('t2-dual-score');
  const elT2DualQText = document.getElementById('t2-dual-qtext');
  const elT2DualOptions = document.getElementById('t2-dual-options');
  const elT2DualFeedback = document.getElementById('t2-dual-feedback');

  // Pass & Play Elements
  const elPassContainer = document.getElementById('pass-turn-container');
  const elQuestionCard = document.getElementById('question-card');
  const elTurnBanner = document.getElementById('turn-banner');
  const elTurnAvatar = document.getElementById('turn-avatar');
  const elTurnMsg = document.getElementById('turn-message');
  const elQText = document.getElementById('question-text');
  const elQNumBadge = document.getElementById('question-num-badge');
  const elQTeamBadge = document.getElementById('question-team-badge');
  const elOptionsGrid = document.getElementById('options-grid');
  const elFeedback = document.getElementById('feedback-msg');

  /* ========================================================
   * AUDIO BUZZER & SUCCESS CHIME SYNTHESIZER
   * ======================================================== */
  function playWrongBuzzSound() {
    if (window.KZAudio) {
      if (KZAudio.isMuted && KZAudio.isMuted()) return;
      if (KZAudio.playWrong) KZAudio.playWrong();
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._kzBuzzAudioCtx) {
        window._kzBuzzAudioCtx = new AudioCtx();
      }
      const ctx = window._kzBuzzAudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.linearRampToValueAtTime(105, now + 0.25);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(145, now);
      osc2.frequency.linearRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.015);
      gain.gain.setValueAtTime(0.18, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.33);
      osc2.stop(now + 0.33);
    } catch (e) {}
  }

  function playRightChimeSound() {
    if (window.KZAudio) {
      if (KZAudio.isMuted && KZAudio.isMuted()) return;
      if (KZAudio.playOk) KZAudio.playOk();
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._kzBuzzAudioCtx) {
        window._kzBuzzAudioCtx = new AudioCtx();
      }
      const ctx = window._kzBuzzAudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.05;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.18, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.18);
      });
    } catch (e) {}
  }

  function triggerWrongAnswerBuzz(btnEl, cardEl) {
    playWrongBuzzSound();

    if (btnEl) {
      btnEl.classList.remove('buzz-wrong');
      void btnEl.offsetWidth; // Force CSS reflow to re-trigger vibration
      btnEl.classList.add('buzz-wrong');
      btnEl.disabled = true;

      const prefix = btnEl.querySelector('.option-prefix, .dual-key-badge');
      if (prefix) {
        prefix.textContent = '✕';
      }
    }

    if (cardEl) {
      cardEl.classList.remove('card-buzz-shake');
      void cardEl.offsetWidth;
      cardEl.classList.add('card-buzz-shake');
      setTimeout(() => cardEl.classList.remove('card-buzz-shake'), 500);
    }
  }

  function triggerCorrectAnswerEffect(btnEl, cardEl) {
    playRightChimeSound();

    if (btnEl) {
      btnEl.classList.remove('pop-correct');
      void btnEl.offsetWidth; // Force CSS reflow to re-trigger spring pop
      btnEl.classList.add('pop-correct');

      const prefix = btnEl.querySelector('.option-prefix, .dual-key-badge');
      if (prefix) {
        prefix.textContent = '✓';
      }
    }

    if (cardEl) {
      cardEl.classList.remove('card-correct-glow');
      void cardEl.offsetWidth;
      cardEl.classList.add('card-correct-glow');
      setTimeout(() => cardEl.classList.remove('card-correct-glow'), 650);
    }
  }

  // Initialize
  async function init() {
    let savedMatch = null;
    try {
      const raw = sessionStorage.getItem('kz_tug_match');
      if (raw) savedMatch = JSON.parse(raw);
    } catch (e) {}

    if (savedMatch && savedMatch.questions && savedMatch.questions.length >= 2) {
      match = savedMatch;
    } else {
      // Default fallback match
      match = {
        quizId: 'science-nature',
        quizTitle: 'Science & Nature Explorers',
        quizSubject: 'Science & Nature',
        mode: 'dual',
        team1: { name: 'Red Dragons', avatar: '🦁', color: '#ef4444' },
        team2: { name: 'Blue Sharks', avatar: '🦈', color: '#3b82f6' },
        countReq: 10,
        questions: []
      };
      try {
        const res = await fetch('quiz/science-nature.json');
        const data = await res.json();
        match.questions = data.questions;
      } catch (err) {
        console.error('Failed to load fallback questions:', err);
      }
    }

    isDualMode = match.mode !== 'pass-play';

    setupMatchData();
    renderScoreboard();

    if (isDualMode) {
      if (elDualArenaContainer) elDualArenaContainer.style.display = 'grid';
      if (elKbdHelper) elKbdHelper.style.display = 'flex';
      if (elPassContainer) elPassContainer.style.display = 'none';
      renderDualT1();
      renderDualT2();
    } else {
      if (elDualArenaContainer) elDualArenaContainer.style.display = 'none';
      if (elKbdHelper) elKbdHelper.style.display = 'none';
      if (elPassContainer) elPassContainer.style.display = 'block';
      showPassPlayQuestion();
    }
  }

  function setupMatchData() {
    const t1NameEl = document.getElementById('t1-score-name');
    const t1AvatarEl = document.getElementById('t1-score-avatar');
    if (t1NameEl) t1NameEl.textContent = match.team1.name;
    if (t1AvatarEl) t1AvatarEl.textContent = match.team1.avatar;
    if (elT1Rider) elT1Rider.textContent = match.team1.avatar;
    if (elT1GaugeLabel) elT1GaugeLabel.textContent = `◀ ${match.team1.name} (0 pts)`;

    const t2NameEl = document.getElementById('t2-score-name');
    const t2AvatarEl = document.getElementById('t2-score-avatar');
    if (t2NameEl) t2NameEl.textContent = match.team2.name;
    if (t2AvatarEl) t2AvatarEl.textContent = match.team2.avatar;
    if (elT2Rider) elT2Rider.textContent = match.team2.avatar;
    if (elT2GaugeLabel) elT2GaugeLabel.textContent = `${match.team2.name} (0 pts) ▶`;

    const topicEl = document.getElementById('quiz-topic-badge');
    if (topicEl) topicEl.textContent = match.quizTitle || match.quizSubject;

    // Dual elements labels
    if (elT1DualName) elT1DualName.textContent = match.team1.name;
    if (elT1DualAvatar) elT1DualAvatar.textContent = match.team1.avatar;
    if (elT2DualName) elT2DualName.textContent = match.team2.name;
    if (elT2DualAvatar) elT2DualAvatar.textContent = match.team2.avatar;

    // Shuffle questions
    const shuffled = [...match.questions].sort(() => Math.random() - 0.5);

    // Determine total questions (must be even so both teams get equal count)
    let desired = match.countReq === 'all' ? shuffled.length : parseInt(match.countReq, 10) || 10;
    let evenCount = Math.floor(Math.min(desired, shuffled.length) / 2) * 2;
    if (evenCount < 2) evenCount = 2;

    halfRounds = evenCount / 2;
    t1Questions = shuffled.slice(0, halfRounds);
    t2Questions = shuffled.slice(halfRounds, evenCount);

    round = 0;
    t1Index = 0;
    t2Index = 0;
    currentTurnTeam = 't1';
    t1Score = 0;
    t2Score = 0;
    t1Log = [];
    t2Log = [];
    isTransitioning = false;
    t1Transitioning = false;
    t2Transitioning = false;

    updateSeesawVisual();
  }

  function renderScoreboard() {
    elT1Score.textContent = t1Score;
    elT2Score.textContent = t2Score;
    if (isDualMode) {
      elRoundDisplay.textContent = `Race Mode (${halfRounds} Qs each)`;
    } else {
      elRoundDisplay.textContent = `Round ${round + 1} of ${halfRounds}`;
    }
  }

  function updateSeesawVisual() {
    const diff = t1Score - t2Score;
    const maxTilt = 14;
    // When Team 1 leads (diff > 0), left end tilts down (counterclockwise: -deg)
    // When Team 2 leads (diff < 0), right end tilts down (clockwise: +deg)
    const tiltAngle = Math.max(-maxTilt, Math.min(maxTilt, -diff * 3.5));

    if (elSeesawPlank) {
      elSeesawPlank.style.setProperty('--tilt', `${tiltAngle}deg`);
      elSeesawPlank.style.transform = `translate(-50%, -50%) rotate(${tiltAngle}deg)`;
    }

    if (elT1GaugeLabel) elT1GaugeLabel.textContent = `◀ ${match.team1.name} (${t1Score} pts)`;
    if (elT2GaugeLabel) elT2GaugeLabel.textContent = `${match.team2.name} (${t2Score} pts) ▶`;

    if (elSeesawStatus) {
      if (diff === 0) {
        elSeesawStatus.textContent = `⚖️ Seesaw Balanced in Center (${t1Score} - ${t2Score})`;
      } else if (diff > 0) {
        elSeesawStatus.textContent = `🎈 ${match.team1.name} tilting down with +${diff} point${diff > 1 ? 's' : ''} lead!`;
      } else {
        elSeesawStatus.textContent = `🎈 ${match.team2.name} tilting down with +${Math.abs(diff)} point${Math.abs(diff) > 1 ? 's' : ''} lead!`;
      }
    }
  }

  /* ========================================================
   * MODE 1: SIDE-BY-SIDE DUAL (SIMULTANEOUS RACE)
   * ======================================================== */

  function renderDualT1() {
    t1Transitioning = false;
    if (elT1DualScore) elT1DualScore.textContent = `${t1Score} pts`;

    if (t1Index >= halfRounds) {
      elT1DualQNum.textContent = 'Finished!';
      elT1DualQText.innerHTML = '🎉 <strong>All questions completed!</strong> Waiting for match conclusion...';
      elT1DualOptions.innerHTML = '';
      elT1DualFeedback.textContent = 'Team 1 has answered all questions!';
      const skipBtn = document.getElementById('t1-dual-skip-btn');
      if (skipBtn) skipBtn.disabled = true;
      checkDualMatchFinished();
      return;
    }

    const q = t1Questions[t1Index];
    elT1DualQNum.textContent = `Q ${t1Index + 1}/${halfRounds}`;
    elT1DualQText.textContent = q.question;
    elT1DualFeedback.textContent = 'Select option:';
    elT1DualFeedback.style.color = 'var(--muted)';

    const badges = ['1', '2', '3', '4'];
    elT1DualOptions.innerHTML = q.options.map((opt, idx) => `
      <button type="button" class="dual-option-btn" id="t1-dual-opt-${idx}" onclick="handleDualPick('t1', ${idx})">
        <span class="dual-key-badge">${badges[idx]}</span>
        <span style="flex: 1;">${opt}</span>
      </button>
    `).join('');

    const skipBtn = document.getElementById('t1-dual-skip-btn');
    if (skipBtn) skipBtn.disabled = false;
  }

  function renderDualT2() {
    t2Transitioning = false;
    if (elT2DualScore) elT2DualScore.textContent = `${t2Score} pts`;

    if (t2Index >= halfRounds) {
      elT2DualQNum.textContent = 'Finished!';
      elT2DualQText.innerHTML = '🎉 <strong>All questions completed!</strong> Waiting for match conclusion...';
      elT2DualOptions.innerHTML = '';
      elT2DualFeedback.textContent = 'Team 2 has answered all questions!';
      const skipBtn = document.getElementById('t2-dual-skip-btn');
      if (skipBtn) skipBtn.disabled = true;
      checkDualMatchFinished();
      return;
    }

    const q = t2Questions[t2Index];
    elT2DualQNum.textContent = `Q ${t2Index + 1}/${halfRounds}`;
    elT2DualQText.textContent = q.question;
    elT2DualFeedback.textContent = 'Select option:';
    elT2DualFeedback.style.color = 'var(--muted)';

    const badges = ['7', '8', '9', '0'];
    elT2DualOptions.innerHTML = q.options.map((opt, idx) => `
      <button type="button" class="dual-option-btn" id="t2-dual-opt-${idx}" onclick="handleDualPick('t2', ${idx})">
        <span class="dual-key-badge">${badges[idx]}</span>
        <span style="flex: 1;">${opt}</span>
      </button>
    `).join('');

    const skipBtn = document.getElementById('t2-dual-skip-btn');
    if (skipBtn) skipBtn.disabled = false;
  }

  window.handleDualPick = function (team, pickedIdx) {
    if (team === 't1') {
      if (t1Transitioning || t1Index >= halfRounds) return;
      const q = t1Questions[t1Index];
      const btn = document.getElementById(`t1-dual-opt-${pickedIdx}`);
      if (!btn || btn.disabled) return;

      const isCorrect = pickedIdx === q.answerIndex;
      if (isCorrect) {
        t1Transitioning = true;
        triggerCorrectAnswerEffect(btn, elT1DualPanel);
        document.querySelectorAll('#t1-dual-options .dual-option-btn').forEach(b => b.disabled = true);

        t1Score++;
        if (elSeesawPlank) {
          elSeesawPlank.classList.add('bounce-t1');
          setTimeout(() => elSeesawPlank.classList.remove('bounce-t1'), 650);
        }
        if (elT1Rider) {
          elT1Rider.classList.add('rider-cheer');
          setTimeout(() => elT1Rider.classList.remove('rider-cheer'), 650);
        }

        elT1DualFeedback.textContent = '🎉 Correct! Seesaw tilted down!';
        elT1DualFeedback.style.color = 'var(--ok)';

        if (window.KZ && KZ.confetti) {
          KZ.confetti({ count: 25, spread: 50, origin: { x: 0.25, y: 0.6 } });
        }

        t1Log.push({
          round: t1Index + 1,
          question: q.question,
          selectedAnswer: q.options[pickedIdx],
          correctAnswer: q.options[q.answerIndex],
          isCorrect: true,
          skipped: false,
          fact: q.fact || `Verified: ${q.options[q.answerIndex]}`
        });

        renderScoreboard();
        updateSeesawVisual();

        // If team completed all questions correctly first, they win immediately!
        if (t1Score === halfRounds) {
          setTimeout(finishMatch, 700);
        } else {
          t1Index++;
          setTimeout(renderDualT1, 350);
        }
      } else {
        // Wrong answer: intense electric buzz shake, sound & glowing ring; do NOT auto-skip!
        triggerWrongAnswerBuzz(btn, elT1DualPanel);
        elT1DualFeedback.textContent = '❌ Buzz! Wrong answer. Try another option or Skip.';
        elT1DualFeedback.style.color = '#ef4444';
      }
    } else {
      // Team 2
      if (t2Transitioning || t2Index >= halfRounds) return;
      const q = t2Questions[t2Index];
      const btn = document.getElementById(`t2-dual-opt-${pickedIdx}`);
      if (!btn || btn.disabled) return;

      const isCorrect = pickedIdx === q.answerIndex;
      if (isCorrect) {
        t2Transitioning = true;
        triggerCorrectAnswerEffect(btn, elT2DualPanel);
        document.querySelectorAll('#t2-dual-options .dual-option-btn').forEach(b => b.disabled = true);

        t2Score++;
        if (elSeesawPlank) {
          elSeesawPlank.classList.add('bounce-t2');
          setTimeout(() => elSeesawPlank.classList.remove('bounce-t2'), 650);
        }
        if (elT2Rider) {
          elT2Rider.classList.add('rider-cheer');
          setTimeout(() => elT2Rider.classList.remove('rider-cheer'), 650);
        }

        elT2DualFeedback.textContent = '🎉 Correct! Seesaw tilted down!';
        elT2DualFeedback.style.color = 'var(--ok)';

        if (window.KZ && KZ.confetti) {
          KZ.confetti({ count: 25, spread: 50, origin: { x: 0.75, y: 0.6 } });
        }

        t2Log.push({
          round: t2Index + 1,
          question: q.question,
          selectedAnswer: q.options[pickedIdx],
          correctAnswer: q.options[q.answerIndex],
          isCorrect: true,
          skipped: false,
          fact: q.fact || `Verified: ${q.options[q.answerIndex]}`
        });

        renderScoreboard();
        updateSeesawVisual();

        // If team completed all questions correctly first, they win immediately!
        if (t2Score === halfRounds) {
          setTimeout(finishMatch, 700);
        } else {
          t2Index++;
          setTimeout(renderDualT2, 350);
        }
      } else {
        // Wrong answer: intense electric buzz shake, sound & glowing ring; do NOT auto-skip!
        triggerWrongAnswerBuzz(btn, elT2DualPanel);
        elT2DualFeedback.textContent = '❌ Buzz! Wrong answer. Try another option or Skip.';
        elT2DualFeedback.style.color = '#ef4444';
      }
    }
  };

  window.skipDualTeam = function (team) {
    if (team === 't1') {
      if (t1Transitioning || t1Index >= halfRounds) return;
      if (window.KZAudio) KZAudio.playTick();
      const q = t1Questions[t1Index];

      t1Log.push({
        round: t1Index + 1,
        question: q.question,
        selectedAnswer: 'Skipped',
        correctAnswer: q.options[q.answerIndex],
        isCorrect: false,
        skipped: true,
        fact: q.fact || `Verified: ${q.options[q.answerIndex]}`
      });

      t1Index++;
      renderDualT1();
    } else {
      if (t2Transitioning || t2Index >= halfRounds) return;
      if (window.KZAudio) KZAudio.playTick();
      const q = t2Questions[t2Index];

      t2Log.push({
        round: t2Index + 1,
        question: q.question,
        selectedAnswer: 'Skipped',
        correctAnswer: q.options[q.answerIndex],
        isCorrect: false,
        skipped: true,
        fact: q.fact || `Verified: ${q.options[q.answerIndex]}`
      });

      t2Index++;
      renderDualT2();
    }
  };

  function checkDualMatchFinished() {
    if (t1Index >= halfRounds && t2Index >= halfRounds) {
      setTimeout(finishMatch, 500);
    }
  }

  // Keyboard Event Listener for Side-by-Side Dual
  window.addEventListener('keydown', (e) => {
    if (!isDualMode || !elBattleContainer || elBattleContainer.style.display === 'none') return;
    const k = e.key.toLowerCase();

    // Team 1: 1, 2, 3, 4 or a, s, d, f
    if (k === '1' || k === 'a') { e.preventDefault(); handleDualPick('t1', 0); }
    else if (k === '2' || k === 's') { e.preventDefault(); handleDualPick('t1', 1); }
    else if (k === '3' || k === 'd') { e.preventDefault(); handleDualPick('t1', 2); }
    else if (k === '4' || k === 'f') { e.preventDefault(); handleDualPick('t1', 3); }
    else if (e.code === 'Space') { e.preventDefault(); skipDualTeam('t1'); }

    // Team 2: 7, 8, 9, 0 or j, k, l, ;
    else if (k === '7' || k === 'j') { e.preventDefault(); handleDualPick('t2', 0); }
    else if (k === '8' || k === 'k') { e.preventDefault(); handleDualPick('t2', 1); }
    else if (k === '9' || k === 'l') { e.preventDefault(); handleDualPick('t2', 2); }
    else if (k === '0' || k === ';') { e.preventDefault(); handleDualPick('t2', 3); }
    else if (e.key === 'Enter') { e.preventDefault(); skipDualTeam('t2'); }
  });

  /* ========================================================
   * MODE 2: PASS & PLAY TURNS (TURN-BY-TURN ALTERNATION)
   * ======================================================== */

  function showPassPlayQuestion() {
    isTransitioning = false;
    currentQSelectedAnswer = null;

    const isT1 = currentTurnTeam === 't1';
    const currentTeam = isT1 ? match.team1 : match.team2;
    const questionsList = isT1 ? t1Questions : t2Questions;
    const qData = questionsList[round];

    if (!qData) {
      finishMatch();
      return;
    }

    renderScoreboard();

    // Turn Banner
    elTurnBanner.className = `turn-banner ${currentTurnTeam}`;
    elTurnAvatar.textContent = currentTeam.avatar;
    elTurnMsg.textContent = `${currentTeam.name}'s Turn: Answer correctly to tilt the seesaw!`;

    // Question Meta
    elQNumBadge.textContent = `Round ${round + 1} / ${halfRounds}`;
    elQTeamBadge.textContent = `${currentTeam.avatar} ${currentTeam.name}`;
    elQTeamBadge.style.color = currentTeam.color;

    elQText.textContent = qData.question;
    elFeedback.textContent = 'Choose the correct answer:';
    elFeedback.style.color = 'var(--muted)';

    if (window.KZAudio && KZAudio.isSpeakingEnabled()) {
      KZAudio.speak(qData.question);
    }

    const prefixes = ['A', 'B', 'C', 'D'];
    elOptionsGrid.innerHTML = qData.options.map((opt, idx) => `
      <button type="button" class="option-btn" id="opt-btn-${idx}" onclick="handlePassOptionClick(${idx})">
        <span class="option-prefix">${prefixes[idx]}</span>
        <span class="option-text">${opt}</span>
      </button>
    `).join('');
  }

  window.handlePassOptionClick = function (pickedIdx) {
    if (isTransitioning) return;

    const isT1 = currentTurnTeam === 't1';
    const questionsList = isT1 ? t1Questions : t2Questions;
    const qData = questionsList[round];
    const pickedBtn = document.getElementById(`opt-btn-${pickedIdx}`);

    if (!pickedBtn || pickedBtn.disabled) return;

    const correctIdx = qData.answerIndex;
    const isCorrect = pickedIdx === correctIdx;
    currentQSelectedAnswer = qData.options[pickedIdx];

    if (isCorrect) {
      isTransitioning = true;
      triggerCorrectAnswerEffect(pickedBtn, elQuestionCard);
      document.querySelectorAll('#options-grid .option-btn').forEach(b => b.disabled = true);

      elFeedback.textContent = '🎉 Correct! Seesaw tilted down!';
      elFeedback.style.color = 'var(--ok)';

      if (isT1) {
        t1Score++;
        if (elSeesawPlank) {
          elSeesawPlank.classList.add('bounce-t1');
          setTimeout(() => elSeesawPlank.classList.remove('bounce-t1'), 650);
        }
        if (elT1Rider) {
          elT1Rider.classList.add('rider-cheer');
          setTimeout(() => elT1Rider.classList.remove('rider-cheer'), 650);
        }
      } else {
        t2Score++;
        if (elSeesawPlank) {
          elSeesawPlank.classList.add('bounce-t2');
          setTimeout(() => elSeesawPlank.classList.remove('bounce-t2'), 650);
        }
        if (elT2Rider) {
          elT2Rider.classList.add('rider-cheer');
          setTimeout(() => elT2Rider.classList.remove('rider-cheer'), 650);
        }
      }

      renderScoreboard();
      updateSeesawVisual();

      if (window.KZ && KZ.confetti) {
        KZ.confetti({ count: 40, spread: 55, origin: { x: isT1 ? 0.3 : 0.7, y: 0.6 } });
      }

      const logItem = {
        round: round + 1,
        question: qData.question,
        selectedAnswer: qData.options[pickedIdx],
        correctAnswer: qData.options[correctIdx],
        isCorrect: true,
        skipped: false,
        fact: qData.fact || `Verified answer: ${qData.options[correctIdx]}`
      };
      if (isT1) t1Log.push(logItem);
      else t2Log.push(logItem);

      // Instant win if team completed all questions correctly
      const teamDoneAllCorrect = (isT1 && t1Score === halfRounds) || (!isT1 && t2Score === halfRounds);

      if (teamDoneAllCorrect) {
        setTimeout(finishMatch, 1000);
      } else {
        setTimeout(advancePassTurn, 1000);
      }
    } else {
      triggerWrongAnswerBuzz(pickedBtn, elQuestionCard);
      elFeedback.textContent = '❌ Buzz! Not quite right. Pick another option or choose Skip.';
      elFeedback.style.color = '#ef4444';
    }
  };

  // Backwards compatibility alias
  window.handleOptionClick = window.handlePassOptionClick;

  window.skipQuestion = function () {
    if (isTransitioning) return;
    isTransitioning = true;

    if (window.KZAudio) KZAudio.playTick();

    const isT1 = currentTurnTeam === 't1';
    const questionsList = isT1 ? t1Questions : t2Questions;
    const qData = questionsList[round];
    const correctIdx = qData.answerIndex;

    elFeedback.textContent = '⏭️ Question skipped. Moving to next turn (no penalty).';
    elFeedback.style.color = 'var(--muted)';

    const logItem = {
      round: round + 1,
      question: qData.question,
      selectedAnswer: currentQSelectedAnswer || 'Skipped',
      correctAnswer: qData.options[correctIdx],
      isCorrect: false,
      skipped: true,
      fact: qData.fact || `Verified answer: ${qData.options[correctIdx]}`
    };
    if (isT1) t1Log.push(logItem);
    else t2Log.push(logItem);

    document.querySelectorAll('#options-grid .option-btn').forEach(b => b.disabled = true);
    setTimeout(advancePassTurn, 800);
  };

  function advancePassTurn() {
    if (currentTurnTeam === 't1') {
      currentTurnTeam = 't2';
    } else {
      currentTurnTeam = 't1';
      round++;
    }

    if (round >= halfRounds) {
      finishMatch();
    } else {
      showPassPlayQuestion();
    }
  }

  /* ========================================================
   * MATCH CONCLUSION & QUESTION REVIEW
   * ======================================================== */

  function finishMatch() {
    elBattleContainer.style.display = 'none';
    if (elKbdHelper) elKbdHelper.style.display = 'none';
    elReviewContainer.classList.add('open');

    // Determine winner based on scores
    let winner = null;
    let isDraw = false;

    if (t1Score > t2Score) {
      winner = match.team1;
    } else if (t2Score > t1Score) {
      winner = match.team2;
    } else {
      isDraw = true;
    }

    const trophyEl = document.getElementById('winner-trophy');
    const titleEl = document.getElementById('winner-title');
    const subEl = document.getElementById('winner-sub');

    if (isDraw) {
      trophyEl.textContent = '🤝';
      titleEl.textContent = "It's an Honorable Draw!";
      subEl.textContent = `Both ${match.team1.name} and ${match.team2.name} balanced the seesaw with incredible knowledge! (${t1Score} to ${t2Score})`;
    } else {
      trophyEl.textContent = '🏆';
      titleEl.textContent = `${winner.avatar} ${winner.name} Wins!`;
      subEl.textContent = `Magnificent seesaw showdown! Final score: ${match.team1.name} ${t1Score} - ${t2Score} ${match.team2.name}`;
      if (window.KZAudio) {
        if (typeof KZAudio.playCheer === 'function') {
          KZAudio.playCheer();
        } else if (typeof KZAudio.playWin === 'function') {
          KZAudio.playWin();
        }
      }
      if (window.KZ && KZ.confetti) {
        KZ.confetti({ count: 120, spread: 80 });
      }
    }

    // Update Tab Titles
    document.getElementById('tab-t1-avatar').textContent = match.team1.avatar;
    document.getElementById('tab-t1-title').textContent = `${match.team1.name} (${t1Score}/${halfRounds})`;

    document.getElementById('tab-t2-avatar').textContent = match.team2.avatar;
    document.getElementById('tab-t2-title').textContent = `${match.team2.name} (${t2Score}/${halfRounds})`;

    // Populate Review Lists
    renderReviewList('t1', t1Log, document.getElementById('t1-review-list'));
    renderReviewList('t2', t2Log, document.getElementById('t2-review-list'));

    // Record Score to Kids Zone Progress Dashboard
    if (window.KZ && KZ.recordScore) {
      const topScore = Math.max(t1Score, t2Score);
      KZ.recordScore('tug-war-quiz', topScore, halfRounds);
    }
  }

  function renderReviewList(teamKey, logs, container) {
    if (!container) return;

    if (!logs || logs.length === 0) {
      container.innerHTML = `<div style="padding: 1rem; color: var(--muted); text-align: center;">No questions answered.</div>`;
      return;
    }

    container.innerHTML = logs.map(item => {
      let statusClass = 'correct';
      let statusText = '✅ Correct (+1 pt)';
      if (item.skipped) {
        statusClass = 'skipped';
        statusText = '⏭️ Skipped (0 pt)';
      } else if (!item.isCorrect) {
        statusClass = 'wrong';
        statusText = '❌ Missed';
      }

      return `
        <div class="review-item">
          <div class="review-item-header">
            <span class="review-item-qnum">Round ${item.round}</span>
            <span class="review-status-tag ${statusClass}">${statusText}</span>
          </div>
          <div class="review-item-qtext">${item.question}</div>
          <div class="review-answers-row">
            <div>
              <span class="ans-label">Your Answer:</span>
              <strong style="${item.isCorrect ? 'color: var(--ok);' : 'color: #ef4444;'}">
                ${item.selectedAnswer}
              </strong>
            </div>
            <div>
              <span class="ans-label">Correct Answer:</span>
              <strong style="color: var(--ok);">${item.correctAnswer}</strong>
            </div>
          </div>
          ${item.fact ? `
            <div class="review-fact">
              💡 <strong>Fact:</strong> ${item.fact}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  // Speech Helper
  window.speakCurrentQuestion = function () {
    if (!window.KZAudio) return;
    const questionsList = currentTurnTeam === 't1' ? t1Questions : t2Questions;
    const qData = questionsList[round];
    if (qData) {
      KZAudio.speak(qData.question);
    }
  };

  // Review screen tabs
  window.switchReviewTab = function (tab) {
    if (window.KZAudio) KZAudio.playClick();
    const btnT1 = document.getElementById('tab-btn-t1');
    const btnT2 = document.getElementById('tab-btn-t2');
    const panelT1 = document.getElementById('tab-panel-t1');
    const panelT2 = document.getElementById('tab-panel-t2');

    if (tab === 't1') {
      btnT1.classList.add('active');
      btnT2.classList.remove('active');
      panelT1.classList.add('active');
      panelT2.classList.remove('active');
    } else {
      btnT2.classList.add('active');
      btnT1.classList.remove('active');
      panelT2.classList.add('active');
      panelT1.classList.remove('active');
    }
  };

  window.playAgain = function () {
    if (window.KZAudio) KZAudio.playClick();
    window.location.reload();
  };

  window.changeSettings = function () {
    if (window.KZAudio) KZAudio.playClick();
    window.location.href = 'index.html';
  };

  // Kickoff
  window.addEventListener('DOMContentLoaded', init);
})();
