/**
 * Kids Zone - On-Device Progress, Scores & Kid Profile Engine
 * 100% Local Storage, Privacy-Respecting (Zero Server / Zero Cloud / Zero Tracking)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.KZProgress = factory();
    if (typeof window !== 'undefined') window.KZProgress = root.KZProgress;
    const kz = root.KZ || (typeof window !== 'undefined' ? window.KZ : null);
    if (kz) {
      kz.progress = root.KZProgress;
      kz.recordScore = root.KZProgress.recordScore;
      kz.getProfile = root.KZProgress.getProfile;
      kz.setProfile = root.KZProgress.setProfile;
      kz.promptKidName = root.KZProgress.promptKidNameModal;
    }
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY_SCORES = 'kz_scores_v1';
  const STORAGE_KEY_PROFILE = 'kz_kid_profile';
  const MAX_RECORDS_PER_GAME = 25;
  const MAX_TOTAL_RECORDS = 200;

  const AVATARS = ['🌟', '🦁', '🚀', '🦄', '🦖', '🎨', '🌈', '👑', '⚡', '🐱', '🐶', '⚽'];

  // Default Kid Profile
  function getProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && typeof p === 'object') {
          return {
            name: typeof p.name === 'string' ? p.name.trim() : '',
            avatar: p.avatar || '🌟',
            registeredAt: p.registeredAt || Date.now()
          };
        }
      }
    } catch (e) {
      console.warn('KZProgress: Failed to read kid profile', e);
    }
    return { name: '', avatar: '🌟', registeredAt: Date.now() };
  }

  function setProfile(profile) {
    const current = getProfile();
    const updated = {
      name: (profile && typeof profile.name === 'string') ? profile.name.trim() : current.name,
      avatar: (profile && profile.avatar) || current.avatar || '🌟',
      registeredAt: current.registeredAt || Date.now()
    };
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
    } catch (e) {
      console.warn('KZProgress: Failed to save kid profile', e);
    }

    updateHeaderProfileUI(updated);
    window.dispatchEvent(new CustomEvent('kz_profile_updated', { detail: updated }));
    return updated;
  }

  function updateHeaderProfileUI(profile) {
    const p = profile || getProfile();
    const avatarEl = document.getElementById('kz-header-avatar');
    const nameEl = document.getElementById('kz-header-name');
    if (avatarEl) avatarEl.textContent = p.avatar || '🌟';
    if (nameEl) nameEl.textContent = p.name ? `${p.name}'s Progress` : 'Progress';
  }

  // Kid Name Modal Prompt ("How should we call you?")
  function promptKidNameModal(callback) {
    const current = getProfile();
    let selectedAvatar = current.avatar || '🌟';

    // Remove existing modal if present
    const existing = document.getElementById('kz-name-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'kz-name-modal';
    overlay.className = 'kz-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="kz-modal-card" style="max-width: 480px; text-align: center;">
        <button type="button" class="kz-modal-close" aria-label="Close" onclick="document.getElementById('kz-name-modal').remove()">×</button>
        
        <div style="font-size: 3rem; margin-bottom: 0.2rem;" id="kz-modal-avatar-preview">${selectedAvatar}</div>
        <h2 style="font-family: var(--font-main); font-size: 1.8rem; font-weight: 800; color: var(--text); margin-bottom: 0.3rem;">
          How should we call you?
        </h2>
        <p style="font-family: var(--font-body); color: var(--muted); font-size: 0.95rem; margin-bottom: 1.2rem; line-height: 1.4;">
          Choose your favorite learning nickname & mascot! All saved 100% safely on your device.
        </p>

        <div style="margin-bottom: 1.2rem; text-align: left;">
          <label for="kz-kid-name-input" style="display: block; font-weight: 700; font-size: 0.88rem; margin-bottom: 0.4rem; color: var(--text);">
            Your Name / Nickname:
          </label>
          <input 
            type="text" 
            id="kz-kid-name-input" 
            maxlength="24"
            value="${escapeHtml(current.name || '')}" 
            placeholder="e.g. Leo, Maya, Super Star..." 
            style="width: 100%; box-sizing: border-box; padding: 0.75rem 1rem; border-radius: 12px; border: 2px solid var(--primary); font-family: var(--font-body); font-size: 1.1rem; font-weight: 700; outline: none;"
          />
        </div>

        <div style="margin-bottom: 1.5rem; text-align: left;">
          <label style="display: block; font-weight: 700; font-size: 0.88rem; margin-bottom: 0.5rem; color: var(--text);">
            Pick Your Mascot Avatar:
          </label>
          <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.5rem;" id="kz-avatar-grid">
            ${AVATARS.map(a => `
              <button type="button" class="kz-avatar-choice ${a === selectedAvatar ? 'active' : ''}" data-avatar="${a}" style="
                font-size: 1.8rem;
                padding: 0.4rem 0.2rem;
                border-radius: 12px;
                border: 2px solid ${a === selectedAvatar ? 'var(--primary)' : 'var(--border)'};
                background: ${a === selectedAvatar ? 'rgba(5, 150, 105, 0.12)' : 'var(--card)'};
                cursor: pointer;
                transition: all 0.15s ease;
              ">${a}</button>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 0.8rem; justify-content: flex-end;">
          <button type="button" class="kz-btn" style="background: var(--card); border: 2px solid var(--border); color: var(--muted);" onclick="document.getElementById('kz-name-modal').remove()">
            Cancel
          </button>
          <button type="button" id="kz-save-profile-btn" class="kz-btn" style="background: var(--primary); color: #fff; border: 2px solid var(--primary); font-weight: 800; padding: 0.75rem 1.5rem;">
            Save & Continue ✨
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Focus input
    const input = document.getElementById('kz-kid-name-input');
    if (input) {
      input.focus();
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveAction();
      });
    }

    // Avatar clicks
    overlay.querySelectorAll('.kz-avatar-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedAvatar = btn.getAttribute('data-avatar');
        overlay.querySelectorAll('.kz-avatar-choice').forEach(b => {
          b.classList.remove('active');
          b.style.borderColor = 'var(--border)';
          b.style.background = 'var(--card)';
        });
        btn.classList.add('active');
        btn.style.borderColor = 'var(--primary)';
        btn.style.background = 'rgba(5, 150, 105, 0.12)';
        const preview = document.getElementById('kz-modal-avatar-preview');
        if (preview) preview.textContent = selectedAvatar;
      });
    });

    function saveAction() {
      const name = (input ? input.value : '').trim();
      const updated = setProfile({ name, avatar: selectedAvatar });
      overlay.remove();
      if (window.KZAudio) window.KZAudio.playOk();
      if (window.KZ && window.KZ.confetti) window.KZ.confetti({ count: 70, spread: 60 });
      if (typeof callback === 'function') callback(updated);
    }

    const saveBtn = document.getElementById('kz-save-profile-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveAction);
  }

  // Score History Storage (Minimal & Local-Only)
  function getAllScores() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SCORES);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list;
      }
    } catch (e) {
      console.warn('KZProgress: Failed to read score history', e);
    }
    return [];
  }

  function saveAllScores(list) {
    try {
      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(list));
    } catch (e) {
      console.warn('KZProgress: Failed to write score history', e);
    }
  }

  function getScores(gameId = null) {
    const list = getAllScores();
    if (!gameId) return list;
    return list.filter(item => item.gameId === gameId);
  }

  /**
   * Record a score attempt for any game
   * @param {Object} entry { gameId, gameTitle, score, total, accuracy, mode, details, durationSec }
   */
  function recordScore(entry) {
    if (!entry || !entry.gameId) return null;

    const gameId = String(entry.gameId).trim();
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

    const now = Date.now();
    const dateStr = new Date(now).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const record = {
      id: 'rec_' + now + '_' + Math.random().toString(36).slice(2, 6),
      gameId: gameId,
      gameTitle: entry.gameTitle || getGameTitle(gameId),
      score: score,
      total: total,
      pct: pct,
      mode: entry.mode || 'standard',
      details: entry.details || '',
      durationSec: Math.max(0, Math.round(Number(entry.durationSec) || 0)),
      timestamp: now,
      dateStr: dateStr
    };

    let list = getAllScores();
    // Prepend latest
    list.unshift(record);

    // Prune per-game (keep only MAX_RECORDS_PER_GAME per game)
    const counts = {};
    list = list.filter(item => {
      counts[item.gameId] = (counts[item.gameId] || 0) + 1;
      return counts[item.gameId] <= MAX_RECORDS_PER_GAME;
    });

    // Prune total max records
    if (list.length > MAX_TOTAL_RECORDS) {
      list = list.slice(0, MAX_TOTAL_RECORDS);
    }

    saveAllScores(list);
    window.dispatchEvent(new CustomEvent('kz_score_recorded', { detail: record }));
    return record;
  }

  function getGameTitle(gameId) {
    if (window.KZ && window.KZ.games) {
      const g = window.KZ.games.find(x => x.id === gameId);
      if (g) return g.title;
    }
    return gameId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  function clearScores(gameId = null) {
    if (!gameId) {
      saveAllScores([]);
    } else {
      const list = getAllScores().filter(item => item.gameId !== gameId);
      saveAllScores(list);
    }
    window.dispatchEvent(new CustomEvent('kz_scores_cleared', { detail: { gameId } }));
  }

  function resetAllData() {
    try {
      localStorage.removeItem(STORAGE_KEY_SCORES);
      localStorage.removeItem(STORAGE_KEY_PROFILE);
    } catch (e) {}
    updateHeaderProfileUI({ name: '', avatar: '🌟' });
    window.dispatchEvent(new CustomEvent('kz_scores_cleared', { detail: {} }));
    window.dispatchEvent(new CustomEvent('kz_profile_updated', { detail: { name: '', avatar: '🌟' } }));
  }

  function exportData() {
    const data = {
      app: 'Kids Zone Progress Data',
      exportDate: new Date().toISOString(),
      profile: getProfile(),
      scores: getAllScores()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kids-zone-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  function loadSampleData() {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const hour = 60 * 60 * 1000;

    const samples = [
      { gameId: 'time-table', score: 10, total: 15, pct: 67, mode: 'practice', durationSec: 95, timeOffset: -4 * day },
      { gameId: 'time-table', score: 12, total: 15, pct: 80, mode: 'practice', durationSec: 88, timeOffset: -3 * day + 2 * hour },
      { gameId: 'time-table', score: 14, total: 15, pct: 93, mode: 'test', durationSec: 75, timeOffset: -2 * day + 5 * hour },
      { gameId: 'time-table', score: 15, total: 15, pct: 100, mode: 'test', durationSec: 62, timeOffset: -1 * day + 1 * hour },
      { gameId: 'time-table', score: 15, total: 15, pct: 100, mode: 'test', durationSec: 54, timeOffset: -2 * hour },

      { gameId: 'add-sub', score: 11, total: 15, pct: 73, mode: 'practice', durationSec: 110, timeOffset: -3 * day },
      { gameId: 'add-sub', score: 13, total: 15, pct: 87, mode: 'test', durationSec: 92, timeOffset: -2 * day },
      { gameId: 'add-sub', score: 15, total: 15, pct: 100, mode: 'test', durationSec: 80, timeOffset: -5 * hour },

      { gameId: 'deci-frac', score: 8, total: 12, pct: 67, mode: 'practice', durationSec: 140, timeOffset: -4 * day + 1 * hour },
      { gameId: 'deci-frac', score: 10, total: 12, pct: 83, mode: 'test', durationSec: 115, timeOffset: -2 * day + 3 * hour },
      { gameId: 'deci-frac', score: 12, total: 12, pct: 100, mode: 'test', durationSec: 98, timeOffset: -3 * hour },

      { gameId: 'perimeter', score: 9, total: 12, pct: 75, mode: 'practice', durationSec: 105, timeOffset: -3 * day },
      { gameId: 'perimeter', score: 11, total: 12, pct: 92, mode: 'test', durationSec: 85, timeOffset: -1 * day },

      { gameId: 'compare-number', score: 12, total: 15, pct: 80, mode: 'practice', durationSec: 70, timeOffset: -2 * day },
      { gameId: 'compare-number', score: 15, total: 15, pct: 100, mode: 'test', durationSec: 58, timeOffset: -4 * hour },

      { gameId: 'order-number', score: 10, total: 12, pct: 83, mode: 'practice', durationSec: 88, timeOffset: -2 * day + 4 * hour },
      { gameId: 'order-number', score: 12, total: 12, pct: 100, mode: 'test', durationSec: 64, timeOffset: -1 * hour },

      { gameId: 'memory', score: 85, total: 100, pct: 85, mode: 'medium', durationSec: 120, timeOffset: -3 * day },
      { gameId: 'memory', score: 95, total: 100, pct: 95, mode: 'hard', durationSec: 105, timeOffset: -1 * day + 2 * hour },

      { gameId: 'equation-architect', score: 8, total: 10, pct: 80, mode: 'puzzle', durationSec: 130, timeOffset: -2 * day },
      { gameId: 'equation-architect', score: 10, total: 10, pct: 100, mode: 'puzzle', durationSec: 100, timeOffset: -6 * hour },

      { gameId: 'magic-sort', score: 100, total: 100, pct: 100, mode: 'level-5', durationSec: 85, timeOffset: -1 * day + 5 * hour }
    ];

    const built = samples.map(s => {
      const ts = now + s.timeOffset;
      return {
        id: 'sample_' + ts + '_' + Math.random().toString(36).slice(2, 6),
        gameId: s.gameId,
        gameTitle: getGameTitle(s.gameId),
        score: s.score,
        total: s.total,
        pct: s.pct,
        mode: s.mode,
        details: 'Sample progress demonstration',
        durationSec: s.durationSec,
        timestamp: ts,
        dateStr: new Date(ts).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    });

    // Sort descending by timestamp
    built.sort((a, b) => b.timestamp - a.timestamp);
    saveAllScores(built);
    
    // Set a cheerful default name if none exists
    const currentProf = getProfile();
    if (!currentProf.name) {
      setProfile({ name: 'Alex', avatar: '🦁' });
    }

    window.dispatchEvent(new CustomEvent('kz_score_recorded', { detail: {} }));
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

  // Initialize UI on load
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      updateHeaderProfileUI();
    });
  }

  return {
    getProfile: getProfile,
    setProfile: setProfile,
    promptKidNameModal: promptKidNameModal,
    recordScore: recordScore,
    getScores: getScores,
    getAllScores: getAllScores,
    clearScores: clearScores,
    resetAllData: resetAllData,
    exportData: exportData,
    loadSampleData: loadSampleData
  };
}));
