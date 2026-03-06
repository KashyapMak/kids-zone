# ➕➖ Add & Sub Trail

**Add & Sub Trail** is a single‑file, kid‑friendly game that helps learners practice **addition** and **subtraction** with **1–4 digit** numbers.  
It mirrors the experience of _Times Table Trail_ with practice/test modes, fun themes, audio feedback, streaks, badges, and a printable summary—while adding options that are specific to +/− learning.

---

## ✨ Highlights

- **Digits:** choose **1‑digit**, **2‑digit**, **3‑digit**, or **4‑digit** problems
- **Operations:** **Addition**, **Subtraction**, or **Mixed**
- **Smart options:** realistic distractors (near answers, off‑by‑one, etc.)
- **Practice** vs **Test (Timed)**  
  - **Per‑question** timer _or_ **Total‑time** countdown
- **Concept support:** optional **Number Line** for small values
- **Subtraction safety:** **No negatives** (optional)
- **Skill scaffolds:** **No carry** (addition) / **No borrow** (subtraction) toggles
- **Kid‑friendly UI:** jungle theme (default), big buttons, fun fonts, confetti 🎉
- **Audio:** feedback sounds (on by default) + optional **Read‑aloud**
- **Progress:** local best/last saved; **printable** results with Q&A summary
- **Offline:** single HTML file, no build step, no tracking

---

## 🚀 Getting Started

1. Open the folder `add-sub/`.
2. Double‑click **`add-sub-trail.html`** to open it in your browser.
3. Choose digits, operation mode, and number of questions → **START TRAIL**.

> Works offline in modern browsers (Chrome, Edge, Firefox, Safari).

---

## 🧩 How to Play

1. Pick **Digits**: 1‑digit to 4‑digit.
2. Pick **Operation**: Addition, Subtraction, or Mixed.
3. Set **Questions** (5–50).
4. (Optional) Enable **No negatives**, **No carry**, **No borrow**, **Number line**.
5. Choose **Practice** or **Test (Timed)**:
   - _Per‑question_ (e.g., 10 seconds each)
   - _Total time_ (e.g., 3 minutes for the whole quiz)
6. Answer using the large **option buttons**.
7. View **Score**, **Time taken**, **Badges**, and **Summary**. Use **Print** to save.

---

## ⏱️ Timing & Tracking

- **Practice:** no countdown, but total time taken is recorded and shown at the end.
- **Test:** choose **Per‑question** or **Total‑time** countdown.
- Local best/last performance is stored in `localStorage` (device‑only).

---

## 🧠 Options & Aids

- **No negatives (subtraction):** prevents negative answers by ordering operands.
- **No carry (addition):** filters problems that require carrying.
- **No borrow (subtraction):** filters problems that require borrowing.
- **Number line:** appears for small values to visualize +/− steps.

---

## 🎮 Keyboard Shortcuts

- `1`–`6` → choose an answer
- `N` or `Enter` → Next (in Test mode)
- `S` → Skip
- `R` → Read the question aloud
- Header toggles: **🔊** sound, **🗣️** voice, **🌓** high‑contrast

---

## 🎨 Themes

- **Jungle** (default), **Blue**, **Pink**, **Space**, **Ocean**, **Candy**  
  Choose from the **Theme** dropdown in the header.

---

## 🔧 Configuration (inline)

The app is a single HTML file with default config set at runtime:

```js
// defaults at startup (simplified)
cfg = {
  digits: 1,           // 1|2|3|4
  opMode: 'add',       // 'add' | 'sub' | 'mix'
  total: 15,
  mode: 'practice',    // 'practice' | 'test'
  timeboxType: 'per-question', // or 'total'
  perQSeconds: 10,
  totalSeconds: 180,
  theme: 'theme-jungle',
  noNegative: true,
  avoidCarry: false,
  avoidBorrow: false,
  showNumberLine: true,
  shuffleOptions: true
};
