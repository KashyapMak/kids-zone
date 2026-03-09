# ⚖️ Number Nature Trail

**Number Nature Trail** is a single‑file, kid‑friendly game that helps learners practice **comparing numbers** across four types — **whole numbers**, **decimals**, **simple fractions**, and **complex fractions** — by choosing the correct symbol: **`<`**, **`>`**, or **`=`**.

It follows the same feel as the *Trail* series (Times Table Trail, Deci‑Frac Trail, Add & Sub Trail): kid‑safe design, practice/test modes, timers, audio feedback, optional read‑aloud, streaks, badges, and a printable summary. Works **offline** and needs **no build tools**.

---

## ✨ Highlights

- **Four Number Types** — compare any mix of:
  - **Whole Numbers** (configurable range, e.g. 1–20)
  - **Decimals** (1 or 2 decimal places, e.g. `3.75`)
  - **Simple Fractions** (denominator 2–5, e.g. `½`, `¾`)
  - **Complex Fractions** (denominator 6–20, e.g. `7/12`, `11/16`)
- **Fractions shown stacked**, same style as Deci‑Frac Trail:

  ```
    3
   ───
    4
  ```

- **Three answer choices**: `<` (Less than), `=` (Equal), `>` (Greater than)
- **Number line visual aid** — shows both values plotted on a live number line
- **Practice** vs **Test (Timed)**
  - **Per‑question** timer *or* **Total‑time** countdown
- **Equal pairs** are optional (toggle on/off)
- **Kid‑friendly UX**: jungle theme, big buttons, fun fonts, confetti 🎉
- **Audio**: feedback sounds (on by default) + **read‑aloud** toggle
- **Keyboard shortcuts** for fast answering
- **Offline**: one HTML file, no tracking, no accounts

---

## 🚀 Getting Started

1. Open the folder (recommended name): `number-nature-trail/`
2. Double‑click **`number-nature-trail.html`** to open it in a modern browser.
3. Choose **Number Types**, **Options**, and **Questions** → **START TRAIL**.

> Works offline in Chrome, Edge, Firefox, and Safari.

---

## 🧩 How to Play

1. **Choose Number Types**
   - Tick any combination of: 🔢 Whole, 🔣 Decimal, ½ Simple Fraction, ⅞ Complex Fraction
2. **Set Ranges**
   - Whole number range (min / max)
   - Decimal places (1 dp or 2 dp)
   - Simple fractions use denominators 2–5 automatically
   - Complex fractions use denominators 6–20 automatically
3. **Options**
   - **Include equal pairs**: allows `=` as a valid answer
   - **Show number line aid**: plots both numbers on a visual line
   - **Shuffle `< > =` order**: randomises button positions
4. **Set Questions**: 5–50
5. **Mode**:
   - **Practice**: no countdown; immediate feedback; retries allowed on wrong answer
   - **Test (Timed)**:
     - **Per‑question** timer (e.g., 12 s each)
     - **Total‑time** countdown (e.g., 180 s for the whole quiz)
6. Two number cards are shown — press **`<`**, **`=`**, or **`>`** to compare them.
7. At the end, view **Score**, **Time Taken**, **Badges**, and a **Q&A Summary**. Use **Print** to save/print a sheet.

---

## 🖥️ Question Display

Two number boxes appear side by side with a `?` symbol between them:

```
┌──────────────┐        ┌──────────────┐
│  Whole       │   ?    │  Simple Frac │
│     12       │        │     3        │
│              │        │    ───       │
│              │        │     4        │
└──────────────┘        └──────────────┘
```

After answering, the `?` is replaced with the correct symbol (e.g. `>`).

---

## 🔢 Number Types Explained

| Type | Denominator / Range | Examples |
|---|---|---|
| Whole Number | configurable min–max | `5`, `12`, `20` |
| Decimal | 1–2 decimal places | `3.75`, `0.50` |
| Simple Fraction | denom 2–5 | `½`, `¾`, `2/5` |
| Complex Fraction | denom 6–20 | `5/8`, `7/12`, `11/16` |

---

## ⏱️ Timing & Tracking

- **Practice** mode shows no timer during play but records total time taken (shown on results screen).
- **Test** mode supports both **per‑question** and **total‑time** timers.

---

## 🌊 Number Line Aid

When enabled, a live number line is drawn beneath the two cards, plotting each value as a coloured dot. This helps learners visualise relative size before answering.

---

## 🎮 Keyboard Shortcuts

| Key | Action |
|---|---|
| `1` | Choose `<` (less than) |
| `2` | Choose `=` (equal) |
| `3` | Choose `>` (greater than) |
| `N` or `Enter` | Next question (Test mode) |
| `S` | Skip question |
| `R` | Read question aloud |
| `🔊` | Toggle sound on/off |
| `🗣️` | Toggle voice read‑aloud |
| `🌓` | Toggle high‑contrast mode |

---

## 🎨 Themes

Six built‑in themes selectable from the header dropdown:

- **Jungle** (default) — green & amber
- **Blue** — classic cool blue
- **Pink** — vibrant rose
- **Space** — dark purple with cyan accents
- **Ocean** — sky blue with orange
- **Candy** — red with mint

---

## 🔧 Configuration (inline)

All configuration resides in the single HTML file and is set at runtime:

```js
const cfg = {
  mode: 'practice',           // 'practice' | 'test'
  timeboxType: 'per-question',// 'per-question' | 'total'
  perQSeconds: 12,
  totalSeconds: 180,
  total: 15,
  // Number types
  useWhole: true,
  useDecimal: true,
  useSimpleFrac: true,
  useComplexFrac: true,
  // Options
  allowEqual: true,
  showNumline: true,
  shuffleOpts: true,
  // Ranges
  wholeMin: 1,
  wholeMax: 20,
  decPlaces: 2,
};
```

---

## ♿ Accessibility & UX

- Large, high‑contrast‑friendly buttons (toggle **🌓**)
- Kid‑friendly typefaces (`Baloo 2`, `Fredoka`) and generous spacing
- Keyboard navigation and shortcuts
- Optional **read‑aloud** via Web Speech API (toggle **🗣️**)

---

## 🛡️ Kids‑Safe & Privacy‑First

This app:

- Contains **no ads**, **no tracking**, and **no logins**
- Runs **offline**; optional network hits are fonts/effects only (when online)
- No data is stored or transmitted

---

## 🧪 Browser Support

- Latest **Chrome**, **Edge**, **Firefox**, **Safari**
- Audio feedback uses **Web Audio API**; read‑aloud uses **Web Speech API** (if available)

---

## 🐛 Troubleshooting

- **No sound?** Make sure the 🔊 toggle is on. Some browsers require a click before audio plays.
- **No voice?** Your browser may not support Speech Synthesis; try enabling it after a user gesture.
- **Fonts differ offline?** Web fonts load from Google Fonts; offline, it falls back to system fonts.
- **Timer not counting?** Ensure **Test (Timed)** is selected and a timebox type is chosen.

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
├── compare/
│   ├── number-nature-trail.html
│   └── README.md        ← (this file)
│
└── ... other games ...
```
