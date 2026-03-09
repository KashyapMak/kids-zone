# 📐 Perimeter Trail

**Perimeter Trail** is a single‑file, kid‑friendly game to practice **perimeter** of **squares, rectangles, equilateral triangles, and regular pentagons**.
It matches the Trail experience (Practice/Test modes, timers, audio, read‑aloud, streaks, badges, printable summary) and runs **offline**.

---

## ✨ Highlights

- Shapes: **Square**, **Rectangle**, **Equilateral Triangle** (scaled to 75% per design), **Regular Pentagon**
- **Practice** & **Test (Timed)** modes
  - **Per‑question** or **Total‑time** timers
- **Smart options** (realistic distractors) to prompt conceptual checks
- **Visual**: Canvas‑drawn shapes with side labels (cm)
- **Hints**: Formula hints (toggle)
- **Accessibility**: keyboard shortcuts, high‑contrast, read‑aloud
- **Progress**: streaks, badges, local best/last, printable Q&A summary
- **Offline**: one HTML file, no tracking, no accounts

---

## 🚀 Getting Started

1. Open folder: `perimeter/`
2. Double‑click **`perimeter-trail.html`** to launch in a browser.
3. Pick **shapes**, **difficulty**, **mode**, and timers → **START TRAIL**.

> Works offline in Chrome, Edge, Firefox, and Safari.

---

## 🧮 Perimeter Formulas

- **Square**: `P = 4 × side`
- **Rectangle**: `P = 2 × (L + W)`
- **Equilateral triangle**: `P = 3 × side`
- **Regular pentagon**: `P = 5 × side`

> The app shows the hint text under the message area when **Show formula hint** is on.

---

## 🎮 Keyboard Shortcuts

- `1–6` → choose an option  
- `N` or `Enter` → Next (in Test mode)  
- `S` → Skip  
- `R` → Read the question aloud  
- Header toggles: **🔊** sound, **🗣️** voice, **🌓** high‑contrast

---

## 🔧 Configuration (inline defaults)

```js
const cfg = {
  shapes: ['square','rectangle','triangle','pentagon'],
  digits: 1,            // 1 → 1–9 cm, 2 → 10–30 cm
  total: 15,
  mode: 'practice',     // 'practice' | 'test'
  timeboxType: 'per-question', // or 'total'
  perQSeconds: 12,
  totalSeconds: 240,
  showHint: true,
  shuffleOptions: true
};
```

---

## 🛡️ Kids‑Safe & Privacy‑First

- **No ads**, **no analytics**, **no logins**
- Works **offline**; only optional web fonts/effects if online
- Saves progress **locally** (can be reset in UI)

---

## 👤 Author & Links

- **Author:** Kashyap Makadia  
- **LinkedIn:** https://www.linkedin.com/in/kashyapmakadia/  
- **GitHub Repo:** https://github.com/KashyapMak/kids-zone

---

## 📄 License

Released under the **MIT License**.

---

## 🗂️ Folder Layout

```text
kids-zone/
│
├── perimeter/
│   ├── perimeter-trail-triangle-075.html
│   └── README.md        ← (this file)
│
└── ... other games ...