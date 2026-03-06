
# Times Table Trail

A single‑file, kid‑friendly multiplication practice game designed for **offline use**.  
Built with **vanilla HTML, CSS, and JavaScript**, it includes fun themes, practice & test modes, adaptive difficulty, voice read‑aloud, and a printable results summary.

---

## ✨ Highlights

- **Single HTML file** — no build step, just open in a browser.
- **Presets up to 30** (1–5, 5–10, 1–10, …, 26–30) + **Custom range**.
- **Two modes:**  
  - **Practice** (retry until correct, no timer)  
  - **Test (Timed)** with **two timeboxing types**:
    - _Per‑question_ countdown (e.g., 10 seconds/question)
    - _Total time_ countdown (e.g., 3 minutes for the entire quiz)
- **Adaptive difficulty** within each session: easier factors first, then harder.
- **Smarter distractors** (realistic wrong options) to improve learning.
- **Jungle theme** by default (more themes available).
- **Audio feedback** (on by default) + **optional voice read‑aloud** of questions.
- **Visual arrays** (dots) for conceptual support on smaller products.
- **Streaks, badges, and confetti** for motivation.
- **Local progress** (best/last) saved via `localStorage`.
- **Accessible**: keyboard shortcuts, high‑contrast mode, large buttons, readable fonts.
- **Printable results**: score, time taken, and a detailed Q&A summary.

---

## 🚀 Getting Started

1. **Download** `times-table-trail.html`.
2. **Double‑click** to open in Chrome, Edge, Firefox, or Safari.
3. Click **START TRAIL 🏁** and begin!

> Works **offline** — ideal for classroom laptops or home use without internet.

---

## 🧩 How to Play

1. Pick a **tables range** using the dropdown (e.g., 1–10 or 26–30).
2. (Optional) Choose **Custom Range** to set Start, End, and Questions (5–50).
3. Select a **Mode**:
   - **Practice**: no timer; kids can retry wrong answers immediately.
   - **Test (Timed)**:
     - **Per question**: e.g., 10s each.
     - **Total time**: e.g., 180s for the whole quiz.
4. Toggle **Visual arrays** and **Shuffle options** if desired.
5. Click **START TRAIL** and answer from the **horizontal choices**.
6. At the end, view **Score**, **Time taken**, **Badges**, and a **Summary**.  
   Use **Print** to save/print a result sheet.

---

## ⏱️ Timing & Tracking

- **Practice mode**: No countdown, but **total time taken** is still recorded and shown on the results screen.
- **Test mode**:
  - **Per‑question** timer (default 10s).
  - **Total time** countdown (default 180s).
- **Local progress** (best/last) is stored per preset/mode/timebox type in `localStorage`.

---

## 🎨 Themes

- **Jungle (default)**, **Blue**, **Pink**, **Space**, **Ocean**, **Candy**  
  Change it from the **Theme** dropdown in the header.

> You can add your own theme by defining a new CSS class (e.g., `.theme-desert`) and applying it to `<body>`.

---

## ♿ Accessibility & UX

- **Large buttons** and high‑contrast friendly palette (toggle in header).
- **Keyboard shortcuts**:
  - `1`–`6` → choose option  
  - `N` or `Enter` → Next (Test mode)  
  - `S` → Skip question  
  - `R` → Read question aloud  
- **Read‑aloud** (voice): toggle with the **🗣️** button.

---

## 🔧 Configuration (inline)

All configuration is handled in the single HTML file via the `cfg` object:

```js
const cfg = {
  start: 1, end: 10, total: 15,
  mode: 'practice',               // practice | test
  timeboxType: 'per-question',    // per-question | total
  perQSeconds: 10,
  totalSeconds: 180,
  theme: 'theme-jungle',
  showArrays: true,
  shuffleOptions: true,
  factorMax: 12                   // multiplier upper bound
};
