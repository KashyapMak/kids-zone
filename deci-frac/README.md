# ➗➕ Deci‑Frac Trail

**Deci‑Frac Trail** is a single‑file, kid‑friendly game that helps learners practice **addition** and **subtraction** with **decimals** and **fractions** — using a **vertical, column layout** to mirror how sums are worked out on paper.

It follows the same feel as your *Trail* series (Times Table Trail, Add & Sub Trail): kid‑safe design, practice/test modes, timers, audio feedback, optional read‑aloud, streaks, badges, and a printable summary. Works **offline** and needs **no build tools**.

---

## ✨ Highlights

- **Decimals, Fractions, or Mixed** questions
- **Vertical (column) layout**
  - **Decimals** (aligned to decimal point)
  - **Fractions** shown **stacked** side‑by‑side:

  ```
    2     4
   --- + ---
    5     5
  ```

- **Practice** vs **Test (Timed)**  
  - **Per‑question** timer *or* **Total‑time** countdown
- **Configurable difficulty**
  - **Decimals**: whole‑number digits (1–3) & decimal places (1–3)
  - **Fractions**: like/unlike denominators, **simplify result**, **proper results**, **no negative answers**
- **Smart options** (realistic distractors) to encourage understanding
- **Visual aids**:
  - **100‑grid** for small decimal problems
  - **Fraction bars** for each operand
- **Kid‑friendly UX**: jungle theme, big buttons, fun fonts, confetti 🎉
- **Audio**: feedback sounds (on by default) + **read‑aloud** toggle
- **Progress**: local best/last saved; detailed, **printable** summary
- **Offline**: one HTML file, no tracking, no accounts

---

## 🚀 Getting Started

1. Open the folder (recommended name): `deci-frac/`
2. Double‑click **`deci-frac-trail.html`** to open it in a modern browser.
3. Choose **Type**, **Operation**, and **Questions** → **START TRAIL**.

> Works offline in Chrome, Edge, Firefox, and Safari.

---

## 🧩 How to Play

1. **Choose Type**  
   - **Decimals**: select whole digits (1–3) and decimal places (1–3)  
   - **Fractions**: pick denominator range, like/unlike denoms, simplify/proper
   - **Mixed**: a blend of both
2. **Choose Operation**: Addition, Subtraction, or Mixed (+/−)
3. **Set Questions**: 5–50
4. **Options**:
   - **No negative answers** (for subtraction)
   - **Show visual aid** (100‑grid or fraction bars)
   - **Shuffle options**
5. **Mode**:
   - **Practice**: no countdown; immediate feedback; retries allowed
   - **Test (Timed)**:
     - **Per‑question** timer (e.g., 12s each)
     - **Total‑time** countdown (e.g., 240s for the whole quiz)
6. Answer using the large **option buttons**.  
7. At the end, view **Score**, **Time Taken**, **Badges**, and a **Q&A Summary**. Use **Print** to save/print a sheet.

---

## ⏱️ Timing & Tracking

- **Practice** mode tracks **total time** (shown on the results screen).
- **Test** mode supports **per‑question** and **total‑time** timers.
- Best/last stats are saved **locally** in `localStorage` (per type/mode/timer).

---

## 🧠 Visual Aids

- **Decimals**: a **100‑grid** highlights approximate quantity (for small values and up to 2 dp).
- **Fractions**: **fraction bars** show each operand’s size (top vs bottom).

---

## 🎮 Keyboard Shortcuts

- `1`–`6` → choose an answer  
- `N` or `Enter` → Next (in Test mode)  
- `S` → Skip  
- `R` → Read the question aloud  
- Header toggles: **🔊** sound, **🗣️** voice, **🌓** high‑contrast

---

## 🎨 Display & Layout

- **Decimals** are shown vertically, aligned to the decimal point:

  ```
   10.50
  −  2.20
  ------
  ```

- **Fractions** are shown **stacked**, side‑by‑side with the operator on the **middle** line:

  ```
    2     4
   --- + ---
    5     5
  ```

> Answer options for fractions are displayed as `a/b` by default (simple and compact).  
> If you want **stacked fraction answers on the buttons** as well, say the word — easy to add.

---

## 🔧 Configuration (inline)

All configuration resides in the single HTML file and is set at runtime:

```js
const cfg = {
  type: 'decimal',           // 'decimal' | 'fraction' | 'mixed'
  opMode: 'add',             // 'add' | 'sub' | 'mix'
  total: 15,
  mode: 'practice',          // 'practice' | 'test'
  timeboxType: 'per-question', // or 'total'
  perQSeconds: 12,
  totalSeconds: 240,
  // Visuals & UX
  shuffleOptions: true,
  showAid: true,
  // Decimals
  wholeDigits: 2,
  decPlaces: 2,
  // Fractions
  denMin: 3, denMax: 12,
  likeDen: true,
  simplify: true,
  properOnly: false,
  // Safety
  noNegative: true
};
```

---

## ♿ Accessibility & UX

- Large, high‑contrast friendly buttons (toggle **🌓**)
- Kid‑friendly typefaces and spacing
- Keyboard navigation/shortcuts
- Optional **read‑aloud** via Web Speech API (toggle **🗣️**)

---

## 🛡️ Kids‑Safe & Privacy‑First

This app:

- Contains **no ads**, **no tracking**, and **no logins**
- Runs **offline**; the only optional network hits are fonts/effects if online
- Stores progress **locally** in the browser and can be reset in the UI

---

## 🧪 Browser Support

- Latest **Chrome**, **Edge**, **Firefox**, **Safari**
- Audio feedback uses **Web Audio API**; read‑aloud uses **Web Speech API** (if available)

---

## 🐛 Troubleshooting

- **No sound?** Make sure the 🔊 toggle is on. Some browsers require a click before audio can play.
- **No voice?** Your browser may not support **Speech Synthesis**; try enabling it after a user gesture (click).
- **Fonts differ offline?** Web fonts load from Google Fonts; offline, it falls back to system fonts.
- **Timer not counting down?** Ensure **Test (Timed)** is selected, and pick **Per‑question** or **Total**.

---

## 👤 Author & Links

- **Author:** Kashyap Makadia  
- **LinkedIn:** https://www.linkedin.com/in/kashyapmakadia/  
- **GitHub Repo:** https://github.com/KashyapMak/kids-zone

---

## 📄 License

Released under the **MIT License**.  
See the repository `LICENSE` file.

---

## 🗂️ Folder Layout

```text
kids-zone/
│
├── deci-frac/
│   ├── deci-frac-trail.html
│   └── README.md        ← (this file)
│
└── ... other games ...
```

> Want stacked **fraction answers** on the buttons, a column‑format **working pane**, or **mixed numbers**?  
> I can add those next. Just say the word!
