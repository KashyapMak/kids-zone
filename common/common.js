/**
 * Kids Zone - Common Engine (Header, Footer, Navigation, Themes, Modals)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./audio.js'], function (KZAudio) {
      return factory(root, KZAudio);
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(typeof global !== 'undefined' ? global : root, require('./audio.js'));
  } else {
    root.KZ = factory(root, root.KZAudio);
    if (typeof window !== 'undefined') window.KZ = root.KZ;
  }
}(typeof self !== 'undefined' ? self : this, function (root, KZAudio) {
  'use strict';

  const globalScope = typeof root !== 'undefined' ? root : (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : this));

  function getProgressModule() {
    return (globalScope && globalScope.KZProgress) || (typeof window !== 'undefined' && window.KZProgress) || null;
  }

  // 11 Core Games metadata single-source
  const DEFAULT_GAMES = [
    {
      id: "time-table",
      title: "Times Table Trail",
      subtitle: "Multiplication Practice",
      category: "Math & Arithmetic",
      icon: "🧮",
      color: "#059669",
      badge: "Ages 6-12",
      description: "Master multiplication tables 1–30 with custom ranges, practice & timed test modes, visual arrays, streaks, and badges.",
      dir: "time-table",
      entry: "time-table/index.html"
    },
    {
      id: "add-sub",
      title: "Add & Sub Trail",
      subtitle: "Addition & Subtraction",
      category: "Math & Arithmetic",
      icon: "➕➖",
      color: "#2563eb",
      badge: "Ages 5-11",
      description: "Custom difficulty addition and subtraction with 1–4 digits, plus optional No Carry, No Borrow, and No Negatives modes.",
      dir: "add-sub",
      entry: "add-sub/index.html"
    },
    {
      id: "deci-frac",
      title: "Deci-Frac Trail",
      subtitle: "Decimals & Fractions",
      category: "Math & Arithmetic",
      icon: "➗➕",
      color: "#7c3aed",
      badge: "Ages 8-13",
      description: "Decimal and fraction addition & subtraction with vertical layouts, stacked fraction visuals, and practice/test modes.",
      dir: "deci-frac",
      entry: "deci-frac/index.html"
    },
    {
      id: "perimeter",
      title: "Perimeter Trail",
      subtitle: "Geometry & Shapes",
      category: "Geometry",
      icon: "📐",
      color: "#0ea5e9",
      badge: "Ages 7-12",
      description: "Interactive geometry practice with dynamic shapes (square, rectangle, triangle, pentagon), side labels, and formula hints.",
      dir: "perimeter",
      entry: "perimeter/index.html"
    },
    {
      id: "compare-number",
      title: "Number Nature Trail",
      subtitle: "Comparison Practice",
      category: "Number Sense",
      icon: "⚖️",
      color: "#f59e0b",
      badge: "Ages 6-11",
      description: "Compare whole numbers, decimals, and stacked fractions by picking <, =, or > with immediate cheerful visual feedback.",
      dir: "compare-number",
      entry: "compare-number/index.html"
    },
    {
      id: "order-number",
      title: "Number Order Trail",
      subtitle: "Ascending & Descending",
      category: "Number Sense",
      icon: "🔢",
      color: "#10b981",
      badge: "Ages 6-11",
      description: "Arrange 3–5 number cards in ascending or descending sequence across mixed whole numbers, decimals, and fractions.",
      dir: "order-number",
      entry: "order-number/index.html"
    },
    {
      id: "memory",
      title: "Memory Trail",
      subtitle: "Brain & Focus Match",
      category: "Brain & Memory",
      icon: "🧠",
      color: "#ec4899",
      badge: "All Ages",
      description: "Fun card matching game with numbers, symbols, mixed sets, adjustable grid difficulty, themes, and global timers.",
      dir: "memory",
      entry: "memory/index.html"
    },
    {
      id: "equation-architect",
      title: "Equation Architect",
      subtitle: "Math Equation Puzzle",
      category: "Logic & Puzzles",
      icon: "🏗️",
      color: "#d97706",
      badge: "Ages 7-12",
      description: "Build valid mathematical equations using number and operator tiles to reach the target number. Guaranteed solvable!",
      dir: "equation-architect",
      entry: "equation-architect/index.html"
    },
    {
      id: "klotski",
      title: "KLOTSKI Trail",
      subtitle: "Classic Sliding Tile Puzzle",
      category: "Logic & Puzzles",
      icon: "🧩",
      color: "#c49a3c",
      badge: "Ages 6-99",
      description: "Wooden sliding tile puzzle inspired by classic Klotski. Slide the master red block out through the bottom opening.",
      dir: "klotski",
      entry: "klotski/index.html"
    },
    {
      id: "abacus",
      title: "Abacus Trail",
      subtitle: "Interactive Place Value",
      category: "Math & Arithmetic",
      icon: "🧮",
      color: "#059669",
      badge: "Ages 5-11",
      description: "Master the vertical abacus with smooth animated bead physics, exploring place value from units to ten thousands.",
      dir: "abacus",
      entry: "abacus/index.html"
    },
    {
      id: "magic-sort",
      title: "Magic Sort",
      subtitle: "Color Liquid Sorting Puzzle",
      category: "Logic & Puzzles",
      icon: "🧪",
      color: "#6366f1",
      badge: "All Ages",
      description: "Sort colorful potions across test tubes until each tube holds only one color. Relaxing and engaging brain teaser.",
      dir: "magic-sort",
      entry: "magic-sort/index.html"
    },
    {
      id: "tug-war-of-math",
      title: "Tug War of Math",
      subtitle: "Two-Team Arena Battle",
      category: "Math & Arithmetic",
      icon: "🪢",
      color: "#e11d48",
      badge: "Ages 6-14 • 2 Players",
      description: "Fast-paced, two-team same-screen mathematics competition with animated tug-of-war arena, customizable avatars, carrying/borrowing options, and dual keyboard/touch controls.",
      dir: "tug-war-of-math",
      entry: "https://kashyapmak.github.io/tug-war-of-math/",
      externalUrl: "https://kashyapmak.github.io/tug-war-of-math/",
      githubUrl: "https://github.com/KashyapMak/tug-war-of-math",
      isExternal: true
    },
    {
      id: "seesaw-war-quiz",
      title: "Seesaw Battle Quiz Arena",
      subtitle: "Two-Team Knowledge Seesaw",
      category: "Logic & Puzzles",
      icon: "⚖️",
      color: "#f59e0b",
      badge: "All Ages • 2 Players",
      description: "Exciting 2-team seesaw quiz battle with dynamic physics, customizable mascots, science, space, nature, and riddles question packs, no-penalty guessing, and custom CSV uploads.",
      dir: "seesaw-war-quiz",
      entry: "seesaw-war-quiz/index.html"
    }
  ];

  const THEMES = [
    { id: 'theme-jungle', label: '🌿 Jungle' },
    { id: 'theme-blue', label: '🌊 Ocean Blue' },
    { id: 'theme-pink', label: '🌸 Bubble Pink' },
    { id: 'theme-space', label: '🚀 Deep Space' },
    { id: 'theme-ocean', label: '🏖️ Turquoise' },
    { id: 'theme-candy', label: '🍭 Candy' },
    { id: 'high-contrast', label: '⚡ High Contrast' }
  ];

  // Helper to calculate relative path to website root
  function getRelativeRoot() {
    const path = window.location.pathname;
    // Count depth relative to root or index.html
    const segments = path.replace(/^\/|\/$/g, '').split('/');
    if (segments.length <= 1 && (segments[0] === '' || segments[0].endsWith('.html') || segments[0] === 'index.html')) {
      return './';
    }
    return '../';
  }

  // Ensure on-device progress module is available
  if (typeof document !== 'undefined' && !getProgressModule() && document.head) {
    const rel = getRelativeRoot();
    const script = document.createElement('script');
    script.src = rel + 'common/progress.js';
    document.head.appendChild(script);
  }

  // Current Theme state
  let currentTheme = 'theme-jungle';
  try {
    const saved = localStorage.getItem('kz_theme');
    if (saved) currentTheme = saved;
  } catch (e) {}

  function applyTheme(theme) {
    if (!theme) return;
    currentTheme = theme;
    THEMES.forEach(t => document.body.classList.remove(t.id));
    document.body.classList.add(theme);

    try {
      localStorage.setItem('kz_theme', theme);
    } catch (e) {}

    // Synchronize all theme select elements on the page
    document.querySelectorAll('.kz-theme-select').forEach(sel => {
      sel.value = theme;
    });

    if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('kz-theme-changed', { detail: { theme } }));
    }
  }

  // Confetti helper
  function triggerConfetti(opts = {}) {
    if (typeof window.confetti === 'function') {
      window.confetti({
        particleCount: opts.count || 70,
        spread: opts.spread || 60,
        origin: opts.origin || { y: 0.6 },
        ...opts
      });
    }
  }

  // Safety Modal
  function ensureSafetyModal() {
    let modal = document.getElementById('kz-safety-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'kz-safety-modal';
      modal.className = 'kz-modal-overlay';
      modal.innerHTML = `
        <div class="kz-modal-card">
          <button class="kz-modal-close" onclick="KZ.closeSafetyModal()" aria-label="Close modal">✕</button>
          <h2 style="font-size:1.4rem; font-weight:800; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">
            <span>🛡️</span> Kids-Safe & Privacy-First
          </h2>
          <p style="font-family:var(--font-body); font-size:0.95rem; color:var(--muted); line-height:1.5; margin-bottom:1rem;">
            Kids Zone is specially designed for safe learning in classrooms and homes:
          </p>
          <ul style="font-family:var(--font-body); font-size:0.92rem; color:var(--muted); line-height:1.6; padding-left:1.2rem; margin-bottom:1.4rem;">
            <li><strong>Zero Tracking or Ads:</strong> No trackers, cookies, or corporate analytics.</li>
            <li><strong>No Accounts:</strong> Kids can immediately play without passwords or personal data.</li>
            <li><strong>Local Browser Storage:</strong> Best scores and badges stay safely on your local device.</li>
            <li><strong>Offline Friendly:</strong> Built with self-contained web technology.</li>
          </ul>
          <button class="kz-btn kz-btn-primary" style="width:100%;" onclick="KZ.closeSafetyModal()">
            Got It, Let's Play! 🚀
          </button>
        </div>
      `;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) KZ.closeSafetyModal();
      });
      document.body.appendChild(modal);
    }
    return modal;
  }

  function openSafetyModal() {
    const modal = ensureSafetyModal();
    modal.classList.add('open');
  }

  function closeSafetyModal() {
    const modal = document.getElementById('kz-safety-modal');
    if (modal) modal.classList.remove('open');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Mount Header Component
  function mountHeader(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;

    const rel = getRelativeRoot();
    let gameId = options.gameId || el.getAttribute('data-kz-header') || '';
    if (gameId === 'tug-war-quiz' || gameId === 'Seesaw-war-quiz') gameId = 'seesaw-war-quiz';
    const currentGame = DEFAULT_GAMES.find(g => g.id === gameId);
    const isHome = !gameId || gameId === 'home';
    const isProgressPage = gameId === 'progress';

    let profile = { name: '', avatar: '🌟' };
    const progModule = getProgressModule();
    if (progModule && progModule.getProfile) {
      profile = progModule.getProfile();
    } else if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('kz_kid_profile');
        if (raw) profile = Object.assign(profile, JSON.parse(raw));
      } catch (e) {}
    }

    const gameOptionsHtml = DEFAULT_GAMES.map(g => `
      <option value="${g.id}" ${g.id === gameId ? 'selected' : ''}>${g.icon} ${g.title}${g.isExternal ? ' ↗' : ''}</option>
    `).join('');

    const themeOptionsHtml = THEMES.map(t => `
      <option value="${t.id}" ${t.id === currentTheme ? 'selected' : ''}>${t.label}</option>
    `).join('');

    const isMuted = KZAudio ? KZAudio.isMuted() : false;
    const isSpeaking = KZAudio ? KZAudio.isSpeakingEnabled() : false;

    el.className = 'kz-header';
    el.innerHTML = `
      <div class="kz-header-inner">
        <div class="kz-header-left">
          <a href="${rel}index.html" class="kz-brand" title="Kids Zone Home">
            <img src="${rel}common/logo.svg" alt="Kids Zone Logo" class="kz-brand-logo" />
            <span class="kz-brand-title">Kids Zone</span>
          </a>

          ${currentGame ? `
            <div class="kz-game-label" title="${currentGame.subtitle}">
              <span>${currentGame.icon}</span>
              <span>${currentGame.title}</span>
            </div>
          ` : ''}

          ${!isHome ? `
            <div class="kz-game-switcher" title="Switch Game">
              <select class="kz-select" onchange="KZ.switchGame(this.value)">
                <option value="" disabled>Switch Game...</option>
                ${gameOptionsHtml}
              </select>
            </div>
          ` : ''}
        </div>

        <div class="kz-header-actions">
          <a href="${rel}progress.html${currentGame ? `?game=${currentGame.id}` : ''}" 
             class="kz-progress-btn ${isProgressPage ? 'active' : ''}" 
             id="kz-header-progress-btn" 
             title="View Learning Progress & Score History">
            <span class="kz-profile-avatar" id="kz-header-avatar">${profile.avatar || '🌟'}</span>
            <span class="kz-profile-name" id="kz-header-name">${profile.name ? `${escapeHtml(profile.name)}'s Scores` : 'Progress'}</span>
            <span class="kz-progress-badge">📊</span>
          </a>

          <select class="kz-select kz-theme-select" title="Change Theme" onchange="KZ.setTheme(this.value)">
            ${themeOptionsHtml}
          </select>

          ${options.showSpeech !== false ? `
            <button type="button" class="kz-icon-btn kz-speech-btn ${isSpeaking ? 'active' : ''}" 
                    id="kz-speech-toggle"
                    onclick="KZ.toggleSpeaking(this)" 
                    title="Toggle Question Reading" 
                    aria-label="Speech Toggle">
              ${isSpeaking ? '🗣️' : '💬'}
            </button>
          ` : ''}

          <button type="button" class="kz-icon-btn kz-sound-btn ${isMuted ? '' : 'active'}" 
                  id="kz-mute-toggle"
                  onclick="KZ.toggleMute(this)" 
                  title="Toggle Sound Effects" 
                  aria-label="Sound Toggle">
            ${isMuted ? '🔇' : '🔊'}
          </button>

          ${!isHome ? `
            <a href="${rel}index.html" class="kz-home-btn" title="Back to All Games">
              <span>🏠</span>
              <span>All Games</span>
            </a>
          ` : `
            <button type="button" class="kz-icon-btn" onclick="KZ.playRandomGame()" title="Surprise Me (Random Game)">
              🎲
            </button>
            <button type="button" class="kz-home-btn" onclick="KZ.openSafetyModal()" title="Safety and Classroom Guide">
              <span>🛡️</span>
              <span>Kids-Safe</span>
            </button>
          `}
        </div>

        <div class="kz-header-progress" id="kz-header-progress-track">
          <div class="kz-header-progress-fill" id="kz-header-progress-bar"></div>
        </div>
      </div>
    `;

    // Listen to mute state changes
    window.addEventListener('kz-mute-changed', (e) => {
      const btn = document.getElementById('kz-mute-toggle');
      if (btn) {
        btn.innerHTML = e.detail.isMuted ? '🔇' : '🔊';
        btn.classList.toggle('active', !e.detail.isMuted);
      }
    });

    window.addEventListener('kz-speak-changed', (e) => {
      const btn = document.getElementById('kz-speech-toggle');
      if (btn) {
        btn.innerHTML = e.detail.canSpeak ? '🗣️' : '💬';
        btn.classList.toggle('active', e.detail.canSpeak);
      }
    });
  }

  // Mount Footer Component
  function mountFooter(container) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;

    const rel = getRelativeRoot();
    el.className = 'kz-footer';
    el.innerHTML = `
      <div class="kz-footer-inner">
        <div class="kz-footer-brand">
          <img src="${rel}common/logo.svg" alt="Kids Zone Logo" class="kz-footer-logo" />
          <span>Kids Zone</span>
        </div>
        <p class="kz-footer-desc">
          Safe, fun, distraction-free educational web games for children. Built for school classrooms and family learning at home.
        </p>
        <div class="kz-footer-links">
          <a href="${rel}index.html">All 12 Activities</a>
          <span class="kz-footer-sep">•</span>
          <a href="${rel}progress.html">📊 Progress Dashboard</a>
          <span class="kz-footer-sep">•</span>
          <button type="button" onclick="KZ.promptKidName()">Edit Player Profile</button>
          <span class="kz-footer-sep">•</span>
          <button type="button" onclick="KZ.openSafetyModal()">Kids-Safe Principles</button>
          <span class="kz-footer-sep">•</span>
          <a href="https://github.com/KashyapMak/kids-zone" target="_blank" rel="noopener noreferrer">GitHub Project</a>
          <span class="kz-footer-sep">•</span>
          <span style="color:var(--ok)">✓ Offline & GitHub Pages Ready</span>
        </div>
      </div>
    `;
  }

  function switchGame(gameId) {
    if (!gameId) return;
    if (gameId === 'tug-war-quiz' || gameId === 'Seesaw-war-quiz') gameId = 'seesaw-war-quiz';
    const target = DEFAULT_GAMES.find(g => g.id === gameId);
    if (!target) return;
    if (target.isExternal && target.externalUrl) {
      window.open(target.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const rel = getRelativeRoot();
    window.location.href = `${rel}${target.dir}/index.html`;
  }

  function playRandomGame() {
    triggerConfetti();
    const game = DEFAULT_GAMES[Math.floor(Math.random() * DEFAULT_GAMES.length)];
    const rel = getRelativeRoot();
    setTimeout(() => {
      if (game.isExternal && game.externalUrl) {
        window.open(game.externalUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = `${rel}${game.dir}/index.html`;
      }
    }, 300);
  }

  function toggleMute(btn) {
    if (KZAudio) {
      const isMuted = KZAudio.toggleMute();
      if (!isMuted) KZAudio.playClick();
    }
  }

  function toggleSpeaking(btn) {
    if (KZAudio) {
      KZAudio.toggleSpeaking();
      if (KZAudio.isSpeakingEnabled()) {
        KZAudio.speak('Voice reading enabled');
      }
    }
  }

  // Set header progress bar
  function setProgress(percent) {
    const track = document.getElementById('kz-header-progress-track');
    const bar = document.getElementById('kz-header-progress-bar');
    if (!track || !bar) return;

    if (percent === null || percent === undefined) {
      track.classList.remove('active');
      bar.style.width = '0%';
    } else {
      track.classList.add('active');
      bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
  }

  // Auto mount on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme);

    const autoHeader = document.querySelector('[data-kz-header]');
    if (autoHeader) {
      mountHeader(autoHeader);
    }

    const autoFooter = document.querySelector('[data-kz-footer]');
    if (autoFooter) {
      mountFooter(autoFooter);
    }
  });

  const KZ = {
    games: DEFAULT_GAMES,
    themes: THEMES,
    audio: KZAudio,
    getTheme: () => currentTheme,
    setTheme: applyTheme,
    mountHeader,
    mountFooter,
    switchGame,
    playRandomGame,
    toggleMute,
    toggleSpeaking,
    setProgress,
    confetti: triggerConfetti,
    openSafetyModal,
    closeSafetyModal,
    getRelativeRoot,
    recordScore: function (entry) {
      try {
        const p = getProgressModule();
        if (p && p.recordScore) {
          return p.recordScore(entry);
        }
        if (typeof localStorage !== 'undefined' && entry && entry.gameId) {
          const raw = localStorage.getItem('kz_scores_v1');
          const list = raw ? JSON.parse(raw) : [];
          const now = Date.now();
          const score = Number(entry.score) || 0;
          const total = entry.total !== undefined ? Number(entry.total) : null;
          let pct = 0;
          if (entry.accuracy !== undefined) {
            pct = Math.max(0, Math.min(100, Math.round(Number(entry.accuracy))));
          } else if (total && total > 0) {
            pct = Math.max(0, Math.min(100, Math.round((score / total) * 100)));
          } else {
            pct = Math.max(0, Math.min(100, Math.round(score)));
          }
          list.unshift({
            id: 'rec_' + now + '_' + Math.random().toString(36).slice(2, 6),
            gameId: String(entry.gameId).trim(),
            gameTitle: entry.gameTitle || entry.gameId,
            score: score,
            total: total,
            pct: pct,
            mode: entry.mode || 'standard',
            details: entry.details || '',
            durationSec: Math.max(0, Math.round(Number(entry.durationSec) || 0)),
            timestamp: now,
            dateStr: new Date(now).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          });
          localStorage.setItem('kz_scores_v1', JSON.stringify(list.slice(0, 200)));
        }
      } catch (err) {
        // Silently protect gameplay from any storage errors
      }
    },
    getProfile: function () {
      const p = getProgressModule();
      return p ? p.getProfile() : { name: '', avatar: '🌟' };
    },
    setProfile: function (profile) {
      const p = getProgressModule();
      return p ? p.setProfile(profile) : profile;
    },
    promptKidName: function (cb) {
      const p = getProgressModule();
      if (p && p.promptKidNameModal) {
        return p.promptKidNameModal(cb);
      }
    }
  };

  return KZ;
}));
