# 🔢 Number Order Trail

**Number Order Trail** is a single‑file, kid‑friendly game that helps learners practice **ordering numbers** across four types — **whole numbers**, **decimals**, **simple fractions**, and **complex fractions** — by arranging shuffled cards into the correct **ascending** or **descending** order using drag‑and‑drop or tap‑to‑place.

It follows the same feel as the *Trail* series (Times Table Trail, Deci‑Frac Trail, Add & Sub Trail): kid‑safe design, practice/test modes, timers, audio feedback, optional read‑aloud, streaks, badges, and a printable summary. Works **offline** and needs **no build tools**.

---

## ✨ Highlights

- **Four Number Types** — order any mix of:
  - **Whole Numbers** (configurable range, e.g. 1–20)
  - **Decimals** (1 or 2 decimal places, e.g. `3.75`)
  - **Simple Fractions** (denominator 2–5, e.g. `½`, `¾`)
  - **Complex Fractions** (denominator 6–20, e.g. `7/12`, `11/16`)
- **Fractions shown stacked**, same style as Deci‑Frac Trail:

  ```
    7
   ───
   12
  ```

- **3, 4, or 5 cards per question** (easy / medium / hard)
- **Ascending ⬆️, Descending ⬇️, or Mixed 🔀** direction per question
- **Drag‑and‑drop** on desktop; **tap‑to‑select then tap‑to‑place** on mobile
- **Card swapping** — drag or tap a card already in a slot to move or swap it
- **Practice** vs **Test (Timed)**
  - **Per‑question** timer *or* **Total‑time** countdown
- **Correct order reveal** shown automatically on wrong answers
- **Kid‑friendly UX**: jungle theme, big buttons, fun fonts, confetti 🎉
- **Audio**: feedback sounds (on by default) + **read‑aloud** toggle
- **Keyboard shortcuts** for fast navigation
- **Offline**: one HTML file, no tracking, no accounts

---

## 🚀 Getting Started

1. Open the folder (recommended name): `number-order-trail/`
2. Double‑click **`number-order-trail.html`** to open it in a modern browser.
3. Choose **Number Types**, **Direction**, **Cards per Question**, and **Questions** → **START TRAIL**.

> Works offline in Chrome, Edge, Firefox, and Safari.

---

## 🧩 How to Play

1. **Choose Number Types**
   - Tick any combination of: 🔢 Whole, 🔣 Decimal, ½ Simple Fraction, ⅞ Complex Fraction
2. **Choose Direction**
   - ⬆️ **Ascending** — always smallest to largest
   - ⬇️ **Descending** — always largest to smallest
   - 🔀 **Mixed** — direction is randomised each question
3. **Set Cards per Question**
   - **3 cards** — easy
   - **4 cards** — medium (default)
   - **5 cards** — hard
4. **Set Ranges**
   - Whole number range (min / max)
   - Decimal places (1 dp or 2 dp)
5. **Set Questions**: 5–50
6. **Mode**:
   - **Practice**: no countdown; immediate feedback; correct order revealed on mistakes; auto‑advances
   - **Test (Timed)**:
     - **Per‑question** timer (e.g., 30 s each)
     - **Total‑time** countdown (e.g., 300 s for the whole quiz)
7. **Arrange cards** into the numbered slots in the correct order.
8. Press **✔ Check Order** to submit. Slots flash green ✅ or red ❌ per position.
9. At the end, view **Score**, **Time Taken**, **Badges**, and a **Q&A Summary**. Use **Print** to save/print a sheet.

---

## 🖥️ Question Display

The direction is shown prominently at the top of each question:

```
⬆️  Ascending — Smallest → Largest
```

Cards appear in a **shuffled source tray**. Below them are **numbered drop slots**:

```
Shuffled cards:          ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
                         │  3/4 │  │  7   │  │ 1.25 │  │  1   │
                         │ ─── │  │      │  │      │  │ ─── │
                         │  5   │  │      │  │      │  │  3   │
                         └──────┘  └──────┘  └──────┘  └──────┘

Slots:          #1 [ empty ]    #2 [ empty ]    #3 [ empty ]    #4 [ empty ]
```

