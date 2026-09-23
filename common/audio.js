/**
 * Kids Zone - Unified Web Audio Synthesizer
 * High-performance, zero external assets, memory-leak free audio engine.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.KZAudio = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let audioCtx = null;
  let isMuted = false;
  let canSpeak = false;

  // Retrieve initial mute status from localStorage
  try {
    const savedMute = localStorage.getItem('kz_muted');
    if (savedMute !== null) {
      isMuted = savedMute === 'true';
    }
  } catch (e) {
    // localStorage not accessible
  }

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  // Pre-unlock on first user interaction
  const unlockAudio = () => {
    getAudioContext();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  const KZAudio = {
    isMuted: () => isMuted,

    setMuted: (muted) => {
      isMuted = !!muted;
      try {
        localStorage.setItem('kz_muted', isMuted ? 'true' : 'false');
      } catch (e) {}

      // Dispatch event so UI can sync mute button state
      window.dispatchEvent(new CustomEvent('kz-mute-changed', { detail: { isMuted } }));
      return isMuted;
    },

    toggleMute: () => {
      return KZAudio.setMuted(!isMuted);
    },

    isSpeakingEnabled: () => canSpeak,

    setSpeakingEnabled: (enabled) => {
      canSpeak = !!enabled;
      try {
        localStorage.setItem('kz_speak', canSpeak ? 'true' : 'false');
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('kz-speak-changed', { detail: { canSpeak } }));
      return canSpeak;
    },

    toggleSpeaking: () => {
      return KZAudio.setSpeakingEnabled(!canSpeak);
    },

    /**
     * Play custom tones using a single shared AudioContext
     */
    tone: (freq = 440, type = 'sine', duration = 0.12, gainLevel = 0.15) => {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration + 0.02);
      } catch (err) {
        // Audio error handling
      }
    },

    playClick: () => {
      if (isMuted) return;
      KZAudio.tone(620, 'sine', 0.04, 0.08);
    },

    playTick: () => {
      if (isMuted) return;
      KZAudio.tone(800, 'sine', 0.03, 0.05);
    },

    playOk: () => {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + idx * 0.05;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(0.18, start + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.16);
        });
      } catch (e) {}
    },

    playWrong: () => {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.18);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
      } catch (e) {}
    },

    playWin: () => {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        const now = ctx.currentTime;
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + i * 0.08;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + 0.24);
        });
      } catch (e) {}
    },

    playCheer: () => {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const chords = [
          { notes: [523.25, 659.25, 783.99], time: 0 },
          { notes: [659.25, 783.99, 987.77], time: 0.14 },
          { notes: [783.99, 987.77, 1174.66], time: 0.28 },
          { notes: [1046.50, 1318.51, 1567.98], time: 0.44 }
        ];
        const now = ctx.currentTime;
        chords.forEach(({ notes, time }) => {
          notes.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const t = now + time;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(t);
            osc.stop(t + 0.38);
          });
        });
      } catch (e) {}
    },

    playFanfare: () => {
      if (KZAudio.playCheer) KZAudio.playCheer();
    },

    playBad: () => {
      if (KZAudio.playWrong) KZAudio.playWrong();
    },

    speak: (text) => {
      if (!canSpeak || !('speechSynthesis' in window)) return;
      try {
        const clean = String(text).replace(/×/g, ' times ').replace(/÷/g, ' divided by ');
        const utter = new SpeechSynthesisUtterance(clean);
        utter.rate = 0.95;
        utter.pitch = 1.1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      } catch (e) {}
    }
  };

  // Sync mute across browser tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'kz_muted') {
      isMuted = e.newValue === 'true';
      window.dispatchEvent(new CustomEvent('kz-mute-changed', { detail: { isMuted } }));
    }
  });

  return KZAudio;
}));