After placing all cards and pressing **✔ Check Order**, each slot turns green or red.

---

## 🃏 Interaction — Drag & Drop (Desktop)

1. **Drag** a card from the source tray and **drop** it onto an empty slot.
2. **Drag** a card from one slot to another to **move** it.
3. If the target slot already has a card, the two cards **swap**.
4. Press **↺ Clear** to return all cards to the tray and start over.
5. Press **✔ Check Order** when all slots are filled.

## 👆 Interaction — Tap to Place (Mobile / Touch)

1. **Tap** a card in the source tray to **select** it (highlighted in amber).
2. **Tap** an empty slot to **place** it.
3. **Tap** a card already in a slot to pick it up; then tap another slot or source card to swap.
4. Tap the same card again to **deselect** it.

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

- **Practice** mode tracks **total time** (shown on the results screen).
- **Test** mode supports both **per‑question** and **total‑time** timers.
- When the per‑question timer expires, the current arrangement is auto‑submitted.

---

## 🎮 Keyboard Shortcuts

| Key | Action |
|---|---|
| `C` | Check Order (submit current arrangement) |
| `X` | Clear all slots |
| `S` | Skip question |
| `N` or `Enter` | Next question (after checking) |
| `R` | Read card values aloud |
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

## 🏅 Badges

Badges are awarded at the results screen based on performance:

| Badge | Condition |
|---|---|
| 🏆 Flawless! | 100% score |
| ⏱️ Per‑Q Master | Completed in Test (per‑question) mode |
| ⏱️ Total‑Time Master | Completed in Test (total‑time) mode |
| 🔥 Streak N | Achieved a streak of 5 or more |
| 🔀 All Types! | All four number types enabled |
| 🔀 Mixed Direction | Mixed ascending/descending mode used |
| ⭐ Hard Mode (5 cards) | Played with 5 cards per question |

---

## 🔧 Configuration (inline)

All configuration resides in the single HTML file and is set at runtime:

```js
const cfg = {
  mode: 'practice',            // 'practice' | 'test'
  timeboxType: 'per-question', // 'per-question' | 'total'
  perQSeconds: 30,
  totalSeconds: 300,
  total: 12,
  // Number types
  useWhole: true,
  useDecimal: true,
  useSimpleFrac: true,
  useComplexFrac: true,
  // Direction
  direction: 'asc',            // 'asc' | 'desc' | 'mix'
  cardCount: 4,                // 3 | 4 | 5
  // Ranges
  wholeMin: 1,
  wholeMax: 20,
  decPlaces: 2,
};
```

---

## ♿ Accessibility & UX

- Large, high‑contrast‑friendly cards and slots (toggle **🌓**)
- Kid‑friendly typefaces (`Baloo 2`, `Fredoka`) and generous spacing
- Dual input: drag‑and‑drop for desktop, tap‑to‑place for touch devices
- Keyboard navigation and shortcuts
- Optional **read‑aloud** via Web Speech API (toggle **🗣️**)
- Shake animation on incomplete submission (slots not all filled)
- Bounce‑in animation when cards return to tray

---

## 🛡️ Kids‑Safe & Privacy‑First

This app:

- Contains **no ads**, **no tracking**, and **no logins**
- Runs **offline**; optional network hits are fonts/effects only (when online)
- No data is stored or transmitted

---

## 🧪 Browser Support

- Latest **Chrome**, **Edge**, **Firefox**, **Safari**
- Drag‑and‑drop uses the **HTML5 Drag and Drop API**
- Audio feedback uses **Web Audio API**; read‑aloud uses **Web Speech API** (if available)

---

## 🐛 Troubleshooting

- **Cards won't drag?** Try clicking once to select, then clicking a slot to place (tap mode works on all devices).
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
├── ordering/
│   ├── number-order-trail.html
│   └── README.md        ← (this file)
│
└── ... other games ...
```